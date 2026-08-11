using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Assignments.Commands.UploadAssignmentAttachment;

public class UploadAssignmentAttachmentCommandHandler
    : IRequestHandler<UploadAssignmentAttachmentCommand, UploadAssignmentAttachmentResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public UploadAssignmentAttachmentCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<UploadAssignmentAttachmentResult> Handle(
        UploadAssignmentAttachmentCommand request,
        CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.TeacherAssignment)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
            throw new NotFoundException($"Assignment with ID '{request.AssignmentId}' was not found.");

        var allowedTypes = new[]
        {
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/zip",
            "application/x-rar-compressed",
            "text/plain",
            "image/png",
            "image/jpeg",
            "image/gif"
        };

        if (!allowedTypes.Contains(request.ContentType))
            throw new ValidationException("Invalid file type. Allowed: PDF, DOCX, ZIP, TXT, Images.");

        if (request.FileStream.Length > 50 * 1024 * 1024)
            throw new ValidationException("File size exceeds 50MB limit.");

        var result = await _fileStorageService.UploadFileAsync(
            request.FileStream, request.FileName, request.ContentType, "assignments", cancellationToken);

        var attachment = new AssignmentAttachment
        {
            AssignmentId = request.AssignmentId,
            FileName = result.FileName,
            FilePath = result.FilePath,
            FileSizeBytes = result.FileSize,
            MimeType = result.ContentType,
            StorageProvider = "local"
        };

        _context.AssignmentAttachments.Add(attachment);
        await _context.SaveChangesAsync(cancellationToken);

        return new UploadAssignmentAttachmentResult(
            attachment.Id,
            attachment.FileName,
            attachment.FilePath,
            attachment.FileSizeBytes);
    }
}
