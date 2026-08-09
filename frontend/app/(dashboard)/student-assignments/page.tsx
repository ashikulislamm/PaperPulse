"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountdownWidget } from "@/components/ui/countdown";
import { StatCard } from "@/components/common/stat-card";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Trophy,
} from "lucide-react";

export interface StudentAssignmentFeedItem {
  id?: string;
  assignmentId?: string;
  title: string;
  description: string;
  subjectName: string;
  className: string;
  teacherName?: string;
  maxMarks: number;
  passMarks: number;
  dueDate: string;
  allowLateSubmissions?: boolean;
  latePenaltyPercentage?: number;
  submissionStatus: "Pending" | "Submitted" | "Graded" | "Overdue";
  gradeObtained?: number;
  feedback?: string;
  hasSubmission?: boolean;
}

export default function StudentAssignmentsPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Query Fetch Student Assignments from DB
  const { data: assignmentsData } = useQuery({
    queryKey: queryKeys.studentAssignments.feed(selectedStatus),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/student/assignments", {
          params: {
            search: debouncedSearch || undefined,
            status: selectedStatus === "All" ? undefined : selectedStatus,
          },
        });
        return response.data?.data?.items as StudentAssignmentFeedItem[];
      } catch (e) {
        return [];
      }
    },
  });

  const itemsList: StudentAssignmentFeedItem[] = assignmentsData || [];

  const filteredItems = itemsList.filter((item: StudentAssignmentFeedItem) => {
    if (selectedStatus === "All") return true;
    return item.submissionStatus?.toLowerCase() === selectedStatus.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Assignment Workspace</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track deadlines, submit solution files, view evaluations, and manage submission revisions.
          </p>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard
          title="Pending Tasks"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Pending").length}
          subtext="Requires your action"
          accentColor="indigo"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Submitted Work"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Submitted").length}
          subtext="Awaiting teacher review"
          accentColor="sky"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Graded Assessments"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Graded").length}
          subtext="Evaluated & scored"
          accentColor="emerald"
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="Overdue Tasks"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Overdue").length}
          subtext="Past deadline"
          accentColor="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Filter & Control Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Input
              placeholder="Search assignment by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["All", "Pending", "Submitted", "Graded", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Cards Grid Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-8 text-center glass-card border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-bold text-slate-700">No assignments found matching &ldquo;{selectedStatus}&rdquo; filter.</p>
          </div>
        ) : (
          filteredItems.map((item: StudentAssignmentFeedItem) => {
            const targetId = item.assignmentId || item.id || "018f4a2b-8910-7500-8000-000000000001";
            const isOverdue = new Date(item.dueDate).getTime() < Date.now() && item.submissionStatus !== "Submitted" && item.submissionStatus !== "Graded";

            return (
              <Card key={targetId} className="glass-card p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        item.submissionStatus === "Graded"
                          ? "graded"
                          : item.submissionStatus === "Submitted"
                          ? "submitted"
                          : isOverdue
                          ? "overdue"
                          : "warning"
                      }
                      dot
                    >
                      {item.submissionStatus === "Graded"
                        ? `Graded (${item.gradeObtained}/${item.maxMarks})`
                        : item.submissionStatus}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {item.maxMarks} Points
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/student-assignments/${targetId}`}
                      className="text-lg font-extrabold text-[var(--text-primary)] hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="primary">{item.subjectName}</Badge>
                    <Badge variant="default">{item.className}</Badge>
                    {item.allowLateSubmissions && (
                      <Badge variant="warning" className="text-[10px]">
                        Late Allowed (-{item.latePenaltyPercentage}%)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Deadline Timer & CTA */}
                <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                  <CountdownWidget dueDate={item.dueDate} />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.hasSubmission ? "Version History Available" : "No Submission Yet"}
                    </span>
                    <Link href={`/student-assignments/${targetId}`}>
                      <Button size="sm" variant="primary" className="gap-1 text-xs">
                        Submission Studio <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
