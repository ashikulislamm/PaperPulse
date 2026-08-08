using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;

public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public MarkAllNotificationsAsReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId.Value && n.Status == NotificationStatus.Unread)
            .ToListAsync(cancellationToken);

        if (unreadNotifications.Any())
        {
            var now = DateTimeOffset.UtcNow;
            foreach (var n in unreadNotifications)
            {
                n.Status = NotificationStatus.Read;
                n.ReadAt = now;
            }

            _context.Notifications.UpdateRange(unreadNotifications);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
