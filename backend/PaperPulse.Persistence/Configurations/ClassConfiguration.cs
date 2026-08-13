using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class ClassConfiguration : IEntityTypeConfiguration<Class>
{
    public void Configure(EntityTypeBuilder<Class> builder)
    {
        builder.ToTable("classes");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(c => c.AcademicTermId)
            .HasColumnName("academic_term_id")
            .IsRequired();

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Code)
            .HasColumnName("code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(c => c.MaxCapacity)
            .HasColumnName("max_capacity")
            .HasDefaultValue(50)
            .IsRequired();

        // Audit Columns
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(c => c.DeletedAt).HasColumnName("deleted_at");
        builder.Property(c => c.CreatedBy).HasColumnName("created_by");
        builder.Property(c => c.UpdatedBy).HasColumnName("updated_by");
        builder.Property(c => c.DeletedBy).HasColumnName("deleted_by");
        builder.Property(c => c.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(c => c.AcademicTerm)
            .WithMany(at => at.Classes)
            .HasForeignKey(c => c.AcademicTermId)
            .OnDelete(DeleteBehavior.Restrict);

        // Check Constraints
        builder.ToTable(t => t.HasCheckConstraint("chk_classes_capacity", "max_capacity > 0"));

        // Indexes
        builder.HasIndex(c => c.Code)
            .IsUnique()
            .HasDatabaseName("idx_classes_code_active")
            .HasFilter("is_deleted = false");

        builder.HasIndex(c => c.AcademicTermId)
            .HasDatabaseName("idx_classes_academic_term")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
