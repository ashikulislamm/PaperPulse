using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.StudentExperience.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.StudentExperience.Queries.GetUpcomingDeadlines;

public class GetUpcomingDeadlinesQueryHandler : IRequestHandler<GetUpcomingDeadlinesQuery, List<UpcomingDeadlineDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUpcomingDeadlinesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<UpcomingDeadlineDto>> Handle(GetUpcomingDeadlinesQuery request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Student is not authenticated.");
        }

        var enrolledClassIds = await _context.StudentEnrollments
            .AsNoTracking()
            .Where(se => se.StudentId == studentId.Value)
            .Select(se => se.ClassId)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;

        var assignments = await _context.Assignments
            .AsNoTracking()
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Class)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Subject)
            .Include(a => a.Submissions.Where(s => s.StudentId == studentId.Value))
            .Where(a => enrolledClassIds.Contains(a.TeacherAssignment.ClassSubject.ClassId) &&
                        a.Status == AssignmentStatus.Published &&
                        !a.Submissions.Any(s => s.StudentId == studentId.Value))
            .OrderBy(a => a.DueDate)
            .Take(10)
            .ToListAsync(cancellationToken);

        return assignments.Select(a =>
        {
            var timeDiff = a.DueDate - now;
            var hoursRemaining = Math.Max(0, timeDiff.TotalHours);
            var isOverdue = a.DueDate < now;

            return new UpcomingDeadlineDto(
                a.Id,
                a.Title,
                a.TeacherAssignment.ClassSubject.Class.Name,
                a.TeacherAssignment.ClassSubject.Subject.Name,
                a.DueDate,
                Math.Round(hoursRemaining, 1),
                isOverdue
            );
        }).ToList();
    }
}
