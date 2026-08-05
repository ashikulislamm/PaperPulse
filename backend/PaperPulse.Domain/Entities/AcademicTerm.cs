using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class AcademicTerm : BaseEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Class> Classes { get; set; } = new List<Class>();
}
