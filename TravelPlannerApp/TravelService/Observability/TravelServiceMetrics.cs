using System.Diagnostics.Metrics;

namespace TravelService.Observability
{
    /// <summary>
    /// Application metrics za TravelService (deo Application Metrics observability sablona).
    /// Meter se registruje kroz OpenTelemetry MeterProvider u TravelService.cs (AddMeter(MeterName))
    /// i izlaze se u Prometheus formatu na /metrics endpointu (isti Kestrel listener kao /health).
    /// </summary>
    public static class TravelServiceMetrics
    {
        public const string MeterName = "TravelPlannerApp.TravelService";

        private static readonly Meter Meter = new(MeterName, "1.0.0");

        /// <summary>
        /// Ukupan broj izvrsenih operacija, tagovan po entitetu, operaciji i ishodu.
        /// Namerno se ne postavlja "unit" parametar - Prometheus exporter automatski dodaje sufiks
        /// imenu metrike na osnovu unit-a, sto bi ovde dupliralo sufiks koji je vec deo naziva.
        /// </summary>
        private static readonly Counter<long> OperationsCounter = Meter.CreateCounter<long>(
            name: "travel_service_operations_total",
            description: "Ukupan broj izvrsenih operacija u TravelService-u, po entitetu, operaciji i ishodu.");

        /// <summary>Trajanje operacije u milisekundama, tagovano po entitetu i operaciji.</summary>
        private static readonly Histogram<double> OperationDuration = Meter.CreateHistogram<double>(
            name: "travel_service_operation_duration_ms",
            description: "Trajanje operacija u TravelService-u, u milisekundama.");

        /// <summary>
        /// Belezi jednu izvrsenu operaciju nad odredjenim entitetom (npr. TravelPlan/Create,
        /// Activity/Delete...) zajedno sa ishodom i trajanjem.
        /// </summary>
        public static void RecordOperation(string entity, string operation, bool success, double durationMs)
        {
            var result = success ? "success" : "failure";

            OperationsCounter.Add(1,
                new KeyValuePair<string, object?>("entity", entity),
                new KeyValuePair<string, object?>("operation", operation),
                new KeyValuePair<string, object?>("result", result));

            OperationDuration.Record(durationMs,
                new KeyValuePair<string, object?>("entity", entity),
                new KeyValuePair<string, object?>("operation", operation));
        }
    }
}
