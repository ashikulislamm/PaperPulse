using MediatR;

namespace PaperPulse.Application.Features.Grading.Commands.ReturnSubmission;

public record ReturnSubmissionCommand(Guid SubmissionId) : IRequest<Unit>;
