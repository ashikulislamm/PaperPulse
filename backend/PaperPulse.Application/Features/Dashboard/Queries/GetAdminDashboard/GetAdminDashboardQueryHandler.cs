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

        var submissionsQuery = _context.StudentSubmissions.AsNoTracking();

        var totalSubmissions = await submissionsQuery.CountAsync(cancellationToken);
        var gradedSubmissions = await submissionsQuery.CountAsync(s => s.Status == SubmissionStatus.Graded || s.Status == SubmissionStatus.Returned, cancellationToken);
        var pendingSubmissions = await submissionsQuery.CountAsync(s => s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.LateSubmitted, cancellationToken);
        var lateSubmissions = await submissionsQuery.CountAsync(s => s.Status == SubmissionStatus.LateSubmitted, cancellationToken);

        var totalEnrollments = await _context.StudentEnrollments.AsNoTracking().CountAsync(cancellationToken);
        var expectedSubmissions = totalAssignments * Math.Max(1, totalEnrollments);
        var submissionRate = expectedSubmissions > 0 ? Math.Min(100.0, Math.Round((double)totalSubmissions / expectedSubmissions * 100, 1)) : 0.0;

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
