using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Submissions.Queries.GetSubmissionById;

public class GetSubmissionByIdQueryHandler : IRequestHandler<GetSubmissionByIdQuery, SubmissionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetSubmissionByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<SubmissionDto> Handle(GetSubmissionByIdQuery request, CancellationToken cancellationToken)
    {
        var submission = await _context.StudentSubmissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
                .ThenInclude(a => a.TeacherAssignment)
            .Include(s => s.Versions)
                .ThenInclude(v => v.Attachments)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (submission == null)
        {
            throw new NotFoundException($"Submission with ID '{request.Id}' was not found.");
        }

        var isStudent = _currentUserService.Roles.Contains(RoleType.Student.ToString());
        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isStudent && !isAdmin && submission.StudentId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only view your own submissions.");
        }

        if (isTeacher && !isAdmin && submission.Assignment.TeacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only view submissions for assignments assigned to you.");
        }

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
