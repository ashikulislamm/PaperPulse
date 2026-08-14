using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.UnenrollStudents;

public record UnenrollStudentsCommand(
    Guid ClassId,
    List<Guid> StudentIds
) : IRequest<int>;

public class UnenrollStudentsCommandHandler : IRequestHandler<UnenrollStudentsCommand, int>
{
    private readonly IApplicationDbContext _context;

    public UnenrollStudentsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(UnenrollStudentsCommand request, CancellationToken cancellationToken)
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

        var enrollments = await _context.StudentEnrollments
            .Where(se => se.ClassId == request.ClassId &&
                         studentIds.Contains(se.StudentId) &&
                         se.IsActive)
            .ToListAsync(cancellationToken);

        if (enrollments.Count == 0)
        {
            throw new NotFoundException("No active enrollments were found for the selected students.");
        }

        var now = DateTimeOffset.UtcNow;
        foreach (var enrollment in enrollments)
        {
            enrollment.IsActive = false;
            enrollment.UpdatedAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return enrollments.Count;
    }
}
