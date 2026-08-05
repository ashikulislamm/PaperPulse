using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions");

        builder.HasKey(rp => rp.Id);

        builder.Property(rp => rp.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(rp => rp.RoleId)
            .HasColumnName("role_id")
            .IsRequired();

        builder.Property(rp => rp.PermissionId)
            .HasColumnName("permission_id")
            .IsRequired();

        // Audit Columns
        builder.Property(rp => rp.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(rp => rp.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(rp => rp.DeletedAt).HasColumnName("deleted_at");
        builder.Property(rp => rp.CreatedBy).HasColumnName("created_by");
        builder.Property(rp => rp.UpdatedBy).HasColumnName("updated_by");
        builder.Property(rp => rp.DeletedBy).HasColumnName("deleted_by");
        builder.Property(rp => rp.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(rp => new { rp.RoleId, rp.PermissionId })
            .IsUnique()
            .HasDatabaseName("idx_role_permissions_role_perm")
            .HasFilter("is_deleted = false");

        builder.HasIndex(rp => rp.PermissionId)
            .HasDatabaseName("idx_role_permissions_permission_id")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(rp => !rp.IsDeleted);
    }
}
