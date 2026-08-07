namespace PaperPulse.Application.Features.Submissions.DTOs;

public record SubmissionVersionDto(
    Guid Id,
    int VersionNumber,
    string Content,
    DateTimeOffset SubmittedAt,
    bool IsLate,
    List<SubmissionAttachmentDto> Attachments
);
