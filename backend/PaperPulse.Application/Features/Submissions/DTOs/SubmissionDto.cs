namespace PaperPulse.Application.Features.Submissions.DTOs;

public record SubmissionDto(
    Guid Id,
    Guid AssignmentId,
    string AssignmentTitle,
    Guid StudentId,
    string StudentName,
    DateTimeOffset SubmittedAt,
    string Status,
    int AttemptCount,
    List<SubmissionVersionDto> Versions
);
