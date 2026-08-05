using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class AcademicTermConfiguration : IEntityTypeConfiguration<AcademicTerm>
{
    public void Configure(EntityTypeBuilder<AcademicTerm> builder)
    {
        builder.ToTable("academic_terms");

        builder.HasKey(at => at.Id);

        builder.Property(at => at.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(at => at.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();

        builder.Property(at => at.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(at => at.Code)
            .HasColumnName("code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(at => at.StartDate)
            .HasColumnName("start_date")
            .IsRequired();

        builder.Property(at => at.EndDate)
            .HasColumnName("end_date")
            .IsRequired();

        builder.Property(at => at.IsCurrent)
            .HasColumnName("is_current")
            .HasDefaultValue(false)
            .IsRequired();

        // Audit Columns
        builder.Property(at => at.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(at => at.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(at => at.DeletedAt).HasColumnName("deleted_at");
        builder.Property(at => at.CreatedBy).HasColumnName("created_by");
        builder.Property(at => at.UpdatedBy).HasColumnName("updated_by");
        builder.Property(at => at.DeletedBy).HasColumnName("deleted_by");
        builder.Property(at => at.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(at => at.Tenant)
            .WithMany(t => t.AcademicTerms)
            .HasForeignKey(at => at.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(at => new { at.TenantId, at.Code })
            .IsUnique()
            .HasDatabaseName("idx_academic_terms_tenant_code_active")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(at => !at.IsDeleted);
    }
}
