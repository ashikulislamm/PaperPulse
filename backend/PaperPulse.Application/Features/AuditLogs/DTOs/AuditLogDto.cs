namespace PaperPulse.Application.Features.AuditLogs.DTOs;

public record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string UserName,
    string UserEmail,
    string Action,
    string EntityName,
    Guid? EntityId,
    string? IpAddress,
    string? UserAgent,
    DateTimeOffset CreatedAt
);
