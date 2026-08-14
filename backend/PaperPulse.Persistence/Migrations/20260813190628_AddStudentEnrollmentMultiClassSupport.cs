using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaperPulse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentEnrollmentMultiClassSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_student_enrollments_class_id",
                table: "student_enrollments");

            migrationBuilder.DropIndex(
                name: "idx_student_single_active_enrollment",
                table: "student_enrollments");

            migrationBuilder.CreateIndex(
                name: "idx_student_class_active_enrollment",
                table: "student_enrollments",
                columns: new[] { "student_id", "class_id" },
                unique: true,
                filter: "is_active = true AND is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_student_enrollments_student_id",
                table: "student_enrollments",
                column: "student_id",
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "IX_student_enrollments_class_id",
                table: "student_enrollments",
                column: "class_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_student_class_active_enrollment",
                table: "student_enrollments");

            migrationBuilder.DropIndex(
                name: "idx_student_enrollments_student_id",
                table: "student_enrollments");

            migrationBuilder.DropIndex(
                name: "IX_student_enrollments_class_id",
                table: "student_enrollments");

            migrationBuilder.CreateIndex(
                name: "idx_student_enrollments_class_id",
                table: "student_enrollments",
                column: "class_id",
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_student_single_active_enrollment",
                table: "student_enrollments",
                column: "student_id",
                unique: true,
                filter: "is_active = true AND is_deleted = false");
        }
    }
}
