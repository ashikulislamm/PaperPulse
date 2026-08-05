using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class Feedback : BaseEntity
{
    public Guid SubmissionId { get; set; }
    public Guid TeacherId { get; set; }
    public string Comments { get; set; } = string.Empty;
    public bool IsPrivate { get; set; } = false;

    // Navigation properties
    public StudentSubmission Submission { get; set; } = null!;
    public User Teacher { get; set; } = null!;
}
