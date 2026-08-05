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

        // 2. Upsert Permissions Catalog
        var permissionsToSeed = new (string Code, string Category, string Description)[]
        {
            ("users:read", "Users", "View user profiles"),
            ("users:write", "Users", "Create and edit users"),
            ("users:delete", "Users", "Soft delete users"),
            ("classes:manage", "Academic", "Manage classes and subject allocations"),
            ("enrollments:manage", "Academic", "Manage student class enrollments"),
            ("assignments:read", "Assignments", "View published assignments"),
            ("assignments:create", "Assignments", "Create and publish assignments"),
            ("assignments:update", "Assignments", "Edit assignment specifications"),
            ("submissions:submit", "Submissions", "Submit solutions for assignments"),
            ("submissions:grade", "Submissions", "Grade student submissions and provide feedback"),
            ("submissions:view_all", "Submissions", "View all submissions across classes")
        };

        var permissionList = new List<Permission>();

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

            permissionList.Add(existingPerm);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 3. Upsert RolePermissions for Admin Role (100% Capabilities)
        var adminRole = roleMap[RoleType.Admin];
        foreach (var perm in permissionList)
        {
            var exists = await _context.RolePermissions
                .IgnoreQueryFilters()
                .AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id, cancellationToken);

            if (!exists)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = perm.Id
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 4. Upsert Default System Admin Account
        var adminEmail = Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL") ?? "admin@paperpulse.com";
        var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "AdminPass123!";

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
        _logger.LogInformation("Seeding Development Sample Data (Tenant, Terms, Sample Users, Classes, Assignments)...");

        // 1. Sample Tenant
        var tenantSlug = "springfield-academy";
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Slug == tenantSlug, cancellationToken);

        if (tenant == null)
        {
            tenant = new Tenant
            {
                Name = "Springfield Academy",
                Slug = tenantSlug,
                Status = "active"
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 2. Academic Term
        var termCode = "FALL-2025";
        var academicTerm = await _context.AcademicTerms
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(at => at.TenantId == tenant.Id && at.Code == termCode, cancellationToken);

        if (academicTerm == null)
        {
            academicTerm = new AcademicTerm
            {
                TenantId = tenant.Id,
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
        var teacher = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == teacherEmail, cancellationToken);

        if (teacher == null)
        {
            teacher = new User
            {
                TenantId = tenant.Id,
                Email = teacherEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("TeacherPass123!"),
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
        var student = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == studentEmail, cancellationToken);

        if (student == null)
        {
            student = new User
            {
                TenantId = tenant.Id,
                Email = studentEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("StudentPass123!"),
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
            .FirstOrDefaultAsync(c => c.TenantId == tenant.Id && c.Code == classCode, cancellationToken);

        if (academicClass == null)
        {
            academicClass = new Class
            {
                TenantId = tenant.Id,
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
            .FirstOrDefaultAsync(s => s.TenantId == tenant.Id && s.Code == subjectCode, cancellationToken);

        if (subject == null)
        {
            subject = new Subject
            {
                TenantId = tenant.Id,
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
            .FirstOrDefaultAsync(a => a.TenantId == tenant.Id && a.Title == assignmentTitle, cancellationToken);

        if (assignment == null)
        {
            assignment = new Assignment
            {
                TenantId = tenant.Id,
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
