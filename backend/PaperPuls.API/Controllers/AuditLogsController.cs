using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;
using PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogById;
using PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogs;
using PaperPulse.Application.Features.AuditLogs.Queries.GetSecurityAuditLogs;
using PaperPulse.Domain.Constants;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
public class AuditLogsController : ApiControllerBase
{
    /// <summary>
    /// Search, filter, and paginate system audit logs
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.AuditLogs.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetAuditLogs(
        [FromQuery] GetAuditLogsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Audit logs retrieved successfully.");
    }

    /// <summary>
    /// Get high-priority security audit logs (Logins, Ban, Role Escalations, Password Changes)
    /// </summary>
    [HttpGet("security")]
    [HasPermission(Permissions.AuditLogs.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetSecurityAuditLogs(
        [FromQuery] GetSecurityAuditLogsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "Security audit logs retrieved successfully.");
    }

    /// <summary>
    /// Filter audit logs by specific user ID
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [HasPermission(Permissions.AuditLogs.View)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetUserAuditLogs(
        [FromRoute] Guid userId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAuditLogsQuery(UserId: userId, PageNumber: pageNumber, PageSize: pageSize);
        var result = await Mediator.Send(query, cancellationToken);
        return PagedResponse(result, "User audit logs retrieved successfully.");
    }

    /// <summary>
    /// Get single audit log entry details with complete JSON state payload
    /// </summary>
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.AuditLogs.View)]
    [ProducesResponseType(typeof(ApiResponse<AuditLogDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AuditLogDetailDto>>> GetAuditLogById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAuditLogByIdQuery(id), cancellationToken);
        return OkResponse(result, "Audit log details retrieved successfully.");
    }
}
