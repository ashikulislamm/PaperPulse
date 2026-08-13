using PaperPulse.Domain.Common;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Domain.Entities;

public class StudentSubmission : BaseEntity
{
    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; }
    public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
    public int AttemptCount { get; set; } = 1;
    public uint ConcurrencyToken { get; set; }

    // Navigation properties
    public Assignment Assignment { get; set; } = null!;
    public User Student { get; set; } = null!;
    public Mark? Mark { get; set; }
    public ICollection<SubmissionVersion> Versions { get; set; } = new List<SubmissionVersion>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
