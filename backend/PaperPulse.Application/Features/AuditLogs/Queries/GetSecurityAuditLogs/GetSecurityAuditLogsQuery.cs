using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetSecurityAuditLogs;

public class GetSecurityAuditLogsQuery : IRequest<PagedResult<AuditLogDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public GetSecurityAuditLogsQuery() { }

    public GetSecurityAuditLogsQuery(int pageNumber = 1, int pageSize = 10)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}
