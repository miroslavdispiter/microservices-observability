using System.Diagnostics.Metrics;

namespace UserService.Observability
{
    /// <summary>
    /// Application metrics za UserService (deo Application Metrics observability sablona).
    /// Meter se registruje kroz OpenTelemetry MeterProvider u UserService.cs (AddMeter(MeterName))
    /// i izlaze se u Prometheus formatu na /metrics endpointu (isti Kestrel listener kao /health).
    /// </summary>
    public static class UserServiceMetrics
    {
        public const string MeterName = "TravelPlannerApp.UserService";

        private static readonly Meter Meter = new(MeterName, "1.0.0");

        /// <summary>
        /// Ukupan broj izvrsenih operacija, tagovan po operaciji i ishodu (success/failure).
        /// Namerno se ne postavlja "unit" parametar - Prometheus exporter automatski dodaje sufiks
        /// imenu metrike na osnovu unit-a (npr. "s" -> "_seconds"), sto bi ovde dupliralo sufiks
        /// koji je vec deo naziva. Nazivi metrika ostaju stabilni i predvidivi.
        /// </summary>
        private static readonly Counter<long> OperationsCounter = Meter.CreateCounter<long>(
            name: "user_service_operations_total",
            description: "Ukupan broj izvrsenih operacija u UserService-u, po tipu operacije i ishodu.");

        /// <summary>Trajanje operacije u milisekundama, tagovano po operaciji.</summary>
        private static readonly Histogram<double> OperationDuration = Meter.CreateHistogram<double>(
            name: "user_service_operation_duration_ms",
            description: "Trajanje operacija u UserService-u, u milisekundama.");

        /// <summary>Poseban counter za neuspesne pokusaje prijave (bezbednosno relevantna metrika).</summary>
        private static readonly Counter<long> LoginFailuresCounter = Meter.CreateCounter<long>(
            name: "user_service_login_failures_total",
            description: "Broj neuspesnih pokusaja prijave (pogresan email/lozinka).");

        /// <summary>
        /// Belezi jednu izvrsenu operaciju (npr. Register, Login, UpdateUser...) zajedno sa
        /// njenim ishodom i trajanjem. Poziva se iz servisnih implementacija nakon zavrsetka rada.
        /// </summary>
        public static void RecordOperation(string operation, bool success, double durationMs)
        {
            var result = success ? "success" : "failure";

            OperationsCounter.Add(1,
                new KeyValuePair<string, object?>("operation", operation),
                new KeyValuePair<string, object?>("result", result));

            OperationDuration.Record(durationMs,
                new KeyValuePair<string, object?>("operation", operation));

            if (operation == "Login" && !success)
            {
                LoginFailuresCounter.Add(1);
            }
        }
    }
}
