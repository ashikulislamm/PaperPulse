"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/common/stat-card";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  Search,
} from "lucide-react";

interface StudentGradeSummary {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  className: string;
  subjectName: string;
  scoreObtained: number;
  maxMarks: number;
  passMarks: number;
  isPassed: boolean;
  submissionStatus: string;
  gradedAt: string;
  teacherName: string;
  feedbackComments: string[];
}

interface PagedGradesResponse {
  items: StudentGradeSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function GradesPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState<string>("All");
  const [selectedSubject, setSelectedSubject] = React.useState<string>("All");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: gradesData, isLoading } = useQuery({
    queryKey: queryKeys.studentAssignments.grades({
      classId: selectedClass === "All" ? undefined : selectedClass,
      subjectId: selectedSubject === "All" ? undefined : selectedSubject,
      pageNumber,
      pageSize,
    }),
    queryFn: async () => {
      const params: Record<string, unknown> = {
        pageNumber,
        pageSize,
      };
      if (selectedClass !== "All") params.classId = selectedClass;
      if (selectedSubject !== "All") params.subjectId = selectedSubject;

      const response = await apiClient.get("/student/grades", { params });
      return response.data?.data as PagedGradesResponse;
    },
  });

  const items = gradesData?.items || [];
  const totalCount = gradesData?.totalCount || 0;
  const totalPages = gradesData?.totalPages || 1;

  const filteredItems = React.useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.assignmentTitle.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q)
    );
  }, [items, debouncedSearch]);

  const passedCount = items.filter((i) => i.isPassed).length;
  const failedCount = items.filter((i) => !i.isPassed).length;
  const avgScore =
    items.length > 0
      ? Math.round(
          (items.reduce((acc, i) => acc + (i.scoreObtained / i.maxMarks) * 100, 0) /
            items.length) *
            10
        ) / 10
      : 0;

  const columns: Column<StudentGradeSummary>[] = [
    {
      header: "Assignment",
      accessorKey: "assignmentTitle",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--text-primary)] line-clamp-1">
            {row.assignmentTitle}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">{row.subjectName}</span>
        </div>
      ),
    },
    {
      header: "Class",
      accessorKey: "className",
      sortable: true,
    },
    {
      header: "Score",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm">
            {row.scoreObtained}/{row.maxMarks}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            ({Math.round((row.scoreObtained / row.maxMarks) * 100)}%)
          </span>
        </div>
      ),
    },
    {
      header: "Result",
      accessorKey: "isPassed",
      sortable: true,
      cell: (row) => (
        <Badge variant={row.isPassed ? "success" : "danger"} dot>
          {row.isPassed ? "Passed" : "Failed"}
        </Badge>
      ),
    },
    {
      header: "Teacher",
      accessorKey: "teacherName",
      sortable: true,
    },
    {
      header: "Graded",
      accessorKey: "gradedAt",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(row.gradedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Feedback",
      cell: (row) =>
        row.feedbackComments.length > 0 ? (
          <Badge variant="info">{row.feedbackComments.length} note{row.feedbackComments.length !== 1 ? "s" : ""}</Badge>
        ) : (
          <span className="text-xs text-[var(--text-secondary)]">—</span>
        ),
    },
    {
      header: "",
      cell: (row) => (
        <Link href={`/grades/${row.submissionId}`}>
          <Button size="sm" variant="ghost" className="gap-1 text-xs">
            Details <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Grades</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          View your scores, pass/fail status, and teacher feedback for all graded assignments.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard
          title="Total Graded"
          value={totalCount}
          subtext="Assignments evaluated"
          accentColor="indigo"
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="Passed"
          value={passedCount}
          subtext="Above pass marks"
          accentColor="emerald"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Failed"
          value={failedCount}
          subtext="Below pass marks"
          accentColor="rose"
          icon={<XCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          subtext="Across all graded"
          accentColor="sky"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by assignment, subject, or teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setPageNumber(1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] cursor-pointer"
              >
                <option value="All">All Classes</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setPageNumber(1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] cursor-pointer"
              >
                <option value="All">All Subjects</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Grades Table */}
      <Card>
        <div className="p-6 space-y-4">
          <DataTable
            columns={columns}
            data={filteredItems}
            isLoading={isLoading}
            emptyMessage="No grades found. Your graded assignments will appear here."
          />

          {totalPages > 1 && (
            <PaginationControl
              currentPage={pageNumber}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPageNumber}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
