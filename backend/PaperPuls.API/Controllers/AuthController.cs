using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Auth.Commands.Login;
using PaperPulse.Application.Features.Auth.Commands.Logout;
using PaperPulse.Application.Features.Auth.Commands.RefreshToken;
using PaperPulse.Application.Features.Auth.Commands.Register;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Application.Features.Auth.Queries.GetCurrentUser;

namespace PaperPuls.API.Controllers;

public class AuthController : ApiControllerBase
{
    /// <summary>
    /// Register a new user (Student or Teacher)
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(
        [FromBody] RegisterCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedResponse(result, nameof(GetCurrentUser), new { }, "User registered successfully.");
    }

    /// <summary>
    /// Authenticate user credentials and issue JWT &amp; Refresh token
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Login successful.");
    }

    /// <summary>
    /// Refresh an expired JWT access token using Refresh Token Rotation
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> RefreshToken(
        [FromBody] RefreshTokenCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkResponse(result, "Token refreshed successfully.");
    }

    /// <summary>
    /// Logout current user session and revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse>> Logout(
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] LogoutCommand? command,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(command ?? new LogoutCommand(), cancellationToken);
        return NoContentResponse("Logged out successfully.");
    }

    /// <summary>
    /// Retrieve current authenticated user profile
    /// </summary>
    [HttpGet("me", Name = nameof(GetCurrentUser))]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetCurrentUserQuery(), cancellationToken);
        return OkResponse(result, "User profile retrieved successfully.");
    }
}
