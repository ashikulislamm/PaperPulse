using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Queries.GetAvailableStudents;

public record GetAvailableStudentsQuery(
    Guid ClassId
) : IRequest<List<StudentEnrollmentDto>>;

public class GetAvailableStudentsQueryHandler : IRequestHandler<GetAvailableStudentsQuery, List<StudentEnrollmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableStudentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentEnrollmentDto>> Handle(GetAvailableStudentsQuery request, CancellationToken cancellationToken)
    {
        var classExists = await _context.Classes
            .AnyAsync(c => c.Id == request.ClassId, cancellationToken);

        if (!classExists)
        {
            throw new NotFoundException($"Class with ID '{request.ClassId}' was not found.");
        }

        var enrolledStudentIds = await _context.StudentEnrollments
            .AsNoTracking()
            .Where(se => se.ClassId == request.ClassId && se.IsActive)
            .Select(se => se.StudentId)
            .ToListAsync(cancellationToken);

        var availableStudents = await _context.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => !enrolledStudentIds.Contains(u.Id) &&
                        u.UserRoles.Any(ur => ur.Role.Name == RoleType.Student) &&
                        u.Status == UserStatus.Active)
            .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
            .ToListAsync(cancellationToken);

        return availableStudents.Select(s => new StudentEnrollmentDto(
            Guid.Empty,
            s.Id,
            $"{s.FirstName} {s.LastName}",
            s.Email,
            null,
            DateTimeOffset.MinValue,
            true
        )).ToList();
    }
}
