using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Common.Events;

public class SubmissionReceivedEventHandler : INotificationHandler<SubmissionReceivedEvent>
{
    private readonly IApplicationDbContext _context;

    public SubmissionReceivedEventHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SubmissionReceivedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var submission = await _context.StudentSubmissions
                .Include(s => s.Student)
                .Include(s => s.Assignment)
                    .ThenInclude(a => a.TeacherAssignment)
                .FirstOrDefaultAsync(s => s.Id == notification.SubmissionId, cancellationToken);

            if (submission == null) return;

            var teacherId = submission.Assignment.TeacherAssignment.TeacherId;
            var studentName = $"{submission.Student.FirstName} {submission.Student.LastName}";

            var inAppNotification = new Notification
            {
                UserId = teacherId,
                Title = "New Submission Received",
                Message = $"{studentName} submitted work for '{submission.Assignment.Title}'.",
                Type = NotificationType.SubmissionReceived,
                Status = NotificationStatus.Unread,
                TargetUrl = $"/grading/submissions/{submission.Id}"
            };

            _context.Notifications.Add(inAppNotification);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Logging or graceful suppression so notification constraint issue never breaks student submission
        }
    }
}
