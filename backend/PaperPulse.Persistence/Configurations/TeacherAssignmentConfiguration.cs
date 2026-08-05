using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class TeacherAssignmentConfiguration : IEntityTypeConfiguration<TeacherAssignment>
{
    public void Configure(EntityTypeBuilder<TeacherAssignment> builder)
    {
        builder.ToTable("teacher_assignments");

        builder.HasKey(ta => ta.Id);

        builder.Property(ta => ta.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(ta => ta.TeacherId)
            .HasColumnName("teacher_id")
            .IsRequired();

        builder.Property(ta => ta.ClassSubjectId)
            .HasColumnName("class_subject_id")
            .IsRequired();

        builder.Property(ta => ta.IsPrimary)
            .HasColumnName("is_primary")
            .HasDefaultValue(true)
            .IsRequired();

        // Audit Columns
        builder.Property(ta => ta.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(ta => ta.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(ta => ta.DeletedAt).HasColumnName("deleted_at");
        builder.Property(ta => ta.CreatedBy).HasColumnName("created_by");
        builder.Property(ta => ta.UpdatedBy).HasColumnName("updated_by");
        builder.Property(ta => ta.DeletedBy).HasColumnName("deleted_by");
        builder.Property(ta => ta.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(ta => ta.Teacher)
            .WithMany(u => u.TeacherAssignments)
            .HasForeignKey(ta => ta.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ta => ta.ClassSubject)
            .WithMany(cs => cs.TeacherAssignments)
            .HasForeignKey(ta => ta.ClassSubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ta => new { ta.TeacherId, ta.ClassSubjectId })
            .IsUnique()
            .HasDatabaseName("idx_teacher_assignments_unique")
            .HasFilter("is_deleted = false");

        builder.HasIndex(ta => ta.ClassSubjectId)
            .HasDatabaseName("idx_teacher_assignments_class_subject")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(ta => !ta.IsDeleted);
    }
}
