using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Grading.Commands.AddFeedback;
using PaperPulse.Application.Features.Grading.Commands.GradeSubmission;
using PaperPulse.Application.Features.Grading.Commands.ReturnSubmission;
using PaperPulse.Application.Features.Grading.DTOs;
using PaperPulse.Application.Features.Grading.Queries.GetSubmissionGradingDetail;
using PaperPulse.Application.Features.Grading.Queries.GetSubmissionsForGrading;
using PaperPulse.Domain.Constants;
using PaperPulse.Domain.Enums;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
public class GradingController : ApiControllerBase
{
    /// <summary>
    /// Get student submissions for an assignment to review and grade
    /// </summary>
    [HttpGet("assignments/{assignmentId:guid}/submissions")]
    [HasPermission(Permissions.Submissions.Review)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<SubmissionGradingDetailDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PagedResult<SubmissionGradingDetailDto>>>> GetSubmissionsForGrading(
        [FromRoute] Guid assignmentId,
        [FromQuery] SubmissionStatus? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSubmissionsForGradingQuery(assignmentId, status, pageNumber, pageSize);
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Submissions retrieved for grading successfully.");
    }

    /// <summary>
    /// Retrieve detailed submission payload for teacher grading and review
    /// </summary>
    [HttpGet("submissions/{submissionId:guid}")]
    [HasPermission(Permissions.Submissions.Review)]
    [ProducesResponseType(typeof(ApiResponse<SubmissionGradingDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<SubmissionGradingDetailDto>>> GetSubmissionGradingDetail(
        [FromRoute] Guid submissionId,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetSubmissionGradingDetailQuery(submissionId), cancellationToken);
        return OkResponse(result, "Submission grading details retrieved successfully.");
    }

    /// <summary>
    /// Assign grade/marks to a student submission
    /// </summary>
    [HttpPost("submissions/{submissionId:guid}/grade")]
    [HasPermission(Permissions.Grades.Create)]
    [ProducesResponseType(typeof(ApiResponse<SubmissionGradingDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<SubmissionGradingDetailDto>>> GradeSubmission(
        [FromRoute] Guid submissionId,
        [FromBody] GradeSubmissionCommand command,
        CancellationToken cancellationToken)
    {
        if (submissionId != command.SubmissionId)
        {
            return BadRequest(ApiResponse<SubmissionGradingDetailDto>.FailureResponse("Route ID does not match body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Submission graded successfully.");
    }

    /// <summary>
    /// Add public feedback comment or private teacher note to submission
    /// </summary>
    [HttpPost("submissions/{submissionId:guid}/feedback")]
    [HasPermission(Permissions.Feedback.Create)]
    [ProducesResponseType(typeof(ApiResponse<FeedbackDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<FeedbackDto>>> AddFeedback(
        [FromRoute] Guid submissionId,
        [FromBody] AddFeedbackCommand command,
        CancellationToken cancellationToken)
    {
        if (submissionId != command.SubmissionId)
        {
            return BadRequest(ApiResponse<FeedbackDto>.FailureResponse("Route ID does not match body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Feedback comment added successfully.");
    }

    /// <summary>
    /// Return graded submission to student
    /// </summary>
    [HttpPatch("submissions/{submissionId:guid}/return")]
    [HasPermission(Permissions.Grades.Update)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> ReturnSubmission(
        [FromRoute] Guid submissionId,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new ReturnSubmissionCommand(submissionId), cancellationToken);
        return NoContentResponse("Submission returned to student successfully.");
    }
}
