using MediatR;

namespace PaperPulse.Application.Features.Assignments.Commands.DeleteAssignment;

public record DeleteAssignmentCommand(Guid Id) : IRequest<Unit>;
