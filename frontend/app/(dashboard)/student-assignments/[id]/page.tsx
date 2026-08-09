"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";

export default function SubmissionStudioPage() {
  const params = useParams();
  const assignmentId = params.id as string;

  const [selectedFile, setSelectedFile] = React.useState<SelectedFile | null>(null);
  const [comments, setComments] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isValidGuid = assignmentId && assignmentId !== "undefined" && assignmentId.length > 10;

  // 1. Query Assignment Specifications & Reference Materials
  const { data: assignmentData } = useQuery({
    queryKey: queryKeys.assignments.detail(assignmentId),
    enabled: !!isValidGuid,
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/assignments/${assignmentId}`);
        return response.data?.data;
      } catch (e) {
        return null;
      }
    },
  });

  // 2. Query Student Submission History (Graceful 404 handling if no submission exists yet)
  const { data: submissionData, refetch } = useQuery({
    queryKey: queryKeys.submissions.detail(assignmentId),
    enabled: !!isValidGuid,
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/submissions/${assignmentId}`);
        return response.data?.data;
      } catch (e) {
        // 404 is expected when a student has not submitted work yet
        return null;
      }
    },
  });

  // Mock Fallback Data for rich demo experience
  const mockAssignment = {
    id: assignmentId,
    title: assignmentData?.title || "Calculus Problem Set #4 — Derivatives & Optimization",
    description:
      assignmentData?.description ||
      "Complete all assigned exercises in Chapter 4 covering implicit differentiation, chain rule applications, and optimization models in engineering. Ensure all mathematical steps are written clearly on standard A4 paper or typed using LaTeX.",
    subjectName: assignmentData?.subjectName || "Mathematics",
    className: assignmentData?.className || "Grade 10-A",
    teacherName: assignmentData?.teacherName || "Sarah Conner",
    maxMarks: assignmentData?.maxMarks ?? 100,
    passMarks: assignmentData?.passMarks ?? 40,
    dueDate: assignmentData?.dueDate || new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
    allowLateSubmissions: assignmentData?.allowLateSubmission ?? true,
    latePenaltyPercentage: assignmentData?.latePenaltyPercentage ?? 10,
    status: assignmentData?.status || "Published",
    teacherAttachments: assignmentData?.attachments?.length
      ? assignmentData.attachments
      : [
          {
            id: "att-1",
            fileName: "Calculus_Problem_Set_4_Specifications.pdf",
            fileUrl: "#",
            fileSize: 2450000,
          },
          {
            id: "att-2",
            fileName: "Derivatives_Reference_Formula_Sheet.pdf",
            fileUrl: "#",
            fileSize: 1120000,
          },
        ],
  };

  const [mockVersions, setMockVersions] = React.useState<SubmissionVersionItem[]>([
    {
      id: "v1",
      versionNumber: 1,
      fileName: "John_Doe_Calculus_PS4_v1.pdf",
      fileUrl: "#",
      fileSize: 1850000,
      contentType: "application/pdf",
      comments: "Initial draft submission. Completed questions 1 through 8.",
      submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      isLate: false,
      status: "Submitted",
    },
  ]);

  const activeVersions = submissionData?.versions?.length ? submissionData.versions : mockVersions;

  const handleSubmitWork = async () => {
    if (!selectedFile) {
      toast.error("Please select a solution file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submission API call / create new version
      const newVersionNum = activeVersions.length + 1;
      const newVersion: SubmissionVersionItem = {
        id: `v${newVersionNum}`,
        versionNumber: newVersionNum,
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile.file),
        fileSize: selectedFile.size,
        contentType: selectedFile.type,
        comments: comments || undefined,
        submittedAt: new Date().toISOString(),
        isLate: new Date(mockAssignment.dueDate).getTime() < Date.now(),
        latePenaltyDeduction: mockAssignment.latePenaltyPercentage,
        status: "Submitted",
      };

      setMockVersions((prev) => [...prev, newVersion]);
      toast.success(`Successfully submitted Version ${newVersionNum}!`);
      setSelectedFile(null);
      setComments("");
      refetch();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
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
      </div>

      {/* Main Studio Grid: Left Column (Instructions) & Right Column (Upload Zone) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Assignment Specification & Teacher Materials */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-8 glass-card space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{mockAssignment.subjectName}</Badge>
                  <Badge variant="default">{mockAssignment.className}</Badge>
                </div>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Teacher: <span className="font-bold text-slate-900">{mockAssignment.teacherName}</span>
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {mockAssignment.title}
              </h1>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {mockAssignment.description}
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
                    {mockAssignment.maxMarks} Points <span className="text-[10px] text-slate-500 font-normal">(Pass: {mockAssignment.passMarks})</span>
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
                    {mockAssignment.allowLateSubmissions
                      ? `Allowed (-${mockAssignment.latePenaltyPercentage}%)`
                      : "Strictly Disallowed"}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Countdown Timer */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                Time Remaining:
              </label>
              <CountdownWidget dueDate={mockAssignment.dueDate} />
            </div>
          </Card>

          {/* Teacher Material Attachments */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Teacher Materials &amp; Reference Files</h3>
            <div className="space-y-3">
              {mockAssignment.teacherAttachments.map((att: any) => (
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
        </div>

        {/* Right Column — Student File Upload & Submission Studio */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 glass-card space-y-5 border-indigo-200/80 shadow-md">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Submission Studio</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Upload your completed solution and submit a new revision.
              </p>
            </div>

            {/* File Drag & Drop Upload Zone */}
            <StudentFileUploader
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />

            {/* Submission Notes Input */}
            <Textarea
              label="Submission Notes / Comments (Optional)"
              placeholder="Add any clarification, assumptions, or questions for your teacher..."
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full gap-2 shadow-sm"
              isLoading={isSubmitting}
              onClick={handleSubmitWork}
            >
              <Send className="h-4 w-4" /> Submit Solution (Version {activeVersions.length + 1})
            </Button>
          </Card>
        </div>
      </div>

      {/* Bottom Section — Multi-Version Submission History Timeline */}
      <SubmissionVersionTimeline versions={activeVersions} />
    </div>
  );
}
