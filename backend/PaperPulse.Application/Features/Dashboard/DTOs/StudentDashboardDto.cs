using PaperPulse.Application.Features.StudentExperience.DTOs;

namespace PaperPulse.Application.Features.Dashboard.DTOs;

public record StudentGradePerformanceDto(
    int TotalGraded,
    int PassedCount,
    int FailedCount,
    double AveragePercentage
);

public record StudentDashboardDto(
    int PendingAssignmentsCount,
    int SubmittedAssignmentsCount,
    List<UpcomingDeadlineDto> UpcomingDeadlines,
    StudentGradePerformanceDto GradePerformance
);
