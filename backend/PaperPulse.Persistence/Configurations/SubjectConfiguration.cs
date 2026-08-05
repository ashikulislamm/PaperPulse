using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.ToTable("subjects");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(s => s.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();

        builder.Property(s => s.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(s => s.Code)
            .HasColumnName("code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(s => s.Description)
            .HasColumnName("description");

        // Audit Columns
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(s => s.DeletedAt).HasColumnName("deleted_at");
        builder.Property(s => s.CreatedBy).HasColumnName("created_by");
        builder.Property(s => s.UpdatedBy).HasColumnName("updated_by");
        builder.Property(s => s.DeletedBy).HasColumnName("deleted_by");
        builder.Property(s => s.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(s => s.Tenant)
            .WithMany(t => t.Subjects)
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(s => new { s.TenantId, s.Code })
            .IsUnique()
            .HasDatabaseName("idx_subjects_tenant_code_active")
            .HasFilter("is_deleted = false");

        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}
