using FluentValidation;

namespace PaperPulse.Application.Features.Submissions.Commands.UpdateSubmission;

public class UpdateSubmissionCommandValidator : AbstractValidator<UpdateSubmissionCommand>
{
    public UpdateSubmissionCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty().WithMessage("Submission ID is required.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Submission content is required.");
    }
}
