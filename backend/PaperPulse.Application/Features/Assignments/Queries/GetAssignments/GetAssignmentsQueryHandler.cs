using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Extensions;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Assignments.DTOs;

namespace PaperPulse.Application.Features.Assignments.Queries.GetAssignments;

public class GetAssignmentsQueryHandler : IRequestHandler<GetAssignmentsQuery, PagedResult<AssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAssignmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AssignmentDto>> Handle(GetAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Assignments
            .AsNoTracking()
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Class)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Subject)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLowerInvariant();
            query = query.Where(a =>
                a.Title.ToLower().Contains(searchLower) ||
                a.Description.ToLower().Contains(searchLower));
        }

        // Status filter
        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }

        // Teacher assignment filter
        if (request.TeacherAssignmentId.HasValue)
        {
            query = query.Where(a => a.TeacherAssignmentId == request.TeacherAssignmentId.Value);
        }

        // Class filter
        if (request.ClassId.HasValue)
        {
            query = query.Where(a => a.TeacherAssignment.ClassSubject.ClassId == request.ClassId.Value);
        }

        // Subject filter
        if (request.SubjectId.HasValue)
        {
            query = query.Where(a => a.TeacherAssignment.ClassSubject.SubjectId == request.SubjectId.Value);
        }

        // Sorting
        query = query.ApplySorting(request.SortBy, request.IsDescending);

        var totalCount = await query.CountAsync(cancellationToken);

        var assignments = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = assignments.Select(a => new AssignmentDto(
            a.Id,
            a.TeacherAssignmentId,
            a.TeacherAssignment.ClassSubject.Class.Name,
            a.TeacherAssignment.ClassSubject.Subject.Name,
            a.Title,
            a.Description,
            a.MaxMarks,
            a.PassMarks,
            a.DueDate,
            a.Status.ToString(),
            a.AllowLateSubmission,
            a.LatePenaltyPercentage,
            a.CreatedAt
        )).ToList();

        return new PagedResult<AssignmentDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
