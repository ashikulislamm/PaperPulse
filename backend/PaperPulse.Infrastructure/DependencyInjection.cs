using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Infrastructure.Authentication;
using PaperPulse.Infrastructure.Identity;

namespace PaperPulse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddHttpContextAccessor();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}
