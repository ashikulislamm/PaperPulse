using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Queries.GetClassStudents;

public record GetClassStudentsQuery(
    Guid ClassId
) : IRequest<List<StudentEnrollmentDto>>;

public class GetClassStudentsQueryHandler : IRequestHandler<GetClassStudentsQuery, List<StudentEnrollmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClassStudentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentEnrollmentDto>> Handle(GetClassStudentsQuery request, CancellationToken cancellationToken)
    {
        var classExists = await _context.Classes
            .AnyAsync(c => c.Id == request.ClassId, cancellationToken);

        if (!classExists)
        {
            throw new NotFoundException($"Class with ID '{request.ClassId}' was not found.");
        }

        var enrollments = await _context.StudentEnrollments
            .AsNoTracking()
            .Include(se => se.Student)
            .Where(se => se.ClassId == request.ClassId)
            .OrderBy(se => se.Student.FirstName)
                .ThenBy(se => se.Student.LastName)
            .ToListAsync(cancellationToken);

        return enrollments.Select(se => new StudentEnrollmentDto(
            se.Id,
            se.StudentId,
            $"{se.Student.FirstName} {se.Student.LastName}",
            se.Student.Email,
            se.RollNumber,
            se.EnrollmentDate,
            se.IsActive
        )).ToList();
    }
}
