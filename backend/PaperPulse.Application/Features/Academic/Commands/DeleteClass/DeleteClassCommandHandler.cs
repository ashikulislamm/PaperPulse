using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.DeleteClass;

public class DeleteClassCommandHandler : IRequestHandler<DeleteClassCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteClassCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteClassCommand request, CancellationToken cancellationToken)
    {
        var @class = await _context.Classes
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (@class == null)
        {
            throw new NotFoundException($"Class with ID '{request.Id}' was not found.");
        }

        // Load all class-subject associations with their teacher assignments and assignments
        var classSubjects = await _context.ClassSubjects
            .Where(cs => cs.ClassId == request.Id)
            .Include(cs => cs.TeacherAssignments)
                .ThenInclude(ta => ta.Assignments)
            .ToListAsync(cancellationToken);

        // Remove in reverse dependency order
        foreach (var cs in classSubjects)
        {
            // Remove assignments under each teacher assignment
            foreach (var ta in cs.TeacherAssignments)
            {
                if (ta.Assignments.Any())
                {
                    _context.Assignments.RemoveRange(ta.Assignments);
                }
            }
            // Remove teacher assignments
            if (cs.TeacherAssignments.Any())
            {
                _context.TeacherAssignments.RemoveRange(cs.TeacherAssignments);
            }
        }

        // Remove class-subject associations
        if (classSubjects.Any())
        {
            _context.ClassSubjects.RemoveRange(classSubjects);
        }

        // Remove the class
        _context.Classes.Remove(@class);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
