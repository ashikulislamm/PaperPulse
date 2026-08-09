"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/api/auth-store";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const userRoles = user?.roles || ["Student"];
  const userName = user?.firstName ? `${user.firstName} ${user.lastName}` : "User";

  const isAdmin = userRoles.includes("Admin");
  const isTeacher = userRoles.includes("Teacher");
  const isStudent = userRoles.includes("Student") && !isTeacher && !isAdmin;

  if (isAdmin) {
    return <AdminDashboard userName={userName} />;
  }

  if (isTeacher) {
    return <TeacherDashboard userName={userName} />;
  }

  return <StudentDashboard userName={userName} />;
}
