using Microsoft.EntityFrameworkCore;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<AcademicTerm> AcademicTerms { get; }
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Class> Classes { get; }
    DbSet<Subject> Subjects { get; }
    DbSet<ClassSubject> ClassSubjects { get; }
    DbSet<TeacherAssignment> TeacherAssignments { get; }
    DbSet<StudentEnrollment> StudentEnrollments { get; }
    DbSet<Assignment> Assignments { get; }
    DbSet<AssignmentAttachment> AssignmentAttachments { get; }
    DbSet<StudentSubmission> StudentSubmissions { get; }
    DbSet<SubmissionVersion> SubmissionVersions { get; }
    DbSet<SubmissionAttachment> SubmissionAttachments { get; }
    DbSet<Mark> Marks { get; }
    DbSet<Feedback> Feedbacks { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
