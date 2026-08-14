using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Academic.Commands.CreateClass;
using PaperPulse.Application.Features.Academic.Commands.CreateSubject;
using PaperPulse.Application.Features.Academic.Commands.DeleteClass;
using PaperPulse.Application.Features.Academic.Commands.DeleteSubject;
using PaperPulse.Application.Features.Academic.Commands.EnrollStudents;
using PaperPulse.Application.Features.Academic.Commands.ReassignTeacher;
using PaperPulse.Application.Features.Academic.Commands.UnenrollStudents;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Application.Features.Academic.Queries.GetAvailableStudents;
using PaperPulse.Application.Features.Academic.Queries.GetClasses;
using PaperPulse.Application.Features.Academic.Queries.GetClassStudents;
using PaperPulse.Application.Features.Academic.Queries.GetMyTeacherAssignments;
using PaperPulse.Application.Features.Academic.Queries.GetSubjects;
using PaperPulse.Domain.Constants;
using PaperPulse.Infrastructure.Authorization;

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

    /// <summary>
    /// Fetch students enrolled in a class
    /// </summary>
    [HttpGet("classes/{id:guid}/students")]
    [HasPermission(Permissions.StudentEnrollments.View)]
    [ProducesResponseType(typeof(ApiResponse<List<StudentEnrollmentDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<List<StudentEnrollmentDto>>>> GetClassStudents(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetClassStudentsQuery(id), cancellationToken);
        return OkResponse(result, "Class students retrieved successfully.");
    }

    /// <summary>
    /// Fetch students (with the Student role) not yet enrolled in a class
    /// </summary>
    [HttpGet("classes/{id:guid}/available-students")]
    [HasPermission(Permissions.StudentEnrollments.View)]
    [ProducesResponseType(typeof(ApiResponse<List<StudentEnrollmentDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<List<StudentEnrollmentDto>>>> GetAvailableStudents(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAvailableStudentsQuery(id), cancellationToken);
        return OkResponse(result, "Available students retrieved successfully.");
    }

    /// <summary>
    /// Enroll students into a class (Admin only) with seat capacity enforcement
    /// </summary>
    [HttpPost("classes/{id:guid}/students")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<int>>> EnrollStudents(
        [FromRoute] Guid id,
        [FromBody] EnrollStudentsCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.ClassId)
        {
            return BadRequest(ApiResponse<int>.FailureResponse("Route ID does not match payload body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, $"{result} student(s) enrolled successfully.");
    }

    /// <summary>
    /// Unenroll students from a class (Admin only)
    /// </summary>
    [HttpDelete("classes/{id:guid}/students")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<int>>> UnenrollStudents(
        [FromRoute] Guid id,
        [FromBody] UnenrollStudentsCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.ClassId)
        {
            return BadRequest(ApiResponse<int>.FailureResponse("Route ID does not match payload body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, $"{result} student(s) unenrolled successfully.");
    }

    /// <summary>
    /// Change the assigned teacher for a class subject (Admin only). Blocked while active assignments exist; history preserved.
    /// </summary>
    [HttpPut("subjects/{classSubjectId:guid}/teacher")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<SubjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<SubjectDto>>> ReassignTeacher(
        [FromRoute] Guid classSubjectId,
        [FromBody] ReassignTeacherCommand command,
        CancellationToken cancellationToken)
    {
        if (classSubjectId != command.ClassSubjectId)
        {
            return BadRequest(ApiResponse<SubjectDto>.FailureResponse("Route ID does not match payload body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Subject teacher reassigned successfully.");
    }

    /// <summary>
    /// Fetch the current teacher's primary subject allocations (class + subject)
    /// </summary>
    [HttpGet("teacher-assignments/me")]
    [Authorize(Roles = "Teacher,Admin")]
    [ProducesResponseType(typeof(ApiResponse<List<TeacherAllocationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<TeacherAllocationDto>>>> GetMyTeacherAssignments(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetMyTeacherAssignmentsQuery(), cancellationToken);
        return OkResponse(result, "Teacher assignments retrieved successfully.");
    }
}
