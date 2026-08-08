using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Common.Events;

public class SubmissionGradedEventHandler : INotificationHandler<SubmissionGradedEvent>
{
    private readonly IApplicationDbContext _context;

    public SubmissionGradedEventHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SubmissionGradedEvent notification, CancellationToken cancellationToken)
    {
        var submission = await _context.StudentSubmissions
            .Include(s => s.Assignment)
            .Include(s => s.Mark)
            .FirstOrDefaultAsync(s => s.Id == notification.SubmissionId, cancellationToken);

        if (submission == null) return;

        var message = submission.Mark != null
            ? $"Your submission for '{submission.Assignment.Title}' has been graded. Score: {submission.Mark.ScoreObtained}/{submission.Assignment.MaxMarks}."
            : $"Your submission for '{submission.Assignment.Title}' has been returned by your teacher.";

        var inAppNotification = new Notification
        {
            TenantId = submission.TenantId,
            UserId = submission.StudentId,
            Title = "Submission Graded",
            Message = message,
            Type = NotificationType.SubmissionGraded,
            Status = NotificationStatus.Unread,
            TargetUrl = "/student/grades"
        };

        _context.Notifications.Add(inAppNotification);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
