using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class StudentEnrollment : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid ClassId { get; set; }
    public DateTimeOffset EnrollmentDate { get; set; } = DateTimeOffset.UtcNow;
    public bool IsActive { get; set; } = true;
    public string? RollNumber { get; set; }

    // Navigation properties
    public User Student { get; set; } = null!;
    public Class Class { get; set; } = null!;
}
