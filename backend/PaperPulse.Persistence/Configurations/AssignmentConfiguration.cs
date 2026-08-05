using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Persistence.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.ToTable("assignments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(a => a.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();

        builder.Property(a => a.TeacherAssignmentId)
            .HasColumnName("teacher_assignment_id")
            .IsRequired();

        builder.Property(a => a.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(a => a.Description)
            .HasColumnName("description")
            .IsRequired();

        builder.Property(a => a.MaxMarks)
            .HasColumnName("max_marks")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(a => a.PassMarks)
            .HasColumnName("pass_marks")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(a => a.DueDate)
            .HasColumnName("due_date")
            .IsRequired();

        builder.Property(a => a.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(AssignmentStatus.Draft)
            .IsRequired();

        builder.Property(a => a.AllowLateSubmission)
            .HasColumnName("allow_late_submission")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(a => a.LatePenaltyPercentage)
            .HasColumnName("late_penalty_percentage")
            .HasPrecision(5, 2)
            .HasDefaultValue(0.00m)
            .IsRequired();

        // Optimistic Concurrency Token
        builder.Property(a => a.ConcurrencyToken)
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .IsRowVersion();

        // Audit Columns
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(a => a.DeletedAt).HasColumnName("deleted_at");
        builder.Property(a => a.CreatedBy).HasColumnName("created_by");
        builder.Property(a => a.UpdatedBy).HasColumnName("updated_by");
        builder.Property(a => a.DeletedBy).HasColumnName("deleted_by");
        builder.Property(a => a.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(a => a.Tenant)
            .WithMany()
            .HasForeignKey(a => a.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.TeacherAssignment)
            .WithMany(ta => ta.Assignments)
            .HasForeignKey(a => a.TeacherAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Check Constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("chk_assignments_marks", "pass_marks <= max_marks AND max_marks > 0 AND pass_marks >= 0");
            t.HasCheckConstraint("chk_assignments_status", "status IN ('Draft', 'Published', 'Archived', 'Closed')");
        });

        // Indexes
        builder.HasIndex(a => new { a.TenantId, a.TeacherAssignmentId, a.Status, a.DueDate })
            .HasDatabaseName("idx_assignments_tenant_teacher_assign_status")
            .HasFilter("is_deleted = false");

        builder.HasIndex(a => a.DueDate)
            .HasDatabaseName("idx_assignments_due_date")
            .HasFilter("status = 'Published' AND is_deleted = false");

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}
