using MediatR;

namespace PaperPulse.Application.Features.Notifications.Commands.CleanupOldNotifications;

public record CleanupOldNotificationsCommand(int RetentionDays = 30) : IRequest<int>;
