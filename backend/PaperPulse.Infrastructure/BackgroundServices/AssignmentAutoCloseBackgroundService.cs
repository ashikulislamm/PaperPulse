using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PaperPulse.Application.Features.Assignments.Commands.AutoCloseAssignments;

namespace PaperPulse.Infrastructure.BackgroundServices;

public class AssignmentAutoCloseBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AssignmentAutoCloseBackgroundService> _logger;

    public AssignmentAutoCloseBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<AssignmentAutoCloseBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<ISender>();
                var closedCount = await mediator.Send(new AutoCloseAssignmentsCommand(), stoppingToken);

                if (closedCount > 0)
                {
                    _logger.LogInformation("AutoCloseAssignmentsBackgroundService closed {Count} expired assignments.", closedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in AssignmentAutoCloseBackgroundService.");
            }
        }
    }
}
