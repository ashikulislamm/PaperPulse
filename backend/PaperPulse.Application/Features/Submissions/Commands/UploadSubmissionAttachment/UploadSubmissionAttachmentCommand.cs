using MediatR;

namespace PaperPulse.Application.Features.Submissions.Commands.UploadSubmissionAttachment;

public record UploadSubmissionAttachmentCommand(
    Guid SubmissionVersionId,
    Stream FileStream,
    string FileName,
    string ContentType
) : IRequest<UploadSubmissionAttachmentResult>;

public record UploadSubmissionAttachmentResult(
    Guid AttachmentId,
    string FileName,
    string FilePath,
    long FileSize
);
