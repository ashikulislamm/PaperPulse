"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { StatCard } from "@/components/common/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Users,
  Plus,
  ChevronRight,
  CheckCircle2,
  Lock,
  Pencil,
} from "lucide-react";

interface TeacherDashboardDto {
  totalAssignmentsAuthored?: number;
  pendingSubmissionsToGrade?: number;
  activeClassesCount?: number;
  averageClassScorePercentage?: number;
}

export function TeacherDashboard({ userName }: { userName: string }) {
  // Fetch Authored Assignments from DB
  const { data: assignmentsData } = useQuery({
    queryKey: queryKeys.assignments.all(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/assignments");
        return response.data?.data?.items;
      } catch (e) {
        return null;
      }
    },
  });

  // Fetch Teacher Dashboard Metrics
  const { data: dashboardData } = useQuery<TeacherDashboardDto | null>({
    queryKey: queryKeys.dashboard.teacher(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dashboard/teacher");
        return response.data?.data as TeacherDashboardDto;
      } catch (e) {
        return null;
      }
    },
  });

  // Use 100% real DB data returned by API queries
  const itemsList = (assignmentsData as any[]) || [];

  const totalAuthored = dashboardData?.totalAssignmentsAuthored ?? itemsList.length;
  const publishedCount = itemsList.filter((i: any) => i.status === "Published").length;
  const draftCount = itemsList.filter((i: any) => i.status === "Draft").length;
  const closedCount = itemsList.filter((i: any) => i.status === "Closed").length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, Professor {userName}! 🎓</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Author assignments, manage class allocations, and review pending student submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assignments">
            <Button variant="primary" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Create Assignment
            </Button>
          </Link>
          <Link href="/grading">
            <Button variant="outline" className="gap-2">
              <GraduationCap className="h-4 w-4" /> Review Submissions
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Authored Assignments"
          value={totalAuthored}
          subtext="Total tasks created"
          accentColor="indigo"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Published Tasks"
          value={publishedCount}
          subtext="Active for students"
          accentColor="emerald"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Draft Specifications"
          value={draftCount}
          subtext="Work in progress"
          accentColor="amber"
          icon={<Pencil className="h-5 w-5" />}
        />
        <StatCard
          title="Closed Submissions"
          value={closedCount}
          subtext="Deadline elapsed"
          accentColor="rose"
          icon={<Lock className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid: Management Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Assignment Studio Shortcut */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-100/80 text-indigo-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Assignment Authoring Studio</h3>
                  <p className="text-xs text-slate-500">Draft specifications, attach reference materials, and configure due dates.</p>
                </div>
              </div>
            </div>
            <Link href="/assignments">
              <Button variant="primary" className="w-full gap-2">
                Manage Authoring Studio ({totalAuthored} Tasks) <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Right Column — Evaluation Shortcut */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 glass-card space-y-4 border-emerald-200/80">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100/80 text-emerald-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Evaluation Studio</h3>
                <p className="text-xs text-slate-500">Score submissions, provide student feedback, and issue final grades.</p>
              </div>
            </div>
            <Link href="/grading">
              <Button variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Open Evaluation Workspace <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
