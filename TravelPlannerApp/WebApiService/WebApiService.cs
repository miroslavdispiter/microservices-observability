using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
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

                        return app;
                    }))
            };
        }
    }
}