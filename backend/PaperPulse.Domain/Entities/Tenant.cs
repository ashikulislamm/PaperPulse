using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = "active";

    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Class> Classes { get; set; } = new List<Class>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<AcademicTerm> AcademicTerms { get; set; } = new List<AcademicTerm>();
}
