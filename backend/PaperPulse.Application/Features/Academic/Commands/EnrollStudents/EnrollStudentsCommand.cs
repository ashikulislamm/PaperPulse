using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.EnrollStudents;

public record EnrollStudentsCommand(
    Guid ClassId,
    List<Guid> StudentIds
) : IRequest<int>;

public class EnrollStudentsCommandHandler : IRequestHandler<EnrollStudentsCommand, int>
{
    private readonly IApplicationDbContext _context;

    public EnrollStudentsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(EnrollStudentsCommand request, CancellationToken cancellationToken)
    {
        var studentIds = request.StudentIds.Distinct().ToList();
        if (studentIds.Count == 0)
        {
            throw new ValidationException("StudentIds", "At least one student must be selected.");
        }

        var @class = await _context.Classes
            .FirstOrDefaultAsync(c => c.Id == request.ClassId, cancellationToken);

        if (@class == null)
        {
            throw new NotFoundException($"Class with ID '{request.ClassId}' was not found.");
        }

        // All selected students must exist and have the Student role
        var students = await _context.Users
            .AsNoTracking()
            .Where(u => studentIds.Contains(u.Id) &&
                        u.UserRoles.Any(ur => ur.Role.Name == RoleType.Student))
            .Select(u => new { u.Id, u.FirstName, u.LastName })
            .ToListAsync(cancellationToken);

        var missingIds = studentIds.Except(students.Select(s => s.Id)).ToList();
        if (missingIds.Count > 0)
        {
            throw new NotFoundException($"Student(s) with ID '{string.Join(", ", missingIds)}' were not found.");
        }

        // Load existing active enrollments to dedupe
        var existingEnrollments = await _context.StudentEnrollments
            .IgnoreQueryFilters()
            .Where(se => se.ClassId == request.ClassId && studentIds.Contains(se.StudentId))
            .ToListAsync(cancellationToken);

        var existingActiveStudentIds = existingEnrollments
            .Where(se => se.IsActive && !se.IsDeleted)
            .Select(se => se.StudentId)
            .ToHashSet();

        var newStudentIds = studentIds.Where(id => !existingActiveStudentIds.Contains(id)).ToList();

        // Seat capacity check
        var enrolledCount = await _context.StudentEnrollments
            .IgnoreQueryFilters()
            .CountAsync(se => se.ClassId == request.ClassId && se.IsActive && !se.IsDeleted, cancellationToken);

        if (enrolledCount + newStudentIds.Count > @class.MaxCapacity)
        {
            throw new ConflictException($"Class '{@class.Name}' has a maximum capacity of {@class.MaxCapacity} students. You can enroll at most {@class.MaxCapacity - enrolledCount} more student(s).");
        }

        // Re-activate existing soft-deleted/inactive enrollments
        var enrollmentsToRestore = existingEnrollments
            .Where(se => !se.IsActive || se.IsDeleted)
            .ToList();

        foreach (var enrollment in enrollmentsToRestore)
        {
            enrollment.IsActive = true;
            enrollment.IsDeleted = false;
            enrollment.DeletedAt = null;
            enrollment.DeletedBy = null;
            enrollment.UpdatedAt = DateTimeOffset.UtcNow;
        }

        // Create new enrollments
        var added = 0;
        foreach (var studentId in newStudentIds)
        {
            _context.StudentEnrollments.Add(new StudentEnrollment
            {
                StudentId = studentId,
                ClassId = request.ClassId,
                RollNumber = null,
                IsActive = true
            });
            added++;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return enrollmentsToRestore.Count + added;
    }
}
