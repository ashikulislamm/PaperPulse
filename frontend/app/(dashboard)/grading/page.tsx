"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { GraduationCap, Eye, Search } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  status: string;
  maxMarks: number;
  passMarks: number;
  className: string;
  subjectName: string;
}

interface SubmissionItem {
  id: string;
  submissionId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignmentId: string;
  assignmentTitle: string;
  status: string;
  submittedAt: string;
  attemptCount: number;
  scoreObtained?: number | null;
  isPassed?: boolean | null;
  maxMarks: number;
  passMarks: number;
  mark?: {
    scoreObtained: number;
    maxMarks: number;
    passMarks: number;
    isPassed: boolean;
    gradedAt: string;
    teacherName: string;
  } | null;
}

interface PagedSubmissionResponse {
  items: SubmissionItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function GradingPage() {
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: assignmentsData } = useQuery({
    queryKey: queryKeys.assignments.all({}),
    queryFn: async () => {
      const response = await apiClient.get("/assignments", {
        params: { pageNumber: 1, pageSize: 100 },
      });
      return response.data?.data?.items as Assignment[];
    },
  });

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: queryKeys.grading.submissions(selectedAssignmentId),
    enabled: !!selectedAssignmentId,
    queryFn: async () => {
      const params: Record<string, unknown> = {
        pageNumber,
        pageSize,
      };
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      const response = await apiClient.get(
        `/grading/assignments/${selectedAssignmentId}/submissions`,
        { params }
      );
      return response.data?.data as PagedSubmissionResponse;
    },
  });

  const columns: Column<SubmissionItem>[] = [
    {
      header: "Student",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.studentName} size="sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-[var(--text-primary)]">{row.studentName}</span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">{row.studentEmail}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Graded"
              ? "graded"
              : row.status === "Submitted"
              ? "submitted"
              : row.status === "LateSubmitted"
              ? "overdue"
              : "draft"
          }
          dot
        >
          {row.status === "LateSubmitted" ? "Late" : row.status}
        </Badge>
      ),
    },
    {
      header: "Attempt",
      cell: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">v{row.attemptCount || 1}</span>
      ),
    },
    {
      header: "Turned In",
      cell: (row) => (
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {new Date(row.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Evaluation Result",
      cell: (row) => {
        const score = row.mark?.scoreObtained ?? row.scoreObtained;
        const max = row.mark?.maxMarks ?? row.maxMarks;
        const pass = row.mark?.passMarks ?? row.passMarks;
        if (score !== undefined && score !== null) {
          return (
            <ScoreIndicator
              scoreObtained={score}
              maxMarks={max}
              passMarks={pass}
              isPassed={row.isPassed}
              showBar={false}
            />
          );
        }
        return <span className="text-[11px] text-[var(--text-muted)]">Unscored</span>;
      },
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => {
        const targetId = row.id || row.submissionId;
        return (
          <Link href={`/grading/${targetId}`}>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Eye className="h-3 w-3" /> Evaluate
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Submission Evaluation Studio"
        description="Review student work, grade against assignment rubrics, and deliver actionable feedback."
        badge="Grading"
        icon={<GraduationCap className="h-4 w-4" />}
      />

      {/* Assignment Selector & Filters Card */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Select
              label="Select Assignment Specification"
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                setPageNumber(1);
              }}
              options={[
                { label: "— Choose an authored assignment —", value: "" },
                ...(assignmentsData || []).map((a) => ({
                  label: `${a.title} (${a.className})`,
                  value: a.id,
                })),
              ]}
            />
          </div>

          {selectedAssignmentId && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {["All", "Submitted", "LateSubmitted", "Graded", "Returned"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPageNumber(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === status
                      ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {status === "LateSubmitted" ? "Late" : status}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedAssignmentId && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-8 w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--border-focused)] focus-visible:ring-1 focus-visible:ring-[var(--border-focused)]"
              />
            </div>
            {submissionsData && (
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {submissionsData.totalCount} submission{submissionsData.totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Submissions Table */}
      {selectedAssignmentId ? (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            data={submissionsData?.items || []}
            isLoading={isLoading}
            emptyMessage="No submissions found for this assignment."
          />
          {submissionsData && submissionsData.totalPages > 1 && (
            <PaginationControl
              currentPage={submissionsData.pageNumber || pageNumber}
              totalPages={submissionsData.totalPages || 1}
              totalItems={submissionsData.totalCount || 0}
              pageSize={pageSize}
              onPageChange={setPageNumber}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      ) : (
        <Card className="p-12 text-center text-xs text-[var(--text-muted)] space-y-1.5">
          <GraduationCap className="h-6 w-6 mx-auto text-slate-400" />
          <p className="font-medium text-[var(--text-primary)]">Select an Assignment to Begin Grading</p>
          <p className="text-[11px]">Choose an assignment from the selector above to inspect and evaluate turn-ins.</p>
        </Card>
      )}
    </div>
  );
}
