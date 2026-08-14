using Microsoft.EntityFrameworkCore;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Persistence.Seed;

public static class DatabaseSeeder
{
    // Deterministic static GUIDs for seeded entities
    public static readonly Guid AdminRoleId = Guid.Parse("018f4a2b-8910-7000-8000-000000000001");
    public static readonly Guid TeacherRoleId = Guid.Parse("018f4a2b-8910-7000-8000-000000000002");
    public static readonly Guid StudentRoleId = Guid.Parse("018f4a2b-8910-7000-8000-000000000003");

    public static void SeedInitialData(ModelBuilder modelBuilder)
    {
        // 1. Seed Roles
        var adminRole = new Role
        {
            Id = AdminRoleId,
            Name = RoleType.Admin,
            Description = "System administrator with full system capabilities",
            CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            UpdatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            IsDeleted = false
        };

        var teacherRole = new Role
        {
            Id = TeacherRoleId,
            Name = RoleType.Teacher,
            Description = "Academic instructor capable of creating assignments and grading submissions",
            CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            UpdatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            IsDeleted = false
        };

        var studentRole = new Role
        {
            Id = StudentRoleId,
            Name = RoleType.Student,
            Description = "Enrolled learner capable of viewing assignments and submitting work",
            CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            UpdatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            IsDeleted = false
        };

        modelBuilder.Entity<Role>().HasData(adminRole, teacherRole, studentRole);

        // 2. Seed Permissions
        var permissions = new List<Permission>
        {
            // Users
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000001"), Code = "users:read", Category = "Users", Description = "View user profiles", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000002"), Code = "users:write", Category = "Users", Description = "Create and edit users", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000003"), Code = "users:delete", Category = "Users", Description = "Soft delete users", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },

            // Classes & Subjects
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000004"), Code = "classes:manage", Category = "Academic", Description = "Manage classes and subject allocations", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000005"), Code = "enrollments:manage", Category = "Academic", Description = "Manage student class enrollments", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },

            // Assignments
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000006"), Code = "assignments:read", Category = "Assignments", Description = "View published assignments", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000007"), Code = "assignments:create", Category = "Assignments", Description = "Create and publish assignments", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000008"), Code = "assignments:update", Category = "Assignments", Description = "Edit assignment specifications", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },

            // Submissions & Grading
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000009"), Code = "submissions:submit", Category = "Submissions", Description = "Submit solutions for assignments", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000010"), Code = "submissions:grade", Category = "Submissions", Description = "Grade student submissions and provide feedback", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) },
            new() { Id = Guid.Parse("018f4a2b-8910-7100-8000-000000000011"), Code = "submissions:view_all", Category = "Submissions", Description = "View all submissions across classes", CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero) }
        };

        modelBuilder.Entity<Permission>().HasData(permissions);

        // 3. Seed Role Permissions for Admin (Full Access)
        var rolePermissions = permissions.Select((p, index) => new RolePermission
        {
            Id = Guid.Parse($"018f4a2b-8910-7200-8000-00000000{index + 1:D4}"),
            RoleId = AdminRoleId,
            PermissionId = p.Id,
            CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            UpdatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            IsDeleted = false
        }).ToList();

        modelBuilder.Entity<RolePermission>().HasData(rolePermissions);
    }
}
