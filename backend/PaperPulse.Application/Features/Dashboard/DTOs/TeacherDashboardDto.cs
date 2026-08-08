namespace PaperPulse.Application.Features.Dashboard.DTOs;

public record TeacherPendingReviewDto(
    Guid SubmissionId,
    Guid AssignmentId,
    string AssignmentTitle,
    string StudentName,
    DateTimeOffset SubmittedAt,
    bool IsLate
);

public record TeacherSubmissionStatsDto(
    int TotalReceived,
    int GradedCount,
    int PendingCount,
    double AverageScorePercentage
);

public record TeacherDashboardDto(
    int MyAssignmentsCount,
    int PendingReviewsCount,
    TeacherSubmissionStatsDto SubmissionStatistics,
    List<TeacherPendingReviewDto> RecentPendingReviews
);
