using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Submissions.Commands.CreateSubmission;
using PaperPulse.Application.Features.Submissions.Commands.UpdateSubmission;
using PaperPulse.Application.Features.Submissions.DTOs;
using PaperPulse.Application.Features.Submissions.Queries.GetSubmissionById;
using PaperPulse.Domain.Constants;
using PaperPulse.Application.Features.Submissions.Commands.UploadSubmissionAttachment;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
public class SubmissionsController : ApiControllerBase
{
    /// <summary>
    /// Submit work for an assignment (Creates Version 1)
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Submissions.Create)]
    [ProducesResponseType(typeof(ApiResponse<SubmissionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> CreateSubmission(
        [FromBody] CreateSubmissionCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedResponse(result, nameof(GetSubmissionById), new { id = result.Id }, "Assignment submitted successfully.");
    }

    /// <summary>
    /// Update/resubmit work for an assignment (Creates new Version)
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Submissions.Update)]
    [ProducesResponseType(typeof(ApiResponse<SubmissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> UpdateSubmission(
        [FromRoute] Guid id,
        [FromBody] UpdateSubmissionCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.SubmissionId)
        {
            return BadRequest(ApiResponse<SubmissionDto>.FailureResponse("Route ID does not match body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Submission updated successfully.");
    }

    /// <summary>
    /// Get submission details with full version history and attached files
    /// </summary>
    [HttpGet("{id:guid}", Name = nameof(GetSubmissionById))]
    [HasPermission(Permissions.Submissions.View)]
    [ProducesResponseType(typeof(ApiResponse<SubmissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> GetSubmissionById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetSubmissionByIdQuery(id), cancellationToken);
        return OkResponse(result, "Submission details retrieved successfully.");
    }

    /// <summary>
    /// Upload a file attachment for a submission version
    /// </summary>
    [HttpPost("{id:guid}/upload")]
    [HasPermission(Permissions.Submissions.Create)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> UploadSubmissionFile(
        [FromRoute] Guid id,
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        using var stream = file.OpenReadStream();
        var result = await Mediator.Send(
            new UploadSubmissionAttachmentCommand(id, stream, file.FileName, file.ContentType),
            cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            attachmentId = result.AttachmentId,
            fileName = result.FileName,
            filePath = result.FilePath,
            fileSize = result.FileSize
        }, "File uploaded successfully.", StatusCodes.Status200OK));
    }
}
