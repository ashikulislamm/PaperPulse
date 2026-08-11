using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.DeleteSubject;

public class DeleteSubjectCommandHandler : IRequestHandler<DeleteSubjectCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteSubjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteSubjectCommand request, CancellationToken cancellationToken)
    {
        var subject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (subject == null)
        {
            throw new NotFoundException($"Subject with ID '{request.Id}' was not found.");
        }

        // Load all class-subject associations with their teacher assignments and assignments
        var classSubjects = await _context.ClassSubjects
            .Where(cs => cs.SubjectId == request.Id)
            .Include(cs => cs.TeacherAssignments)
                .ThenInclude(ta => ta.Assignments)
            .ToListAsync(cancellationToken);

        // Remove in reverse dependency order
        foreach (var cs in classSubjects)
        {
            foreach (var ta in cs.TeacherAssignments)
            {
                if (ta.Assignments.Any())
                {
                    _context.Assignments.RemoveRange(ta.Assignments);
                }
            }
            if (cs.TeacherAssignments.Any())
            {
                _context.TeacherAssignments.RemoveRange(cs.TeacherAssignments);
            }
        }

        if (classSubjects.Any())
        {
            _context.ClassSubjects.RemoveRange(classSubjects);
        }

        // Remove the subject
        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
