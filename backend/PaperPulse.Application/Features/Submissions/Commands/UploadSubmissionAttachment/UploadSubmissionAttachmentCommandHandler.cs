using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Submissions.Commands.UploadSubmissionAttachment;

public class UploadSubmissionAttachmentCommandHandler
    : IRequestHandler<UploadSubmissionAttachmentCommand, UploadSubmissionAttachmentResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;

    public UploadSubmissionAttachmentCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
    }

    public async Task<UploadSubmissionAttachmentResult> Handle(
        UploadSubmissionAttachmentCommand request,
        CancellationToken cancellationToken)
    {
        var version = await _context.SubmissionVersions
            .Include(v => v.Submission)
            .FirstOrDefaultAsync(v => v.Id == request.SubmissionVersionId, cancellationToken);

        if (version == null)
            throw new NotFoundException($"Submission version with ID '{request.SubmissionVersionId}' was not found.");

        var userId = _currentUserService.UserId;
        if (userId == null || version.Submission.StudentId != userId)
            throw new ForbiddenException("You can only upload files to your own submissions.");

        var allowedTypes = new[]
        {
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/zip",
            "application/x-zip-compressed",
            "application/x-rar-compressed",
            "application/octet-stream",
            "text/plain",
            "image/png",
            "image/jpeg"
        };

        var ext = Path.GetExtension(request.FileName).ToLowerInvariant();
        var allowedExts = new[] { ".pdf", ".docx", ".doc", ".zip", ".rar", ".txt", ".png", ".jpg", ".jpeg" };

        if (!allowedTypes.Contains(request.ContentType) && !allowedExts.Contains(ext))
            throw new ValidationException("Invalid file type. Allowed: PDF, DOCX, ZIP, TXT, Images.");

        if (request.FileStream.Length > 25 * 1024 * 1024)
            throw new ValidationException("File size exceeds 25MB limit.");

        var result = await _fileStorageService.UploadFileAsync(
            request.FileStream, request.FileName, request.ContentType, "submissions", cancellationToken);

        var attachment = new SubmissionAttachment
        {
            SubmissionVersionId = request.SubmissionVersionId,
            FileName = result.FileName,
            FilePath = result.FilePath,
            FileSizeBytes = result.FileSize,
            MimeType = result.ContentType,
            StorageProvider = "local"
        };

        _context.SubmissionAttachments.Add(attachment);
        await _context.SaveChangesAsync(cancellationToken);

        return new UploadSubmissionAttachmentResult(
            attachment.Id,
            attachment.FileName,
            attachment.FilePath,
            attachment.FileSizeBytes);
    }
}
