using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Academic.Commands.CreateClass;
using PaperPulse.Application.Features.Academic.Commands.CreateSubject;
using PaperPulse.Application.Features.Academic.Commands.DeleteClass;
using PaperPulse.Application.Features.Academic.Commands.DeleteSubject;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Application.Features.Academic.Queries.GetClasses;
using PaperPulse.Application.Features.Academic.Queries.GetSubjects;

namespace PaperPuls.API.Controllers;

[Authorize]
public class AcademicController : ApiControllerBase
{
    /// <summary>
    /// Fetch all academic classes
    /// </summary>
    [HttpGet("classes")]
    [ProducesResponseType(typeof(ApiResponse<List<ClassDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<ClassDto>>>> GetClasses(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetClassesQuery(), cancellationToken);
        return OkResponse(result, "Academic classes retrieved successfully.");
    }

    /// <summary>
    /// Create an independent academic class (Admin only)
    /// </summary>
    [HttpPost("classes")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ClassDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<ClassDto>>> CreateClass(
        [FromBody] CreateClassCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<ClassDto>.CreatedResponse(result, "Class created successfully."));
    }

    /// <summary>
    /// Fetch all subjects with their assigned class details
    /// </summary>
    [HttpGet("subjects")]
    [ProducesResponseType(typeof(ApiResponse<List<SubjectDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<SubjectDto>>>> GetSubjects(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetSubjectsQuery(), cancellationToken);
        return OkResponse(result, "Subjects retrieved successfully.");
    }

    /// <summary>
    /// Create a subject assigned to an independent class (Admin only)
    /// </summary>
    [HttpPost("subjects")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<SubjectDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<SubjectDto>>> CreateSubject(
        [FromBody] CreateSubjectCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<SubjectDto>.CreatedResponse(result, "Subject created successfully."));
    }

    /// <summary>
    /// Delete an academic class and its subject associations (Admin only)
    /// </summary>
    [HttpDelete("classes/{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> DeleteClass(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteClassCommand(id), cancellationToken);
        return NoContentResponse("Class deleted successfully.");
    }

    /// <summary>
    /// Delete a subject and its class associations (Admin only)
    /// </summary>
    [HttpDelete("subjects/{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> DeleteSubject(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteSubjectCommand(id), cancellationToken);
        return NoContentResponse("Subject deleted successfully.");
    }
}
