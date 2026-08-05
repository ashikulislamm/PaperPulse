using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class AssignmentAttachment : BaseEntity
{
    public Guid AssignmentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string StorageProvider { get; set; } = "supabase_storage";

    // Navigation properties
    public Assignment Assignment { get; set; } = null!;
}
