using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;
using PaperPulse.Application.Features.Notifications.Commands.MarkNotificationAsRead;
using PaperPulse.Application.Features.Notifications.Commands.SendDeadlineReminders;
using PaperPulse.Application.Features.Notifications.DTOs;
using PaperPulse.Application.Features.Notifications.Queries.GetNotifications;
using PaperPulse.Application.Features.Notifications.Queries.GetUnreadNotificationCount;
using PaperPulse.Domain.Constants;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
public class NotificationsController : ApiControllerBase
{
    /// <summary>
    /// Get in-app notifications for authenticated user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<NotificationDto>>>> GetNotifications(
        [FromQuery] GetNotificationsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Notifications retrieved successfully.");
    }

    /// <summary>
    /// Get unread notifications count for badge display
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<UnreadCountDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<UnreadCountDto>>> GetUnreadCount(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetUnreadNotificationCountQuery(), cancellationToken);
        return OkResponse(result, "Unread count retrieved successfully.");
    }

    /// <summary>
    /// Mark single notification as read
    /// </summary>
    [HttpPatch("{id:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> MarkAsRead(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new MarkNotificationAsReadCommand(id), cancellationToken);
        return NoContentResponse("Notification marked as read.");
    }

    /// <summary>
    /// Mark all unread notifications for current user as read
    /// </summary>
    [HttpPatch("read-all")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse>> MarkAllAsRead(CancellationToken cancellationToken)
    {
        await Mediator.Send(new MarkAllNotificationsAsReadCommand(), cancellationToken);
        return NoContentResponse("All notifications marked as read.");
    }

    /// <summary>
    /// System/Admin endpoint to trigger deadline reminder notifications for upcoming assignments
    /// </summary>
    [HttpPost("trigger-deadline-reminders")]
    [HasPermission(Permissions.Notifications.Send)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<int>>> TriggerDeadlineReminders(
        [FromQuery] int hoursThreshold = 24,
        CancellationToken cancellationToken = default)
    {
        var count = await Mediator.Send(new SendDeadlineRemindersCommand(hoursThreshold), cancellationToken);
        return OkResponse(count, $"{count} deadline reminder notifications dispatched successfully.");
    }
}
