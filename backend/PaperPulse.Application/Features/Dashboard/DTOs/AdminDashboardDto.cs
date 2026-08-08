namespace PaperPulse.Application.Features.Dashboard.DTOs;

public record AdminSubmissionStatsDto(
    int TotalSubmissions,
    int GradedSubmissions,
    int PendingSubmissions,
    int LateSubmissions,
    double SubmissionRatePercentage
);

public record AdminDashboardDto(
    int TotalStudents,
    int TotalTeachers,
    int TotalClasses,
    int TotalAssignments,
    AdminSubmissionStatsDto SubmissionStatistics
);
