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

        var upcomingAssignments = await _context.Assignments
            .AsNoTracking()
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
            .Where(a => a.Status == AssignmentStatus.Published &&
                        a.DueDate > now &&
                        a.DueDate <= thresholdTime)
            .ToListAsync(cancellationToken);

        if (!upcomingAssignments.Any()) return 0;

        var assignmentIds = upcomingAssignments.Select(a => a.Id).ToList();
        var classIds = upcomingAssignments.Select(a => a.TeacherAssignment.ClassSubject.ClassId).Distinct().ToList();

        var submittedStudentIdsByAssignment = await _context.StudentSubmissions
            .AsNoTracking()
            .Where(s => assignmentIds.Contains(s.AssignmentId))
            .GroupBy(s => s.AssignmentId)
            .Select(g => new { AssignmentId = g.Key, StudentIds = g.Select(s => s.StudentId).ToList() })
            .ToDictionaryAsync(g => g.AssignmentId, g => g.StudentIds, cancellationToken);

        var enrolledStudentIdsByClass = await _context.StudentEnrollments
            .AsNoTracking()
            .Where(se => classIds.Contains(se.ClassId))
            .GroupBy(se => se.ClassId)
            .Select(g => new { ClassId = g.Key, StudentIds = g.Select(se => se.StudentId).ToList() })
            .ToDictionaryAsync(g => g.ClassId, g => g.StudentIds, cancellationToken);

        var notificationCount = 0;

        foreach (var assignment in upcomingAssignments)
        {
            var classId = assignment.TeacherAssignment.ClassSubject.ClassId;

            if (!enrolledStudentIdsByClass.TryGetValue(classId, out var enrolledStudentIds)) continue;
            if (!submittedStudentIdsByAssignment.TryGetValue(assignment.Id, out var submittedStudentIds))
                submittedStudentIds = new List<Guid>();

            var unsubmittedStudentIds = enrolledStudentIds
                .Where(sid => !submittedStudentIds.Contains(sid))
                .ToList();

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
