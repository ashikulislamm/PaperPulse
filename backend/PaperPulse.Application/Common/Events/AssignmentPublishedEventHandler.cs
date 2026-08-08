using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Common.Events;

public class AssignmentPublishedEventHandler : INotificationHandler<AssignmentPublishedEvent>
{
    private readonly IApplicationDbContext _context;

    public AssignmentPublishedEventHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(AssignmentPublishedEvent notification, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
            .FirstOrDefaultAsync(a => a.Id == notification.AssignmentId, cancellationToken);

        if (assignment == null) return;

        var classId = assignment.TeacherAssignment.ClassSubject.ClassId;

        var enrolledStudentIds = await _context.StudentEnrollments
            .AsNoTracking()
            .Where(se => se.ClassId == classId)
            .Select(se => se.StudentId)
            .ToListAsync(cancellationToken);

        if (!enrolledStudentIds.Any()) return;

        var notifications = enrolledStudentIds.Select(studentId => new Notification
        {
            TenantId = assignment.TenantId,
            UserId = studentId,
            Title = "New Assignment Published",
            Message = $"Assignment '{assignment.Title}' has been published.",
            Type = NotificationType.AssignmentPublished,
            Status = NotificationStatus.Unread,
            TargetUrl = $"/student/assignments"
        }).ToList();

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
