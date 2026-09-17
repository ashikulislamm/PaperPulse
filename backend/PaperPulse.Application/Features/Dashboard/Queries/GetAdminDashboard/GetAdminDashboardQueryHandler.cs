using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Dashboard.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Dashboard.Queries.GetAdminDashboard;

public class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardDto> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
    {
        var totalStudents = await _context.UserRoles
            .AsNoTracking()
            .CountAsync(ur => ur.Role.Name == RoleType.Student, cancellationToken);

        var totalTeachers = await _context.UserRoles
            .AsNoTracking()
            .CountAsync(ur => ur.Role.Name == RoleType.Teacher, cancellationToken);

        var totalClasses = await _context.Classes
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var totalAssignments = await _context.Assignments
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var submissionStats = await _context.StudentSubmissions
            .AsNoTracking()
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Graded = g.Count(s => s.Status == SubmissionStatus.Graded || s.Status == SubmissionStatus.Returned),
                Pending = g.Count(s => s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.LateSubmitted),
                Late = g.Count(s => s.Status == SubmissionStatus.LateSubmitted)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalSubmissions = submissionStats?.Total ?? 0;
        var gradedSubmissions = submissionStats?.Graded ?? 0;
        var pendingSubmissions = submissionStats?.Pending ?? 0;
        var lateSubmissions = submissionStats?.Late ?? 0;

        var expectedSubmissions = await _context.Assignments
            .AsNoTracking()
            .Where(a => a.Status == AssignmentStatus.Published || a.Status == AssignmentStatus.Closed)
            .Select(a => _context.StudentEnrollments.Count(se => se.ClassId == a.TeacherAssignment.ClassSubject.ClassId && se.IsActive))
            .SumAsync(cancellationToken);

        var submissionRate = expectedSubmissions > 0 
            ? Math.Min(100.0, Math.Round((double)totalSubmissions / expectedSubmissions * 100, 1)) 
            : 0.0;

        var stats = new AdminSubmissionStatsDto(
            totalSubmissions,
            gradedSubmissions,
            pendingSubmissions,
            lateSubmissions,
            submissionRate
        );

        return new AdminDashboardDto(
            totalStudents,
            totalTeachers,
            totalClasses,
            totalAssignments,
            stats
        );
    }
}
