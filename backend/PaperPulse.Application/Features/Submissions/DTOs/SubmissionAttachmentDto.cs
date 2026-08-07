namespace PaperPulse.Application.Features.Submissions.DTOs;

public record SubmissionAttachmentDto(
    Guid Id,
    string FileName,
    string FilePath,
    string FileType,
    long FileSizeBytes
);
