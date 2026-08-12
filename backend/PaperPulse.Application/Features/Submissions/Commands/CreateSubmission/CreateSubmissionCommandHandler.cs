using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Events;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Submissions.Commands.CreateSubmission;

public class CreateSubmissionCommandHandler : IRequestHandler<CreateSubmissionCommand, SubmissionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPublisher _publisher;
    private readonly IAuditLogService _auditLogService;

    public CreateSubmissionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IPublisher publisher,
        IAuditLogService auditLogService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _publisher = publisher;
        _auditLogService = auditLogService;
    }

    public async Task<SubmissionDto> Handle(CreateSubmissionCommand request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Student is not authenticated.");
        }

        var student = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == studentId.Value, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student account not found.");
        }

        var assignment = await _context.Assignments
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
        {
            throw new NotFoundException($"Assignment with ID '{request.AssignmentId}' was not found.");
        }

        if (assignment.Status != AssignmentStatus.Published && assignment.Status != AssignmentStatus.Closed)
        {
            throw new BadRequestException("Submissions can only be made for published assignments.");
        }

        // Enrollment Guard & Auto-Enrollment
        var targetClassId = assignment.TeacherAssignment.ClassSubject.ClassId;
        var isEnrolled = await _context.StudentEnrollments
            .AnyAsync(se => se.StudentId == studentId.Value &&
                            se.ClassId == targetClassId, cancellationToken);

        if (!isEnrolled)
        {
            _context.StudentEnrollments.Add(new StudentEnrollment
            {
                StudentId = studentId.Value,
                ClassId = targetClassId,
                RollNumber = "AUTO",
                IsActive = true
            });
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Existing Submission Check
        var existingSubmission = await _context.StudentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == studentId.Value, cancellationToken);

        if (existingSubmission != null)
        {
            throw new ConflictException("You have already submitted for this assignment. Please use the update/resubmit option.");
        }

        var now = DateTimeOffset.UtcNow;
        var isLate = now > assignment.DueDate;

        if (isLate && !assignment.AllowLateSubmission)
        {
            throw new ForbiddenException("Late submissions are not permitted for this assignment.");
        }

        var status = isLate ? SubmissionStatus.LateSubmitted : SubmissionStatus.Submitted;

        var submission = new StudentSubmission
        {
            TenantId = assignment.TenantId,
            AssignmentId = assignment.Id,
            StudentId = studentId.Value,
            SubmittedAt = now,
            Status = status,
            AttemptCount = 1
        };

        _context.StudentSubmissions.Add(submission);

        var initialVersion = new SubmissionVersion
        {
            SubmissionId = submission.Id,
            VersionNumber = 1,
            SubmissionText = request.Content.Trim(),
            SubmittedAt = now,
            IsLate = isLate
        };

        _context.SubmissionVersions.Add(initialVersion);
        await _context.SaveChangesAsync(cancellationToken);
        await _publisher.Publish(new SubmissionReceivedEvent(submission.Id), cancellationToken);
        await _auditLogService.LogAsync(
            "SubmissionCreated",
            "StudentSubmission",
            submission.Id,
            newValues: new { assignment.Title, Status = status.ToString(), IsLate = isLate },
            cancellationToken: cancellationToken);

        var studentName = $"{student.FirstName} {student.LastName}";

        var versionDto = new SubmissionVersionDto(
            initialVersion.Id,
            initialVersion.VersionNumber,
            initialVersion.SubmissionText ?? string.Empty,
            initialVersion.SubmittedAt,
            initialVersion.IsLate,
            new List<SubmissionAttachmentDto>()
        );

        return new SubmissionDto(
            submission.Id,
            assignment.Id,
            assignment.Title,
            studentId.Value,
            studentName,
            submission.SubmittedAt,
            submission.Status.ToString(),
            submission.AttemptCount,
            new List<SubmissionVersionDto> { versionDto }
        );
    }
}
