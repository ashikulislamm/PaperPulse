using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Application.Features.Users.Commands.ActivateUser;
using PaperPulse.Application.Features.Users.Commands.AssignUserRoles;
using PaperPulse.Application.Features.Users.Commands.BanUser;
using PaperPulse.Application.Features.Users.Commands.CreateUser;
using PaperPulse.Application.Features.Users.Commands.DeactivateUser;
using PaperPulse.Application.Features.Users.Commands.DeleteUser;
using PaperPulse.Application.Features.Users.Commands.UpdateUser;
using PaperPulse.Application.Features.Users.Queries.GetUserById;
using PaperPulse.Application.Features.Users.Queries.GetUsers;
using PaperPulse.Domain.Constants;
using PaperPulse.Domain.Enums;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
public class UsersController : ApiControllerBase
{
    /// <summary>
    /// Search, filter, and paginate system users
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Users.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<UserDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetUsers(
        [FromQuery] GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Users retrieved successfully.");
    }

    /// <summary>
    /// Get detailed user profile by ID
    /// </summary>
    [HttpGet("{id:guid}", Name = nameof(GetUserById))]
    [HasPermission(Permissions.Users.View)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetUserByIdQuery(id), cancellationToken);
        return OkResponse(result, "User profile retrieved successfully.");
    }

    /// <summary>
    /// Create a new system user with password &amp; mandatory first-login password change
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Users.Create)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser(
        [FromBody] CreateUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedResponse(result, nameof(GetUserById), new { id = result.Id }, "User created successfully.");
    }

    /// <summary>
    /// Update existing user profile details
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Users.Update)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(
        [FromRoute] Guid id,
        [FromBody] UpdateUserCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<UserDto>.FailureResponse("Route ID does not match body ID.", StatusCodes.Status400BadRequest));
        }

        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "User profile updated successfully.");
    }

    /// <summary>
    /// Soft delete a user account
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Users.Delete)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> DeleteUser(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeleteUserCommand(id), cancellationToken);
        return NoContentResponse("User account deleted successfully.");
    }

    /// <summary>
    /// Activate a user account
    /// </summary>
    [HttpPatch("{id:guid}/activate")]
    [HasPermission(Permissions.Users.Activate)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> ActivateUser(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new ActivateUserCommand(id), cancellationToken);
        return NoContentResponse("User account activated successfully.");
    }

    /// <summary>
    /// Deactivate a user account and terminate active sessions
    /// </summary>
    [HttpPatch("{id:guid}/deactivate")]
    [HasPermission(Permissions.Users.Deactivate)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> DeactivateUser(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new DeactivateUserCommand(id), cancellationToken);
        return NoContentResponse("User account deactivated successfully.");
    }

    /// <summary>
    /// Ban/Suspend a user account and kill active sessions
    /// </summary>
    [HttpPatch("{id:guid}/ban")]
    [HasPermission(Permissions.Users.Deactivate)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> BanUser(
        [FromRoute] Guid id,
        [FromBody] string? reason,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new BanUserCommand(id, reason), cancellationToken);
        return NoContentResponse("User account banned/suspended successfully.");
    }

    /// <summary>
    /// Assign or update roles assigned to a user
    /// </summary>
    [HttpPost("{id:guid}/roles")]
    [HasPermission(Permissions.Roles.Assign)]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDto>>> AssignUserRoles(
        [FromRoute] Guid id,
        [FromBody] List<RoleType> roles,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new AssignUserRolesCommand(id, roles), cancellationToken);
        return OkResponse(result, "User roles updated successfully.");
    }
}
