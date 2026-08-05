using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class SubmissionAttachmentConfiguration : IEntityTypeConfiguration<SubmissionAttachment>
{
    public void Configure(EntityTypeBuilder<SubmissionAttachment> builder)
    {
        builder.ToTable("submission_attachments");

        builder.HasKey(sa => sa.Id);

        builder.Property(sa => sa.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(sa => sa.SubmissionVersionId)
            .HasColumnName("submission_version_id")
            .IsRequired();

        builder.Property(sa => sa.FileName)
            .HasColumnName("file_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(sa => sa.FilePath)
            .HasColumnName("file_path")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(sa => sa.FileSizeBytes)
            .HasColumnName("file_size_bytes")
            .IsRequired();

        builder.Property(sa => sa.MimeType)
            .HasColumnName("mime_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(sa => sa.StorageProvider)
            .HasColumnName("storage_provider")
            .HasMaxLength(50)
            .HasDefaultValue("supabase_storage")
            .IsRequired();

        // Audit Columns
        builder.Property(sa => sa.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(sa => sa.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(sa => sa.DeletedAt).HasColumnName("deleted_at");
        builder.Property(sa => sa.CreatedBy).HasColumnName("created_by");
        builder.Property(sa => sa.UpdatedBy).HasColumnName("updated_by");
        builder.Property(sa => sa.DeletedBy).HasColumnName("deleted_by");
        builder.Property(sa => sa.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(sa => sa.SubmissionVersion)
            .WithMany(sv => sv.Attachments)
            .HasForeignKey(sa => sa.SubmissionVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(sa => sa.SubmissionVersionId)
            .HasDatabaseName("idx_submission_attachments_version")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(sa => !sa.IsDeleted);
    }
}
