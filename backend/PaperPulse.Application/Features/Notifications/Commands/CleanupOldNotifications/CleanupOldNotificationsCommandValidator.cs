using FluentValidation;

namespace PaperPulse.Application.Features.Notifications.Commands.CleanupOldNotifications;

public class CleanupOldNotificationsCommandValidator : AbstractValidator<CleanupOldNotificationsCommand>
{
    public CleanupOldNotificationsCommandValidator()
    {
        RuleFor(x => x.RetentionDays)
            .InclusiveBetween(1, 365).WithMessage("Retention days must be between 1 and 365.");
    }
}
