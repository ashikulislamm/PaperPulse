using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Persistence.Configurations;

public class StudentSubmissionConfiguration : IEntityTypeConfiguration<StudentSubmission>
{
    public void Configure(EntityTypeBuilder<StudentSubmission> builder)
    {
        builder.ToTable("student_submissions");

        builder.HasKey(ss => ss.Id);

        builder.Property(ss => ss.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(ss => ss.AssignmentId)
            .HasColumnName("assignment_id")
            .IsRequired();

        builder.Property(ss => ss.StudentId)
            .HasColumnName("student_id")
            .IsRequired();

        builder.Property(ss => ss.SubmittedAt)
            .HasColumnName("submitted_at")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(ss => ss.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(SubmissionStatus.Submitted)
            .IsRequired();

        builder.Property(ss => ss.AttemptCount)
            .HasColumnName("attempt_count")
            .HasDefaultValue(1)
            .IsRequired();

        // Optimistic Concurrency Token
        builder.Property(ss => ss.ConcurrencyToken)
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .IsRowVersion();

        // Audit Columns
        builder.Property(ss => ss.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(ss => ss.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(ss => ss.DeletedAt).HasColumnName("deleted_at");
        builder.Property(ss => ss.CreatedBy).HasColumnName("created_by");
        builder.Property(ss => ss.UpdatedBy).HasColumnName("updated_by");
        builder.Property(ss => ss.DeletedBy).HasColumnName("deleted_by");
        builder.Property(ss => ss.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(ss => ss.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(ss => ss.AssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ss => ss.Student)
            .WithMany(u => u.Submissions)
            .HasForeignKey(ss => ss.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Check Constraints
        builder.ToTable(t => t.HasCheckConstraint("chk_submissions_status", "status IN ('Draft', 'Submitted', 'LateSubmitted', 'Graded', 'Returned')"));

        // Indexes (Business Rule: Student submits ONE active submission entry per assignment)
        builder.HasIndex(ss => new { ss.AssignmentId, ss.StudentId })
            .IsUnique()
            .HasDatabaseName("idx_submissions_unique_student")
            .HasFilter("is_deleted = false");

        builder.HasIndex(ss => new { ss.AssignmentId, ss.Status })
            .HasDatabaseName("idx_submissions_assignment_status")
            .HasFilter("is_deleted = false");

        builder.HasIndex(ss => ss.StudentId)
            .HasDatabaseName("idx_submissions_student")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(ss => !ss.IsDeleted);
    }
}
