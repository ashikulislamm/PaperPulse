using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(p => p.Code)
            .HasColumnName("code")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.Category)
            .HasColumnName("category")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasMaxLength(255);

        // Audit Columns
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");
        builder.Property(p => p.CreatedBy).HasColumnName("created_by");
        builder.Property(p => p.UpdatedBy).HasColumnName("updated_by");
        builder.Property(p => p.DeletedBy).HasColumnName("deleted_by");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(p => p.Code)
            .IsUnique()
            .HasDatabaseName("idx_permissions_code_active")
            .HasFilter("is_deleted = false");

        builder.HasIndex(p => p.Category)
            .HasDatabaseName("idx_permissions_category")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
