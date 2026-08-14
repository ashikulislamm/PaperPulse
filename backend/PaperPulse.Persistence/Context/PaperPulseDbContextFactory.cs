using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PaperPulse.Persistence.Context;

public class PaperPulseDbContextFactory : IDesignTimeDbContextFactory<PaperPulseDbContext>
{
    public PaperPulseDbContext CreateDbContext(string[] args)
    {
        // Try loading .env from solution root or backend directory
        var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
        if (!File.Exists(envPath))
        {
            envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
        }

        if (File.Exists(envPath))
        {
            DotNetEnv.Env.Load(envPath);
        }

        var rawConnection = Environment.GetEnvironmentVariable("DB_URI");

        if (string.IsNullOrWhiteSpace(rawConnection))
        {
            throw new InvalidOperationException("DB_URI environment variable is not set. Ensure it is configured in your .env file.");
        }

        var connectionString = DependencyInjection.ParseConnectionString(rawConnection);

        var optionsBuilder = new DbContextOptionsBuilder<PaperPulseDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly(typeof(PaperPulseDbContext).Assembly.FullName);
        });

        return new PaperPulseDbContext(optionsBuilder.Options);
    }
}
