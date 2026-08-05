using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class Class : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid AcademicTermId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int MaxCapacity { get; set; } = 50;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public AcademicTerm AcademicTerm { get; set; } = null!;
    public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
    public ICollection<StudentEnrollment> StudentEnrollments { get; set; } = new List<StudentEnrollment>();
}
