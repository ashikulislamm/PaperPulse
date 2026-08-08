using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Assignments.Commands.AutoCloseAssignments;

public class AutoCloseAssignmentsCommandHandler : IRequestHandler<AutoCloseAssignmentsCommand, int>
{
    private readonly IApplicationDbContext _context;

    public AutoCloseAssignmentsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(AutoCloseAssignmentsCommand request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var expiredAssignments = await _context.Assignments
            .Where(a => a.Status == AssignmentStatus.Published && a.DueDate <= now)
            .ToListAsync(cancellationToken);

        if (!expiredAssignments.Any()) return 0;

        foreach (var assignment in expiredAssignments)
        {
            assignment.Status = AssignmentStatus.Closed;
        }

        _context.Assignments.UpdateRange(expiredAssignments);
        await _context.SaveChangesAsync(cancellationToken);

        return expiredAssignments.Count;
    }
}
