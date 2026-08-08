using MediatR;

namespace PaperPulse.Application.Features.Notifications.Commands.MarkNotificationAsRead;

public record MarkNotificationAsReadCommand(Guid Id) : IRequest<Unit>;
