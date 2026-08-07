namespace PaperPulse.Application.Features.Assignments.DTOs;

public record AssignmentAttachmentDto(
    Guid Id,
    string FileName,
    string FilePath,
    string FileType,
    long FileSizeBytes
);
