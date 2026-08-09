"use client";

import * as React from "react";
import { StatCard } from "@/components/common/stat-card";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Trophy,
  Download,
  Plus,
  ChevronRight,
} from "lucide-react";

interface SubmissionRow {
  id: string;
  assignmentTitle: string;
  studentName: string;
  className: string;
  submittedAt: string;
  status: "Submitted" | "LateSubmitted" | "Graded";
  isLate: boolean;
}

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const mockSubmissions: SubmissionRow[] = [
    {
      id: "1",
      assignmentTitle: "Calculus Problem Set #4",
      studentName: "Alex Rivera",
      className: "Grade 10-A",
      submittedAt: "2026-08-08 14:30",
      status: "Submitted",
      isLate: false,
    },
    {
      id: "2",
      assignmentTitle: "Physics Motion & Vectors Lab",
      studentName: "Emma Watson",
      className: "Grade 11-B",
      submittedAt: "2026-08-08 16:45",
      status: "LateSubmitted",
      isLate: true,
    },
    {
      id: "3",
      assignmentTitle: "Organic Chemistry Quiz 2",
      studentName: "Michael Jordan",
      className: "Grade 12-A",
      submittedAt: "2026-08-07 10:15",
      status: "Graded",
      isLate: false,
    },
  ];

  const columns: Column<SubmissionRow>[] = [
    {
      header: "Assignment",
      accessorKey: "assignmentTitle",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-[var(--text-primary)]">{row.assignmentTitle}</span>
          <span className="text-xs text-[var(--text-secondary)]">{row.className}</span>
        </div>
      ),
    },
    {
      header: "Student",
      accessorKey: "studentName",
      sortable: true,
      cell: (row) => <span className="font-semibold text-slate-800">{row.studentName}</span>,
    },
    {
      header: "Submitted Date",
      accessorKey: "submittedAt",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.submittedAt}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Graded"
              ? "graded"
              : row.status === "LateSubmitted"
              ? "overdue"
              : "submitted"
          }
          dot
        >
          {row.status === "LateSubmitted" ? "Late Submitted" : row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: () => (
        <Button size="sm" variant="outline" className="gap-1">
          Review &amp; Grade <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Academic Overview Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time analytics, assignment metrics, and pending submission queues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Create Assignment
          </Button>
        </div>
      </div>

      {/* Analytics Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Active Students"
          value="1,248"
          subtext="Across 18 classes"
          trend={{ value: "12.4%", isPositive: true }}
          accentColor="indigo"
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <StatCard
          title="Active Assignments"
          value="34"
          subtext="8 published this week"
          trend={{ value: "4.2%", isPositive: true }}
          accentColor="sky"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Review Queue"
          value="19"
          subtext="Requires teacher grading"
          trend={{ value: "8.1%", isPositive: false }}
          accentColor="amber"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Pass Rate"
          value="94.2%"
          subtext="System-wide performance"
          trend={{ value: "3.5%", isPositive: true }}
          accentColor="emerald"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      {/* Recent Submissions Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Student Submissions</CardTitle>
            <CardDescription className="mt-1">
              Submissions received in the past 24 hours requiring review.
            </CardDescription>
          </div>
          <Button size="sm" variant="ghost">View All</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable columns={columns} data={mockSubmissions} />
          <PaginationControl
            currentPage={currentPage}
            totalPages={3}
            totalItems={28}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
