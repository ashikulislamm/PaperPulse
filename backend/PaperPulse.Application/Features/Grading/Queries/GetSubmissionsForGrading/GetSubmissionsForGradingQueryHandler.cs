using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Grading.DTOs;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Grading.Queries.GetSubmissionsForGrading;

public class GetSubmissionsForGradingQueryHandler : IRequestHandler<GetSubmissionsForGradingQuery, PagedResult<SubmissionGradingDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetSubmissionsForGradingQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<SubmissionGradingDetailDto>> Handle(GetSubmissionsForGradingQuery request, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.TeacherAssignment)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
        {
            throw new NotFoundException($"Assignment with ID '{request.AssignmentId}' was not found.");
        }

        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isTeacher && !isAdmin && assignment.TeacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only view submissions for assignments assigned to you.");
        }

        var query = _context.StudentSubmissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Include(s => s.Mark)
                .ThenInclude(m => m!.Teacher)
            .Include(s => s.Feedbacks)
                .ThenInclude(f => f.Teacher)
            .Include(s => s.Versions)
                .ThenInclude(v => v.Attachments)
            .Where(s => s.AssignmentId == request.AssignmentId)
            .AsQueryable();

        if (request.Status.HasValue)
        {
            query = query.Where(s => s.Status == request.Status.Value);
        }

        query = query.OrderByDescending(s => s.SubmittedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var submissions = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = submissions.Select(s =>
        {
            var studentName = $"{s.Student.FirstName} {s.Student.LastName}";

            MarkDto? markDto = s.Mark != null ? new MarkDto(
                s.Mark.Id,
                s.Mark.ScoreObtained,
                assignment.MaxMarks,
                assignment.PassMarks,
                s.Mark.IsPassed,
                s.Mark.GradedAt,
                $"{s.Mark.Teacher?.FirstName} {s.Mark.Teacher?.LastName}"
            ) : null;

            var feedbackDtos = s.Feedbacks.OrderByDescending(f => f.CreatedAt).Select(f => new FeedbackDto(
                f.Id,
                f.Comments,
                f.IsPrivate,
                $"{f.Teacher.FirstName} {f.Teacher.LastName}",
                f.CreatedAt
            )).ToList();

            var versionDtos = s.Versions.OrderBy(v => v.VersionNumber).Select(v => new SubmissionVersionDto(
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
                s.Id,
                s.AssignmentId,
                assignment.Title,
                assignment.MaxMarks,
                assignment.PassMarks,
                s.StudentId,
                studentName,
                s.Student.Email,
                s.SubmittedAt,
                s.Status.ToString(),
                s.AttemptCount,
                markDto,
                feedbackDtos,
                versionDtos
            );
        }).ToList();

        return new PagedResult<SubmissionGradingDetailDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
