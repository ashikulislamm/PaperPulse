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
import {
  BookOpen,
  GraduationCap,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
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
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Teacher Workspace"
        description={`Active instruction portal for ${userName}. Review incoming student work and publish assignments.`}
        badge="Teacher"
        actions={
          <>
            <Link href="/assignments">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Assignment
              </Button>
            </Link>
            <Link href="/grading">
              <Button variant="outline" size="sm" className="gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Review Submissions
              </Button>
            </Link>
          </>
        }
      />

      {/* Metric Row with Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Primary Hero Metric: Pending Reviews needing teacher action */}
        <StatCard
          title="Submissions Awaiting Grading"
          value={d?.pendingReviewsCount ?? 0}
          subtext="Unscored student submissions requiring evaluation"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          className="md:col-span-2"
          isHero
        />

        <StatCard
          title="Active Assignments"
          value={d?.myAssignmentsCount ?? 0}
          subtext="Authored by your faculty profile"
          icon={<BookOpen className="h-4 w-4" />}
        />

        <StatCard
          title="Average Class Score"
          value={`${(stats?.averageScorePercentage ?? 0).toFixed(1)}%`}
          subtext={`Across ${stats?.gradedCount ?? 0} graded turn-ins`}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Reviews Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Pending Evaluation Queue
            </h2>
            <Link href="/grading" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              View All Queue
            </Link>
          </div>

          <div className="space-y-2">
            {reviews.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
                No submissions currently awaiting grading.
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.submissionId} className="p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {review.assignmentTitle}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Turned in by {review.studentName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.isLate && (
                      <Badge variant="danger" dot>Late</Badge>
                    )}
                    <Link href={`/grading/${review.submissionId}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        Evaluate <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Course Management
          </h2>

          <div className="space-y-2">
            <Card className="p-4 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">Assignment Authoring Studio</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Publish new problem sets, set deadlines, and upload attachments.
                </p>
              </div>
              <Link href="/assignments">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>Manage Authored Assignments</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>

            <Card className="p-4 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">Evaluation &amp; Feedback Center</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Input scores, annotate submissions, and release marks to students.
                </p>
              </div>
              <Link href="/grading">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>Open Evaluation Center</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
