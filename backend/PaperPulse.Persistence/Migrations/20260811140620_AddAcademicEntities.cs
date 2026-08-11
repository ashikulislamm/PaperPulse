using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaperPulse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_notifications_type",
                table: "notifications");

            migrationBuilder.AddCheckConstraint(
                name: "chk_notifications_type",
                table: "notifications",
                sql: "type IN ('AssignmentCreated', 'AssignmentPublished', 'AssignmentDueSoon', 'DeadlineReminder', 'SubmissionReceived', 'SubmissionGraded', 'FeedbackAdded', 'SystemAlert')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_notifications_type",
                table: "notifications");

            migrationBuilder.AddCheckConstraint(
                name: "chk_notifications_type",
                table: "notifications",
                sql: "type IN ('AssignmentCreated', 'AssignmentDueSoon', 'SubmissionGraded', 'FeedbackAdded', 'SystemAlert')");
        }
    }
}
