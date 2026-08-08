using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Dashboard.DTOs;
using PaperPulse.Application.Features.StudentExperience.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Dashboard.Queries.GetStudentDashboard;

public class GetStudentDashboardQueryHandler : IRequestHandler<GetStudentDashboardQuery, StudentDashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStudentDashboardQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<StudentDashboardDto> Handle(GetStudentDashboardQuery request, CancellationToken cancellationToken)
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

        var myPublishedAssignments = await _context.Assignments
            .AsNoTracking()
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Class)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Subject)
            .Include(a => a.Submissions.Where(s => s.StudentId == studentId.Value))
            .Where(a => enrolledClassIds.Contains(a.TeacherAssignment.ClassSubject.ClassId) &&
                        a.Status == AssignmentStatus.Published)
            .ToListAsync(cancellationToken);

        var pendingAssignmentsCount = myPublishedAssignments.Count(a => !a.Submissions.Any());

        var studentSubmissions = await _context.StudentSubmissions
            .AsNoTracking()
            .Include(s => s.Assignment)
            .Include(s => s.Mark)
            .Where(s => s.StudentId == studentId.Value)
            .ToListAsync(cancellationToken);

        var submittedAssignmentsCount = studentSubmissions.Count;

        var upcomingDeadlines = myPublishedAssignments
            .Where(a => !a.Submissions.Any())
            .OrderBy(a => a.DueDate)
            .Take(5)
            .Select(a =>
            {
                var hoursRemaining = Math.Max(0, (a.DueDate - now).TotalHours);
                return new UpcomingDeadlineDto(
                    a.Id,
                    a.Title,
                    a.TeacherAssignment.ClassSubject.Class.Name,
                    a.TeacherAssignment.ClassSubject.Subject.Name,
                    a.DueDate,
                    Math.Round(hoursRemaining, 1),
                    a.DueDate < now
                );
            }).ToList();

        var gradedSubmissions = studentSubmissions
            .Where(s => s.Mark != null)
            .ToList();

        var totalGraded = gradedSubmissions.Count;
        var passedCount = gradedSubmissions.Count(s => s.Mark!.IsPassed);
        var failedCount = totalGraded - passedCount;

        double averagePercentage = 0.0;
        if (totalGraded > 0)
        {
            var percentages = gradedSubmissions
                .Where(s => s.Assignment.MaxMarks > 0)
                .Select(s => (double)(s.Mark!.ScoreObtained / s.Assignment.MaxMarks) * 100);

            if (percentages.Any())
            {
                averagePercentage = Math.Round(percentages.Average(), 1);
            }
        }

        var gradePerformance = new StudentGradePerformanceDto(
            totalGraded,
            passedCount,
            failedCount,
            averagePercentage
        );

        return new StudentDashboardDto(
            pendingAssignmentsCount,
            submittedAssignmentsCount,
            upcomingDeadlines,
            gradePerformance
        );
    }
}
