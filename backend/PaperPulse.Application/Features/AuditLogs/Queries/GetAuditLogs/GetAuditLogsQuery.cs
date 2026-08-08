using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery(
    string? Search = null,
    string? Action = null,
    string? EntityName = null,
    Guid? UserId = null,
    string? IpAddress = null,
    DateTimeOffset? StartDate = null,
    DateTimeOffset? EndDate = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<AuditLogDto>>;
