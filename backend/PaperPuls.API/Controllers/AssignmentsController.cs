using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Assignments.Commands.ArchiveAssignment;
using PaperPulse.Application.Features.Assignments.Commands.CloseAssignment;
using PaperPulse.Application.Features.Assignments.Commands.CreateAssignment;
using PaperPulse.Application.Features.Assignments.Commands.DeleteAssignment;
using PaperPulse.Application.Features.Assignments.Commands.PublishAssignment;
using PaperPulse.Application.Features.Assignments.Commands.UpdateAssignment;
using PaperPulse.Application.Features.Assignments.DTOs;
using PaperPulse.Application.Features.Assignments.Queries.GetAssignmentById;
using PaperPulse.Application.Features.Assignments.Queries.GetAssignments;
using PaperPulse.Domain.Constants;
using PaperPulse.Application.Features.Assignments.Commands.UploadAssignmentAttachment;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
public class AssignmentsController : ApiControllerBase
{
    /// <summary>
    /// Search, filter, and paginate assignments
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Assignments.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AssignmentDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<AssignmentDto>>>> GetAssignments(
        [FromQuery] GetAssignmentsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Assignments retrieved successfully.");
    }

    /// <summary>
    /// Get detailed assignment info with attached reference files
    /// </summary>
    [HttpGet("{id:guid}", Name = nameof(GetAssignmentById))]
    [HasPermission(Permissions.Assignments.Details)]
    [ProducesResponseType(typeof(ApiResponse<AssignmentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AssignmentDetailDto>>> GetAssignmentById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAssignmentByIdQuery(id), cancellationToken);
        return OkResponse(result, "Assignment details retrieved successfully.");
    }

    /// <summary>
    /// Create a new assignment (Draft or Published)
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Assignments.Create)]
    [ProducesResponseType(typeof(ApiResponse<AssignmentDetailDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<AssignmentDetailDto>>> CreateAssignment(
        [FromBody] CreateAssignmentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedResponse(result, nameof(GetAssignmentById), new { id = result.Id }, "Assignment created successfully.");
    }

    /// <summary>
    /// Update existing assignment details
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Assignments.Update)]
    [ProducesResponseType(typeof(ApiResponse<AssignmentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AssignmentDetailDto>>> UpdateAssignment(
        [FromRoute] Guid id,
        [FromBody] UpdateAssignmentCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<AssignmentDetailDto>.FailureResponse("Route ID does not match payload body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Assignment updated successfully.");
    }

    /// <summary>
    /// Publish assignment to make visible to enrolled students
    /// </summary>
    [HttpPatch("{id:guid}/publish")]
    [HasPermission(Permissions.Assignments.Publish)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> PublishAssignment(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new PublishAssignmentCommand(id), cancellationToken);
        return NoContentResponse("Assignment published successfully.");
    }

    /// <summary>
    /// Close assignment to block new submissions
    /// </summary>
    [HttpPatch("{id:guid}/close")]
    [HasPermission(Permissions.Assignments.Update)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> CloseAssignment(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new CloseAssignmentCommand(id), cancellationToken);
        return NoContentResponse("Assignment closed successfully.");
    }

    /// <summary>
    /// Archive assignment
    /// </summary>
    [HttpPatch("{id:guid}/archive")]
    [HasPermission(Permissions.Assignments.Archive)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> ArchiveAssignment(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new ArchiveAssignmentCommand(id), cancellationToken);
        return NoContentResponse("Assignment archived successfully.");
    }

    /// <summary>
    /// Delete an assignment
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Assignments.Delete)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> DeleteAssignment(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteAssignmentCommand(id), cancellationToken);
        return NoContentResponse("Assignment deleted successfully.");
    }

    /// <summary>
    /// Upload a file attachment for an assignment
    /// </summary>
    [HttpPost("{id:guid}/upload")]
    [HasPermission(Permissions.Assignments.Create)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> UploadAssignmentFile(
        [FromRoute] Guid id,
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        using var stream = file.OpenReadStream();
        var result = await Mediator.Send(
            new UploadAssignmentAttachmentCommand(id, stream, file.FileName, file.ContentType),
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
