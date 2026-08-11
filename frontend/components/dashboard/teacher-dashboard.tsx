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
  BookOpen,
  GraduationCap,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";

interface TeacherPendingReviewDto {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  submittedAt: string;
  isLate: boolean;
}

interface TeacherSubmissionStatsDto {
  totalReceived: number;
  gradedCount: number;
  pendingCount: number;
  averageScorePercentage: number;
}

interface TeacherDashboardDto {
  myAssignmentsCount: number;
  pendingReviewsCount: number;
  submissionStatistics: TeacherSubmissionStatsDto;
  recentPendingReviews: TeacherPendingReviewDto[];
}

export function TeacherDashboard({ userName }: { userName: string }) {
  const { data: dashboardData } = useQuery<TeacherDashboardDto | null>({
    queryKey: queryKeys.dashboard.teacher(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dashboard/teacher");
        return response.data?.data as TeacherDashboardDto;
      } catch {
        return null;
      }
    },
  });

  const d = dashboardData;
  const stats = d?.submissionStatistics;
  const reviews = d?.recentPendingReviews ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Welcome back, {userName}. Manage assignments and review student submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assignments">
            <Button variant="primary" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> New Assignment
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
          title="My Assignments"
          value={d?.myAssignmentsCount ?? 0}
          subtext="Authored assignments"
          accentColor="indigo"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Reviews"
          value={d?.pendingReviewsCount ?? 0}
          subtext="Awaiting your grading"
          accentColor="amber"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Graded"
          value={stats?.gradedCount ?? 0}
          subtext={`of ${stats?.totalReceived ?? 0} total submissions`}
          accentColor="emerald"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Avg. Score"
          value={`${(stats?.averageScorePercentage ?? 0).toFixed(1)}%`}
          subtext="Across graded submissions"
          accentColor="sky"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
        {/* Pending Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Recent Pending Reviews
            </h2>
            <Link href="/grading" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500">
                No pending reviews.
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.submissionId} className="p-4 glass-card">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {review.assignmentTitle}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        by {review.studentName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.isLate && (
                        <Badge variant="danger">Late</Badge>
                      )}
                      <Link href={`/grading/${review.submissionId}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          Review <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Quick Actions</h2>

          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-100/80 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assignment Studio</h3>
                <p className="text-xs text-slate-500">
                  Create, edit, and manage your assignments.
                </p>
              </div>
            </div>
            <Link href="/assignments">
              <Button variant="primary" className="w-full gap-2">
                Manage Assignments ({d?.myAssignmentsCount ?? 0}) <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>

          <Card className="p-6 glass-card space-y-4 border-emerald-200/80">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100/80 text-emerald-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Evaluation Center</h3>
                <p className="text-xs text-slate-500">
                  Score submissions, provide feedback, and issue grades.
                </p>
              </div>
            </div>
            <Link href="/grading">
              <Button variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Open Evaluation Center <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
