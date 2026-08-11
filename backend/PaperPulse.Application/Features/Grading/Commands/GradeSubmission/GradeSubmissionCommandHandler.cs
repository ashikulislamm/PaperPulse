using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Events;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Grading.DTOs;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Grading.Commands.GradeSubmission;

public class GradeSubmissionCommandHandler : IRequestHandler<GradeSubmissionCommand, SubmissionGradingDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPublisher _publisher;

    public GradeSubmissionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IPublisher publisher)
    {
        _context = context;
        _currentUserService = currentUserService;
        _publisher = publisher;
    }

    public async Task<SubmissionGradingDetailDto> Handle(GradeSubmissionCommand request, CancellationToken cancellationToken)
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue)
        {
            throw new UnauthorizedException("Teacher is not authenticated.");
        }

        var teacher = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == teacherId.Value, cancellationToken);

        if (teacher == null)
        {
            throw new NotFoundException("Teacher account not found.");
        }

        var submission = await _context.StudentSubmissions
            .Include(s => s.Student)
            .Include(s => s.Assignment)
                .ThenInclude(a => a.TeacherAssignment)
            .Include(s => s.Mark)
            .Include(s => s.Feedbacks)
                .ThenInclude(f => f.Teacher)
            .Include(s => s.Versions)
                .ThenInclude(v => v.Attachments)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
        {
            throw new NotFoundException($"Submission with ID '{request.SubmissionId}' was not found.");
        }

        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isTeacher && !isAdmin && submission.Assignment.TeacherAssignment.TeacherId != teacherId.Value)
        {
            throw new ForbiddenException("You can only grade submissions for assignments assigned to you.");
        }

        if (request.ScoreObtained > submission.Assignment.MaxMarks)
        {
            throw new BadRequestException($"Score obtained ({request.ScoreObtained}) cannot exceed Assignment Max Marks ({submission.Assignment.MaxMarks}).");
        }

        var isPassed = request.ScoreObtained >= submission.Assignment.PassMarks;
        var now = DateTimeOffset.UtcNow;

        if (submission.Mark == null)
        {
            submission.Mark = new Mark
            {
                SubmissionId = submission.Id,
                TeacherId = teacherId.Value,
                ScoreObtained = request.ScoreObtained,
                IsPassed = isPassed,
                GradedAt = now
            };
            _context.Marks.Add(submission.Mark);
        }
        else
        {
            submission.Mark.TeacherId = teacherId.Value;
            submission.Mark.ScoreObtained = request.ScoreObtained;
            submission.Mark.IsPassed = isPassed;
            submission.Mark.GradedAt = now;
            _context.Marks.Update(submission.Mark);
        }

        submission.Status = SubmissionStatus.Graded;
        _context.StudentSubmissions.Update(submission);

        if (!string.IsNullOrWhiteSpace(request.Comments))
        {
            var feedback = new Feedback
            {
                SubmissionId = submission.Id,
                TeacherId = teacherId.Value,
                Comments = request.Comments.Trim(),
                IsPrivate = request.IsPrivateFeedback
            };
            _context.Feedbacks.Add(feedback);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await _publisher.Publish(new SubmissionGradedEvent(submission.Id), cancellationToken);

        var studentName = $"{submission.Student.FirstName} {submission.Student.LastName}";
        var teacherName = $"{teacher.FirstName} {teacher.LastName}";

        var markDto = new MarkDto(
            submission.Mark.Id,
            submission.Mark.ScoreObtained,
            submission.Assignment.MaxMarks,
            submission.Assignment.PassMarks,
            submission.Mark.IsPassed,
            submission.Mark.GradedAt,
            teacherName
        );

        var feedbackDtos = submission.Feedbacks.OrderByDescending(f => f.CreatedAt).Select(f => new FeedbackDto(
            f.Id,
            f.Comments,
            f.IsPrivate,
            $"{f.Teacher.FirstName} {f.Teacher.LastName}",
            f.CreatedAt
        )).ToList();

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

        return new SubmissionGradingDetailDto(
            submission.Id,
            submission.AssignmentId,
            submission.Assignment.Title,
            submission.Assignment.MaxMarks,
            submission.Assignment.PassMarks,
            submission.StudentId,
            studentName,
            submission.Student.Email,
            submission.SubmittedAt,
            submission.Status.ToString(),
            submission.AttemptCount,
            markDto,
            feedbackDtos,
            versionDtos
        );
    }
}
