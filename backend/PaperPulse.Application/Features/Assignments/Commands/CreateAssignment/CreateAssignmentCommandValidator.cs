using FluentValidation;

namespace PaperPulse.Application.Features.Assignments.Commands.CreateAssignment;

public class CreateAssignmentCommandValidator : AbstractValidator<CreateAssignmentCommand>
{
    public CreateAssignmentCommandValidator()
    {
        RuleFor(x => x.TeacherAssignmentId)
            .NotEmpty().WithMessage("Teacher assignment ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Assignment title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Assignment description is required.")
            .MaximumLength(5000).WithMessage("Description must not exceed 5000 characters.");

        RuleFor(x => x.MaxMarks)
            .GreaterThan(0).WithMessage("Max marks must be greater than 0.");

        RuleFor(x => x.PassMarks)
            .GreaterThanOrEqualTo(0).WithMessage("Pass marks cannot be negative.")
            .LessThanOrEqualTo(x => x.MaxMarks).WithMessage("Pass marks cannot exceed Max marks.");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTimeOffset.UtcNow).WithMessage("Due date must be in the future.");

        RuleFor(x => x.LatePenaltyPercentage)
            .GreaterThanOrEqualTo(0).WithMessage("Late penalty percentage cannot be negative.")
            .LessThanOrEqualTo(100).WithMessage("Late penalty percentage cannot exceed 100%.");
    }
}
