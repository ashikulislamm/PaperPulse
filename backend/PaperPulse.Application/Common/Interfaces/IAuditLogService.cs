namespace PaperPulse.Application.Common.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        string action,
        string entityName,
        Guid? entityId = null,
        object? oldValues = null,
        object? newValues = null,
        CancellationToken cancellationToken = default);
}
