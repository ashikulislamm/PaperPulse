using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
{
    public void Configure(EntityTypeBuilder<Feedback> builder)
    {
        builder.ToTable("feedbacks");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(f => f.SubmissionId)
            .HasColumnName("submission_id")
            .IsRequired();

        builder.Property(f => f.TeacherId)
            .HasColumnName("teacher_id")
            .IsRequired();

        builder.Property(f => f.Comments)
            .HasColumnName("comments")
            .IsRequired();

        builder.Property(f => f.IsPrivate)
            .HasColumnName("is_private")
            .HasDefaultValue(false)
            .IsRequired();

        // Audit Columns
        builder.Property(f => f.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(f => f.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(f => f.DeletedAt).HasColumnName("deleted_at");
        builder.Property(f => f.CreatedBy).HasColumnName("created_by");
        builder.Property(f => f.UpdatedBy).HasColumnName("updated_by");
        builder.Property(f => f.DeletedBy).HasColumnName("deleted_by");
        builder.Property(f => f.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(f => f.Submission)
            .WithMany(s => s.Feedbacks)
            .HasForeignKey(f => f.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.Teacher)
            .WithMany(u => u.Feedbacks)
            .HasForeignKey(f => f.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(f => new { f.SubmissionId, f.CreatedAt })
            .HasDatabaseName("idx_feedbacks_submission")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(f => !f.IsDeleted);
    }
}
