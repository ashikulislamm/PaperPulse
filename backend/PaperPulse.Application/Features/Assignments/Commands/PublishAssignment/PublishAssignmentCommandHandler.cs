using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Events;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Assignments.Commands.PublishAssignment;

public class PublishAssignmentCommandHandler : IRequestHandler<PublishAssignmentCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPublisher _publisher;
    private readonly IAuditLogService _auditLogService;

    public PublishAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IPublisher publisher,
        IAuditLogService auditLogService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _publisher = publisher;
        _auditLogService = auditLogService;
    }

    public async Task<Unit> Handle(PublishAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.TeacherAssignment)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (assignment == null)
        {
            throw new NotFoundException($"Assignment with ID '{request.Id}' was not found.");
        }

        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isTeacher && !isAdmin && assignment.TeacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only publish assignments assigned to you.");
        }

        assignment.Status = AssignmentStatus.Published;
        _context.Assignments.Update(assignment);

        await _context.SaveChangesAsync(cancellationToken);
        await _publisher.Publish(new AssignmentPublishedEvent(assignment.Id), cancellationToken);
        await _auditLogService.LogAsync(
            "AssignmentPublished",
            "Assignment",
            assignment.Id,
            newValues: new { assignment.Title, Status = assignment.Status.ToString() },
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
