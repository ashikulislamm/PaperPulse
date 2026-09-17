using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Persistence.Context;

namespace PaperPulse.Persistence.Seed;

public class DatabaseSeederService : IDatabaseSeeder
{
    private readonly PaperPulseDbContext _context;
    private readonly ILogger<DatabaseSeederService> _logger;

    private const long AdvisoryLockId = 718293847;

    public DatabaseSeederService(PaperPulseDbContext context, ILogger<DatabaseSeederService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(bool isDevelopment, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting database seeding process...");

        var strategy = _context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // Acquire PostgreSQL Advisory Lock to ensure thread-safe single-replica execution
                await _context.Database.ExecuteSqlRawAsync($"SELECT pg_advisory_xact_lock({AdvisoryLockId});", cancellationToken);
                _logger.LogInformation("Acquired PostgreSQL advisory lock ({LockId}) for database seeding.", AdvisoryLockId);

                // Update notification table check constraints for new NotificationType enum values
                try
                {
                    await _context.Database.ExecuteSqlRawAsync("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notifications_type;", cancellationToken);
                }
                catch
                {
                    // Ignore if database provider doesn't support raw SQL constraint drop
                }

                await SeedMasterDataAsync(cancellationToken);

                if (isDevelopment)
                {
                    await SeedDevelopmentDataAsync(cancellationToken);
                }

                await transaction.CommitAsync(cancellationToken);
                _logger.LogInformation("Database seeding process completed successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(ex, "An error occurred during database seeding. Transaction rolled back.");
                throw;
            }
        });
    }

    private async Task SeedMasterDataAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Seeding System Master Data (Roles, Permissions, RolePermissions, System Admin)...");

        // 1. Upsert Roles
        var rolesToSeed = new[]
        {
            (RoleType.Admin, "System administrator with full system capabilities"),
            (RoleType.Teacher, "Academic instructor capable of creating assignments and grading submissions"),
            (RoleType.Student, "Enrolled learner capable of viewing assignments and submitting work")
        };

        var roleMap = new Dictionary<RoleType, Role>();

        foreach (var (roleType, description) in rolesToSeed)
        {
            var existingRole = await _context.Roles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Name == roleType, cancellationToken);

            if (existingRole == null)
            {
                existingRole = new Role
                {
                    Name = roleType,
                    Description = description
                };
                _context.Roles.Add(existingRole);
            }
            else
            {
                existingRole.Description = description;
            }

            roleMap[roleType] = existingRole;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 2. Upsert Permissions Catalog (Synchronized with PaperPulse.Domain.Constants.Permissions)
        var permissionsToSeed = new (string Code, string Category, string Description)[]
        {
            (Domain.Constants.Permissions.Dashboard.View, "Dashboard", "View dashboard analytics"),

            (Domain.Constants.Permissions.Users.View, "Users", "View user accounts"),
            (Domain.Constants.Permissions.Users.Create, "Users", "Create new users"),
            (Domain.Constants.Permissions.Users.Update, "Users", "Update user details"),
            (Domain.Constants.Permissions.Users.Delete, "Users", "Soft delete users"),
            (Domain.Constants.Permissions.Users.Activate, "Users", "Activate user accounts"),
            (Domain.Constants.Permissions.Users.Deactivate, "Users", "Deactivate user accounts"),

            (Domain.Constants.Permissions.Roles.View, "Roles", "View roles"),
            (Domain.Constants.Permissions.Roles.Assign, "Roles", "Assign roles to users"),

            (Domain.Constants.Permissions.SystemPermissions.View, "Permissions", "View system permissions"),

            (Domain.Constants.Permissions.Profile.View, "Profile", "View own profile"),
            (Domain.Constants.Permissions.Profile.Update, "Profile", "Update own profile"),

            (Domain.Constants.Permissions.Classes.View, "Academic", "View academic classes"),
            (Domain.Constants.Permissions.Classes.Create, "Academic", "Create academic classes"),
            (Domain.Constants.Permissions.Classes.Update, "Academic", "Update academic classes"),
            (Domain.Constants.Permissions.Classes.Delete, "Academic", "Delete academic classes"),

            (Domain.Constants.Permissions.Subjects.View, "Academic", "View subjects"),
            (Domain.Constants.Permissions.Subjects.Create, "Academic", "Create subjects"),
            (Domain.Constants.Permissions.Subjects.Update, "Academic", "Update subjects"),
            (Domain.Constants.Permissions.Subjects.Delete, "Academic", "Delete subjects"),

            (Domain.Constants.Permissions.TeacherAssignments.View, "Academic", "View teacher allocations"),
            (Domain.Constants.Permissions.TeacherAssignments.Create, "Academic", "Allocate teachers to subjects"),
            (Domain.Constants.Permissions.TeacherAssignments.Update, "Academic", "Update teacher allocations"),
            (Domain.Constants.Permissions.TeacherAssignments.Delete, "Academic", "Remove teacher allocations"),

            (Domain.Constants.Permissions.StudentEnrollments.View, "Academic", "View student class enrollments"),
            (Domain.Constants.Permissions.StudentEnrollments.Create, "Academic", "Enroll students in classes"),
            (Domain.Constants.Permissions.StudentEnrollments.Delete, "Academic", "Unenroll students from classes"),

            (Domain.Constants.Permissions.Assignments.View, "Assignments", "View published assignments"),
            (Domain.Constants.Permissions.Assignments.Details, "Assignments", "View assignment details and attachments"),
            (Domain.Constants.Permissions.Assignments.Create, "Assignments", "Create assignments"),
            (Domain.Constants.Permissions.Assignments.Update, "Assignments", "Edit assignments"),
            (Domain.Constants.Permissions.Assignments.Delete, "Assignments", "Delete assignments"),
            (Domain.Constants.Permissions.Assignments.Publish, "Assignments", "Publish assignments"),
            (Domain.Constants.Permissions.Assignments.Archive, "Assignments", "Archive assignments"),

            (Domain.Constants.Permissions.Submissions.View, "Submissions", "View submissions"),
            (Domain.Constants.Permissions.Submissions.Create, "Submissions", "Submit work for assignments"),
            (Domain.Constants.Permissions.Submissions.Update, "Submissions", "Resubmit work"),
            (Domain.Constants.Permissions.Submissions.Delete, "Submissions", "Delete submissions"),
            (Domain.Constants.Permissions.Submissions.Review, "Submissions", "Review submissions for grading"),

            (Domain.Constants.Permissions.Grades.View, "Grades", "View grades and scores"),
            (Domain.Constants.Permissions.Grades.Create, "Grades", "Assign grades to submissions"),
            (Domain.Constants.Permissions.Grades.Update, "Grades", "Return graded submissions"),

            (Domain.Constants.Permissions.Feedback.View, "Feedback", "View feedback comments"),
            (Domain.Constants.Permissions.Feedback.Create, "Feedback", "Add feedback comments"),
            (Domain.Constants.Permissions.Feedback.Update, "Feedback", "Edit feedback comments"),

            (Domain.Constants.Permissions.Notifications.View, "Notifications", "View in-app notifications"),
            (Domain.Constants.Permissions.Notifications.Send, "Notifications", "Trigger system notifications"),

            (Domain.Constants.Permissions.AuditLogs.View, "AuditLogs", "View security audit logs"),

            (Domain.Constants.Permissions.Settings.View, "Settings", "View system settings"),
            (Domain.Constants.Permissions.Settings.Update, "Settings", "Update system settings"),

            (Domain.Constants.Permissions.Reports.View, "Reports", "View institutional reports")
        };

        var permissionMap = new Dictionary<string, Permission>();

        foreach (var p in permissionsToSeed)
        {
            var existingPerm = await _context.Permissions
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(perm => perm.Code == p.Code, cancellationToken);

            if (existingPerm == null)
            {
                existingPerm = new Permission
                {
                    Code = p.Code,
                    Category = p.Category,
                    Description = p.Description
                };
                _context.Permissions.Add(existingPerm);
            }
            else
            {
                existingPerm.Category = p.Category;
                existingPerm.Description = p.Description;
            }

            permissionMap[p.Code] = existingPerm;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 3. Upsert RolePermissions
        var adminRole = roleMap[RoleType.Admin];
        var teacherRole = roleMap[RoleType.Teacher];
        var studentRole = roleMap[RoleType.Student];

        var teacherPermissionCodes = new HashSet<string>
        {
            Domain.Constants.Permissions.Dashboard.View,
            Domain.Constants.Permissions.Profile.View,
            Domain.Constants.Permissions.Profile.Update,
            Domain.Constants.Permissions.Classes.View,
            Domain.Constants.Permissions.Subjects.View,
            Domain.Constants.Permissions.TeacherAssignments.View,
            Domain.Constants.Permissions.StudentEnrollments.View,
            Domain.Constants.Permissions.Assignments.View,
            Domain.Constants.Permissions.Assignments.Details,
            Domain.Constants.Permissions.Assignments.Create,
            Domain.Constants.Permissions.Assignments.Update,
            Domain.Constants.Permissions.Assignments.Delete,
            Domain.Constants.Permissions.Assignments.Publish,
            Domain.Constants.Permissions.Assignments.Archive,
            Domain.Constants.Permissions.Submissions.View,
            Domain.Constants.Permissions.Submissions.Review,
            Domain.Constants.Permissions.Grades.View,
            Domain.Constants.Permissions.Grades.Create,
            Domain.Constants.Permissions.Grades.Update,
            Domain.Constants.Permissions.Feedback.View,
            Domain.Constants.Permissions.Feedback.Create,
            Domain.Constants.Permissions.Feedback.Update,
            Domain.Constants.Permissions.Notifications.View
        };

        var studentPermissionCodes = new HashSet<string>
        {
            Domain.Constants.Permissions.Dashboard.View,
            Domain.Constants.Permissions.Profile.View,
            Domain.Constants.Permissions.Profile.Update,
            Domain.Constants.Permissions.Classes.View,
            Domain.Constants.Permissions.Subjects.View,
            Domain.Constants.Permissions.Assignments.View,
            Domain.Constants.Permissions.Assignments.Details,
            Domain.Constants.Permissions.Submissions.View,
            Domain.Constants.Permissions.Submissions.Create,
            Domain.Constants.Permissions.Submissions.Update,
            Domain.Constants.Permissions.Grades.View,
            Domain.Constants.Permissions.Feedback.View,
            Domain.Constants.Permissions.Notifications.View
        };

        foreach (var (code, perm) in permissionMap)
        {
            // Admin gets 100% permissions
            var adminHas = await _context.RolePermissions
                .IgnoreQueryFilters()
                .AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id, cancellationToken);
            if (!adminHas)
            {
                _context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = perm.Id });
            }

            // Teacher permissions
            if (teacherPermissionCodes.Contains(code))
            {
                var teacherHas = await _context.RolePermissions
                    .IgnoreQueryFilters()
                    .AnyAsync(rp => rp.RoleId == teacherRole.Id && rp.PermissionId == perm.Id, cancellationToken);
                if (!teacherHas)
                {
                    _context.RolePermissions.Add(new RolePermission { RoleId = teacherRole.Id, PermissionId = perm.Id });
                }
            }

            // Student permissions
            if (studentPermissionCodes.Contains(code))
            {
                var studentHas = await _context.RolePermissions
                    .IgnoreQueryFilters()
                    .AnyAsync(rp => rp.RoleId == studentRole.Id && rp.PermissionId == perm.Id, cancellationToken);
                if (!studentHas)
                {
                    _context.RolePermissions.Add(new RolePermission { RoleId = studentRole.Id, PermissionId = perm.Id });
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 4. Upsert Default System Admin Account
        var adminEmail = Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL") ?? "admin@paperpulse.com";
        var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");

        if (string.IsNullOrWhiteSpace(adminPassword))
        {
            throw new InvalidOperationException("SEED_ADMIN_PASSWORD environment variable is not set. Ensure it is configured in your .env file.");
        }

        var existingAdminUser = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == adminEmail, cancellationToken);

        if (existingAdminUser == null)
        {
            var adminUser = new User
            {
                Email = adminEmail,
                // BCrypt hashed password for security
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                FirstName = "System",
                LastName = "Administrator",
                Status = UserStatus.Active
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync(cancellationToken);

            _context.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Default Admin user created successfully: {Email}", adminEmail);
        }
    }

    private async Task SeedDevelopmentDataAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Seeding Development Sample Data (Terms, Sample Users, Classes, Assignments)...");

        // 1. Academic Term
        var termCode = "FALL-2025";
        var academicTerm = await _context.AcademicTerms
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(at => at.Code == termCode, cancellationToken);

        if (academicTerm == null)
        {
            academicTerm = new AcademicTerm
            {
                Name = "2025-2026 Fall Semester",
                Code = termCode,
                StartDate = new DateTimeOffset(2025, 9, 1, 0, 0, 0, TimeSpan.Zero),
                EndDate = new DateTimeOffset(2025, 12, 31, 0, 0, 0, TimeSpan.Zero),
                IsCurrent = true
            };
            _context.AcademicTerms.Add(academicTerm);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 3. Sample Teacher & Student Users
        var teacherRole = await _context.Roles.FirstAsync(r => r.Name == RoleType.Teacher, cancellationToken);
        var studentRole = await _context.Roles.FirstAsync(r => r.Name == RoleType.Student, cancellationToken);

        var teacherEmail = "teacher@paperpulse.com";
        var teacherPassword = Environment.GetEnvironmentVariable("SEED_TEACHER_PASSWORD");
        if (string.IsNullOrWhiteSpace(teacherPassword))
        {
            throw new InvalidOperationException("SEED_TEACHER_PASSWORD environment variable is not set. Ensure it is configured in your .env file.");
        }

        var teacher = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == teacherEmail, cancellationToken);

        if (teacher == null)
        {
            teacher = new User
            {
                Email = teacherEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(teacherPassword),
                FirstName = "Sarah",
                LastName = "Conner",
                Status = UserStatus.Active
            };
            _context.Users.Add(teacher);
            await _context.SaveChangesAsync(cancellationToken);

            _context.UserRoles.Add(new UserRole { UserId = teacher.Id, RoleId = teacherRole.Id });
            await _context.SaveChangesAsync(cancellationToken);
        }

        var studentEmail = "student@paperpulse.com";
        var studentPassword = Environment.GetEnvironmentVariable("SEED_STUDENT_PASSWORD");
        if (string.IsNullOrWhiteSpace(studentPassword))
        {
            throw new InvalidOperationException("SEED_STUDENT_PASSWORD environment variable is not set. Ensure it is configured in your .env file.");
        }

        var student = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == studentEmail, cancellationToken);

        if (student == null)
        {
            student = new User
            {
                Email = studentEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(studentPassword),
                FirstName = "John",
                LastName = "Doe",
                Status = UserStatus.Active
            };
            _context.Users.Add(student);
            await _context.SaveChangesAsync(cancellationToken);

            _context.UserRoles.Add(new UserRole { UserId = student.Id, RoleId = studentRole.Id });
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 4. Sample Class & Subject
        var classCode = "G10-A";
        var academicClass = await _context.Classes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Code == classCode, cancellationToken);

        if (academicClass == null)
        {
            academicClass = new Class
            {
                AcademicTermId = academicTerm.Id,
                Name = "Grade 10 - Section A",
                Code = classCode,
                MaxCapacity = 40
            };
            _context.Classes.Add(academicClass);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var subjectCode = "MATH-101";
        var subject = await _context.Subjects
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Code == subjectCode, cancellationToken);

        if (subject == null)
        {
            subject = new Subject
            {
                Name = "Algebra & Trigonometry",
                Code = subjectCode,
                Description = "Core mathematics course covering linear equations and trigonometry"
            };
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 5. ClassSubject & TeacherAssignment & StudentEnrollment
        var classSubject = await _context.ClassSubjects
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(cs => cs.ClassId == academicClass.Id && cs.SubjectId == subject.Id, cancellationToken);

        if (classSubject == null)
        {
            classSubject = new ClassSubject
            {
                ClassId = academicClass.Id,
                SubjectId = subject.Id,
                PassMarks = 50.00m
            };
            _context.ClassSubjects.Add(classSubject);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var teacherAssignment = await _context.TeacherAssignments
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(ta => ta.TeacherId == teacher.Id && ta.ClassSubjectId == classSubject.Id, cancellationToken);

        if (teacherAssignment == null)
        {
            teacherAssignment = new TeacherAssignment
            {
                TeacherId = teacher.Id,
                ClassSubjectId = classSubject.Id,
                IsPrimary = true
            };
            _context.TeacherAssignments.Add(teacherAssignment);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var enrollmentExists = await _context.StudentEnrollments
            .IgnoreQueryFilters()
            .AnyAsync(se => se.StudentId == student.Id && se.ClassId == academicClass.Id, cancellationToken);

        if (!enrollmentExists)
        {
            _context.StudentEnrollments.Add(new StudentEnrollment
            {
                StudentId = student.Id,
                ClassId = academicClass.Id,
                RollNumber = "1001",
                IsActive = true
            });
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 6. Sample Assignment
        var assignmentTitle = "Algebra Practice Worksheet #1";
        var assignment = await _context.Assignments
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.Title == assignmentTitle, cancellationToken);

        if (assignment == null)
        {
            assignment = new Assignment
            {
                TeacherAssignmentId = teacherAssignment.Id,
                Title = assignmentTitle,
                Description = "Solve exercises 1 through 20 from chapter 3 of the textbook.",
                MaxMarks = 100.00m,
                PassMarks = 50.00m,
                DueDate = DateTimeOffset.UtcNow.AddDays(7),
                Status = AssignmentStatus.Published,
                AllowLateSubmission = true,
                LatePenaltyPercentage = 10.00m
            };
            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation("Development sample data seeded successfully.");
    }
}
