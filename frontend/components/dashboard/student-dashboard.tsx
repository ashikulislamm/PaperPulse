"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/common/page-header";
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
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Student Workspace"
        description={`Enrolled course overview for ${userName}. Track assignment deadlines and review your grades.`}
        badge="Student"
        actions={
          <Link href="/student-assignments">
            <Button variant="primary" size="sm" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> My Assignments
            </Button>
          </Link>
        }
      />

      {/* Visual Hierarchy: Hero Metric + Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Primary Hero Metric: Pending tasks requiring action */}
        <StatCard
          title="Assignments Pending Turn-In"
          value={d?.pendingAssignmentsCount ?? 0}
          subtext="Coursework requiring submission prior to due dates"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          className="md:col-span-2"
          isHero
        />

        <StatCard
          title="Turned In Work"
          value={d?.submittedAssignmentsCount ?? 0}
          subtext="Under teacher evaluation"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />

        <StatCard
          title="Cumulative Grade Average"
          value={`${(perf?.averagePercentage ?? 0).toFixed(1)}%`}
          subtext={`${perf?.passedCount ?? 0} passed, ${perf?.failedCount ?? 0} failed`}
          icon={<FileCheck className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Upcoming Deadlines
            </h2>
            <Link href="/student-assignments" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              View All Coursework
            </Link>
          </div>

          <div className="space-y-2">
            {deadlines.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
                No upcoming assignment deadlines scheduled.
              </Card>
            ) : (
              deadlines.map((dl) => (
                <Card key={dl.assignmentId} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="primary">{dl.subjectName}</Badge>
                        <Badge variant="default">{dl.className}</Badge>
                        {dl.isOverdue && <Badge variant="danger" dot>Overdue</Badge>}
                      </div>
                      <h3 className="text-xs font-semibold text-[var(--text-primary)]">{dl.title}</h3>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono">
                        Due: {new Date(dl.dueDate).toLocaleDateString()} at{" "}
                        {new Date(dl.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CountdownWidget dueDate={dl.dueDate} />
                      <Link href={`/student-assignments/${dl.assignmentId}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          Submit Work <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Grade Summary Card */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-slate-400" />
            Academic Standing
          </h2>

          {perf ? (
            <Card className="p-5 space-y-4">
              <div className="text-center pb-3 border-b border-[var(--border-subtle)] space-y-0.5">
                <p className="text-3xl font-bold font-mono font-mono-numeric text-[var(--text-primary)]">
                  {perf.averagePercentage.toFixed(1)}%
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Overall Course Score</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Total Evaluated</span>
                  <span className="font-mono font-bold">{perf.totalGraded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Passing Grades</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{perf.passedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Unsatisfactory</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{perf.failedCount}</span>
                </div>
              </div>

              <Link href="/grades">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>View Gradebook</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-6 text-center text-xs text-[var(--text-muted)]">
              No evaluation data published yet.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
