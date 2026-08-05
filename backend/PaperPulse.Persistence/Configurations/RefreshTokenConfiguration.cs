using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(rt => rt.Id);

        builder.Property(rt => rt.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(rt => rt.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(rt => rt.TokenHash)
            .HasColumnName("token_hash")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(rt => rt.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(rt => rt.IsRevoked)
            .HasColumnName("is_revoked")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(rt => rt.ReplacedByTokenHash)
            .HasColumnName("replaced_by_token_hash")
            .HasMaxLength(255);

        builder.Property(rt => rt.CreatedIp)
            .HasColumnName("created_ip")
            .HasMaxLength(45);

        builder.Property(rt => rt.RevokedAt)
            .HasColumnName("revoked_at");

        // Audit Columns
        builder.Property(rt => rt.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(rt => rt.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(rt => rt.DeletedAt).HasColumnName("deleted_at");
        builder.Property(rt => rt.CreatedBy).HasColumnName("created_by");
        builder.Property(rt => rt.UpdatedBy).HasColumnName("updated_by");
        builder.Property(rt => rt.DeletedBy).HasColumnName("deleted_by");
        builder.Property(rt => rt.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(rt => rt.TokenHash)
            .IsUnique()
            .HasDatabaseName("idx_refresh_tokens_hash");

        builder.HasIndex(rt => new { rt.UserId, rt.ExpiresAt, rt.IsRevoked })
            .HasDatabaseName("idx_refresh_tokens_user_expires");

        builder.HasQueryFilter(rt => !rt.IsDeleted);
    }
}
