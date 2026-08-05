using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class MarkConfiguration : IEntityTypeConfiguration<Mark>
{
    public void Configure(EntityTypeBuilder<Mark> builder)
    {
        builder.ToTable("marks");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(m => m.SubmissionId)
            .HasColumnName("submission_id")
            .IsRequired();

        builder.Property(m => m.TeacherId)
            .HasColumnName("teacher_id")
            .IsRequired();

        builder.Property(m => m.ScoreObtained)
            .HasColumnName("score_obtained")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(m => m.IsPassed)
            .HasColumnName("is_passed")
            .IsRequired();

        builder.Property(m => m.GradedAt)
            .HasColumnName("graded_at")
            .HasDefaultValueSql("now()")
            .IsRequired();

        // Audit Columns
        builder.Property(m => m.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(m => m.DeletedAt).HasColumnName("deleted_at");
        builder.Property(m => m.CreatedBy).HasColumnName("created_by");
        builder.Property(m => m.UpdatedBy).HasColumnName("updated_by");
        builder.Property(m => m.DeletedBy).HasColumnName("deleted_by");
        builder.Property(m => m.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(m => m.Submission)
            .WithOne(s => s.Mark)
            .HasForeignKey<Mark>(m => m.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Teacher)
            .WithMany(u => u.GradedMarks)
            .HasForeignKey(m => m.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        // Check Constraints
        builder.ToTable(t => t.HasCheckConstraint("chk_marks_score", "score_obtained >= 0"));

        // Indexes
        builder.HasIndex(m => m.SubmissionId)
            .IsUnique()
            .HasDatabaseName("idx_marks_submission_unique")
            .HasFilter("is_deleted = false");

        builder.HasIndex(m => m.TeacherId)
            .HasDatabaseName("idx_marks_teacher")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(m => !m.IsDeleted);
    }
}
