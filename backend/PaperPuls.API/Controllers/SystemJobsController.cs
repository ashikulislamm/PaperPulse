using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Assignments.Commands.AutoCloseAssignments;
using PaperPulse.Application.Features.Auth.Commands.CleanupRefreshTokens;
using PaperPulse.Application.Features.Notifications.Commands.CleanupOldNotifications;
using PaperPulse.Domain.Constants;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
[Route("api/v1/system/jobs")]
public class SystemJobsController : ApiControllerBase
{
    /// <summary>
    /// Trigger background job to auto-close expired published assignments
    /// </summary>
    [HttpPost("auto-close-assignments")]
    [HasPermission(Permissions.Settings.Update)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<int>>> TriggerAutoCloseAssignments(CancellationToken cancellationToken)
    {
        var count = await Mediator.Send(new AutoCloseAssignmentsCommand(), cancellationToken);
        return OkResponse(count, $"{count} expired assignments auto-closed successfully.");
    }

    /// <summary>
    /// Trigger background job to purge expired and revoked refresh tokens
    /// </summary>
    [HttpPost("cleanup-tokens")]
    [HasPermission(Permissions.Settings.Update)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<int>>> TriggerTokenCleanup(CancellationToken cancellationToken)
    {
        var count = await Mediator.Send(new CleanupRefreshTokensCommand(), cancellationToken);
        return OkResponse(count, $"{count} stale refresh tokens purged successfully.");
    }

    /// <summary>
    /// Trigger background job to purge old read notifications
    /// </summary>
    [HttpPost("cleanup-notifications")]
    [HasPermission(Permissions.Settings.Update)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<int>>> TriggerNotificationCleanup(
        [FromQuery] int retentionDays = 30,
        CancellationToken cancellationToken = default)
    {
        var count = await Mediator.Send(new CleanupOldNotificationsCommand(retentionDays), cancellationToken);
        return OkResponse(count, $"{count} old read notifications purged successfully.");
    }
}
