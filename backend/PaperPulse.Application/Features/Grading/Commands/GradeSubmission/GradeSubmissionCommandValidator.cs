using FluentValidation;

namespace PaperPulse.Application.Features.Grading.Commands.GradeSubmission;

public class GradeSubmissionCommandValidator : AbstractValidator<GradeSubmissionCommand>
{
    public GradeSubmissionCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty().WithMessage("Submission ID is required.");

        RuleFor(x => x.ScoreObtained)
            .GreaterThanOrEqualTo(0).WithMessage("Score obtained cannot be negative.");
    }
}
