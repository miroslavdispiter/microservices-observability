using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
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

                        // ============================================================================
                        //  OBSERVABILITY: Application Metrics + Distributed Tracing
                        // ============================================================================
                        builder.Services.AddOpenTelemetry()

                            // Zajednicki resource atributi za metrike i trace-ove. service.name je
                            // ono po cemu Jaeger grupise servise, a fabric atributi pokazuju na kom
                            // cvoru klastera je span nastao.
                            .ConfigureResource(resource => resource
                                .AddService(
                                    serviceName: "WebApiService",
                                    serviceVersion: "1.0.0",
                                    serviceInstanceId: serviceContext.NodeContext.NodeName)
                                .AddAttributes(new[]
                                {
                                    new KeyValuePair<string, object>("service.fabric.application", serviceContext.CodePackageActivationContext.ApplicationName),
                                    new KeyValuePair<string, object>("service.fabric.service", serviceContext.ServiceName.ToString()),
                                    new KeyValuePair<string, object>("service.fabric.node", serviceContext.NodeContext.NodeName),
                                }))

                            // Application Metrics: standardne ASP.NET Core HTTP metrike (broj zahteva,
                            // trajanje, aktivni zahtevi po ruti/statusu) i .NET runtime metrike
                            // (GC, thread pool), izlozene u Prometheus formatu na /metrics.
                            .WithMetrics(metrics => metrics
                                .AddAspNetCoreInstrumentation()
                                .AddRuntimeInstrumentation()
                                .AddPrometheusExporter())

                            // Distributed Tracing: WebApiService je ulazna tacka sistema, pa se ovde
                            // rodi root span svakog trace-a. Taj span se zatim, kroz instrumentaciju
                            // Service Fabric Remoting-a, prenosi do UserService/TravelService/SharingService.
                            .WithTracing(tracing => tracing
                                .AddAspNetCoreInstrumentation(options =>
                                {
                                    // Bez ovog filtera bi Jaeger bio zatrpan: Prometheus skrejpuje
                                    // /metrics na svakih 5 sekundi, a /health se poziva jos cesce.
                                    // Te rute su infrastrukturne i nisu deo korisnickog toka.
                                    options.Filter = httpContext =>
                                        !httpContext.Request.Path.StartsWithSegments("/metrics")
                                        && !httpContext.Request.Path.StartsWithSegments("/health");

                                    // Exception tracking: neuhvacen izuzetak se upisuje u span
                                    // kao ActivityEvent sa stack trace-om.
                                    options.RecordException = true;
                                })

                                // Klijentski span-ovi za odlazne remoting pozive + ubacivanje
                                // W3C trace context-a u zaglavlja remoting poruke.
                                .AddServiceFabricRemotingInstrumentation(options =>
                                {
                                    options.AddExceptionAtClient = true;
                                    options.AddExceptionAtServer = true;
                                })

                                // Izvoz preko OTLP protokola ka Jaeger-u. Endpoint i protokol se
                                // citaju iz OTEL_EXPORTER_OTLP_ENDPOINT / OTEL_EXPORTER_OTLP_PROTOCOL
                                // promenljivih okruzenja definisanih u ServiceManifest.xml.
                                .AddOtlpExporter());

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