using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PaperPulse.Application.Features.Auth.Commands.CleanupRefreshTokens;

namespace PaperPulse.Infrastructure.BackgroundServices;

public class RefreshTokenCleanupBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RefreshTokenCleanupBackgroundService> _logger;

    public RefreshTokenCleanupBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<RefreshTokenCleanupBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<ISender>();
                var purgedCount = await mediator.Send(new CleanupRefreshTokensCommand(), stoppingToken);

                if (purgedCount > 0)
                {
                    _logger.LogInformation("RefreshTokenCleanupBackgroundService purged {Count} stale refresh tokens.", purgedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in RefreshTokenCleanupBackgroundService.");
            }
        }
    }
}
