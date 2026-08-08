using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.StudentExperience.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.StudentExperience.Queries.GetStudentGrades;

public class GetStudentGradesQueryHandler : IRequestHandler<GetStudentGradesQuery, PagedResult<StudentGradeSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStudentGradesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<StudentGradeSummaryDto>> Handle(GetStudentGradesQuery request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Student is not authenticated.");
        }

        var query = _context.StudentSubmissions
            .AsNoTracking()
            .Include(s => s.Assignment)
                .ThenInclude(a => a.TeacherAssignment)
                    .ThenInclude(ta => ta.ClassSubject)
                        .ThenInclude(cs => cs.Class)
            .Include(s => s.Assignment)
                .ThenInclude(a => a.TeacherAssignment)
                    .ThenInclude(ta => ta.ClassSubject)
                        .ThenInclude(cs => cs.Subject)
            .Include(s => s.Mark)
                .ThenInclude(m => m!.Teacher)
            .Include(s => s.Feedbacks.Where(f => !f.IsPrivate))
            .Where(s => s.StudentId == studentId.Value &&
                        (s.Status == SubmissionStatus.Graded || s.Status == SubmissionStatus.Returned) &&
                        s.Mark != null)
            .AsQueryable();

        if (request.ClassId.HasValue)
        {
            query = query.Where(s => s.Assignment.TeacherAssignment.ClassSubject.ClassId == request.ClassId.Value);
        }

        if (request.SubjectId.HasValue)
        {
            query = query.Where(s => s.Assignment.TeacherAssignment.ClassSubject.SubjectId == request.SubjectId.Value);
        }

        query = query.OrderByDescending(s => s.Mark!.GradedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var submissions = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = submissions.Select(s =>
        {
            var mark = s.Mark!;
            var teacherName = $"{mark.Teacher.FirstName} {mark.Teacher.LastName}";
            var feedbackComments = s.Feedbacks.Select(f => f.Comments).ToList();

            return new StudentGradeSummaryDto(
                s.Id,
                s.AssignmentId,
                s.Assignment.Title,
                s.Assignment.TeacherAssignment.ClassSubject.Class.Name,
                s.Assignment.TeacherAssignment.ClassSubject.Subject.Name,
                mark.ScoreObtained,
                s.Assignment.MaxMarks,
                s.Assignment.PassMarks,
                mark.IsPassed,
                s.Status.ToString(),
                mark.GradedAt,
                teacherName,
                feedbackComments
            );
        }).ToList();

        return new PagedResult<StudentGradeSummaryDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
