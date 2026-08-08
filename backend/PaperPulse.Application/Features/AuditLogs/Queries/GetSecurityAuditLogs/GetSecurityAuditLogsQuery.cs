using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetSecurityAuditLogs;

public record GetSecurityAuditLogsQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<AuditLogDto>>;
