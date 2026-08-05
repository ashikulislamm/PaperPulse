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

        var rawConnection = Environment.GetEnvironmentVariable("DB_URI")
                            ?? "postgresql://postgres:PaperPulse@123@db.pdabvjfvwugrhlpbvmyh.supabase.co:5432/postgres";

        var connectionString = DependencyInjection.ParseConnectionString(rawConnection);

        var optionsBuilder = new DbContextOptionsBuilder<PaperPulseDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly(typeof(PaperPulseDbContext).Assembly.FullName);
        });

        return new PaperPulseDbContext(optionsBuilder.Options);
    }
}
