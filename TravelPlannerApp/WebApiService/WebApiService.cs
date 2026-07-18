using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using System.Fabric;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using WebAPIService.Services;

namespace WebApiService
{
    internal sealed class WebApiService : StatelessService
    {
        public WebApiService(StatelessServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        var configPackagePath = serviceContext.CodePackageActivationContext
                            .GetConfigurationPackageObject("Config").Path;

                        builder.Configuration
                            .SetBasePath(configPackagePath)
                            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);
                        builder.Services.AddScoped<TravelServiceProxy>();
                        builder.Services.AddScoped<UserServiceProxy>();
                        builder.Services.AddScoped<SharingServiceProxy>();

                        builder.WebHost
                            .UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url);

                        // JWT settings from configuration
                        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
                        var secret = jwtSettings["Secret"];
                        var issuer = jwtSettings["Issuer"];
                        var audience = jwtSettings["Audience"];

                        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

                        // JWT Authentication
                        var key = Encoding.UTF8.GetBytes(secret);

                        builder.Services
                            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                            .AddJwtBearer(options =>
                            {
                                options.RequireHttpsMetadata = false;
                                options.SaveToken = true;

                                options.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuerSigningKey = true,
                                    IssuerSigningKey = new SymmetricSecurityKey(key),

                                    ValidateIssuer = true,
                                    ValidIssuer = issuer,

                                    ValidateAudience = true,
                                    ValidAudience = audience,

                                    ValidateLifetime = true,
                                    ClockSkew = TimeSpan.Zero
                                };
                            });

                        builder.Services.AddAuthorization();

                        // Application Metrics: OpenTelemetry meter provider koji hvata standardne
                        // ASP.NET Core HTTP metrike (broj zahteva, trajanje, aktivni zahtevi po ruti/statusu)
                        // i .NET runtime metrike (GC, thread pool), i izlaze ih u Prometheus formatu na /metrics.
                        builder.Services.AddOpenTelemetry()
                            .ConfigureResource(resource => resource.AddService(serviceName: "WebApiService"))
                            .WithMetrics(metrics => metrics
                                .AddAspNetCoreInstrumentation()
                                .AddRuntimeInstrumentation()
                                .AddPrometheusExporter());

                        // Health checks: osnovni gateway self-check + provera dostupnosti
                        // UserService, TravelService i SharingService preko njihovih /health endpointa
                        var healthChecksBuilder = builder.Services.AddHealthChecks();

                        var userServiceHealthUrl = builder.Configuration["HealthChecksUrls:UserService"];
                        var travelServiceHealthUrl = builder.Configuration["HealthChecksUrls:TravelService"];
                        var sharingServiceHealthUrl = builder.Configuration["HealthChecksUrls:SharingService"];

                        if (!string.IsNullOrWhiteSpace(userServiceHealthUrl))
                        {
                            healthChecksBuilder.AddUrlGroup(
                                new Uri(userServiceHealthUrl),
                                name: "UserService",
                                tags: new[] { "downstream", "ready" });
                        }

                        if (!string.IsNullOrWhiteSpace(travelServiceHealthUrl))
                        {
                            healthChecksBuilder.AddUrlGroup(
                                new Uri(travelServiceHealthUrl),
                                name: "TravelService",
                                tags: new[] { "downstream", "ready" });
                        }

                        if (!string.IsNullOrWhiteSpace(sharingServiceHealthUrl))
                        {
                            healthChecksBuilder.AddUrlGroup(
                                new Uri(sharingServiceHealthUrl),
                                name: "SharingService",
                                tags: new[] { "downstream", "ready" });
                        }

                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowFrontend", policy =>
                            {
                                policy.WithOrigins(
                                        "http://localhost:5173",
                                        "http://localhost:3000")
                                      .AllowAnyMethod()
                                      .AllowAnyHeader()
                                      .AllowCredentials();
                            });
                        });

                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();

                        builder.Services.AddSwaggerGen(options =>
                        {
                            options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                            {
                                Name = "Authorization",
                                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                                Scheme = "bearer",
                                BearerFormat = "JWT",
                                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                                Description = "Enter your JWT token"
                            });

                            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                            {
                                {
                                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                                    {
                                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                                        {
                                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                            Id = "Bearer"
                                        }
                                    },
                                    new string[] {}
                                }
                            });
                        });

                        var app = builder.Build();

                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseRouting();
                        app.UseCors("AllowFrontend");
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();

                        // /metrics - Prometheus scrape endpoint sa HTTP i runtime metrikama (Application Metrics)
                        app.MapPrometheusScrapingEndpoint("/metrics");

                        // /health - sve provere (gateway + baze downstream servisa preko njihovih /health-ova)
                        app.MapHealthChecks("/health", new HealthCheckOptions
                        {
                            ResponseWriter = WriteHealthCheckResponse
                        });

                        // /health/live - da li proces uopste radi (bez provere zavisnosti); koristi se npr. za restart odluke
                        app.MapHealthChecks("/health/live", new HealthCheckOptions
                        {
                            Predicate = _ => false,
                            ResponseWriter = WriteHealthCheckResponse
                        });

                        // /health/ready - da li je gateway spreman da opsluzuje saobracaj (baze + eksterni servisi zdravi)
                        app.MapHealthChecks("/health/ready", new HealthCheckOptions
                        {
                            Predicate = check => check.Tags.Contains("ready"),
                            ResponseWriter = WriteHealthCheckResponse
                        });

                        return app;
                    }))
            };
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
    }
}