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
import { Textarea } from "@/components/ui/textarea";
import { CountdownWidget } from "@/components/ui/countdown";
import { StudentFileUploader, SelectedFile } from "@/components/submissions/student-file-uploader";
import { SubmissionVersionTimeline, SubmissionVersionItem } from "@/components/submissions/submission-version-timeline";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  AlertTriangle,
  Download,
  FileText,
  Send,
  UserCheck,
  RefreshCw,
} from "lucide-react";

interface AssignmentDetail {
  id: string;
  title: string;
  description: string;
  subjectName: string;
  className: string;
  teacherName: string;
  maxMarks: number;
  passMarks: number;
  dueDate: string;
  allowLateSubmissions: boolean;
  latePenaltyPercentage: number;
  status: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    filePath?: string;
    fileSize: number;
  }>;
}

interface SubmissionVersion {
  id: string;
  versionNumber: number;
  submissionText: string;
  submittedAt: string;
  isLate: boolean;
}

interface SubmissionData {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  attemptCount: number;
  versions: SubmissionVersion[];
}

export default function SubmissionStudioPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = React.useState<SelectedFile | null>(null);
  const [comments, setComments] = React.useState("");
  const [localSubmission, setLocalSubmission] = React.useState<SubmissionData | null>(null);

  const isValidGuid = assignmentId && assignmentId !== "undefined" && assignmentId.length > 10;

  // 1. Query Assignment Specifications
  const { data: assignmentData } = useQuery({
    queryKey: queryKeys.assignments.detail(assignmentId),
    enabled: !!isValidGuid,
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data?.data as AssignmentDetail;
    },
  });

  // 2. Query Student Submission — backend resolves by assignmentId for current student
  const {
    data: submissionData,
    isLoading: isSubmissionLoading,
  } = useQuery({
    queryKey: queryKeys.submissions.byAssignment(assignmentId),
    enabled: !!isValidGuid && !localSubmission,
    queryFn: async () => {
      const response = await apiClient.get(`/submissions/${assignmentId}`);
      return response.data?.data as SubmissionData;
    },
  });

  // 3. Create Submission Mutation (POST /submissions)
  const createSubmissionMutation = useMutation({
    mutationFn: async (payload: { assignmentId: string; content: string; file?: File | null }) => {
      const response = await apiClient.post("/submissions", {
        assignmentId: payload.assignmentId,
        content: payload.content,
      });
      const submissionData = response.data?.data as SubmissionData;

      // Upload file if provided
      if (payload.file && submissionData?.versions?.[0]?.id) {
        const formData = new FormData();
        formData.append("file", payload.file);
        await apiClient.post(`/submissions/${submissionData.versions[0].id}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      return submissionData;
    },
    onSuccess: (data) => {
      toast.success("Submission created successfully!");
      setSelectedFile(null);
      setComments("");
      if (data) {
        setLocalSubmission(data);
        queryClient.setQueryData(queryKeys.submissions.byAssignment(assignmentId), data);
      }
    },
  });

  // 4. Update/Resubmit Mutation (PUT /submissions/{id})
  const updateSubmissionMutation = useMutation({
    mutationFn: async (payload: { submissionId: string; content: string; file?: File | null }) => {
      const response = await apiClient.put(`/submissions/${payload.submissionId}`, {
        submissionId: payload.submissionId,
        content: payload.content,
      });
      const submissionData = response.data?.data as SubmissionData;

      // Upload file if provided — attach to the latest version
      if (payload.file && submissionData?.versions?.length) {
        const latestVersion = submissionData.versions[submissionData.versions.length - 1];
        const formData = new FormData();
        formData.append("file", payload.file);
        await apiClient.post(`/submissions/${latestVersion.id}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      return submissionData;
    },
    onSuccess: (data) => {
      toast.success("Resubmission recorded as new version!");
      setSelectedFile(null);
      setComments("");
      if (data) {
        setLocalSubmission(data);
        queryClient.setQueryData(queryKeys.submissions.byAssignment(assignmentId), data);
      }
    },
  });

  // Merge server-fetched and locally-cached submission data
  const effectiveSubmission = localSubmission || submissionData;
  const hasSubmission = !!effectiveSubmission?.id;
  const isSubmitting = createSubmissionMutation.isPending || updateSubmissionMutation.isPending;

  // Build version timeline from API data
  const versions: SubmissionVersionItem[] = React.useMemo(() => {
    if (!effectiveSubmission?.versions) return [];
    return effectiveSubmission.versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      fileName: `Submission_v${v.versionNumber}.txt`,
      fileUrl: "#",
      fileSize: v.submissionText?.length || 0,
      contentType: "text/plain",
      comments: v.submissionText,
      submittedAt: v.submittedAt,
      isLate: v.isLate,
      status: effectiveSubmission.status,
    }));
  }, [effectiveSubmission]);

  // Handle Submit / Resubmit
  const handleSubmitWork = async () => {
    const content = comments.trim() || `Submission for ${assignmentData?.title || "assignment"}`;
    const file = selectedFile?.file || null;

    if (hasSubmission && effectiveSubmission?.id) {
      updateSubmissionMutation.mutate({
        submissionId: effectiveSubmission.id,
        content,
        file,
      });
    } else {
      createSubmissionMutation.mutate({
        assignmentId,
        content,
        file,
      });
    }
  };

  // Mock assignment data fallback
  const assignment = assignmentData || {
    id: assignmentId,
    title: "Assignment",
    description: "Loading assignment details...",
    subjectName: "Subject",
    className: "Class",
    teacherName: "Teacher",
    maxMarks: 100,
    passMarks: 40,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    allowLateSubmissions: true,
    latePenaltyPercentage: 10,
    status: "Published",
    attachments: [],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/student-assignments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Assignments
        </Link>

        {/* Resubmit Button (visible when submission exists) */}
        {hasSubmission && (
          <Badge variant="primary" className="gap-1.5">
            <RefreshCw className="h-3 w-3" />
            Version {versions.length} Active
          </Badge>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Assignment Specification */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-8 glass-card space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{assignment.subjectName}</Badge>
                  <Badge variant="default">{assignment.className}</Badge>
                </div>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Teacher: <span className="font-bold text-slate-900">{assignment.teacherName}</span>
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {assignment.title}
              </h1>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {assignment.description}
              </p>
            </div>

            {/* Evaluation & Due Date Specs */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100/70 text-indigo-600">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Max Marks
                  </span>
                  <div className="text-sm font-extrabold font-mono text-slate-900">
                    {assignment.maxMarks} Points{" "}
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Pass: {assignment.passMarks})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100/70 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Late Policy
                  </span>
                  <div className="text-xs font-extrabold font-mono text-slate-900">
                    {assignment.allowLateSubmissions
                      ? `Allowed (-${assignment.latePenaltyPercentage}%)`
                      : "Strictly Disallowed"}
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                Time Remaining:
              </label>
              <CountdownWidget dueDate={assignment.dueDate} />
            </div>
          </Card>

          {/* Teacher Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Teacher Materials &amp; Reference Files</h3>
              <div className="space-y-3">
                {assignment.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-slate-50/50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">{att.fileName}</span>
                    </div>
                    <a
                      href={att.fileUrl || att.filePath || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs shrink-0"
                      title="Download Material"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column — Submission Studio */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 glass-card space-y-5 border-indigo-200/80 shadow-md">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {hasSubmission ? "Resubmit Work" : "Submit Solution"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {hasSubmission
                  ? "Submit a new revision. Your previous version will be archived in the timeline."
                  : "Upload your completed solution and submit your work."}
              </p>
            </div>

            {/* File Upload Zone */}
            <StudentFileUploader
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />

            {/* Submission Notes */}
            <Textarea
              label="Submission Notes / Comments"
              placeholder="Add your solution text, clarification, assumptions, or questions for your teacher..."
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            {/* Submit / Resubmit Button */}
            <Button
              type="button"
              variant={hasSubmission ? "outline" : "primary"}
              size="lg"
              className={`w-full gap-2 shadow-sm ${hasSubmission ? "border-indigo-200 text-indigo-700" : ""}`}
              isLoading={isSubmitting}
              onClick={handleSubmitWork}
              disabled={!comments.trim() && !selectedFile}
            >
              {hasSubmission ? (
                <>
                  <RefreshCw className="h-4 w-4" /> Resubmit (Version {versions.length + 1})
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Solution
                </>
              )}
            </Button>

            {hasSubmission && (
              <p className="text-[10px] text-center text-[var(--text-muted)]">
                Your previous submission remains visible to your teacher until this new version is graded.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Version History Timeline */}
      <SubmissionVersionTimeline versions={versions} />
    </div>
  );
}
