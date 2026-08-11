using MediatR;

namespace PaperPulse.Application.Features.Assignments.Commands.UploadAssignmentAttachment;

public record UploadAssignmentAttachmentCommand(
    Guid AssignmentId,
    Stream FileStream,
    string FileName,
    string ContentType
) : IRequest<UploadAssignmentAttachmentResult>;

public record UploadAssignmentAttachmentResult(
    Guid AttachmentId,
    string FileName,
    string FilePath,
    long FileSize
);
