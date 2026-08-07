using MediatR;

namespace PaperPulse.Application.Features.Assignments.Commands.ArchiveAssignment;

public record ArchiveAssignmentCommand(Guid Id) : IRequest<Unit>;
