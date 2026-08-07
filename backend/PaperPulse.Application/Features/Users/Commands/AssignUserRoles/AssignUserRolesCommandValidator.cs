using FluentValidation;

namespace PaperPulse.Application.Features.Users.Commands.AssignUserRoles;

public class AssignUserRolesCommandValidator : AbstractValidator<AssignUserRolesCommand>
{
    public AssignUserRolesCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Roles)
            .NotNull().WithMessage("Roles list is required.")
            .Must(r => r.Count > 0).WithMessage("At least one role must be assigned.");
    }
}
