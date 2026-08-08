using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PaperPulse.Application.Features.Notifications.Commands.CleanupOldNotifications;

namespace PaperPulse.Infrastructure.BackgroundServices;

public class NotificationCleanupBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationCleanupBackgroundService> _logger;

    public NotificationCleanupBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<NotificationCleanupBackgroundService> logger)
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
                var purgedCount = await mediator.Send(new CleanupOldNotificationsCommand(30), stoppingToken);

                if (purgedCount > 0)
                {
                    _logger.LogInformation("NotificationCleanupBackgroundService purged {Count} old read notifications.", purgedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in NotificationCleanupBackgroundService.");
            }
        }
    }
}
