using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class ClassSubject : BaseEntity
{
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
    public decimal? PassMarks { get; set; }

    // Navigation properties
    public Class Class { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
}
