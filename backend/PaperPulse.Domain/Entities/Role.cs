using PaperPulse.Domain.Common;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Domain.Entities;

public class Role : BaseEntity
{
    public RoleType Name { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
