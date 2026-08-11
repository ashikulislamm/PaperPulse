"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  User,
} from "lucide-react";

interface SubmissionVersion {
  id: string;
  versionNumber: number;
  submissionText: string;
  submittedAt: string;
  isLate: boolean;
  attachments: Array<{
    id: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    fileSizeBytes: number;
  }>;
}

interface SubmissionDetail {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: string;
  attemptCount: number;
  versions: SubmissionVersion[];
}

interface GradeDetail {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  className: string;
  subjectName: string;
  scoreObtained: number;
  maxMarks: number;
  passMarks: number;
  isPassed: boolean;
  gradedAt: string;
  teacherName: string;
  feedbackComments: string[];
}

export default function GradeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const submissionId = params.id as string;

  // Check if grade data was passed via URL search params (avoids re-fetching all grades)
  const gradeDataParam = searchParams.get("gradeData");
  const navState = React.useMemo(() => {
    if (!gradeDataParam) return null;
    try {
      return JSON.parse(gradeDataParam) as GradeDetail;
    } catch {
      return null;
    }
  }, [gradeDataParam]);

  // Fetch grade detail from the grades list (fallback for direct URL access)
  const { data: gradeData, isLoading: gradeLoading } = useQuery({
    queryKey: [...queryKeys.studentAssignments.grades({}), "detail", submissionId],
    enabled: !navState,
    queryFn: async () => {
      const response = await apiClient.get("/student/grades", {
        params: { pageNumber: 1, pageSize: 50 },
      });
      const items = response.data?.data?.items as GradeDetail[];
      return items?.find((g) => g.submissionId === submissionId) || null;
    },
  });

  const effectiveGrade = navState || gradeData;

  // Fetch submission detail with version history
  const { data: submission, isLoading: submissionLoading } = useQuery({
    queryKey: queryKeys.submissions.detail(submissionId),
    enabled: !!submissionId,
    queryFn: async () => {
      const response = await apiClient.get(`/submissions/${submissionId}`);
      return response.data?.data as SubmissionDetail;
    },
  });

  const isLoading = !navState && (gradeLoading || submissionLoading);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!effectiveGrade) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link
          href="/grades"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Grades
        </Link>
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Grade details not found.</p>
        </Card>
      </div>
    );
  }

  const percentage = Math.round((effectiveGrade.scoreObtained / effectiveGrade.maxMarks) * 100);
  const latestVersion = submission?.versions?.[submission.versions.length - 1];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <Link
        href="/grades"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Grades
      </Link>

      {/* Header Card */}
      <Card className="p-6 glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
              {effectiveGrade.assignmentTitle}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary">{effectiveGrade.subjectName}</Badge>
              <Badge variant="default">{effectiveGrade.className}</Badge>
              <Badge variant={effectiveGrade.isPassed ? "success" : "danger"} dot>
                {effectiveGrade.isPassed ? "Passed" : "Failed"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Graded By
              </p>
              <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                <User className="h-3 w-3" /> {effectiveGrade.teacherName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Graded On
              </p>
              <p className="text-xs font-mono text-slate-900">
                {new Date(effectiveGrade.gradedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Submission & Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Submission */}
          {latestVersion && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" /> Latest Submission
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    v{latestVersion.versionNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(latestVersion.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {latestVersion.submissionText ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                  {latestVersion.submissionText}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">
                  No submission text content.
                </p>
              )}

              {latestVersion.isLate && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  This submission was submitted after the deadline.
                </div>
              )}

              {/* Attachments */}
              {latestVersion.attachments && latestVersion.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {latestVersion.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Version Timeline */}
          {submission?.versions && submission.versions.length > 1 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" /> Version Timeline
              </h3>
              <div className="space-y-3">
                {[...submission.versions].reverse().map((v, idx) => (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border ${
                      idx === 0
                        ? "border-indigo-200 bg-indigo-50/30"
                        : "border-slate-200/60 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-indigo-600">
                          v{v.versionNumber}
                        </span>
                        {idx === 0 && <Badge variant="published">Latest</Badge>}
                        {v.isLate ? (
                          <Badge variant="overdue" dot>Late</Badge>
                        ) : (
                          <Badge variant="success" dot>On Time</Badge>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(v.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    {v.submissionText && (
                      <p className="text-xs text-slate-700 line-clamp-2">{v.submissionText}</p>
                    )}
                    {v.attachments && v.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {v.attachments.map((att) => (
                          <span key={att.id} className="text-[10px] text-slate-500 font-mono">
                            {att.fileName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Teacher Feedback */}
          {effectiveGrade.feedbackComments.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" /> Teacher Feedback
              </h3>
              <div className="space-y-3">
                {effectiveGrade.feedbackComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50"
                  >
                    <p className="text-xs text-slate-700 leading-relaxed">{comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column — Score Breakdown */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-indigo-600" /> Score Breakdown
            </h3>

            {/* Score Circle */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
                    effectiveGrade.isPassed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {percentage}%
                    </p>
                    <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                      {effectiveGrade.isPassed ? "PASSED" : "FAILED"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Score Obtained</span>
                <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {effectiveGrade.scoreObtained}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Maximum Marks</span>
                <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {effectiveGrade.maxMarks}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Pass Marks</span>
                <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {effectiveGrade.passMarks}
                </span>
              </div>

              <div className="h-px bg-[var(--border-subtle)]" />

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Percentage</span>
                <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Result</span>
                {effectiveGrade.isPassed ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                    <XCircle className="h-3.5 w-3.5" /> Failed
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Submission Attempts</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                  {submission?.attemptCount || 1}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Submitted On</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">
                  {submission?.submittedAt
                    ? new Date(submission.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Versions</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                  {submission?.versions?.length || 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
