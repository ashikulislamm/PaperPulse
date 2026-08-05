using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");

        builder.HasKey(ur => ur.Id);

        builder.Property(ur => ur.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(ur => ur.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(ur => ur.RoleId)
            .HasColumnName("role_id")
            .IsRequired();

        // Audit Columns
        builder.Property(ur => ur.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(ur => ur.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(ur => ur.DeletedAt).HasColumnName("deleted_at");
        builder.Property(ur => ur.CreatedBy).HasColumnName("created_by");
        builder.Property(ur => ur.UpdatedBy).HasColumnName("updated_by");
        builder.Property(ur => ur.DeletedBy).HasColumnName("deleted_by");
        builder.Property(ur => ur.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ur => new { ur.UserId, ur.RoleId })
            .IsUnique()
            .HasDatabaseName("idx_user_roles_user_role")
            .HasFilter("is_deleted = false");

        builder.HasIndex(ur => ur.RoleId)
            .HasDatabaseName("idx_user_roles_role_id")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(ur => !ur.IsDeleted);
    }
}
