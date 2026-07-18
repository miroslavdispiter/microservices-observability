using System.Diagnostics.Metrics;

namespace SharingService.Observability
{
    /// <summary>
    /// Application metrics za SharingService (deo Application Metrics observability sablona).
    /// Meter se registruje kroz OpenTelemetry MeterProvider u SharingService.cs (AddMeter(MeterName))
    /// i izlaze se u Prometheus formatu na /metrics endpointu (isti Kestrel listener kao /health).
    /// </summary>
    public static class SharingServiceMetrics
    {
        public const string MeterName = "TravelPlannerApp.SharingService";

        private static readonly Meter Meter = new(MeterName, "1.0.0");

        /// <summary>
        /// Ukupan broj izvrsenih operacija, tagovan po operaciji i ishodu (success/failure).
        /// Namerno se ne postavlja "unit" parametar - Prometheus exporter automatski dodaje sufiks
        /// imenu metrike na osnovu unit-a, sto bi ovde dupliralo sufiks koji je vec deo naziva.
        /// </summary>
        private static readonly Counter<long> OperationsCounter = Meter.CreateCounter<long>(
            name: "sharing_service_operations_total",
            description: "Ukupan broj izvrsenih operacija u SharingService-u, po tipu operacije i ishodu.");

        /// <summary>Trajanje operacije u milisekundama, tagovano po operaciji.</summary>
        private static readonly Histogram<double> OperationDuration = Meter.CreateHistogram<double>(
            name: "sharing_service_operation_duration_ms",
            description: "Trajanje operacija u SharingService-u, u milisekundama.");

        /// <summary>Broj pristupa deljenim linkovima (validacija/citanje tokena) - pokazatelj koriscenja funkcije deljenja.</summary>
        private static readonly Counter<long> TokenAccessCounter = Meter.CreateCounter<long>(
            name: "sharing_service_token_access_total",
            description: "Broj pristupa deljenim putovanjima preko sharing tokena, po ishodu (validan/nevalidan).");

        public static void RecordOperation(string operation, bool success, double durationMs)
        {
            var result = success ? "success" : "failure";

            OperationsCounter.Add(1,
                new KeyValuePair<string, object?>("operation", operation),
                new KeyValuePair<string, object?>("result", result));

            OperationDuration.Record(durationMs,
                new KeyValuePair<string, object?>("operation", operation));

            if (operation is "GetSharingToken" or "ValidateSharingToken")
            {
                TokenAccessCounter.Add(1,
                    new KeyValuePair<string, object?>("operation", operation),
                    new KeyValuePair<string, object?>("result", result));
            }
        }
    }
}
