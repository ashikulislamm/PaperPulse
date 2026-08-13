using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Common.Events;

public class FeedbackAddedEventHandler : INotificationHandler<FeedbackAddedEvent>
{
    private readonly IApplicationDbContext _context;

    public FeedbackAddedEventHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(FeedbackAddedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.Submission)
                    .ThenInclude(s => s!.Assignment)
                .Include(f => f.Teacher)
                .FirstOrDefaultAsync(f => f.Id == notification.FeedbackId, cancellationToken);

            if (feedback == null || feedback.IsPrivate) return;

            var submission = feedback.Submission;
            if (submission == null) return;

            var teacherName = $"{feedback.Teacher.FirstName} {feedback.Teacher.LastName}";

            var inAppNotification = new Notification
            {
                UserId = submission.StudentId,
                Title = "New Feedback Added",
                Message = $"{teacherName} left feedback on your submission for '{submission.Assignment.Title}'.",
                Type = NotificationType.FeedbackAdded,
                Status = NotificationStatus.Unread,
                TargetUrl = $"/student/assignments/{submission.AssignmentId}"
            };

            _context.Notifications.Add(inAppNotification);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Silent suppression so notification issues never break the feedback flow
        }
    }
}
