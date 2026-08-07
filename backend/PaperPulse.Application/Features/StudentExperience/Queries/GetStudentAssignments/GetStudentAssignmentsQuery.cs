using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.StudentExperience.DTOs;

namespace PaperPulse.Application.Features.StudentExperience.Queries.GetStudentAssignments;

public record GetStudentAssignmentsQuery(
    string? Filter = null, // "Upcoming", "Past", "Submitted", "Overdue"
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<StudentAssignmentSummaryDto>>;
