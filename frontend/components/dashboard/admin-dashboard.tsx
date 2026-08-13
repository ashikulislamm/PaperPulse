"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { StatCard } from "@/components/common/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ShieldCheck,
  Building2,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
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
  const { data: dashboardData, isLoading } = useQuery<AdminDashboardDto | null>({
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Administration</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Welcome back, {userName}. Manage users, roles, and review platform health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="primary" className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" /> Manage Users
            </Button>
          </Link>
          <Link href="/audit-logs">
            <Button variant="outline" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={d?.totalStudents ?? 0}
          subtext="Enrolled across all classes"
          accentColor="indigo"
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <StatCard
          title="Total Teachers"
          value={d?.totalTeachers ?? 0}
          subtext="Active staff members"
          accentColor="sky"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Classes"
          value={d?.totalClasses ?? 0}
          subtext="Active class sections"
          accentColor="emerald"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="Assignments"
          value={d?.totalAssignments ?? 0}
          subtext="Created across platform"
          accentColor="amber"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </div>

      {/* Submission Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card className="p-4 glass-card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Total Submissions</p>
              <p className="text-lg font-bold">{stats.totalSubmissions}</p>
            </div>
          </Card>
          <Card className="p-4 glass-card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Graded</p>
              <p className="text-lg font-bold">{stats.gradedSubmissions}</p>
            </div>
          </Card>
          <Card className="p-4 glass-card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Pending</p>
              <p className="text-lg font-bold">{stats.pendingSubmissions}</p>
            </div>
          </Card>
          <Card className="p-4 glass-card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Late</p>
              <p className="text-lg font-bold">{stats.lateSubmissions}</p>
            </div>
          </Card>
          <Card className="p-4 glass-card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Submission Rate</p>
              <p className="text-lg font-bold">{stats.submissionRatePercentage.toFixed(1)}%</p>
            </div>
          </Card>
        </div>
      )}

      {/* Management Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
        <Card className="p-6 glass-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100/80 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">User Directory</h3>
              <p className="text-xs text-slate-500">
                Provision accounts, assign roles, and manage active status.
              </p>
            </div>
          </div>
          <Link href="/users">
            <Button variant="primary" className="w-full gap-2">
              Manage Users <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="p-6 glass-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Review authentication attempts, role changes, and system activity.
              </p>
            </div>
          </div>
          <Link href="/audit-logs">
            <Button variant="outline" className="w-full gap-2">
              Open Audit Logs <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
