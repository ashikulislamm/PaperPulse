using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PaperPulse.Persistence.Context;
using PaperPulse.Persistence.Seed;

namespace PaperPulse.Persistence;

public static class DatabaseMigrationExtensions
{
    public static async Task MigrateAndSeedDatabaseAsync(this IServiceProvider serviceProvider, bool isDevelopment)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<PaperPulseDbContext>>();

        try
        {
            logger.LogInformation("Applying EF Core Database Migrations...");
            var context = services.GetRequiredService<PaperPulseDbContext>();
            await context.Database.MigrateAsync();
            logger.LogInformation("EF Core Database Migrations applied successfully.");

            var seeder = services.GetRequiredService<IDatabaseSeeder>();
            await seeder.SeedAsync(isDevelopment);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
            throw;
        }
    }
}
