"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { GradePanel } from "@/components/grading/grade-panel";
import { FeedbackForm } from "@/components/grading/feedback-form";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Send,
} from "lucide-react";

interface SubmissionDetail {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  submittedAt: string;
  attemptCount: number;
  maxMarks: number;
  passMarks: number;
  scoreObtained: number | null;
  isPassed: boolean | null;
  versions: Array<{
    id: string;
    versionNumber: number;
    submissionText: string;
    submittedAt: string;
    isLate: boolean;
    attachments: Array<{
      id: string;
      fileName: string;
      filePath: string;
      fileType: string;
      fileSizeBytes: number;
    }>;
  }>;
  feedbacks: Array<{
    id: string;
    teacherName: string;
    comments: string;
    isPrivate: boolean;
    createdAt: string;
  }>;
  mark?: {
    id: string;
    scoreObtained: number;
    isPassed: boolean;
    gradedAt: string;
    teacherName: string;
  };
}

export default function GradingDetailPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;
  const queryClient = useQueryClient();
  const [showReturnConfirm, setShowReturnConfirm] = React.useState(false);

  // Fetch submission detail
  const {
    data: submission,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.grading.detail(submissionId),
    enabled: !!submissionId,
    queryFn: async () => {
      const response = await apiClient.get(`/grading/submissions/${submissionId}`);
      return response.data?.data as SubmissionDetail;
    },
  });

  // Return to student mutation
  const returnMutation = useMutation({
    mutationFn: async (subId: string) => {
      const response = await apiClient.patch(`/grading/submissions/${subId}/return`);
      return response.data?.data;
    },
    onSuccess: () => {
      toast.success("Submission returned to student.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.grading.detail(submissionId),
      });
    },
  });

  const handleReturn = () => {
    setShowReturnConfirm(true);
  };

  const confirmReturn = () => {
    setShowReturnConfirm(false);
    returnMutation.mutate(submissionId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Link
          href="/grading"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Grading
        </Link>
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Submission not found.</p>
        </Card>
      </div>
    );
  }

  const latestVersion = submission.versions?.[submission.versions.length - 1];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/grading"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Grading
        </Link>

        {submission.status === "Graded" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-indigo-700 border-indigo-200"
            isLoading={returnMutation.isPending}
            onClick={handleReturn}
          >
            <Send className="h-3.5 w-3.5" /> Return to Student
          </Button>
        )}
      </div>

      {/* Student & Assignment Header */}
      <Card className="p-6 glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={submission.studentName} size="lg" />
            <div>
              <h1 className="text-lg font-extrabold text-[var(--text-primary)]">
                {submission.studentName}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] font-mono">{submission.studentEmail}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    submission.status === "Graded"
                      ? "graded"
                      : submission.status === "Submitted"
                      ? "submitted"
                      : submission.status === "LateSubmitted"
                      ? "overdue"
                      : submission.status === "Returned"
                      ? "warning"
                      : "default"
                  }
                  dot
                >
                  {submission.status === "LateSubmitted" ? "Late Submission" : submission.status}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  v{submission.attemptCount} attempt{submission.attemptCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Assignment
              </p>
              <p className="text-xs font-bold text-slate-900">{submission.assignmentTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Score
              </p>
              <ScoreIndicator
                scoreObtained={submission.scoreObtained}
                maxMarks={submission.maxMarks}
                passMarks={submission.passMarks}
                isPassed={submission.isPassed}
                showBar={false}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — Submission Content & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Latest Submission Content */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" /> Latest Submission
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="h-3.5 w-3.5" />
                {latestVersion && new Date(latestVersion.submittedAt).toLocaleString()}
              </div>
            </div>

            {latestVersion?.submissionText ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                {latestVersion.submissionText}
              </div>
            ) : !(latestVersion?.attachments && latestVersion.attachments.length > 0) ? (
              <div className="p-6 sm:p-8 text-center text-xs text-[var(--text-muted)]">
                No submission text content available.
              </div>
            ) : null}

            {latestVersion?.attachments && latestVersion.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted Files</p>
                {latestVersion.attachments.map((att) => {
                  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5109";
                  const fileUrl = `${apiBase}/${att.filePath}`;
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block">{att.fileName}</span>
                          <span className="text-[10px] text-slate-500">{(att.fileSizeBytes / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs shrink-0"
                        title="Download submission file"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {latestVersion?.isLate && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                This submission was submitted after the deadline.
              </div>
            )}
          </Card>

          {/* Version History */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" /> Version History
            </h3>

            {submission.versions && submission.versions.length > 0 ? (
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
                    <div className="flex items-center justify-between mb-2">
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
                      <div className="mt-2 space-y-1.5">
                        {v.attachments.map((att) => {
                          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5109";
                          const fileUrl = `${apiBase}/${att.filePath}`;
                          return (
                            <div key={att.id} className="flex items-center gap-2 text-xs">
                              <FileText className="h-3 w-3 text-indigo-400 shrink-0" />
                              <span className="text-slate-700 font-medium truncate">{att.fileName}</span>
                              <span className="text-slate-400">({(att.fileSizeBytes / 1024).toFixed(1)} KB)</span>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 shrink-0"
                                title="Download"
                              >
                                <Download className="h-3 w-3" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No version history available.</p>
            )}
          </Card>

          {/* Existing Feedback */}
          {submission.feedbacks && submission.feedbacks.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" /> Teacher Feedback
              </h3>
              <div className="space-y-3">
                {submission.feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className={`p-4 rounded-xl border ${
                      fb.isPrivate
                        ? "border-amber-200 bg-amber-50/30"
                        : "border-slate-200/60 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{fb.teacherName}</span>
                        {fb.isPrivate && <Badge variant="warning">Private</Badge>}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(fb.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{fb.comments}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column — Grading Panel & Feedback */}
        <div className="lg:col-span-5 space-y-6">
          <GradePanel
            submissionId={submissionId}
            maxMarks={submission.maxMarks}
            passMarks={submission.passMarks}
            currentScore={submission.mark?.scoreObtained ?? submission.scoreObtained}
            currentStatus={submission.status}
            onSuccess={() => {
              refetch();
              queryClient.invalidateQueries({ queryKey: ["grading"] });
            }}
          />

          <FeedbackForm
            submissionId={submissionId}
            onSuccess={() => {
              refetch();
              queryClient.invalidateQueries({ queryKey: ["grading"] });
            }}
          />
        </div>
      </div>

      {/* Return Confirmation Modal */}
      <ConfirmModal
        isOpen={showReturnConfirm}
        onClose={() => setShowReturnConfirm(false)}
        onConfirm={confirmReturn}
        title="Return submission to student?"
        description="The student will be able to view their grade, score, and any feedback you've provided. You can re-grade later if needed."
        confirmLabel="Return to Student"
        variant="info"
        isLoading={returnMutation.isPending}
      />
    </div>
  );
}
