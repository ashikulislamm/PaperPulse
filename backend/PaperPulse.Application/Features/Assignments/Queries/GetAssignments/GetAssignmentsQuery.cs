using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Assignments.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Assignments.Queries.GetAssignments;

public record GetAssignmentsQuery(
    string? Search = null,
    AssignmentStatus? Status = null,
    Guid? TeacherAssignmentId = null,
    Guid? ClassId = null,
    Guid? SubjectId = null,
    int PageNumber = 1,
    int PageSize = 10,
    string SortBy = "CreatedAt",
    bool IsDescending = true
) : IRequest<PagedResult<AssignmentDto>>;
