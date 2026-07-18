using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using Shared.Common;
using Shared.DTOs.Sharing;
using Shared.Interfaces;
using SharingService.HealthChecks;
using SharingService.Observability;
using SharingService.Repositories;
using SharingService.Services;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SharingService
{
    internal sealed class SharingService : StatefulService, ISharingService
    {
        private ISharingTokenRepository _repository;
        private ISharingBusinessLogic _businessLogic;

        public SharingService(StatefulServiceContext context)
            : base(context)
        { }

        public async Task<ServiceResult<SharingTokenDto>> CreateSharingToken(int userId, CreateSharingTokenDto dto)
        {
            return await _businessLogic.CreateSharingToken(userId, dto);
        }

        public async Task<ServiceResult<SharingTokenDto>> GetSharingToken(string token)
        {
            return await _businessLogic.GetSharingToken(token);
        }

        public async Task<ServiceResult<List<SharingTokenDto>>> GetUserSharingTokens(int userId)
        {
            return await _businessLogic.GetUserSharingTokens(userId);
        }

        public async Task<ServiceResult<bool>> RevokeSharingToken(string token, int userId)
        {
            return await _businessLogic.RevokeSharingToken(token, userId);
        }

        public async Task<ServiceResult<bool>> ValidateSharingToken(ValidateSharingTokenDto dto)
        {
            return await _businessLogic.ValidateSharingToken(dto);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            var listeners = this.CreateServiceRemotingReplicaListeners().ToList();

            // Potpuno odvojen HTTP listener SAMO za /health - radi na fiksnom portu (HealthEndpoint)
            // SharingService nema SQL bazu, vec Reliable Collections, pa ReliableStateHealthCheck 
            // proverava da li je State Manager dostupan.
            listeners.Add(new ServiceReplicaListener((StatefulServiceContext serviceContext) =>
                new KestrelCommunicationListener(serviceContext, "HealthEndpoint", (url, listener) =>
                {
                    ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting health check Kestrel on {url}");

                    var builder = WebApplication.CreateBuilder();

                    builder.WebHost
                        .UseKestrel()
                        .UseContentRoot(Directory.GetCurrentDirectory())
                        .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                        .UseUrls(url);

                    builder.Services.AddSingleton<IReliableStateManager>(this.StateManager);

                    builder.Services.AddHealthChecks()
                        .AddCheck<ReliableStateHealthCheck>(
                            "SharingService-State",
                            tags: new[] { "state", "ready" });

                    // Application Metrics: custom business metrike (SharingServiceMetrics) + .NET runtime
                    // metrike, izlozene u Prometheus formatu na /metrics (isti Kestrel listener kao /health).
                    builder.Services.AddOpenTelemetry()
                        .ConfigureResource(resource => resource.AddService(serviceName: "SharingService"))
                        .WithMetrics(metrics => metrics
                            .AddMeter(SharingServiceMetrics.MeterName)
                            .AddRuntimeInstrumentation()
                            .AddPrometheusExporter());

                    var app = builder.Build();

                    app.MapHealthChecks("/health", new HealthCheckOptions
                    {
                        ResponseWriter = WriteHealthCheckResponse
                    });

                    app.MapPrometheusScrapingEndpoint("/metrics");

                    return app;
                }), "HealthEndpoint"));

            return listeners;
        }

        /// <summary>
        /// Vraca detaljan JSON umesto default plain-text "Healthy"/"Unhealthy" odgovora.
        /// </summary>
        private static Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
        {
            context.Response.ContentType = "application/json; charset=utf-8";

            var payload = new
            {
                status = report.Status.ToString(),
                totalDurationMs = report.TotalDuration.TotalMilliseconds,
                checks = report.Entries.Select(e => new
                {
                    name = e.Key,
                    status = e.Value.Status.ToString(),
                    description = e.Value.Description,
                    durationMs = e.Value.Duration.TotalMilliseconds
                })
            };

            return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            _repository = new SharingTokenRepository(this.StateManager);
            _businessLogic = new SharingBusinessLogic(_repository);

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
    }
}