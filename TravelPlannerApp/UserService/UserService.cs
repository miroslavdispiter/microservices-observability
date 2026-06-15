using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Common;
using Shared.DTOs.User;
using Shared.Interfaces;
using System.Fabric;
using UserService.DbContext;
using UserService.Interfaces;
using UserService.Repositories;
using UserService.Services;

namespace UserService
{
    internal sealed class UserService : StatelessService, IUserService
    {
        private readonly ServiceProvider _serviceProvider;

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
            return this.CreateServiceRemotingInstanceListeners();
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