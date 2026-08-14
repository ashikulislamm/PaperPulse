using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;

namespace PaperPulse.Application.Features.Academic.Queries.GetSubjects;

public record GetSubjectsQuery : IRequest<List<SubjectDto>>;

public class GetSubjectsQueryHandler : IRequestHandler<GetSubjectsQuery, List<SubjectDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSubjectsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SubjectDto>> Handle(GetSubjectsQuery request, CancellationToken cancellationToken)
    {
        var classSubjects = await _context.ClassSubjects
            .AsNoTracking()
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .Include(cs => cs.TeacherAssignments)
                .ThenInclude(ta => ta.Teacher)
            .OrderBy(cs => cs.Class.Name)
                .ThenBy(cs => cs.Subject.Name)
            .ToListAsync(cancellationToken);

        return classSubjects.Select(cs =>
        {
            var primaryTeacher = cs.TeacherAssignments.FirstOrDefault(ta => ta.IsPrimary)?.Teacher;
            var teacherName = primaryTeacher != null ? $"{primaryTeacher.FirstName} {primaryTeacher.LastName}" : "Unassigned";

            return new SubjectDto(
                cs.Subject.Id,
                cs.Id,
                cs.Class.Id,
                cs.Class.Name,
                cs.Subject.Name,
                cs.Subject.Code,
                cs.Subject.Description,
                cs.PassMarks ?? 50.0m,
                teacherName,
                cs.CreatedAt
            );
        }).ToList();
    }
}
