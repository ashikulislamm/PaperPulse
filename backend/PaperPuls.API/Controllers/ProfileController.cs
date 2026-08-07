using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Application.Features.Profile.Commands.ChangePassword;
using PaperPulse.Application.Features.Profile.Commands.UpdateProfile;
using PaperPulse.Application.Features.Profile.Queries.GetProfile;

namespace PaperPuls.API.Controllers;

[Authorize]
public class ProfileController : ApiControllerBase
{
    /// <summary>
    /// Retrieve current authenticated user profile (Teacher, Student, Admin)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetProfile(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetProfileQuery(), cancellationToken);
        return OkResponse(result, "Profile retrieved successfully.");
    }

    /// <summary>
    /// Update current user profile details
    /// </summary>
    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile(
        [FromBody] UpdateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Profile updated successfully.");
    }

    /// <summary>
    /// Change password for current authenticated user
    /// </summary>
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse>> ChangePassword(
        [FromBody] ChangePasswordCommand command,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(command, cancellationToken);
        return NoContentResponse("Password changed successfully. Please log in with your new password.");
    }
}
