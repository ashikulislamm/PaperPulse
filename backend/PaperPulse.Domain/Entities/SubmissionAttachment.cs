using PaperPulse.Domain.Common;

namespace PaperPulse.Domain.Entities;

public class SubmissionAttachment : BaseEntity
{
    public Guid SubmissionVersionId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string StorageProvider { get; set; } = "supabase_storage";

    // Navigation properties
    public SubmissionVersion SubmissionVersion { get; set; } = null!;
}
