using MediatR;
using PaperPulse.Application.Features.Submissions.DTOs;

namespace PaperPulse.Application.Features.Submissions.Commands.CreateSubmission;

public record CreateSubmissionCommand(
    Guid AssignmentId,
    string Content
) : IRequest<SubmissionDto>;
