using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class SubmissionVersion : BaseEntity
{
    public Guid SubmissionId { get; set; }
    public int VersionNumber { get; set; } = 1;
    public string? SubmissionText { get; set; }
    public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public StudentSubmission Submission { get; set; } = null!;
    public ICollection<SubmissionAttachment> Attachments { get; set; } = new List<SubmissionAttachment>();
}
