using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Common;
using Shared.DTOs.TravelPlan;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using TravelService.DbContext;
using TravelService.Repositories;
using TravelService.Services;

namespace TravelService
{
    internal sealed class TravelService : StatelessService, ITravelService
    {
        private readonly ServiceProvider _serviceProvider;

        public TravelService(StatelessServiceContext context)
            : base(context)
        {
            var services = new ServiceCollection();

            var configPackagePath = context.CodePackageActivationContext
                .GetConfigurationPackageObject("Config").Path;

            var appSettingsPath = Path.Combine(configPackagePath, "appsettings.json");

            IConfiguration configuration = new ConfigurationBuilder()
                .AddJsonFile(appSettingsPath, optional: false, reloadOnChange: true)
                .Build();

            services.AddSingleton<IConfiguration>(configuration);

            services.AddDbContext<TravelDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<TravelRepository>();
            services.AddScoped<TravelPlanImplementation>();

            _serviceProvider = services.BuildServiceProvider();
        }

        public async Task<ServiceResult<TravelPlanDto>> Create(int userId, CreateTravelPlanDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<TravelPlanImplementation>();
                return await service.Create(userId, dto);
            }
        }

        public async Task<ServiceResult<List<TravelPlanDto>>> GetAll(int userId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<TravelPlanImplementation>();
                return await service.GetAll(userId);
            }
        }

        public async Task<ServiceResult<TravelPlanDto>> GetById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<TravelPlanImplementation>();
                return await service.GetById(id);
            }
        }

        public async Task<ServiceResult<bool>> Update(int id, CreateTravelPlanDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<TravelPlanImplementation>();
                return await service.Update(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> Delete(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<TravelPlanImplementation>();
                return await service.Delete(id);
            }
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<TravelDbContext>();
                await db.Database.EnsureCreatedAsync(cancellationToken);
            }

            while (!cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
    }
}