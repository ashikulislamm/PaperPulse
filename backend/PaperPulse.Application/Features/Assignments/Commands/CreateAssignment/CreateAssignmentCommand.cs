using MediatR;
using PaperPulse.Application.Features.Assignments.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Assignments.Commands.CreateAssignment;

public record CreateAssignmentCommand(
    Guid TeacherAssignmentId,
    string Title,
    string Description,
    decimal MaxMarks,
    decimal PassMarks,
    DateTimeOffset DueDate,
    bool AllowLateSubmission = false,
    decimal LatePenaltyPercentage = 0.00m,
    AssignmentStatus Status = AssignmentStatus.Draft
) : IRequest<AssignmentDetailDto>;
