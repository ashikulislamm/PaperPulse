using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PaperPulse.Application.Features.Notifications.Commands.SendDeadlineReminders;

namespace PaperPulse.Infrastructure.BackgroundServices;

public class DeadlineReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DeadlineReminderBackgroundService> _logger;

    public DeadlineReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<DeadlineReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<ISender>();
                var dispatchedCount = await mediator.Send(new SendDeadlineRemindersCommand(24), stoppingToken);

                if (dispatchedCount > 0)
                {
                    _logger.LogInformation("DeadlineReminderBackgroundService dispatched {Count} deadline reminders.", dispatchedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in DeadlineReminderBackgroundService.");
            }
        }
    }
}
