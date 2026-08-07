namespace PaperPulse.Application.Features.StudentExperience.DTOs;

public record UpcomingDeadlineDto(
    Guid AssignmentId,
    string Title,
    string ClassName,
    string SubjectName,
    DateTimeOffset DueDate,
    double HoursRemaining,
    bool IsOverdue
);
