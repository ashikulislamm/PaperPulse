using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.ReassignTeacher;

public record ReassignTeacherCommand(
    Guid ClassSubjectId,
    Guid NewTeacherId
) : IRequest<SubjectDto>;

public class ReassignTeacherCommandHandler : IRequestHandler<ReassignTeacherCommand, SubjectDto>
{
    private readonly IApplicationDbContext _context;

    public ReassignTeacherCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SubjectDto> Handle(ReassignTeacherCommand request, CancellationToken cancellationToken)
    {
        var classSubject = await _context.ClassSubjects
            .IgnoreQueryFilters()
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .Include(cs => cs.TeacherAssignments)
                .ThenInclude(ta => ta.Assignments)
            .FirstOrDefaultAsync(cs => cs.Id == request.ClassSubjectId, cancellationToken);

        if (classSubject == null)
        {
            throw new NotFoundException($"Subject allocation with ID '{request.ClassSubjectId}' was not found.");
        }

        var newTeacher = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.NewTeacherId, cancellationToken);

        if (newTeacher == null)
        {
            throw new NotFoundException($"Teacher with ID '{request.NewTeacherId}' was not found.");
        }

        if (!newTeacher.UserRoles.Any(ur => ur.Role.Name == RoleType.Teacher))
        {
            throw new BadRequestException("The selected user does not have the Teacher role.");
        }

        var currentPrimary = classSubject.TeacherAssignments
            .FirstOrDefault(ta => ta.IsPrimary && !ta.IsDeleted);

        if (currentPrimary != null && currentPrimary.TeacherId == newTeacher.Id)
        {
            throw new ConflictException($"'{newTeacher.FirstName} {newTeacher.LastName}' is already the assigned teacher for '{classSubject.Subject.Name}'.");
        }

        // Guard: cannot reassign while any active (non-archived) assignment exists
        var hasActiveAssignments = classSubject.TeacherAssignments
            .SelectMany(ta => ta.Assignments)
            .Any(a => a.Status != AssignmentStatus.Archived);

        if (hasActiveAssignments)
        {
            throw new ConflictException("This subject cannot be reassigned because it has active assignments. Archive all assignments before changing the teacher.");
        }

        // Demote current primary (kept for history, assignments remain linked)
        if (currentPrimary != null)
        {
            currentPrimary.IsPrimary = false;
            currentPrimary.UpdatedAt = DateTimeOffset.UtcNow;
        }

        // Reuse an existing (soft-deleted) assignment for this teacher, or create a new one
        var existingAssignmentForTeacher = classSubject.TeacherAssignments
            .FirstOrDefault(ta => ta.TeacherId == newTeacher.Id);

        if (existingAssignmentForTeacher != null)
        {
            existingAssignmentForTeacher.IsPrimary = true;
            existingAssignmentForTeacher.IsDeleted = false;
            existingAssignmentForTeacher.DeletedAt = null;
            existingAssignmentForTeacher.DeletedBy = null;
            existingAssignmentForTeacher.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else
        {
            _context.TeacherAssignments.Add(new TeacherAssignment
            {
                TeacherId = newTeacher.Id,
                ClassSubjectId = classSubject.Id,
                IsPrimary = true
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new SubjectDto(
            classSubject.Subject.Id,
            classSubject.Id,
            classSubject.Class.Id,
            classSubject.Class.Name,
            classSubject.Subject.Name,
            classSubject.Subject.Code,
            classSubject.Subject.Description,
            classSubject.PassMarks ?? 50.0m,
            $"{newTeacher.FirstName} {newTeacher.LastName}",
            classSubject.Subject.CreatedAt
        );
    }
}
