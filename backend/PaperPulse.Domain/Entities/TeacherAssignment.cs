using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class TeacherAssignment : BaseEntity
{
    public Guid TeacherId { get; set; }
    public Guid ClassSubjectId { get; set; }
    public bool IsPrimary { get; set; } = true;

    // Navigation properties
    public User Teacher { get; set; } = null!;
    public ClassSubject ClassSubject { get; set; } = null!;
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
