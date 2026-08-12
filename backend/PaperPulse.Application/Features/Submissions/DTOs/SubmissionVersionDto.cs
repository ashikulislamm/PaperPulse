namespace PaperPulse.Application.Features.Submissions.DTOs;

public record SubmissionVersionDto(
    Guid Id,
    int VersionNumber,
    string SubmissionText,
    DateTimeOffset SubmittedAt,
    bool IsLate,
    List<SubmissionAttachmentDto> Attachments
);
