using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class SubmissionVersionConfiguration : IEntityTypeConfiguration<SubmissionVersion>
{
    public void Configure(EntityTypeBuilder<SubmissionVersion> builder)
    {
        builder.ToTable("submission_versions");

        builder.HasKey(sv => sv.Id);

        builder.Property(sv => sv.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(sv => sv.SubmissionId)
            .HasColumnName("submission_id")
            .IsRequired();

        builder.Property(sv => sv.VersionNumber)
            .HasColumnName("version_number")
            .HasDefaultValue(1)
            .IsRequired();

        builder.Property(sv => sv.SubmissionText)
            .HasColumnName("submission_text");

        builder.Property(sv => sv.SubmittedAt)
            .HasColumnName("submitted_at")
            .HasDefaultValueSql("now()")
            .IsRequired();

        // Audit Columns
        builder.Property(sv => sv.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(sv => sv.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(sv => sv.DeletedAt).HasColumnName("deleted_at");
        builder.Property(sv => sv.CreatedBy).HasColumnName("created_by");
        builder.Property(sv => sv.UpdatedBy).HasColumnName("updated_by");
        builder.Property(sv => sv.DeletedBy).HasColumnName("deleted_by");
        builder.Property(sv => sv.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(sv => sv.Submission)
            .WithMany(s => s.Versions)
            .HasForeignKey(sv => sv.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(sv => new { sv.SubmissionId, sv.VersionNumber })
            .IsUnique()
            .HasDatabaseName("idx_submission_versions_submission_version")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(sv => !sv.IsDeleted);
    }
}
