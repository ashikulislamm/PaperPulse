using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.StudentExperience.DTOs;
using PaperPulse.Application.Features.StudentExperience.Queries.GetStudentAssignments;
using PaperPulse.Application.Features.StudentExperience.Queries.GetStudentGrades;
using PaperPulse.Application.Features.StudentExperience.Queries.GetUpcomingDeadlines;
using PaperPulse.Domain.Constants;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
[Route("api/v1/student")]
public class StudentAssignmentsController : ApiControllerBase
{
    /// <summary>
    /// Get assigned assignments feed for enrolled student (Upcoming, Past, Submitted, Overdue)
    /// </summary>
    [HttpGet("assignments")]
    [HasPermission(Permissions.Assignments.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<StudentAssignmentSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<StudentAssignmentSummaryDto>>>> GetStudentAssignments(
        [FromQuery] GetStudentAssignmentsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Student assignments retrieved successfully.");
    }

    /// <summary>
    /// Get upcoming assignment deadlines for calendar and dashboard widgets
    /// </summary>
    [HttpGet("deadlines")]
    [HasPermission(Permissions.Assignments.View)]
    [ProducesResponseType(typeof(ApiResponse<List<UpcomingDeadlineDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<UpcomingDeadlineDto>>>> GetUpcomingDeadlines(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetUpcomingDeadlinesQuery(), cancellationToken);
        return OkResponse(result, "Upcoming deadlines retrieved successfully.");
    }

    /// <summary>
    /// Get student grades, scores, pass/fail status, and public teacher feedback
    /// </summary>
    [HttpGet("grades")]
    [HasPermission(Permissions.Grades.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<StudentGradeSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<StudentGradeSummaryDto>>>> GetStudentGrades(
        [FromQuery] GetStudentGradesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Student grades and feedback retrieved successfully.");
    }
}
