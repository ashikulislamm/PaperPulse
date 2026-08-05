using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(t => t.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.Slug)
            .HasColumnName("slug")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasMaxLength(50)
            .HasDefaultValue("active")
            .IsRequired();

        // Audit Columns
        builder.Property(t => t.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(t => t.DeletedAt).HasColumnName("deleted_at");
        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.UpdatedBy).HasColumnName("updated_by");
        builder.Property(t => t.DeletedBy).HasColumnName("deleted_by");
        builder.Property(t => t.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(t => t.Slug)
            .IsUnique()
            .HasDatabaseName("idx_tenants_slug_active")
            .HasFilter("is_deleted = false");

        // Global Query Filter for Soft Delete
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
