"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownWidget } from "@/components/ui/countdown";
import { AssignmentModal, AssignmentItem } from "@/components/assignments/assignment-modal";
import { AssignmentActionDialog, ActionType } from "@/components/assignments/assignment-actions";
import {
  ArrowLeft,
  Pencil,
  CheckCircle2,
  Lock,
  Archive,
  Download,
  FileText,
  FileArchive,
  Clock,
  Award,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const canManage = userRoles.includes("Teacher") || userRoles.includes("Admin");

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<ActionType | null>(null);
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  // Fetch Assignment Detail
  const { data: assignment, isLoading, refetch } = useQuery({
    queryKey: queryKeys.assignments.detail(assignmentId),
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data?.data as AssignmentItem;
    },
  });

  // Mock Fallback
  const mockDetail: AssignmentItem = {
    id: assignmentId,
    title: "Calculus Problem Set #4 — Derivatives & Optimization",
    description:
      "Complete all assigned exercises in Chapter 4 covering implicit differentiation, chain rule applications, and optimization models in engineering. Ensure all mathematical steps are written clearly on standard A4 paper or typed using LaTeX.",
    status: "Published",
    maxMarks: 100,
    passMarks: 40,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    allowLateSubmissions: true,
    latePenaltyPercentage: 10,
    teacherAssignmentId: "018f4a2b-8910-7400-8000-000000000001",
    className: "Grade 10-A",
    subjectName: "Mathematics",
    teacherName: "Sarah Conner",
    attachments: [
      {
        id: "att-1",
        fileName: "Calculus_Problem_Set_4_Specifications.pdf",
        fileUrl: "#",
        fileSize: 2450000,
        contentType: "application/pdf",
      },
    ],
  };

  const item = assignment || mockDetail;

  const handleExecuteAction = async () => {
    if (!actionType) return;
    setIsActionLoading(true);

    try {
      if (actionType === "publish") {
        await apiClient.patch(`/assignments/${assignmentId}/publish`);
        toast.success(`Published "${item.title}"`);
      } else if (actionType === "close") {
        await apiClient.patch(`/assignments/${assignmentId}/close`);
        toast.success(`Closed submissions for "${item.title}"`);
      } else if (actionType === "archive") {
        await apiClient.patch(`/assignments/${assignmentId}/archive`);
        toast.success(`Archived "${item.title}"`);
      }
      refetch();
    } catch (err) {
    } finally {
      setIsActionLoading(false);
      setActionType(null);
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) return <FileText className="h-6 w-6 text-rose-500" />;
    if (contentType.includes("zip") || contentType.includes("compressed"))
      return <FileArchive className="h-6 w-6 text-amber-500" />;
    return <FileText className="h-6 w-6 text-indigo-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/assignments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assignment Studio
        </Link>

        {/* Action Controls Guarded for Teachers/Admins */}
        {canManage && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsModalOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Specification
            </Button>

            {item.status === "Draft" ? (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => setActionType("publish")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Publish Assignment
              </Button>
            ) : item.status === "Published" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-amber-700 border-amber-200"
                  onClick={() => setActionType("archive")}
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setActionType("close")}
                >
                  <Lock className="h-3.5 w-3.5" /> Close Submissions
                </Button>
              </>
            ) : item.status === "Closed" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-amber-700 border-amber-200"
                onClick={() => setActionType("archive")}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Assignment Overview Card */}
      <Card className="p-8 glass-card space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{item.subjectName || "Mathematics"}</Badge>
              <Badge variant="default">{item.className || "Grade 10-A"}</Badge>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 ml-2">
                <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                Created by: <span className="font-bold text-slate-900">{item.teacherName || "Sarah Conner"}</span>
              </span>
            </div>
            <Badge
              variant={
                item.status === "Published"
                  ? "published"
                  : item.status === "Closed"
                  ? "closed"
                  : "draft"
              }
              dot
            >
              {item.status}
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {item.title}
          </h1>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {item.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-100/70 text-indigo-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Evaluation Marks
              </span>
              <div className="text-base font-extrabold font-mono text-slate-900">
                {item.maxMarks} Points <span className="text-xs font-normal text-slate-500">(Pass: {item.passMarks})</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-100/70 text-sky-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Due Date &amp; Time
              </span>
              <div className="text-xs font-extrabold font-mono text-slate-900">
                {new Date(item.dueDate).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100/70 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Late Policy
              </span>
              <div className="text-xs font-extrabold font-mono text-slate-900">
                {item.allowLateSubmissions
                  ? `Allowed (-${item.latePenaltyPercentage}%)`
                  : "Strictly Disallowed"}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Countdown Timer Widget */}
        <div className="pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
            Time Remaining Until Deadline:
          </label>
          <CountdownWidget dueDate={item.dueDate} />
        </div>
      </Card>

      {/* Material Attachments Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="text-base font-bold text-slate-900">Material Attachments</h3>
          <span className="text-xs font-mono text-slate-500">
            {item.attachments?.length || 0} Files Attached
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {item.attachments?.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(att.contentType)}
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {att.fileName}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {formatFileSize(att.fileSize)}
                  </span>
                </div>
              </div>

              <a
                href={att.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs shrink-0"
                title="Download Attachment"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Modal */}
      {canManage && (
        <AssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          assignmentToEdit={item}
        />
      )}

      {/* Action Dialog */}
      {canManage && actionType && (
        <AssignmentActionDialog
          isOpen={!!actionType}
          onClose={() => setActionType(null)}
          onConfirm={handleExecuteAction}
          actionType={actionType}
          assignmentTitle={item.title}
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
}
