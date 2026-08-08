using MediatR;

namespace PaperPulse.Application.Features.Notifications.Commands.SendDeadlineReminders;

public record SendDeadlineRemindersCommand(int HoursThreshold = 24) : IRequest<int>;
