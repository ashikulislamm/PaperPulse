"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Building2,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface AdminSubmissionStatsDto {
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  lateSubmissions: number;
  submissionRatePercentage: number;
}

interface AdminDashboardDto {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  submissionStatistics: AdminSubmissionStatsDto;
}

export function AdminDashboard({ userName }: { userName: string }) {
  const { data: dashboardData } = useQuery<AdminDashboardDto | null>({
    queryKey: queryKeys.dashboard.admin(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dashboard/admin");
        return response.data?.data as AdminDashboardDto;
      } catch {
        return null;
      }
    },
  });

  const d = dashboardData;
  const stats = d?.submissionStatistics;

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="System Administration"
        description={`Academic operations overview for ${userName}. Manage accounts, curricula, and system integrity.`}
        badge="Admin"
        actions={
          <>
            <Link href="/users">
              <Button variant="primary" size="sm" className="gap-1.5">
                <UserPlus className="h-3.5 w-3.5" /> Manage Users
              </Button>
            </Link>
            <Link href="/audit-logs">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Audit Logs
              </Button>
            </Link>
          </>
        }
      />

      {/* Primary Hero Metric + Secondary Metrics with Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Primary Hero Metric: Total Students (takes 2 columns) */}
        <StatCard
          title="Enrolled Students"
          value={d?.totalStudents ?? 0}
          subtext="Active student accounts across all classes"
          icon={<GraduationCap className="h-4 w-4" />}
          className="md:col-span-2"
          isHero
        />

        {/* Secondary Metrics (1 column each) */}
        <StatCard
          title="Teaching Staff"
          value={d?.totalTeachers ?? 0}
          subtext="Active faculty members"
          icon={<Users className="h-4 w-4" />}
        />

        <StatCard
          title="Active Classes"
          value={d?.totalClasses ?? 0}
          subtext="Configured sections"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* Submission Performance & Platform Summary */}
      {stats && (
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Platform Submission Metrics
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Aggregate submission volume across all published assignments
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--color-primary)]">
              {stats.submissionRatePercentage.toFixed(1)}% Turn-in Rate
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Total Submissions</span>
              <p className="text-xl font-bold font-mono font-mono-numeric text-[var(--text-primary)] mt-0.5">
                {stats.totalSubmissions}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Graded</span>
              <p className="text-xl font-bold font-mono font-mono-numeric text-emerald-600 mt-0.5">
                {stats.gradedSubmissions}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Pending Evaluation</span>
              <p className="text-xl font-bold font-mono font-mono-numeric text-amber-600 mt-0.5">
                {stats.pendingSubmissions}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Late Turn-ins</span>
              <p className="text-xl font-bold font-mono font-mono-numeric text-rose-600 mt-0.5">
                {stats.lateSubmissions}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">User &amp; Role Directory</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Provision accounts, assign academic roles (Teacher, Student, Admin), and configure access states.
            </p>
          </div>
          <Link href="/users">
            <Button variant="outline" size="sm" className="w-full gap-1.5 justify-between">
              <span>Open User Management</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Security Audit Trail</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Inspect authentication events, authorization checks, and record mutation timestamps.
            </p>
          </div>
          <Link href="/audit-logs">
            <Button variant="outline" size="sm" className="w-full gap-1.5 justify-between">
              <span>View Audit Logs</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
