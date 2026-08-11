using FluentValidation;

namespace PaperPulse.Application.Features.Users.Commands.BanUser;

public class BanUserCommandValidator : AbstractValidator<BanUserCommand>
{
    public BanUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage("Ban reason must not exceed 500 characters.");
    }
}
