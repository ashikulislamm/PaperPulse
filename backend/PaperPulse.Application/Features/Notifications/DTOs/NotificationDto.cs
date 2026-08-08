namespace PaperPulse.Application.Features.Notifications.DTOs;

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    string Type,
    string Status,
    string? TargetUrl,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReadAt
);
