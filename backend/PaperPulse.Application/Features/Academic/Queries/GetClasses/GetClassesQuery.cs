using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;

namespace PaperPulse.Application.Features.Academic.Queries.GetClasses;

public record GetClassesQuery : IRequest<List<ClassDto>>;

public class GetClassesQueryHandler : IRequestHandler<GetClassesQuery, List<ClassDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClassesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClassDto>> Handle(GetClassesQuery request, CancellationToken cancellationToken)
    {
        var classes = await _context.Classes
            .AsNoTracking()
            .Include(c => c.ClassSubjects)
            .Include(c => c.StudentEnrollments)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return classes.Select(c => new ClassDto(
            c.Id,
            c.Name,
            c.Code,
            c.MaxCapacity,
            c.ClassSubjects.Count,
            c.StudentEnrollments.Count,
            c.CreatedAt
        )).ToList();
    }
}
