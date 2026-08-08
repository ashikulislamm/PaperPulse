namespace PaperPulse.Application.Features.StudentExperience.DTOs;

public record StudentGradeSummaryDto(
    Guid SubmissionId,
    Guid AssignmentId,
    string AssignmentTitle,
    string ClassName,
    string SubjectName,
    decimal ScoreObtained,
    decimal MaxMarks,
    decimal PassMarks,
    bool IsPassed,
    string SubmissionStatus,
    DateTimeOffset GradedAt,
    string TeacherName,
    List<string> FeedbackComments
);
