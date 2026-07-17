using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using SharingService.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SharingService.HealthChecks
{
    /// <summary>
    /// SharingService ne koristi spoljnu SQL bazu, vec Service Fabric Reliable Collections
    /// kao svoje skladiste podataka. Proverava da li je moguce otvoriti
    /// "sharingTokens" reliable dictionary i pokrenuti transakciono citanje.
    /// </summary>
    public class ReliableStateHealthCheck : IHealthCheck
    {
        private const string DictionaryName = "sharingTokens";
        private readonly IReliableStateManager _stateManager;

        public ReliableStateHealthCheck(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var tokens = await _stateManager
                    .GetOrAddAsync<IReliableDictionary<string, SharingToken>>(DictionaryName);

                using var tx = _stateManager.CreateTransaction();
                var count = await tokens.GetCountAsync(tx);

                return HealthCheckResult.Healthy(
                    $"Reliable dictionary '{DictionaryName}' je dostupan ({count} zapisa).");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy(
                    $"Reliable State Manager nije dostupan: {ex.Message}", ex);
            }
        }
    }
}
