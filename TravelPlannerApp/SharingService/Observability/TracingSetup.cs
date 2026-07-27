using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Fabric;

namespace SharingService.Observability
{
    /// <summary>
    /// Distributed Tracing setup za SharingService.
    ///
    /// Zasto se TracerProvider pravi ovde, a ne u Kestrel host-u kao metrike:
    /// metrike se izlazu preko /metrics endpointa, pa moraju da zive u DI kontejneru
    /// tog ASP.NET Core host-a. Trace-ovi, medjutim, nastaju u REMOTING listener-u, koji
    /// se otvara nezavisno od Kestrel-a i potencijalno pre njega. Zato se TracerProvider
    /// pravi rucno (Sdk.CreateTracerProviderBuilder) i to iz konstruktora servisa - dakle
    /// pre nego sto Service Fabric uopste otvori bilo koji listener.
    ///
    /// SharingService je StatefulService i podatke cuva u Reliable Collections, pa nema
    /// SqlClient instrumentaciju - vreme provedeno u State Manager-u je deo trajanja
    /// samog server-side remoting span-a.
    /// </summary>
    internal static class TracingSetup
    {
        /// <summary>Ime servisa kako se prikazuje u Jaeger UI-u i u resource atributima.</summary>
        public const string ServiceName = "SharingService";

        private static readonly object SyncRoot = new object();
        private static TracerProvider? _tracerProvider;

        /// <summary>
        /// Pravi i registruje proces-globalni TracerProvider. Idempotentno - visestruki
        /// pozivi nemaju efekta (kod stateful servisa se replika moze vise puta otvoriti
        /// u istom procesu prilikom promene uloge primary/secondary).
        /// </summary>
        public static void Initialize(ServiceContext context)
        {
            if (_tracerProvider != null)
            {
                return;
            }

            lock (SyncRoot)
            {
                if (_tracerProvider != null)
                {
                    return;
                }

                _tracerProvider = Sdk.CreateTracerProviderBuilder()
                    // Resource atributi - staticki opis "ko" salje telemetriju. Jaeger po
                    // service.name grupise servise u levom meniju, a ostali atributi
                    // omogucavaju da se u konkretnom trace-u vidi na kom cvoru klastera
                    // i u kojoj particiji je span nastao.
                    .SetResourceBuilder(ResourceBuilder.CreateDefault()
                        .AddService(
                            serviceName: ServiceName,
                            serviceVersion: "1.0.0",
                            serviceInstanceId: context.NodeContext.NodeName)
                        .AddAttributes(new[]
                        {
                            new KeyValuePair<string, object>("service.fabric.application", context.CodePackageActivationContext.ApplicationName),
                            new KeyValuePair<string, object>("service.fabric.service", context.ServiceName.ToString()),
                            new KeyValuePair<string, object>("service.fabric.partition_id", context.PartitionId.ToString()),
                            new KeyValuePair<string, object>("service.fabric.node", context.NodeContext.NodeName),
                        }))

                    // Server-side span-ovi za dolazne remoting pozive + citanje trace
                    // konteksta iz zaglavlja remoting poruke (vidi RemotingTracing.cs).
                    .AddServiceFabricRemotingInstrumentation(options =>
                    {
                        // Exception tracking: neuhvacen izuzetak se u span upisuje kao
                        // ActivityEvent, pa se u Jaegeru vidi tacan span koji je pukao
                        // zajedno sa stack trace-om.
                        options.AddExceptionAtServer = true;
                        options.AddExceptionAtClient = true;
                    })

                    // Izvoz preko OTLP protokola. Endpoint i protokol se citaju iz
                    // OTEL_EXPORTER_OTLP_ENDPOINT / OTEL_EXPORTER_OTLP_PROTOCOL promenljivih
                    // okruzenja definisanih u ServiceManifest.xml (podrazumevano
                    // http://localhost:4317, gde slusa Jaeger iz docker-compose stack-a).
                    .AddOtlpExporter()

                    .Build();

                // OTLP exporter po pravilu ne salje svaki span odmah, vec ih grupise
                // (BatchActivityExportProcessor) i salje na svakih nekoliko sekundi.
                // Bez ovoga bi se pri gasenju servisa poslednja grupa span-ova izgubila,
                // pa bi izgledalo kao da poslednji zahtevi pred restart nemaju trace.
                AppDomain.CurrentDomain.ProcessExit += (_, _) => Shutdown();
            }
        }

        /// <summary>
        /// Prazni bafer exportera i oslobadja TracerProvider. Poziva se automatski pri
        /// gasenju procesa, a moze i eksplicitno iz OnCloseAsync servisa.
        /// </summary>
        public static void Shutdown()
        {
            lock (SyncRoot)
            {
                _tracerProvider?.ForceFlush(5000);
                _tracerProvider?.Dispose();
                _tracerProvider = null;
            }
        }
    }
}
