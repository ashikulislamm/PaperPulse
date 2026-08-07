using MediatR;
using PaperPulse.Application.Features.Submissions.DTOs;

namespace PaperPulse.Application.Features.Submissions.Commands.UpdateSubmission;

public record UpdateSubmissionCommand(
    Guid SubmissionId,
    string Content
) : IRequest<SubmissionDto>;
