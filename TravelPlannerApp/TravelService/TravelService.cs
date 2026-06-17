using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Common;
using Shared.DTOs.Activity;
using Shared.DTOs.Checklist;
using Shared.DTOs.Destination;
using Shared.DTOs.Expense;
using Shared.DTOs.TravelPlan;
using Shared.Interfaces;
using System.Fabric;
using TravelService.DbContext;
using TravelService.Interfaces;
using TravelService.Repositories;
using TravelService.Services;

namespace TravelService
{
    internal sealed class TravelService : StatelessService, ITravelService, IDestinationService, IActivityService, IExpenseService, IChecklistService
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

            services.AddScoped<ITravelPlanRepository, TravelPlanRepository>();
            services.AddScoped<IDestinationRepository, DestinationRepository>();
            services.AddScoped<IActivityRepository, ActivityRepository>();
            services.AddScoped<IExpenseRepository, ExpenseRepository>();
            services.AddScoped<IChecklistRepository, ChecklistRepository>();

            services.AddScoped<ITravelService, TravelPlanImplementation>();
            services.AddScoped<IDestinationService, DestinationImplementation>();
            services.AddScoped<IActivityService, ActivityImplementation>();
            services.AddScoped<IExpenseService, ExpenseImplementation>();
            services.AddScoped<IChecklistService, ChecklistImplementation>();

            _serviceProvider = services.BuildServiceProvider();
        }

        #region TravelPlan

        public async Task<ServiceResult<TravelPlanDto>> Create(int userId, CreateTravelPlanDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.Create(userId, dto);
            }
        }

        public async Task<ServiceResult<List<TravelPlanDto>>> GetAll(int userId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.GetAll(userId);
            }
        }

        public async Task<ServiceResult<TravelPlanDto>> GetById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.GetById(id);
            }
        }

        public async Task<ServiceResult<bool>> Update(int id, CreateTravelPlanDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.Update(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> Delete(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.Delete(id);
            }
        }

        public async Task<ServiceResult<List<TravelPlanDto>>> GetAllTravelPlans()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.GetAllTravelPlans();
            }
        }

        public async Task<ServiceResult<bool>> DeleteByUserId(int userId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<ITravelService>();
                return await service.DeleteByUserId(userId);
            }
        }

        #endregion

        #region Destination
        public async Task<ServiceResult<DestinationDto>> CreateDestination(int travelPlanId, CreateDestinationDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IDestinationService>();
                return await service.CreateDestination(travelPlanId, dto);
            }
        }

        public async Task<ServiceResult<List<DestinationDto>>> GetAllDestinations(int travelPlanId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IDestinationService>();
                return await service.GetAllDestinations(travelPlanId);
            }
        }

        public async Task<ServiceResult<DestinationDto>> GetDestinationById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IDestinationService>();
                return await service.GetDestinationById(id);
            }
        }

        public async Task<ServiceResult<bool>> UpdateDestination(int id, CreateDestinationDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IDestinationService>();
                return await service.UpdateDestination(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> DeleteDestination(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IDestinationService>();
                return await service.DeleteDestination(id);
            }
        }

        #endregion

        #region Activity

        public async Task<ServiceResult<ActivityDto>> CreateActivity(int travelPlanId, CreateActivityDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.CreateActivity(travelPlanId, dto);
            }
        }

        public async Task<ServiceResult<List<ActivityDto>>> GetAllActivities(int travelPlanId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.GetAllActivities(travelPlanId);
            }
        }

        public async Task<ServiceResult<List<ActivityDto>>> GetActivitiesByDate(int travelPlanId, DateTime date)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.GetActivitiesByDate(travelPlanId, date);
            }
        }

        public async Task<ServiceResult<List<ActivityDto>>> GetActivitiesInRange(int travelPlanId, DateTime startDate, DateTime endDate)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.GetActivitiesInRange(travelPlanId, startDate, endDate);
            }
        }

        public async Task<ServiceResult<ActivityDto>> GetActivityById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.GetActivityById(id);
            }
        }

        public async Task<ServiceResult<bool>> UpdateActivity(int id, CreateActivityDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.UpdateActivity(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> DeleteActivity(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IActivityService>();
                return await service.DeleteActivity(id);
            }
        }

        #endregion

        #region Expense

        public async Task<ServiceResult<ExpenseDto>> CreateExpense(int travelPlanId, CreateExpenseDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.CreateExpense(travelPlanId, dto);
            }
        }

        public async Task<ServiceResult<List<ExpenseDto>>> GetAllExpenses(int travelPlanId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.GetAllExpenses(travelPlanId);
            }
        }

        public async Task<ServiceResult<List<ExpenseDto>>> GetExpensesByCategory(int travelPlanId, int category)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.GetExpensesByCategory(travelPlanId, category);
            }
        }

        public async Task<ServiceResult<ExpenseDto>> GetExpenseById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.GetExpenseById(id);
            }
        }

        public async Task<ServiceResult<bool>> UpdateExpense(int id, CreateExpenseDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.UpdateExpense(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> DeleteExpense(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.DeleteExpense(id);
            }
        }

        public async Task<ServiceResult<BudgetSummaryDto>> GetBudgetSummary(int travelPlanId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                return await service.GetBudgetSummary(travelPlanId);
            }
        }

        #endregion

        #region Checklist

        public async Task<ServiceResult<ChecklistItemDto>> CreateChecklistItem(int travelPlanId, CreateChecklistItemDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.CreateChecklistItem(travelPlanId, dto);
            }
        }

        public async Task<ServiceResult<List<ChecklistItemDto>>> GetAllChecklistItems(int travelPlanId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.GetAllChecklistItems(travelPlanId);
            }
        }

        public async Task<ServiceResult<ChecklistItemDto>> GetChecklistItemById(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.GetChecklistItemById(id);
            }
        }

        public async Task<ServiceResult<bool>> UpdateChecklistItem(int id, CreateChecklistItemDto dto)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.UpdateChecklistItem(id, dto);
            }
        }

        public async Task<ServiceResult<bool>> ToggleChecklistItem(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.ToggleChecklistItem(id);
            }
        }

        public async Task<ServiceResult<bool>> DeleteChecklistItem(int id)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.DeleteChecklistItem(id);
            }
        }

        public async Task<ServiceResult<int>> GetCompletedCount(int travelPlanId)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IChecklistService>();
                return await service.GetCompletedCount(travelPlanId);
            }
        }

        #endregion

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