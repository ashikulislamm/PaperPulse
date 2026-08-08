using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Notifications.Commands.CleanupOldNotifications;

public class CleanupOldNotificationsCommandHandler : IRequestHandler<CleanupOldNotificationsCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CleanupOldNotificationsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CleanupOldNotificationsCommand request, CancellationToken cancellationToken)
    {
        var cutoffDate = DateTimeOffset.UtcNow.AddDays(-request.RetentionDays);

        var oldNotifications = await _context.Notifications
            .Where(n => n.Status == NotificationStatus.Read && n.ReadAt <= cutoffDate)
            .ToListAsync(cancellationToken);

        if (!oldNotifications.Any()) return 0;

        _context.Notifications.RemoveRange(oldNotifications);
        await _context.SaveChangesAsync(cancellationToken);

        return oldNotifications.Count;
    }
}
