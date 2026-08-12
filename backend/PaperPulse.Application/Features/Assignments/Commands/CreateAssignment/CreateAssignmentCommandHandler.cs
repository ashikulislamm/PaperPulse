using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Assignments.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Assignments.Commands.CreateAssignment;

public class CreateAssignmentCommandHandler : IRequestHandler<CreateAssignmentCommand, AssignmentDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditLogService _auditLogService;

    public CreateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAuditLogService auditLogService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _auditLogService = auditLogService;
    }

    public async Task<AssignmentDetailDto> Handle(CreateAssignmentCommand request, CancellationToken cancellationToken)
    {
        var teacherAssignment = await _context.TeacherAssignments
            .Include(ta => ta.Teacher)
            .Include(ta => ta.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(ta => ta.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .FirstOrDefaultAsync(ta => ta.Id == request.TeacherAssignmentId, cancellationToken);

        if (teacherAssignment == null)
        {
            throw new NotFoundException($"Teacher assignment with ID '{request.TeacherAssignmentId}' was not found.");
        }

        // Scope check: Teachers can only create assignments for their own assigned classes/subjects
        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isTeacher && !isAdmin && teacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only create assignments for classes and subjects assigned to you.");
        }

        var tenantId = teacherAssignment.ClassSubject.Class.TenantId;

        var assignment = new Assignment
        {
            TenantId = tenantId,
            TeacherAssignmentId = teacherAssignment.Id,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            MaxMarks = request.MaxMarks,
            PassMarks = request.PassMarks,
            DueDate = request.DueDate,
            Status = request.Status,
            AllowLateSubmission = request.AllowLateSubmission,
            LatePenaltyPercentage = request.LatePenaltyPercentage
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync(
            "AssignmentCreated",
            "Assignment",
            assignment.Id,
            newValues: new { assignment.Title, assignment.MaxMarks, assignment.PassMarks, assignment.DueDate, Status = assignment.Status.ToString() },
            cancellationToken: cancellationToken);

        var teacherName = $"{teacherAssignment.Teacher.FirstName} {teacherAssignment.Teacher.LastName}";

        return new AssignmentDetailDto(
            assignment.Id,
            assignment.TeacherAssignmentId,
            teacherAssignment.ClassSubject.Class.Name,
            teacherAssignment.ClassSubject.Subject.Name,
            teacherName,
            assignment.Title,
            assignment.Description,
            assignment.MaxMarks,
            assignment.PassMarks,
            assignment.DueDate,
            assignment.Status.ToString(),
            assignment.AllowLateSubmission,
            assignment.LatePenaltyPercentage,
            new List<AssignmentAttachmentDto>(),
            assignment.CreatedAt
        );
    }
}
