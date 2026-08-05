using PaperPulse.Domain.Common;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationStatus Status { get; set; } = NotificationStatus.Unread;
    public string? TargetUrl { get; set; }
    public DateTimeOffset? ReadAt { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public User User { get; set; } = null!;
}
