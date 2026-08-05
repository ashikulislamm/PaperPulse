using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class Mark : BaseEntity
{
    public Guid SubmissionId { get; set; }
    public Guid TeacherId { get; set; }
    public decimal ScoreObtained { get; set; }
    public bool IsPassed { get; set; }
    public DateTimeOffset GradedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public StudentSubmission Submission { get; set; } = null!;
    public User Teacher { get; set; } = null!;
}
