using MediatR;
using PaperPulse.Application.Features.Assignments.DTOs;

namespace PaperPulse.Application.Features.Assignments.Commands.UpdateAssignment;

public record UpdateAssignmentCommand(
    Guid Id,
    string Title,
    string Description,
    decimal MaxMarks,
    decimal PassMarks,
    DateTimeOffset DueDate,
    bool AllowLateSubmission,
    decimal LatePenaltyPercentage
) : IRequest<AssignmentDetailDto>;
