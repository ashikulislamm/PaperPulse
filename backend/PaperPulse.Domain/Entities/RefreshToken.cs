using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public string? ReplacedByTokenHash { get; set; }
    public string? CreatedIp { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
