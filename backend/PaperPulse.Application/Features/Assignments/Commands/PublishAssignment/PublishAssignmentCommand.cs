using MediatR;

namespace PaperPulse.Application.Features.Assignments.Commands.PublishAssignment;

public record PublishAssignmentCommand(Guid Id) : IRequest<Unit>;
