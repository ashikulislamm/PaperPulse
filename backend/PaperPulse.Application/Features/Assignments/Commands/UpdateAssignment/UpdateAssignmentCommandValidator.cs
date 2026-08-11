using FluentValidation;

namespace PaperPulse.Application.Features.Assignments.Commands.UpdateAssignment;

public class UpdateAssignmentCommandValidator : AbstractValidator<UpdateAssignmentCommand>
{
    public UpdateAssignmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Assignment ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(5000).WithMessage("Description must not exceed 5000 characters.");

        RuleFor(x => x.MaxMarks)
            .GreaterThan(0).WithMessage("Max marks must be greater than 0.");

        RuleFor(x => x.PassMarks)
            .GreaterThanOrEqualTo(0).WithMessage("Pass marks cannot be negative.")
            .LessThanOrEqualTo(x => x.MaxMarks).WithMessage("Pass marks cannot exceed Max marks.");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required.");

        RuleFor(x => x.LatePenaltyPercentage)
            .GreaterThanOrEqualTo(0).WithMessage("Late penalty percentage cannot be negative.")
            .LessThanOrEqualTo(100).WithMessage("Late penalty percentage cannot exceed 100%.");
    }
}
