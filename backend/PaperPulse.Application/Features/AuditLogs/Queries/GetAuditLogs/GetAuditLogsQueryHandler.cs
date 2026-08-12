using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogs;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditLogs
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLowerInvariant();
            query = query.Where(a =>
                a.Action.ToLower().Contains(searchLower) ||
                a.EntityName.ToLower().Contains(searchLower) ||
                (a.User != null && (a.User.FirstName.ToLower().Contains(searchLower) || a.User.LastName.ToLower().Contains(searchLower) || a.User.Email.ToLower().Contains(searchLower))));
        }

        if (!string.IsNullOrWhiteSpace(request.Action) && !request.Action.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var actionTrim = request.Action.Trim().ToLower();
            query = query.Where(a => a.Action.ToLower() == actionTrim || (actionTrim == "userbanned" && a.Action.ToLower() == "banuser"));
        }

        if (!string.IsNullOrWhiteSpace(request.EntityName) && !request.EntityName.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var entityTrim = request.EntityName.Trim().ToLower();
            query = query.Where(a => a.EntityName.ToLower() == entityTrim);
        }

        if (request.UserId.HasValue)
        {
            query = query.Where(a => a.UserId == request.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.IpAddress))
        {
            query = query.Where(a => a.IpAddress == request.IpAddress.Trim());
        }

        if (request.StartDate.HasValue)
        {
            var startUtc = new DateTimeOffset(request.StartDate.Value.Year, request.StartDate.Value.Month, request.StartDate.Value.Day, 0, 0, 0, TimeSpan.Zero);
            query = query.Where(a => a.CreatedAt >= startUtc);
        }

        if (request.EndDate.HasValue)
        {
            var endUtc = new DateTimeOffset(request.EndDate.Value.Year, request.EndDate.Value.Month, request.EndDate.Value.Day, 23, 59, 59, 999, TimeSpan.Zero);
            query = query.Where(a => a.CreatedAt <= endUtc);
        }

        var pageNumber = Math.Max(1, request.PageNumber);
        var cappedPageSize = Math.Clamp(request.PageSize > 0 ? request.PageSize : 10, 1, 100);

        var totalCount = await query.CountAsync(cancellationToken);

        var logs = await query
            .Skip((pageNumber - 1) * cappedPageSize)
            .Take(cappedPageSize)
            .ToListAsync(cancellationToken);

        var dtos = logs.Select(a => new AuditLogDto(
            a.Id,
            a.UserId,
            a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System / Anonymous",
            a.User?.Email ?? "N/A",
            a.Action,
            a.EntityName,
            a.EntityId,
            a.IpAddress,
            a.UserAgent,
            a.CreatedAt
        )).ToList();

        return new PagedResult<AuditLogDto>(dtos, totalCount, request.PageNumber, cappedPageSize);
    }
}
