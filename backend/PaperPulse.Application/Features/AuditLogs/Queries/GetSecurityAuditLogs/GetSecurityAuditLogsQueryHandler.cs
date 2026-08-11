using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetSecurityAuditLogs;

public class GetSecurityAuditLogsQueryHandler : IRequestHandler<GetSecurityAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;

    private static readonly string[] SecurityActions = new[]
    {
        "UserLogin",
        "UserLoginFailed",
        "PasswordChanged",
        "UserBanned",
        "UserActivated",
        "UserDeactivated",
        "RolesAssigned",
        "UserCreated",
        "UserDeleted"
    };

    public GetSecurityAuditLogsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AuditLogDto>> Handle(GetSecurityAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var cappedPageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => SecurityActions.Contains(a.Action))
            .OrderByDescending(a => a.CreatedAt);

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
