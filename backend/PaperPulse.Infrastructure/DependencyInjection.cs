using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Infrastructure.Authentication;
using PaperPulse.Infrastructure.Authorization;
using PaperPulse.Infrastructure.BackgroundServices;
using PaperPulse.Infrastructure.Identity;
using PaperPulse.Infrastructure.Services;

namespace PaperPulse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(options =>
        {
            configuration.GetSection(JwtOptions.SectionName).Bind(options);
            // Override SecretKey from env var (env var takes precedence over config file)
            var envSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
            if (!string.IsNullOrWhiteSpace(envSecret))
            {
                options.SecretKey = envSecret;
            }
        });

        services.AddHttpContextAccessor();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        // Register Dynamic Permission-Based Authorization Handlers
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        // Register Background Processing HostedServices
        services.AddHostedService<AssignmentAutoCloseBackgroundService>();
        services.AddHostedService<DeadlineReminderBackgroundService>();
        services.AddHostedService<RefreshTokenCleanupBackgroundService>();
        services.AddHostedService<NotificationCleanupBackgroundService>();

        return services;
    }
}
