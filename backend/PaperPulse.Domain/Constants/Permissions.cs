namespace PaperPulse.Domain.Constants;

public static class Permissions
{
    public static class Dashboard
    {
        public const string View = "Dashboard.View";
    }

    public static class Users
    {
        public const string View = "Users.View";
        public const string Create = "Users.Create";
        public const string Update = "Users.Update";
        public const string Delete = "Users.Delete";
        public const string Activate = "Users.Activate";
        public const string Deactivate = "Users.Deactivate";
    }

    public static class Roles
    {
        public const string View = "Roles.View";
        public const string Create = "Roles.Create";
        public const string Update = "Roles.Update";
        public const string Delete = "Roles.Delete";
        public const string Assign = "Roles.Assign";
    }

    public static class SystemPermissions
    {
        public const string View = "Permissions.View";
        public const string Assign = "Permissions.Assign";
    }

    public static class Profile
    {
        public const string View = "Profile.View";
        public const string Update = "Profile.Update";
    }

    public static class Classes
    {
        public const string View = "Classes.View";
        public const string Create = "Classes.Create";
        public const string Update = "Classes.Update";
        public const string Delete = "Classes.Delete";
    }

    public static class Subjects
    {
        public const string View = "Subjects.View";
        public const string Create = "Subjects.Create";
        public const string Update = "Subjects.Update";
        public const string Delete = "Subjects.Delete";
    }

    public static class TeacherAssignments
    {
        public const string View = "TeacherAssignments.View";
        public const string Create = "TeacherAssignments.Create";
        public const string Update = "TeacherAssignments.Update";
        public const string Delete = "TeacherAssignments.Delete";
    }

    public static class StudentEnrollments
    {
        public const string View = "StudentEnrollments.View";
        public const string Create = "StudentEnrollments.Create";
        public const string Update = "StudentEnrollments.Update";
        public const string Delete = "StudentEnrollments.Delete";
    }

    public static class Assignments
    {
        public const string View = "Assignments.View";
        public const string Details = "Assignments.Details";
        public const string Create = "Assignments.Create";
        public const string Update = "Assignments.Update";
        public const string Delete = "Assignments.Delete";
        public const string Publish = "Assignments.Publish";
        public const string Archive = "Assignments.Archive";
    }

    public static class Submissions
    {
        public const string View = "Submissions.View";
        public const string Create = "Submissions.Create";
        public const string Update = "Submissions.Update";
        public const string Delete = "Submissions.Delete";
        public const string Review = "Submissions.Review";
    }

    public static class Grades
    {
        public const string View = "Grades.View";
        public const string Create = "Grades.Create";
        public const string Update = "Grades.Update";
    }

    public static class Feedback
    {
        public const string View = "Feedback.View";
        public const string Create = "Feedback.Create";
        public const string Update = "Feedback.Update";
    }

    public static class Notifications
    {
        public const string View = "Notifications.View";
        public const string Send = "Notifications.Send";
    }

    public static class AuditLogs
    {
        public const string View = "AuditLogs.View";
    }

    public static class Settings
    {
        public const string View = "Settings.View";
        public const string Update = "Settings.Update";
    }

    public static class Reports
    {
        public const string View = "Reports.View";
    }
}
