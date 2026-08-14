using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Persistence.Context;
using PaperPulse.Persistence.Seed;

namespace PaperPulse.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        // Fetch connection string from Environment variable DB_URI or Configuration
        var rawConnection = Environment.GetEnvironmentVariable("DB_URI") 
                            ?? configuration.GetConnectionString("DefaultConnection") 
                            ?? configuration["DB_URI"];

        if (string.IsNullOrWhiteSpace(rawConnection))
        {
            throw new InvalidOperationException("Database connection URI not found. Ensure DB_URI is set in .env or configuration.");
        }

        var connectionString = ParseConnectionString(rawConnection);

        services.AddDbContext<PaperPulseDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(PaperPulseDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorCodesToAdd: null);
            });
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<PaperPulseDbContext>());

        // Register Database Seeder Service
        services.AddScoped<IDatabaseSeeder, DatabaseSeederService>();

        return services;
    }

    public static string ParseConnectionString(string connectionInput)
    {
        if (string.IsNullOrWhiteSpace(connectionInput))
            return string.Empty;

        // If it starts with postgresql:// or postgres://
        if (connectionInput.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            connectionInput.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var schemeEnd = connectionInput.IndexOf("://", StringComparison.Ordinal) + 3;
                var remainder = connectionInput.Substring(schemeEnd);

                // Find the LAST '@' which separates userinfo (which may contain '@' in password) from host
                var lastAtIndex = remainder.LastIndexOf('@');
                if (lastAtIndex == -1)
                {
                    throw new FormatException("Invalid PostgreSQL URI format: missing '@' separator.");
                }

                var userInfo = remainder.Substring(0, lastAtIndex);
                var hostAndPath = remainder.Substring(lastAtIndex + 1);

                // Split userInfo into Username and Password by first ':'
                var userParts = userInfo.Split(':', 2);
                var username = Uri.UnescapeDataString(userParts[0]);
                var password = userParts.Length > 1 ? Uri.UnescapeDataString(userParts[1]) : string.Empty;

                // Split hostAndPath into Host/Port and Database by first '/'
                var pathIndex = hostAndPath.IndexOf('/');
                var hostAndPort = pathIndex != -1 ? hostAndPath.Substring(0, pathIndex) : hostAndPath;
                var database = pathIndex != -1 ? hostAndPath.Substring(pathIndex + 1) : "postgres";

                // Remove query parameters if present in database name
                var queryIndex = database.IndexOf('?');
                if (queryIndex != -1)
                {
                    database = database.Substring(0, queryIndex);
                }

                // Split hostAndPort into Host and Port by last ':'
                var portIndex = hostAndPort.LastIndexOf(':');
                var host = portIndex != -1 ? hostAndPort.Substring(0, portIndex) : hostAndPort;
                var port = portIndex != -1 && int.TryParse(hostAndPort.Substring(portIndex + 1), out var p) ? p : 5432;

                var builder = new NpgsqlConnectionStringBuilder
                {
                    Host = ResolveIpv4(host),
                    Port = port,
                    Database = string.IsNullOrWhiteSpace(database) ? "postgres" : database,
                    Username = username,
                    Password = password,
                    SslMode = SslMode.Require
                };

                return builder.ConnectionString;
            }
            catch
            {
                // Fallback to raw string if parsing fails
                return connectionInput;
            }
        }

        return connectionInput;
    }

    private static string ResolveIpv4(string host)
    {
        try
        {
            var addresses = Dns.GetHostAddresses(host);
            var ipv4 = addresses.FirstOrDefault(a => a.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
            if (ipv4 != null) return ipv4.ToString();
        }
        catch { }
        return host;
    }
}
