using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TravelService.DbContext
{
    public class TravelDbContextFactory : IDesignTimeDbContextFactory<TravelDbContext>
    {
        public TravelDbContext CreateDbContext(string[] args)
        {
            var configPath = Path.Combine(Directory.GetCurrentDirectory(), "PackageRoot", "Config");
            var appSettingsPath = Path.Combine(configPath, "appsettings.json");

            if (!File.Exists(appSettingsPath))
            {
                appSettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            }

            IConfiguration configuration = new ConfigurationBuilder()
                .AddJsonFile(appSettingsPath, optional: false, reloadOnChange: true)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<TravelDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseSqlServer(connectionString);

            return new TravelDbContext(optionsBuilder.Options);
        }
    }
}