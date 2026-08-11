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
        var cappedPageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _context.AuditLogs
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

        if (!string.IsNullOrWhiteSpace(request.Action))
        {
            query = query.Where(a => a.Action == request.Action.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.EntityName))
        {
            query = query.Where(a => a.EntityName == request.EntityName.Trim());
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
            query = query.Where(a => a.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= request.EndDate.Value);
        }

        query = query.OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var logs = await query
            .Skip((request.PageNumber - 1) * cappedPageSize)
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
