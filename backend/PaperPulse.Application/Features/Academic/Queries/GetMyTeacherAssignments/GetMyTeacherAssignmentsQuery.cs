using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Queries.GetMyTeacherAssignments;

public record GetMyTeacherAssignmentsQuery : IRequest<List<TeacherAllocationDto>>;

public class GetMyTeacherAssignmentsQueryHandler : IRequestHandler<GetMyTeacherAssignmentsQuery, List<TeacherAllocationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyTeacherAssignmentsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<TeacherAllocationDto>> Handle(GetMyTeacherAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue)
        {
            throw new UnauthorizedException("Teacher is not authenticated.");
        }

        var allocations = await _context.TeacherAssignments
            .AsNoTracking()
            .Include(ta => ta.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(ta => ta.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Where(ta => ta.TeacherId == teacherId.Value && ta.IsPrimary)
            .OrderBy(ta => ta.ClassSubject.Class.Name)
                .ThenBy(ta => ta.ClassSubject.Subject.Name)
            .ToListAsync(cancellationToken);

        return allocations.Select(ta => new TeacherAllocationDto(
            ta.Id,
            ta.ClassSubjectId,
            ta.ClassSubject.Class.Id,
            ta.ClassSubject.Subject.Id,
            ta.ClassSubject.Class.Name,
            ta.ClassSubject.Subject.Name,
            ta.IsPrimary
        )).ToList();
    }
}
