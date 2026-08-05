using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
