using System.Text.Json;
using Microsoft.AspNetCore.Http;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _currentUserService = currentUserService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(
        string action,
        string entityName,
        Guid? entityId = null,
        object? oldValues = null,
        object? newValues = null,
        CancellationToken cancellationToken = default)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var ipAddress = httpContext?.Connection.RemoteIpAddress?.ToString();
        var userAgent = httpContext?.Request.Headers["User-Agent"].ToString();

        var oldValuesJson = oldValues != null ? JsonSerializer.Serialize(oldValues) : null;
        var newValuesJson = newValues != null ? JsonSerializer.Serialize(newValues) : null;

        var auditLog = new AuditLog
        {
            UserId = _currentUserService.UserId,
            Action = action.Trim(),
            EntityName = entityName.Trim(),
            EntityId = entityId,
            OldValues = oldValuesJson,
            NewValues = newValuesJson,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
