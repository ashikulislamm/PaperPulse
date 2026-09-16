"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownWidget } from "@/components/ui/countdown";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { AssignmentModal, AssignmentItem } from "@/components/assignments/assignment-modal";
import { AssignmentActionDialog, ActionType } from "@/components/assignments/assignment-actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Plus,
  Pencil,
  CheckCircle2,
  ArrowLeftRight,
  Lock,
  Trash2,
  Eye,
  Settings2,
  UserCheck,
  BookOpen,
} from "lucide-react";

interface PagedAssignmentResponse {
  items: AssignmentItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isStudent = userRoles.includes("Student") && !userRoles.includes("Teacher") && !userRoles.includes("Admin");
  const canManage = userRoles.includes("Teacher") || userRoles.includes("Admin");

  // Redirect Student to /student-assignments workspace
  React.useEffect(() => {
    if (isStudent) {
      router.replace("/student-assignments");
    }
  }, [isStudent, router]);

  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Authoring Studio Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAssignment, setEditingAssignment] = React.useState<AssignmentItem | null>(null);

  // Action Confirmation Dialog State
  const [actionTarget, setActionTarget] = React.useState<AssignmentItem | null>(null);
  const [actionType, setActionType] = React.useState<ActionType | null>(null);
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<AssignmentItem | null>(null);

  // Debounce Search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Query Fetch Assignments
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.assignments.all({
      search: debouncedSearch,
      status: selectedStatus === "All" ? undefined : selectedStatus,
      pageNumber,
      pageSize,
    }),
    enabled: !isStudent,
    queryFn: async () => {
      const response = await apiClient.get("/assignments", {
        params: {
          search: debouncedSearch || undefined,
          status: selectedStatus === "All" ? undefined : selectedStatus,
          pageNumber,
          pageSize,
        },
      });
      return response.data?.data as PagedAssignmentResponse;
    },
  });

  const assignmentsList = data?.items ?? [];

  const handleExecuteAction = async () => {
    if (!actionTarget || !actionType) return;
    setIsActionLoading(true);

    try {
      if (actionType === "publish") {
        await apiClient.patch(`/assignments/${actionTarget.id}/publish`);
        toast.success(`Published "${actionTarget.title}"`);
      } else if (actionType === "close") {
        await apiClient.patch(`/assignments/${actionTarget.id}/close`);
        toast.success(`Closed submissions for "${actionTarget.title}"`);
      } else if (actionType === "archive") {
        await apiClient.patch(`/assignments/${actionTarget.id}/archive`);
        toast.success(`Archived "${actionTarget.title}"`);
      }
      refetch();
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all() });
    } catch {
      toast.error("Failed to perform action.");
    } finally {
      setIsActionLoading(false);
      setActionTarget(null);
      setActionType(null);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/assignments/${deleteTarget.id}`);
      toast.success("Assignment deleted.");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete assignment.");
    }
  };

  const columns: Column<AssignmentItem>[] = [
    {
      header: "Assignment Title",
      cell: (row) => (
        <div className="flex flex-col">
          <Link
            href={`/assignments/${row.id}`}
            className="font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {row.title}
          </Link>
          <span className="text-[11px] text-[var(--text-secondary)] line-clamp-1">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      header: "Teacher",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>{row.teacherName || "Unassigned"}</span>
        </div>
      ),
    },
    {
      header: "Class & Subject",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="primary">{row.subjectName || "Subject"}</Badge>
          <Badge variant="default">{row.className || "Class"}</Badge>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Published"
              ? "published"
              : row.status === "Closed"
              ? "closed"
              : row.status === "Archived"
              ? "default"
              : "draft"
          }
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Max Marks",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold">
          {row.maxMarks} pts
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <DropdownMenu
          trigger={
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Settings2 className="h-3.5 w-3.5" /> Options
            </Button>
          }
          items={[
            {
              label: "View Specification",
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: () => router.push(`/assignments/${row.id}`),
            },
            ...(canManage
              ? [
                  {
                    label: "Edit Specification",
                    icon: <Pencil className="h-3.5 w-3.5" />,
                    onClick: () => {
                      setEditingAssignment(row);
                      setIsModalOpen(true);
                    },
                  },
                  ...(row.status === "Draft"
                    ? [{
                        label: "Publish Assignment",
                        icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
                        onClick: () => {
                          setActionTarget(row);
                          setActionType("publish");
                        },
                      }]
                    : row.status === "Published"
                    ? [{
                        label: "Close Submissions",
                        icon: <Lock className="h-3.5 w-3.5 text-rose-600" />,
                        danger: true,
                        onClick: () => {
                          setActionTarget(row);
                          setActionType("close");
                        },
                      }]
                    : row.status === "Closed"
                    ? [{
                        label: "Archive Assignment",
                        icon: <ArrowLeftRight className="h-3.5 w-3.5 text-amber-600" />,
                        onClick: () => {
                          setActionTarget(row);
                          setActionType("archive");
                        },
                      }]
                    : []),
                  {
                    label: "Delete Assignment",
                    icon: <Trash2 className="h-3.5 w-3.5 text-rose-600" />,
                    danger: true,
                    onClick: () => setDeleteTarget(row),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  if (isStudent) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Assignments Studio"
        description="Author, publish specifications, configure mark weights, and manage turn-in schedules."
        badge="Assignments"
        icon={<BookOpen className="h-4 w-4" />}
        actions={
          canManage ? (
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setEditingAssignment(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Create Assignment
            </Button>
          ) : undefined
        }
      />

      {/* Unified Reusable Control Bar */}
      <ControlBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assignment title..."
        statusFilters={["All", "Draft", "Published", "Closed", "Archived"]}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Rendering */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignmentsList.map((item) => (
            <Card key={item.id} className="p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      item.status === "Published"
                        ? "published"
                        : item.status === "Closed"
                        ? "closed"
                        : item.status === "Archived"
                        ? "default"
                        : "draft"
                    }
                    dot
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[11px] font-mono font-semibold text-[var(--text-muted)]">
                    {item.maxMarks} Marks
                  </span>
                </div>

                <div>
                  <Link
                    href={`/assignments/${item.id}`}
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
                    <Badge variant="primary">{item.subjectName || "Subject"}</Badge>
                    <Badge variant="default">{item.className || "Class"}</Badge>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> {item.teacherName || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
                <CountdownWidget dueDate={item.dueDate} />

                <div className="flex items-center justify-between pt-1">
                  <Link href={`/assignments/${item.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Specification
                    </Button>
                  </Link>

                  {canManage && (
                    <DropdownMenu
                      trigger={
                        <Button size="sm" variant="ghost">
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      items={[
                        {
                          label: "Edit Specification",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          onClick: () => {
                            setEditingAssignment(item);
                            setIsModalOpen(true);
                          },
                        },
                        ...(item.status === "Draft"
                          ? [{
                              label: "Publish Assignment",
                              icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
                              onClick: () => {
                                setActionTarget(item);
                                ActionType: "publish";
                                setActionType("publish");
                              },
                            }]
                          : item.status === "Published"
                          ? [{
                              label: "Close Submissions",
                              icon: <Lock className="h-3.5 w-3.5 text-rose-600" />,
                              danger: true,
                              onClick: () => {
                                setActionTarget(item);
                                setActionType("close");
                              },
                            }]
                          : item.status === "Closed"
                          ? [{
                              label: "Archive Assignment",
                              icon: <ArrowLeftRight className="h-3.5 w-3.5 text-amber-600" />,
                              onClick: () => {
                                setActionTarget(item);
                                setActionType("archive");
                              },
                            }]
                          : []),
                        {
                          label: "Delete Assignment",
                          icon: <Trash2 className="h-3.5 w-3.5 text-rose-600" />,
                          danger: true,
                          onClick: () => setDeleteTarget(item),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            data={assignmentsList}
            isLoading={isLoading}
            emptyMessage="No assignments authored yet."
          />
          <PaginationControl
            currentPage={data?.pageNumber || pageNumber}
            totalPages={data?.totalPages || 1}
            totalItems={data?.totalCount || assignmentsList.length}
            pageSize={pageSize}
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Authoring Studio Modal */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all() });
        }}
        assignmentToEdit={editingAssignment}
      />

      {/* Confirmation Action Dialog */}
      {actionTarget && actionType && (
        <AssignmentActionDialog
          isOpen={!!actionTarget}
          onClose={() => {
            setActionTarget(null);
            setActionType(null);
          }}
          onConfirm={handleExecuteAction}
          actionType={actionType}
          assignmentTitle={actionTarget.title}
          isLoading={isActionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAssignment}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This assignment will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Assignment"
        variant="danger"
      />
    </div>
  );
}
