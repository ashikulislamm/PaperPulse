using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Events;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Submissions.Commands.UpdateSubmission;

public class UpdateSubmissionCommandHandler : IRequestHandler<UpdateSubmissionCommand, SubmissionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPublisher _publisher;

    public UpdateSubmissionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IPublisher publisher)
    {
        _context = context;
        _currentUserService = currentUserService;
        _publisher = publisher;
    }

    public async Task<SubmissionDto> Handle(UpdateSubmissionCommand request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Student is not authenticated.");
        }

        var submission = await _context.StudentSubmissions
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Include(s => s.Versions)
                .ThenInclude(v => v.Attachments)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
        {
            throw new NotFoundException($"Submission with ID '{request.SubmissionId}' was not found.");
        }

        if (submission.StudentId != studentId.Value)
        {
            throw new ForbiddenException("You can only edit your own submissions.");
        }

        if (submission.Status == SubmissionStatus.Graded)
        {
            throw new BadRequestException("Cannot resubmit an assignment that has already been graded.");
        }

        var now = DateTimeOffset.UtcNow;
        var isLate = now > submission.Assignment.DueDate;

        if (isLate && !submission.Assignment.AllowLateSubmission)
        {
            throw new ForbiddenException("Late resubmissions are not permitted for this assignment.");
        }

        submission.AttemptCount += 1;
        submission.SubmittedAt = now;
        submission.Status = isLate ? SubmissionStatus.LateSubmitted : SubmissionStatus.Submitted;

        var nextVersionNumber = submission.Versions.Max(v => (int?)v.VersionNumber) ?? 0;
        nextVersionNumber += 1;

        var newVersion = new SubmissionVersion
        {
            SubmissionId = submission.Id,
            VersionNumber = nextVersionNumber,
            SubmissionText = request.Content.Trim(),
            SubmittedAt = now,
            IsLate = isLate
        };

        _context.SubmissionVersions.Add(newVersion);
        _context.StudentSubmissions.Update(submission);

        await _context.SaveChangesAsync(cancellationToken);
        await _publisher.Publish(new SubmissionReceivedEvent(submission.Id), cancellationToken);

        var studentName = $"{submission.Student.FirstName} {submission.Student.LastName}";

        var versionDtos = submission.Versions.OrderBy(v => v.VersionNumber).Select(v => new SubmissionVersionDto(
            v.Id,
            v.VersionNumber,
            v.SubmissionText ?? string.Empty,
            v.SubmittedAt,
            v.IsLate,
            v.Attachments.Select(att => new SubmissionAttachmentDto(
                att.Id, att.FileName, att.FilePath, att.MimeType, att.FileSizeBytes
            )).ToList()
        )).ToList();

        return new SubmissionDto(
            submission.Id,
            submission.AssignmentId,
            submission.Assignment.Title,
            submission.StudentId,
            studentName,
            submission.SubmittedAt,
            submission.Status.ToString(),
            submission.AttemptCount,
            versionDtos
        );
    }
}
