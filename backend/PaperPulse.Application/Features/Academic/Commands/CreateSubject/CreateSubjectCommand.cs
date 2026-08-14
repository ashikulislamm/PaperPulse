using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.CreateSubject;

public record CreateSubjectCommand(
    Guid ClassId,
    string Name,
    string Code,
    string? Description,
    decimal PassMarks,
    Guid TeacherId
) : IRequest<SubjectDto>;

public class CreateSubjectCommandHandler : IRequestHandler<CreateSubjectCommand, SubjectDto>
{
    private readonly IApplicationDbContext _context;

    public CreateSubjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SubjectDto> Handle(CreateSubjectCommand request, CancellationToken cancellationToken)
    {
        // Verify Class exists
        var academicClass = await _context.Classes
            .FirstOrDefaultAsync(c => c.Id == request.ClassId, cancellationToken);

        if (academicClass == null)
        {
            throw new NotFoundException($"Class with ID '{request.ClassId}' was not found.");
        }

        // Create Subject Entity
        var subject = new Subject
        {
            Name = request.Name.Trim(),
            Code = request.Code.Trim().ToUpper(),
            Description = request.Description?.Trim()
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync(cancellationToken);

        // Link Subject to Class via ClassSubject
        var classSubject = new ClassSubject
        {
            ClassId = academicClass.Id,
            SubjectId = subject.Id,
            PassMarks = request.PassMarks
        };

        _context.ClassSubjects.Add(classSubject);
        await _context.SaveChangesAsync(cancellationToken);

        // Determine teacher to assign
        var targetTeacherId = request.TeacherId;

        if (targetTeacherId == Guid.Empty)
        {
            throw new ValidationException("TeacherId", "A teacher must be assigned to the subject.");
        }

        var teacher = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == targetTeacherId, cancellationToken);

        if (teacher == null)
        {
            throw new NotFoundException($"Teacher with ID '{targetTeacherId}' was not found.");
        }

        if (!teacher.UserRoles.Any(ur => ur.Role.Name == RoleType.Teacher))
        {
            throw new BadRequestException("The selected user does not have the Teacher role.");
        }

        var teacherAssignment = new TeacherAssignment
        {
            TeacherId = teacher.Id,
            ClassSubjectId = classSubject.Id,
            IsPrimary = true
        };
        _context.TeacherAssignments.Add(teacherAssignment);
        await _context.SaveChangesAsync(cancellationToken);
        string assignedTeacherName = $"{teacher.FirstName} {teacher.LastName}";

        return new SubjectDto(
            subject.Id,
            classSubject.Id,
            academicClass.Id,
            academicClass.Name,
            subject.Name,
            subject.Code,
            subject.Description,
            request.PassMarks,
            assignedTeacherName,
            subject.CreatedAt
        );
    }
}
