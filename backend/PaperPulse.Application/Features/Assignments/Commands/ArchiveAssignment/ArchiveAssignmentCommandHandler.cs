using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Assignments.Commands.ArchiveAssignment;

public class ArchiveAssignmentCommandHandler : IRequestHandler<ArchiveAssignmentCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditLogService _auditLogService;

    public ArchiveAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAuditLogService auditLogService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _auditLogService = auditLogService;
    }

    public async Task<Unit> Handle(ArchiveAssignmentCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenException("You can only archive assignments assigned to you.");
        }

        assignment.Status = AssignmentStatus.Archived;
        _context.Assignments.Update(assignment);

        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync(
            "AssignmentArchived",
            "Assignment",
            assignment.Id,
            newValues: new { assignment.Title, Status = assignment.Status.ToString() },
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
