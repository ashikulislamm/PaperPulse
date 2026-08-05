using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(r => r.Name)
            .HasColumnName("name")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasColumnName("description")
            .HasMaxLength(255);

        // Audit Columns
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(r => r.DeletedAt).HasColumnName("deleted_at");
        builder.Property(r => r.CreatedBy).HasColumnName("created_by");
        builder.Property(r => r.UpdatedBy).HasColumnName("updated_by");
        builder.Property(r => r.DeletedBy).HasColumnName("deleted_by");
        builder.Property(r => r.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(r => r.Name)
            .IsUnique()
            .HasDatabaseName("idx_roles_name_active")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}
