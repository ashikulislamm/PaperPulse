using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(n => n.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();

        builder.Property(n => n.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(n => n.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(n => n.Message)
            .HasColumnName("message")
            .IsRequired();

        builder.Property(n => n.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(NotificationStatus.Unread)
            .IsRequired();

        builder.Property(n => n.TargetUrl)
            .HasColumnName("target_url")
            .HasMaxLength(500);

        builder.Property(n => n.ReadAt)
            .HasColumnName("read_at");

        // Audit Columns
        builder.Property(n => n.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(n => n.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()").IsRequired();
        builder.Property(n => n.DeletedAt).HasColumnName("deleted_at");
        builder.Property(n => n.CreatedBy).HasColumnName("created_by");
        builder.Property(n => n.UpdatedBy).HasColumnName("updated_by");
        builder.Property(n => n.DeletedBy).HasColumnName("deleted_by");
        builder.Property(n => n.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Relationships
        builder.HasOne(n => n.Tenant)
            .WithMany()
            .HasForeignKey(n => n.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Check Constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("chk_notifications_type", "type IN ('AssignmentCreated', 'AssignmentPublished', 'AssignmentDueSoon', 'DeadlineReminder', 'SubmissionReceived', 'SubmissionGraded', 'FeedbackAdded', 'SystemAlert')");
            t.HasCheckConstraint("chk_notifications_status", "status IN ('Unread', 'Read', 'Archived')");
        });

        // Indexes
        builder.HasIndex(n => new { n.TenantId, n.UserId, n.CreatedAt })
            .HasDatabaseName("idx_notifications_unread_user")
            .HasFilter("status = 'Unread' AND is_deleted = false");

        builder.HasQueryFilter(n => !n.IsDeleted);
    }
}
