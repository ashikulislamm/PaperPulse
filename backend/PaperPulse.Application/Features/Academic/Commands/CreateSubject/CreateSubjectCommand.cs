using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.CreateSubject;

public record CreateSubjectCommand(
    Guid ClassId,
    string Name,
    string Code,
    string? Description,
    decimal PassMarks,
    Guid? TeacherId
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

        // Determine teacher to assign (provided teacher ID or current user)
        var targetTeacherId = request.TeacherId;
        if (!targetTeacherId.HasValue)
        {
            var defaultTeacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == "teacher@paperpulse.com", cancellationToken);
            targetTeacherId = defaultTeacher?.Id;
        }

        string assignedTeacherName = "Unassigned";

        if (targetTeacherId.HasValue)
        {
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == targetTeacherId.Value, cancellationToken);
            if (teacher != null)
            {
                var teacherAssignment = new TeacherAssignment
                {
                    TeacherId = teacher.Id,
                    ClassSubjectId = classSubject.Id,
                    IsPrimary = true
                };
                _context.TeacherAssignments.Add(teacherAssignment);
                await _context.SaveChangesAsync(cancellationToken);
                assignedTeacherName = $"{teacher.FirstName} {teacher.LastName}";
            }
        }

        return new SubjectDto(
            subject.Id,
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
