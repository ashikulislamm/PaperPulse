using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaperPulse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsLateToSubmissionVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_late",
                table: "submission_versions",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_late",
                table: "submission_versions");
        }
    }
}
