namespace PaperPulse.Application.Features.Assignments.DTOs;

public record AssignmentDetailDto(
    Guid Id,
    Guid TeacherAssignmentId,
    string ClassName,
    string SubjectName,
    string TeacherName,
    string Title,
    string Description,
    decimal MaxMarks,
    decimal PassMarks,
    DateTimeOffset DueDate,
    string Status,
    bool AllowLateSubmission,
    decimal LatePenaltyPercentage,
    List<AssignmentAttachmentDto> Attachments,
    DateTimeOffset CreatedAt
);
