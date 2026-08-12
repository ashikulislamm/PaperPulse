using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.AuditLogs.DTOs;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogById;

public class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, AuditLogDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuditLogDetailDto> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        var log = await _context.AuditLogs
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (log == null)
        {
            throw new NotFoundException($"Audit log record with ID '{request.Id}' was not found.");
        }

        var userName = log.User != null ? $"{log.User.FirstName} {log.User.LastName}" : "System / Anonymous";

        return new AuditLogDetailDto(
            log.Id,
            log.TenantId,
            log.UserId,
            userName,
            log.User?.Email ?? "N/A",
            log.Action,
            log.EntityName,
            log.EntityId,
            log.OldValues,
            log.NewValues,
            log.IpAddress,
            log.UserAgent,
            log.CreatedAt
        );
    }
}
