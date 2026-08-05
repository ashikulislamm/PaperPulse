using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class StudentEnrollmentConfiguration : IEntityTypeConfiguration<StudentEnrollment>
{
    public void Configure(EntityTypeBuilder<StudentEnrollment> builder)
    {
        builder.ToTable("student_enrollments");

        builder.HasKey(se => se.Id);

        builder.Property(se => se.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(se => se.StudentId)
            .HasColumnName("student_id")
            .IsRequired();

        builder.Property(se => se.ClassId)
            .HasColumnName("class_id")
            .IsRequired();

        builder.Property(se => se.EnrollmentDate)
            .HasColumnName("enrollment_date")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(se => se.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(se => se.RollNumber)
            .HasColumnName("roll_number")
            .HasMaxLength(50);

        // Audit Columns
        builder.Property(se => se.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(se => se.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(se => se.DeletedAt).HasColumnName("deleted_at");
        builder.Property(se => se.CreatedBy).HasColumnName("created_by");
        builder.Property(se => se.UpdatedBy).HasColumnName("updated_by");
        builder.Property(se => se.DeletedBy).HasColumnName("deleted_by");
        builder.Property(se => se.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(se => se.Student)
            .WithMany(u => u.StudentEnrollments)
            .HasForeignKey(se => se.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(se => se.Class)
            .WithMany(c => c.StudentEnrollments)
            .HasForeignKey(se => se.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes (Business Rule: Student can belong to only ONE active Class)
        builder.HasIndex(se => se.StudentId)
            .IsUnique()
            .HasDatabaseName("idx_student_single_active_enrollment")
            .HasFilter("is_active = true AND is_deleted = false");

        builder.HasIndex(se => se.ClassId)
            .HasDatabaseName("idx_student_enrollments_class_id")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(se => !se.IsDeleted);
    }
}
