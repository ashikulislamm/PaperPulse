using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Dashboard.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Dashboard.Queries.GetTeacherDashboard;

public class GetTeacherDashboardQueryHandler : IRequestHandler<GetTeacherDashboardQuery, TeacherDashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetTeacherDashboardQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<TeacherDashboardDto> Handle(GetTeacherDashboardQuery request, CancellationToken cancellationToken)
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue)
        {
            throw new UnauthorizedException("Teacher is not authenticated.");
        }

        var teacherAssignmentIds = await _context.TeacherAssignments
            .AsNoTracking()
            .Where(ta => ta.TeacherId == teacherId.Value)
            .Select(ta => ta.Id)
            .ToListAsync(cancellationToken);

        var myAssignmentsQuery = _context.Assignments
            .AsNoTracking()
            .Where(a => teacherAssignmentIds.Contains(a.TeacherAssignmentId));

        var myAssignmentsCount = await myAssignmentsQuery.CountAsync(cancellationToken);

        var teacherAssignmentDbIds = await myAssignmentsQuery.Select(a => a.Id).ToListAsync(cancellationToken);

        var submissionsQuery = _context.StudentSubmissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Include(s => s.Mark)
            .Where(s => teacherAssignmentDbIds.Contains(s.AssignmentId));

        var totalReceived = await submissionsQuery.CountAsync(cancellationToken);

        var pendingSubmissions = await submissionsQuery
            .Where(s => s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.LateSubmitted)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync(cancellationToken);

        var pendingReviewsCount = pendingSubmissions.Count;

        var gradedSubmissions = await submissionsQuery
            .Where(s => (s.Status == SubmissionStatus.Graded || s.Status == SubmissionStatus.Returned) && s.Mark != null)
            .ToListAsync(cancellationToken);

        var gradedCount = gradedSubmissions.Count;

        double averageScorePercentage = 0.0;
        if (gradedCount > 0)
        {
            var percentages = gradedSubmissions
                .Where(s => s.Assignment.MaxMarks > 0)
                .Select(s => (double)(s.Mark!.ScoreObtained / s.Assignment.MaxMarks) * 100);

            if (percentages.Any())
            {
                averageScorePercentage = Math.Round(percentages.Average(), 1);
            }
        }

        var stats = new TeacherSubmissionStatsDto(
            totalReceived,
            gradedCount,
            pendingReviewsCount,
            averageScorePercentage
        );

        var recentPending = pendingSubmissions.Take(5).Select(s => new TeacherPendingReviewDto(
            s.Id,
            s.AssignmentId,
            s.Assignment.Title,
            $"{s.Student.FirstName} {s.Student.LastName}",
            s.SubmittedAt,
            s.Status == SubmissionStatus.LateSubmitted
        )).ToList();

        return new TeacherDashboardDto(
            myAssignmentsCount,
            pendingReviewsCount,
            stats,
            recentPending
        );
    }
}
