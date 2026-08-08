using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Notifications.Commands.SendDeadlineReminders;

public class SendDeadlineRemindersCommandHandler : IRequestHandler<SendDeadlineRemindersCommand, int>
{
    private readonly IApplicationDbContext _context;

    public SendDeadlineRemindersCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(SendDeadlineRemindersCommand request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var thresholdTime = now.AddHours(request.HoursThreshold);

        // Find published assignments due within threshold
        var upcomingAssignments = await _context.Assignments
            .AsNoTracking()
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
            .Where(a => a.Status == AssignmentStatus.Published &&
                        a.DueDate > now &&
                        a.DueDate <= thresholdTime)
            .ToListAsync(cancellationToken);

        if (!upcomingAssignments.Any()) return 0;

        var notificationCount = 0;

        foreach (var assignment in upcomingAssignments)
        {
            var classId = assignment.TeacherAssignment.ClassSubject.ClassId;

            // Find enrolled students who haven't submitted yet
            var submittedStudentIds = await _context.StudentSubmissions
                .AsNoTracking()
                .Where(s => s.AssignmentId == assignment.Id)
                .Select(s => s.StudentId)
                .ToListAsync(cancellationToken);

            var unsubmittedStudentIds = await _context.StudentEnrollments
                .AsNoTracking()
                .Where(se => se.ClassId == classId && !submittedStudentIds.Contains(se.StudentId))
                .Select(se => se.StudentId)
                .ToListAsync(cancellationToken);

            if (!unsubmittedStudentIds.Any()) continue;

            var timeRemainingHours = Math.Round((assignment.DueDate - now).TotalHours, 1);

            var notifications = unsubmittedStudentIds.Select(studentId => new Notification
            {
                TenantId = assignment.TenantId,
                UserId = studentId,
                Title = "Assignment Deadline Approaching",
                Message = $"Reminder: '{assignment.Title}' is due in {timeRemainingHours} hours.",
                Type = NotificationType.DeadlineReminder,
                Status = NotificationStatus.Unread,
                TargetUrl = "/student/assignments"
            }).ToList();

            _context.Notifications.AddRange(notifications);
            notificationCount += notifications.Count;
        }

        if (notificationCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return notificationCount;
    }
}
