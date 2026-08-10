"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { GraduationCap, Eye } from "lucide-react";

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
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignmentId: string;
  assignmentTitle: string;
  status: string;
  submittedAt: string;
  attemptCount: number;
  scoreObtained: number | null;
  isPassed: boolean | null;
  maxMarks: number;
  passMarks: number;
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

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch teacher's assignments for the dropdown
  const { data: assignmentsData } = useQuery({
    queryKey: queryKeys.assignments.all({}),
    queryFn: async () => {
      const response = await apiClient.get("/assignments", {
        params: { pageNumber: 1, pageSize: 100 },
      });
      return response.data?.data?.items as Assignment[];
    },
  });

  // Fetch submissions for selected assignment
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

  const selectedAssignment = assignmentsData?.find((a) => a.id === selectedAssignmentId);

  const columns: Column<SubmissionItem>[] = [
    {
      header: "Student",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.studentName} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-[var(--text-primary)]">{row.studentName}</span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">{row.studentEmail}</span>
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
              : row.status === "Returned"
              ? "warning"
              : "default"
          }
          dot
        >
          {row.status === "LateSubmitted" ? "Late" : row.status}
        </Badge>
      ),
    },
    {
      header: "Submitted",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-600">
          {new Date(row.submittedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Attempts",
      cell: (row) => (
        <span className="text-xs font-mono font-bold text-slate-700">
          {row.attemptCount}
        </span>
      ),
    },
    {
      header: "Score",
      cell: (row) => (
        <ScoreIndicator
          scoreObtained={row.scoreObtained}
          maxMarks={row.maxMarks}
          passMarks={row.passMarks}
          isPassed={row.isPassed}
          showBar={false}
        />
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <Link href={`/grading/${row.id}`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Grade
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Grading &amp; Evaluations</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review student submissions, assign grades, and provide feedback.
        </p>
      </div>

      {/* Assignment Selector & Filters */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Assignment Dropdown */}
            <div className="flex-1">
              <Select
                label="Select Assignment"
                value={selectedAssignmentId}
                onChange={(e) => {
                  setSelectedAssignmentId(e.target.value);
                  setPageNumber(1);
                }}
                options={[
                  { label: "— Choose an assignment —", value: "" },
                  ...(assignmentsData || []).map((a) => ({
                    label: `${a.title} (${a.className})`,
                    value: a.id,
                  })),
                ]}
              />
            </div>

            {/* Status Filter */}
            {selectedAssignmentId && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Status:
                </span>
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                  {["All", "Submitted", "LateSubmitted", "Graded", "Returned"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setPageNumber(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        statusFilter === status
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {status === "LateSubmitted" ? "Late" : status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          {selectedAssignmentId && (
            <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search by student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {submissionsData && (
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {submissionsData.totalCount} submission{submissionsData.totalCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </CardHeader>

        {/* Submissions Table */}
        {selectedAssignmentId ? (
          <div className="p-6 pt-0 space-y-4">
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
          <div className="p-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Select an Assignment</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              Choose an assignment from the dropdown above to view and grade student submissions.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
