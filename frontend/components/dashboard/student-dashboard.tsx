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
import { CountdownWidget } from "@/components/ui/countdown";
import {
  Clock,
  CheckCircle2,
  Trophy,
  ChevronRight,
  BookOpen,
  Calendar,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

interface StudentDashboardDto {
  pendingAssignmentsCount?: number;
  submittedAssignmentsCount?: number;
  gradedAssignmentsCount?: number;
  averageGradePercentage?: number;
}

export function StudentDashboard({ userName }: { userName: string }) {
  // Fetch Student Assignments Feed from DB
  const { data: assignmentsData } = useQuery({
    queryKey: queryKeys.studentAssignments.feed(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/student/assignments");
        return response.data?.data?.items;
      } catch (e) {
        return null;
      }
    },
  });

  // Fetch Student Dashboard Analytics
  const { data: dashboardData } = useQuery<StudentDashboardDto | null>({
    queryKey: queryKeys.dashboard.student(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dashboard/student");
        return response.data?.data as StudentDashboardDto;
      } catch (e) {
        return null;
      }
    },
  });

  // Fetch Student Deadlines
  const { data: deadlinesData } = useQuery({
    queryKey: queryKeys.studentAssignments.deadlines(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/student/deadlines");
        return response.data?.data;
      } catch (e) {
        return null;
      }
    },
  });

  // Use 100% real DB data returned by API queries
  const itemsList = (assignmentsData as any[]) || [];

  // Calculate Metrics 100% Dynamically from Real DB Assignments List & Dashboard Endpoint
  const pendingCount = dashboardData?.pendingAssignmentsCount ?? itemsList.filter((i: any) => i.submissionStatus === "Pending").length;
  const submittedCount = dashboardData?.submittedAssignmentsCount ?? itemsList.filter((i: any) => i.submissionStatus === "Submitted").length;
  const gradedCount = dashboardData?.gradedAssignmentsCount ?? itemsList.filter((i: any) => i.submissionStatus === "Graded").length;
  const overdueCount = itemsList.filter((i: any) => i.submissionStatus === "Overdue").length;

  const upcomingDeadlines = deadlinesData?.length ? deadlinesData : itemsList.filter((i: any) => i.submissionStatus === "Pending" || i.submissionStatus === "Submitted");

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here is your academic overview, upcoming deadlines, and submission status.
          </p>
        </div>
        <Link href="/student-assignments">
          <Button variant="primary" className="gap-2 shadow-sm">
            <BookOpen className="h-4 w-4" /> Go to My Assignments
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Tasks"
          value={pendingCount}
          subtext="Requires submission"
          accentColor="indigo"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Submitted Work"
          value={submittedCount}
          subtext="Awaiting teacher review"
          accentColor="sky"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Graded Assessments"
          value={gradedCount}
          subtext="Evaluated & scored"
          accentColor="emerald"
          icon={<FileCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueCount}
          subtext="Past deadline"
          accentColor="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid: Deadlines & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Upcoming Deadlines */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-extrabold text-slate-900">Upcoming Assignment Deadlines</h2>
            </div>
            <Link href="/student-assignments" className="text-xs font-bold text-indigo-600 hover:underline">
              View All ({itemsList.length})
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500">
                No upcoming assignment deadlines.
              </Card>
            ) : (
              upcomingDeadlines.map((dl: any) => (
                <Card key={dl.id || dl.assignmentId} className="p-5 glass-card flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{dl.subjectName || "Subject"}</Badge>
                      <Badge variant="default">{dl.className || "Class"}</Badge>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(dl.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{dl.title}</h3>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <CountdownWidget dueDate={dl.dueDate} />
                    <Link href={`/student-assignments/${dl.assignmentId || dl.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        Open Studio <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column — Quick Workspace Directives */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 glass-card space-y-4 border-indigo-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-100/80 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Submission Studio</h3>
                <p className="text-xs text-slate-500">Upload PDF, DOCX, ZIP files and track version history.</p>
              </div>
            </div>
            <Link href="/student-assignments">
              <Button variant="primary" className="w-full gap-2 mt-2">
                Open Workspace ({itemsList.length} Tasks) <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
