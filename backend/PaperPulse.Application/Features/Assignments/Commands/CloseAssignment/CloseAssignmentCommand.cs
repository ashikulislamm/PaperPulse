using MediatR;

namespace PaperPulse.Application.Features.Assignments.Commands.CloseAssignment;

public record CloseAssignmentCommand(Guid Id) : IRequest<Unit>;
