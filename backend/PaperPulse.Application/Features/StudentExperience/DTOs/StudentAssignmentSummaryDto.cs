namespace PaperPulse.Application.Features.StudentExperience.DTOs;

public record StudentAssignmentSummaryDto(
    Guid AssignmentId,
    string Title,
    string Description,
    string ClassName,
    string SubjectName,
    string TeacherName,
    DateTimeOffset DueDate,
    decimal MaxMarks,
    decimal PassMarks,
    string AssignmentStatus,
    string SubmissionStatus,
    DateTimeOffset? SubmittedAt,
    bool IsOverdue,
    decimal? GradeObtained
);
