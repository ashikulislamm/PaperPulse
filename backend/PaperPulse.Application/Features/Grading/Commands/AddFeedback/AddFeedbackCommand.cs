using MediatR;
using PaperPulse.Application.Features.Grading.DTOs;

namespace PaperPulse.Application.Features.Grading.Commands.AddFeedback;

public record AddFeedbackCommand(
    Guid SubmissionId,
    string Comments,
    bool IsPrivate = false
) : IRequest<FeedbackDto>;
