using FluentValidation;

namespace PaperPulse.Application.Features.Submissions.Commands.CreateSubmission;

public class CreateSubmissionCommandValidator : AbstractValidator<CreateSubmissionCommand>
{
    public CreateSubmissionCommandValidator()
    {
        RuleFor(x => x.AssignmentId)
            .NotEmpty().WithMessage("Assignment ID is required.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Submission content is required.")
            .MaximumLength(10000).WithMessage("Content must not exceed 10000 characters.");
    }
}
