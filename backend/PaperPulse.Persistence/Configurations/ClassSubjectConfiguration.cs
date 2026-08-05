using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class ClassSubjectConfiguration : IEntityTypeConfiguration<ClassSubject>
{
    public void Configure(EntityTypeBuilder<ClassSubject> builder)
    {
        builder.ToTable("class_subjects");

        builder.HasKey(cs => cs.Id);

        builder.Property(cs => cs.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(cs => cs.ClassId)
            .HasColumnName("class_id")
            .IsRequired();

        builder.Property(cs => cs.SubjectId)
            .HasColumnName("subject_id")
            .IsRequired();

        builder.Property(cs => cs.PassMarks)
            .HasColumnName("pass_marks")
            .HasPrecision(5, 2);

        // Audit Columns
        builder.Property(cs => cs.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(cs => cs.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(cs => cs.DeletedAt).HasColumnName("deleted_at");
        builder.Property(cs => cs.CreatedBy).HasColumnName("created_by");
        builder.Property(cs => cs.UpdatedBy).HasColumnName("updated_by");
        builder.Property(cs => cs.DeletedBy).HasColumnName("deleted_by");
        builder.Property(cs => cs.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(cs => cs.Class)
            .WithMany(c => c.ClassSubjects)
            .HasForeignKey(cs => cs.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cs => cs.Subject)
            .WithMany(s => s.ClassSubjects)
            .HasForeignKey(cs => cs.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(cs => new { cs.ClassId, cs.SubjectId })
            .IsUnique()
            .HasDatabaseName("idx_class_subjects_class_subject")
            .HasFilter("is_deleted = false");

        builder.HasIndex(cs => cs.SubjectId)
            .HasDatabaseName("idx_class_subjects_subject_id")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(cs => !cs.IsDeleted);
    }
}
