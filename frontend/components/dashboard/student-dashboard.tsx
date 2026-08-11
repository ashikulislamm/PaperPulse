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
  TrendingUp,
} from "lucide-react";

interface UpcomingDeadlineDto {
  assignmentId: string;
  title: string;
  className: string;
  subjectName: string;
  dueDate: string;
  hoursRemaining: number;
  isOverdue: boolean;
}

interface StudentGradePerformanceDto {
  totalGraded: number;
  passedCount: number;
  failedCount: number;
  averagePercentage: number;
}

interface StudentDashboardDto {
  pendingAssignmentsCount: number;
  submittedAssignmentsCount: number;
  upcomingDeadlines: UpcomingDeadlineDto[];
  gradePerformance: StudentGradePerformanceDto;
}

export function StudentDashboard({ userName }: { userName: string }) {
  const { data: dashboardData } = useQuery<StudentDashboardDto | null>({
    queryKey: queryKeys.dashboard.student(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dashboard/student");
        return response.data?.data as StudentDashboardDto;
      } catch {
        return null;
      }
    },
  });

  const d = dashboardData;
  const deadlines = d?.upcomingDeadlines ?? [];
  const perf = d?.gradePerformance;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Welcome back, {userName}. Track your assignments, deadlines, and grades.
          </p>
        </div>
        <Link href="/student-assignments">
          <Button variant="primary" className="gap-2 shadow-sm">
            <BookOpen className="h-4 w-4" /> My Assignments
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Tasks"
          value={d?.pendingAssignmentsCount ?? 0}
          subtext="Requires submission"
          accentColor="indigo"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Submitted"
          value={d?.submittedAssignmentsCount ?? 0}
          subtext="Awaiting teacher review"
          accentColor="sky"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Graded"
          value={perf?.totalGraded ?? 0}
          subtext={`${perf?.passedCount ?? 0} passed, ${perf?.failedCount ?? 0} failed`}
          accentColor="emerald"
          icon={<FileCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Average Score"
          value={`${(perf?.averagePercentage ?? 0).toFixed(1)}%`}
          subtext="Across graded work"
          accentColor="amber"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Upcoming Deadlines
            </h2>
            <Link href="/student-assignments" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {deadlines.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500">
                No upcoming assignment deadlines.
              </Card>
            ) : (
              deadlines.map((dl) => (
                <Card key={dl.assignmentId} className="p-5 glass-card">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{dl.subjectName}</Badge>
                        <Badge variant="default">{dl.className}</Badge>
                        {dl.isOverdue && <Badge variant="danger">Overdue</Badge>}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{dl.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        {new Date(dl.dueDate).toLocaleDateString()} at{" "}
                        {new Date(dl.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CountdownWidget dueDate={dl.dueDate} />
                      <Link href={`/student-assignments/${dl.assignmentId}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          Open <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Grade Performance */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Grade Performance
          </h2>

          {perf ? (
            <Card className="p-6 glass-card space-y-4">
              <div className="text-center space-y-1">
                <p className="text-3xl font-extrabold text-slate-900">
                  {perf.averagePercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-[var(--text-muted)]">Average Score</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total Graded</span>
                  <span className="font-bold">{perf.totalGraded}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Passed</span>
                  <span className="font-bold text-emerald-600">{perf.passedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Failed</span>
                  <span className="font-bold text-rose-600">{perf.failedCount}</span>
                </div>
              </div>

              <Link href="/grades">
                <Button variant="outline" className="w-full gap-2">
                  View Detailed Grades <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-6 glass-card text-center text-xs text-slate-500">
              No grade data available yet.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
