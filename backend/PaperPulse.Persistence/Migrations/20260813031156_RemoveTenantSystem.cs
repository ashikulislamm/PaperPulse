using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaperPulse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTenantSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_academic_terms_tenants_tenant_id",
                table: "academic_terms");

            migrationBuilder.DropForeignKey(
                name: "FK_assignments_tenants_tenant_id",
                table: "assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_audit_logs_tenants_tenant_id",
                table: "audit_logs");

            migrationBuilder.DropForeignKey(
                name: "FK_classes_tenants_tenant_id",
                table: "classes");

            migrationBuilder.DropForeignKey(
                name: "FK_notifications_tenants_tenant_id",
                table: "notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_student_submissions_tenants_tenant_id",
                table: "student_submissions");

            migrationBuilder.DropForeignKey(
                name: "FK_subjects_tenants_tenant_id",
                table: "subjects");

            migrationBuilder.DropForeignKey(
                name: "FK_users_tenants_tenant_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "tenants");

            migrationBuilder.DropIndex(
                name: "idx_users_tenant_email_active",
                table: "users");

            migrationBuilder.DropIndex(
                name: "idx_subjects_tenant_code_active",
                table: "subjects");

            migrationBuilder.DropIndex(
                name: "idx_submissions_tenant_assignment_status",
                table: "student_submissions");

            migrationBuilder.DropIndex(
                name: "idx_notifications_unread_user",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "IX_notifications_user_id",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "idx_classes_tenant_code_active",
                table: "classes");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_tenant_id",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "idx_assignments_tenant_teacher_assign_status",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_teacher_assignment_id",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "idx_academic_terms_tenant_code_active",
                table: "academic_terms");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "student_submissions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "classes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "academic_terms");

            migrationBuilder.CreateIndex(
                name: "idx_subjects_code_active",
                table: "subjects",
                column: "code",
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_submissions_assignment_status",
                table: "student_submissions",
                columns: new[] { "assignment_id", "status" },
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_notifications_unread_user",
                table: "notifications",
                columns: new[] { "user_id", "created_at" },
                filter: "status = 'Unread' AND is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_classes_code_active",
                table: "classes",
                column: "code",
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_assignments_teacher_assign_status",
                table: "assignments",
                columns: new[] { "teacher_assignment_id", "status", "due_date" },
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_academic_terms_code_active",
                table: "academic_terms",
                column: "code",
                unique: true,
                filter: "is_deleted = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_subjects_code_active",
                table: "subjects");

            migrationBuilder.DropIndex(
                name: "idx_submissions_assignment_status",
                table: "student_submissions");

            migrationBuilder.DropIndex(
                name: "idx_notifications_unread_user",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "idx_classes_code_active",
                table: "classes");

            migrationBuilder.DropIndex(
                name: "idx_assignments_teacher_assign_status",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "idx_academic_terms_code_active",
                table: "academic_terms");

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "subjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "student_submissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "notifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "classes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "audit_logs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "assignments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "academic_terms",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenants", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "idx_users_tenant_email_active",
                table: "users",
                columns: new[] { "tenant_id", "email" },
                unique: true,
                filter: "is_deleted = false AND tenant_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "idx_subjects_tenant_code_active",
                table: "subjects",
                columns: new[] { "tenant_id", "code" },
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_submissions_tenant_assignment_status",
                table: "student_submissions",
                columns: new[] { "tenant_id", "assignment_id", "status" },
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_notifications_unread_user",
                table: "notifications",
                columns: new[] { "tenant_id", "user_id", "created_at" },
                filter: "status = 'Unread' AND is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_user_id",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_classes_tenant_code_active",
                table: "classes",
                columns: new[] { "tenant_id", "code" },
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_tenant_id",
                table: "audit_logs",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "idx_assignments_tenant_teacher_assign_status",
                table: "assignments",
                columns: new[] { "tenant_id", "teacher_assignment_id", "status", "due_date" },
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_teacher_assignment_id",
                table: "assignments",
                column: "teacher_assignment_id");

            migrationBuilder.CreateIndex(
                name: "idx_academic_terms_tenant_code_active",
                table: "academic_terms",
                columns: new[] { "tenant_id", "code" },
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "idx_tenants_slug_active",
                table: "tenants",
                column: "slug",
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.AddForeignKey(
                name: "FK_academic_terms_tenants_tenant_id",
                table: "academic_terms",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_tenants_tenant_id",
                table: "assignments",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_audit_logs_tenants_tenant_id",
                table: "audit_logs",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_classes_tenants_tenant_id",
                table: "classes",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_notifications_tenants_tenant_id",
                table: "notifications",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_student_submissions_tenants_tenant_id",
                table: "student_submissions",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_subjects_tenants_tenant_id",
                table: "subjects",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_users_tenants_tenant_id",
                table: "users",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
