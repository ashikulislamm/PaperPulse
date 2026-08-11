using FluentValidation;

namespace PaperPulse.Application.Features.Notifications.Commands.SendDeadlineReminders;

public class SendDeadlineRemindersCommandValidator : AbstractValidator<SendDeadlineRemindersCommand>
{
    public SendDeadlineRemindersCommandValidator()
    {
        RuleFor(x => x.HoursThreshold)
            .InclusiveBetween(1, 168).WithMessage("Hours threshold must be between 1 and 168 (1 week).");
    }
}
