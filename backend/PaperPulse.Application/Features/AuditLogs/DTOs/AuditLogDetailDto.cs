namespace PaperPulse.Application.Features.AuditLogs.DTOs;

public record AuditLogDetailDto(
    Guid Id,
    Guid? UserId,
    string UserName,
    string UserEmail,
    string Action,
    string EntityName,
    Guid? EntityId,
    string? OldValues,
    string? NewValues,
    string? IpAddress,
    string? UserAgent,
    DateTimeOffset CreatedAt
);
