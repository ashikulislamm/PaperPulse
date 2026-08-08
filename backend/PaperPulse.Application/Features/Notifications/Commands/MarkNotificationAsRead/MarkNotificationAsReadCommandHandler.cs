using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Notifications.Commands.MarkNotificationAsRead;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public MarkNotificationAsReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (notification == null)
        {
            throw new NotFoundException($"Notification with ID '{request.Id}' was not found.");
        }

        if (notification.UserId != userId.Value)
        {
            throw new ForbiddenException("You can only modify your own notifications.");
        }

        if (notification.Status != NotificationStatus.Read)
        {
            notification.Status = NotificationStatus.Read;
            notification.ReadAt = DateTimeOffset.UtcNow;
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
