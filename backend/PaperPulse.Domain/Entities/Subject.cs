using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class Subject : BaseEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
}
