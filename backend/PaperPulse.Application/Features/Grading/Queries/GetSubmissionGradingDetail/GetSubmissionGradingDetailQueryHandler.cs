using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Grading.DTOs;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Grading.Queries.GetSubmissionGradingDetail;

public class GetSubmissionGradingDetailQueryHandler : IRequestHandler<GetSubmissionGradingDetailQuery, SubmissionGradingDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetSubmissionGradingDetailQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<SubmissionGradingDetailDto> Handle(GetSubmissionGradingDetailQuery request, CancellationToken cancellationToken)
    {
        var submission = await _context.StudentSubmissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
                .ThenInclude(a => a.TeacherAssignment)
            .Include(s => s.Mark)
                .ThenInclude(m => m!.Teacher)
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

        if (isTeacher && !isAdmin && submission.Assignment.TeacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only review submissions for assignments assigned to you.");
        }

        var studentName = $"{submission.Student.FirstName} {submission.Student.LastName}";

        MarkDto? markDto = submission.Mark != null ? new MarkDto(
            submission.Mark.Id,
            submission.Mark.ScoreObtained,
            submission.Assignment.MaxMarks,
            submission.Assignment.PassMarks,
            submission.Mark.IsPassed,
            submission.Mark.GradedAt,
            $"{submission.Mark.Teacher?.FirstName} {submission.Mark.Teacher?.LastName}"
        ) : null;

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
