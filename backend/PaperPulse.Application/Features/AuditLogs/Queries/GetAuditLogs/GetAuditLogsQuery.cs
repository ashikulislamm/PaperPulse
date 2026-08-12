using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogs;

public class GetAuditLogsQuery : IRequest<PagedResult<AuditLogDto>>
{
    public string? Search { get; set; }
    public string? Action { get; set; }
    public string? EntityName { get; set; }
    public Guid? UserId { get; set; }
    public string? IpAddress { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public GetAuditLogsQuery() { }

    public GetAuditLogsQuery(
        string? search = null,
        string? action = null,
        string? entityName = null,
        Guid? userId = null,
        string? ipAddress = null,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        int pageNumber = 1,
        int pageSize = 10)
    {
        Search = search;
        Action = action;
        EntityName = entityName;
        UserId = userId;
        IpAddress = ipAddress;
        StartDate = startDate;
        EndDate = endDate;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}
