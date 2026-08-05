namespace PaperPulse.Persistence.Seed;

public interface IDatabaseSeeder
{
    Task SeedAsync(bool isDevelopment, CancellationToken cancellationToken = default);
}
