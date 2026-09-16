"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  Award,
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

  const { data: allGradesData } = useQuery({
    queryKey: queryKeys.studentAssignments.grades({ _filterOptions: true }),
    queryFn: async () => {
      const response = await apiClient.get("/student/grades", {
        params: { pageNumber: 1, pageSize: 100 },
      });
      return response.data?.data as PagedGradesResponse;
    },
  });

  const classOptions = React.useMemo(() => {
    const allItems = allGradesData?.items || [];
    const unique = [...new Set(allItems.map((i) => i.className).filter(Boolean))];
    return unique.sort();
  }, [allGradesData]);

  const subjectOptions = React.useMemo(() => {
    const allItems = allGradesData?.items || [];
    const unique = [...new Set(allItems.map((i) => i.subjectName).filter(Boolean))];
    return unique.sort();
  }, [allGradesData]);

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
      header: "Assignment Title",
      accessorKey: "assignmentTitle",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--text-primary)] line-clamp-1">
            {row.assignmentTitle}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">{row.subjectName}</span>
        </div>
      ),
    },
    {
      header: "Class",
      accessorKey: "className",
      sortable: true,
      cell: (row) => (
        <Badge variant="default">{row.className}</Badge>
      ),
    },
    {
      header: "Score",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-xs">
            {row.scoreObtained}/{row.maxMarks}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
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
      cell: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">{row.teacherName}</span>
      ),
    },
    {
      header: "Graded On",
      accessorKey: "gradedAt",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {new Date(row.gradedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Feedback",
      cell: (row) =>
        row.feedbackComments.length > 0 ? (
          <Badge variant="primary">{row.feedbackComments.length} note{row.feedbackComments.length !== 1 ? "s" : ""}</Badge>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)]">—</span>
        ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <Link
          href={{
            pathname: `/grades/${row.submissionId}`,
            query: { gradeData: JSON.stringify(row) },
          }}
        >
          <Button size="sm" variant="ghost" className="gap-1 text-xs">
            Report <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Academic Gradebook"
        description="Inspect evaluation results, pass/fail thresholds, and faculty feedback notes."
        badge="Gradebook"
        icon={<Award className="h-4 w-4" />}
      />

      {/* Stat Cards with Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Overall Average Score"
          value={`${avgScore}%`}
          subtext="Cumulative performance across all graded submissions"
          icon={<TrendingUp className="h-4 w-4" />}
          className="md:col-span-2"
          isHero
        />
        <StatCard
          title="Passing Assessments"
          value={passedCount}
          subtext="Above minimum mark requirement"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="Unsatisfactory"
          value={failedCount}
          subtext="Below required passing mark"
          icon={<XCircle className="h-4 w-4 text-rose-600" />}
        />
      </div>

      {/* Unified Control Bar */}
      <ControlBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assignment, subject, or teacher..."
      >
        <div className="flex items-center gap-2">
          <Select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPageNumber(1);
            }}
            options={[
              { label: "All Classes", value: "All" },
              ...classOptions.map((c) => ({ label: c, value: c })),
            ]}
          />
          <Select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPageNumber(1);
            }}
            options={[
              { label: "All Subjects", value: "All" },
              ...subjectOptions.map((s) => ({ label: s, value: s })),
            ]}
          />
        </div>
      </ControlBar>

      {/* Table & Pagination */}
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          emptyMessage="No evaluation records found matching this criteria."
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
    </div>
  );
}
