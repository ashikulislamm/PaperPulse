using FluentValidation;

namespace PaperPulse.Application.Features.Grading.Commands.AddFeedback;

public class AddFeedbackCommandValidator : AbstractValidator<AddFeedbackCommand>
{
    public AddFeedbackCommandValidator()
    {
        RuleFor(x => x.SubmissionId)
            .NotEmpty().WithMessage("Submission ID is required.");

        RuleFor(x => x.Comments)
            .NotEmpty().WithMessage("Feedback comments are required.")
            .MaximumLength(5000).WithMessage("Comments must not exceed 5000 characters.");
    }
}
