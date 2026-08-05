using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class RolePermission : BaseEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    // Navigation properties
    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
