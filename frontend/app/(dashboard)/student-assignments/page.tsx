"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownWidget } from "@/components/ui/countdown";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Trophy,
  BookOpen,
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
      } catch {
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
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="My Coursework &amp; Submissions"
        description="Track active deadlines, submit solution artifacts, and review teacher assessments."
        badge="Coursework"
        icon={<BookOpen className="h-4 w-4" />}
      />

      {/* Analytics Metric Cards with Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pending Turn-In"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Pending").length}
          subtext="Requires submission prior to deadline"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          className="md:col-span-2"
          isHero
        />
        <StatCard
          title="Turned In"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Submitted").length}
          subtext="Awaiting evaluation"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          title="Graded"
          value={itemsList.filter((i: StudentAssignmentFeedItem) => i.submissionStatus === "Graded").length}
          subtext="Evaluated & scored"
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      {/* Filter & Control Bar */}
      <ControlBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assignment title..."
        statusFilters={["All", "Pending", "Submitted", "Graded", "Overdue"]}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Grid Content */}
      {filteredItems.length === 0 ? (
        <Card className="p-10 text-center text-xs text-[var(--text-muted)]">
          No assignments match this criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const assignmentId = item.assignmentId || item.id;
            return (
              <Card key={assignmentId} className="p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        item.submissionStatus === "Graded"
                          ? "graded"
                          : item.submissionStatus === "Submitted"
                          ? "submitted"
                          : item.submissionStatus === "Overdue"
                          ? "overdue"
                          : "warning"
                      }
                      dot
                    >
                      {item.submissionStatus}
                    </Badge>
                    <span className="font-mono text-xs font-semibold">
                      {item.maxMarks} Marks
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/student-assignments/${assignmentId}`}
                      className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Badge variant="primary">{item.subjectName}</Badge>
                      <Badge variant="default">{item.className}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
                  <CountdownWidget dueDate={item.dueDate} />

                  <div className="flex items-center justify-between pt-1">
                    {item.gradeObtained !== undefined ? (
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Score: {item.gradeObtained} / {item.maxMarks}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Pass: {item.passMarks} pts
                      </span>
                    )}

                    <Link href={`/student-assignments/${assignmentId}`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        {item.submissionStatus === "Pending" ? "Turn In" : "View Work"}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
