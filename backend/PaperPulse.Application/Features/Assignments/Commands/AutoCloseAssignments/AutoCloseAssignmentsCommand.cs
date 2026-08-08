using MediatR;

namespace PaperPulse.Application.Features.Assignments.Commands.AutoCloseAssignments;

public record AutoCloseAssignmentsCommand : IRequest<int>;
