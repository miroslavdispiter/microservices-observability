using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using Shared.Common;
using Shared.DTOs.User;
using Shared.Interfaces;
using System.Fabric;
using System.Text.Json;
using UserService.DbContext;
using UserService.Interfaces;
using UserService.Observability;
using UserService.Repositories;
using UserService.Services;

namespace UserService
{
    internal sealed class UserService : StatelessService, IUserService
    {
        private readonly ServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;

        public UserService(StatelessServiceContext context)
            : base(context)
        {
            var services = new ServiceCollection();

            var configPackagePath = context.CodePackageActivationContext
                .GetConfigurationPackageObject("Config").Path;

            var appSettingsPath = Path.Combine(configPackagePath, "appsettings.json");

            IConfiguration configuration = new ConfigurationBuilder()
                .AddJsonFile(appSettingsPath, optional: false, reloadOnChange: true)
                .Build();

            _configuration = configuration;

            services.AddSingleton<IConfiguration>(configuration);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IAuthService, AuthServiceImplementation>();
            services.AddScoped<IAdminService, AdminServiceImplementation>();
            services.AddScoped<IJwtService, JwtService>();

            _serviceProvider = services.BuildServiceProvider();
        }

        public async Task<ServiceResult<AuthResponseDto>> Register(RegisterRequestDto request)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAuthService>();
                return await service.Register(request);
            }
        }

        public async Task<ServiceResult<AuthResponseDto>> Login(LoginRequestDto request)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAuthService>();
                return await service.Login(request);
            }
        }

        public async Task<ServiceResult<List<UserDto>>> GetAllUsers()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAdminService>();
                return await service.GetAllUsers();
            }
        }

        public async Task<ServiceResult<UserDto>> GetUserById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAdminService>();
                return await service.GetUserById(id);
            }
        }

        public async Task<ServiceResult<bool>> UpdateUser(int id, UpdateUserDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAdminService>();
                return await service.UpdateUser(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> DeleteUser(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAdminService>();
                return await service.DeleteUser(id);
            }
        }

        public async Task<ServiceResult<bool>> ChangeUserPassword(int id, ChangePasswordDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IAdminService>();
                return await service.ChangeUserPassword(id, dto);
            }
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            var listeners = this.CreateServiceRemotingInstanceListeners().ToList();

            // Odvojen HTTP listener SAMO za /health - radi na fiksnom portu (HealthEndpoint)
            // da bi WebApiService (i drugi alati) mogli da provere zdravlje ovog servisa i
            // njegove konekcije na UsersDb bazu.
            listeners.Add(new ServiceInstanceListener((StatelessServiceContext serviceContext) =>
                new KestrelCommunicationListener(serviceContext, "HealthEndpoint", (url, listener) =>
                {
                    ServiceEventSource.Current.Message($"Starting health check Kestrel on {url}");

                    var builder = WebApplication.CreateBuilder();

                    builder.WebHost
                        .UseKestrel()
                        .UseContentRoot(Directory.GetCurrentDirectory())
                        .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                        .UseUrls(url);

                    var connectionString = _configuration.GetConnectionString("DefaultConnection");

                    builder.Services.AddHealthChecks()
                        .AddSqlServer(
                            connectionString: connectionString!,
                            healthQuery: "SELECT 1;",
                            name: "UsersDb",
                            tags: new[] { "db", "sql", "ready" });

                    // Application Metrics: custom business metrike (UserServiceMetrics) + .NET runtime
                    // metrike, izlozene u Prometheus formatu na /metrics (isti Kestrel listener kao /health).
                    builder.Services.AddOpenTelemetry()
                        .ConfigureResource(resource => resource.AddService(serviceName: "UserService"))
                        .WithMetrics(metrics => metrics
                            .AddMeter(UserServiceMetrics.MeterName)
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
        /// Vraca detaljan JSON umesto default plain-text "Healthy"/"Unhealthy" odgovora
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
            using (var scope = _serviceProvider.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await db.Database.EnsureCreatedAsync(cancellationToken);
            }

            while (!cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
    }
}