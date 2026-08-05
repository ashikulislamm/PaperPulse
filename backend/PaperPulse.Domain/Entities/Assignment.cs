using PaperPulse.Domain.Common;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Domain.Entities;

public class Assignment : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid TeacherAssignmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public decimal PassMarks { get; set; }
    public DateTimeOffset DueDate { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public bool AllowLateSubmission { get; set; } = false;
    public decimal LatePenaltyPercentage { get; set; } = 0.00m;
    public uint ConcurrencyToken { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public TeacherAssignment TeacherAssignment { get; set; } = null!;
    public ICollection<AssignmentAttachment> Attachments { get; set; } = new List<AssignmentAttachment>();
    public ICollection<StudentSubmission> Submissions { get; set; } = new List<StudentSubmission>();
}
