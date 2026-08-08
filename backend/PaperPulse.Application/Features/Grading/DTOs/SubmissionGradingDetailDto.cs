using PaperPulse.Application.Features.Submissions.DTOs;

namespace PaperPulse.Application.Features.Grading.DTOs;

public record SubmissionGradingDetailDto(
    Guid SubmissionId,
    Guid AssignmentId,
    string AssignmentTitle,
    decimal MaxMarks,
    decimal PassMarks,
    Guid StudentId,
    string StudentName,
    string StudentEmail,
    DateTimeOffset SubmittedAt,
    string Status,
    int AttemptCount,
    MarkDto? Mark,
    List<FeedbackDto> Feedbacks,
    List<SubmissionVersionDto> Versions
);
