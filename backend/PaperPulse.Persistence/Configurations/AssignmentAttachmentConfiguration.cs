using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class AssignmentAttachmentConfiguration : IEntityTypeConfiguration<AssignmentAttachment>
{
    public void Configure(EntityTypeBuilder<AssignmentAttachment> builder)
    {
        builder.ToTable("assignment_attachments");

        builder.HasKey(aa => aa.Id);

        builder.Property(aa => aa.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(aa => aa.AssignmentId)
            .HasColumnName("assignment_id")
            .IsRequired();

        builder.Property(aa => aa.FileName)
            .HasColumnName("file_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(aa => aa.FilePath)
            .HasColumnName("file_path")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(aa => aa.FileSizeBytes)
            .HasColumnName("file_size_bytes")
            .IsRequired();

        builder.Property(aa => aa.MimeType)
            .HasColumnName("mime_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(aa => aa.StorageProvider)
            .HasColumnName("storage_provider")
            .HasMaxLength(50)
            .HasDefaultValue("supabase_storage")
            .IsRequired();

        // Audit Columns
        builder.Property(aa => aa.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(aa => aa.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(aa => aa.DeletedAt).HasColumnName("deleted_at");
        builder.Property(aa => aa.CreatedBy).HasColumnName("created_by");
        builder.Property(aa => aa.UpdatedBy).HasColumnName("updated_by");
        builder.Property(aa => aa.DeletedBy).HasColumnName("deleted_by");
        builder.Property(aa => aa.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(aa => aa.Assignment)
            .WithMany(a => a.Attachments)
            .HasForeignKey(aa => aa.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(aa => aa.AssignmentId)
            .HasDatabaseName("idx_assignment_attachments_assignment")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(aa => !aa.IsDeleted);
    }
}
