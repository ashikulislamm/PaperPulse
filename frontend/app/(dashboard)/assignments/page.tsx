"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountdownWidget } from "@/components/ui/countdown";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { AssignmentModal, AssignmentItem } from "@/components/assignments/assignment-modal";
import { AssignmentActionDialog, ActionType } from "@/components/assignments/assignment-actions";
import {
  Plus,
  LayoutGrid,
  List,
  Pencil,
  CheckCircle2,
  ArrowLeftRight,
  Lock,
  Trash2,
  Eye,
  Settings2,
  UserCheck,
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
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
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

  // Use real DB data returned by API query
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
    } catch (err) {
      toast.error("Failed to perform action.");
    } finally {
      setIsActionLoading(false);
      setActionTarget(null);
      setActionType(null);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await apiClient.delete(`/assignments/${id}`);
      toast.success("Assignment deleted.");
      refetch();
    } catch (err) {
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
            className="font-bold text-[var(--text-primary)] hover:text-indigo-600 transition-colors"
          >
            {row.title}
          </Link>
          <span className="text-xs text-[var(--text-secondary)] line-clamp-1">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      header: "Author Teacher",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
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
        <span className="font-mono text-xs font-bold text-slate-800">
          {row.maxMarks} pts
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5">
              <Settings2 className="h-3.5 w-3.5" /> Options
            </Button>
          }
          items={[
            {
              label: "View Specification",
              icon: <Eye className="h-4 w-4 text-slate-500" />,
              onClick: () => (window.location.href = `/assignments/${row.id}`),
            },
            ...(canManage
              ? [
                  {
                    label: "Edit Specification",
                    icon: <Pencil className="h-4 w-4 text-slate-500" />,
                    onClick: () => {
                      setEditingAssignment(row);
                      setIsModalOpen(true);
                    },
                  },
                  ...(row.status === "Draft"
                    ? [{
                        label: "Publish Assignment",
                        icon: <CheckCircle2 className="h-4 w-4 text-indigo-600" />,
                        onClick: () => {
                          setActionTarget(row);
                          setActionType("publish");
                        },
                      }]
                    : row.status === "Published"
                    ? [{
                        label: "Close Submissions",
                        icon: <Lock className="h-4 w-4 text-rose-600" />,
                        danger: true,
                        onClick: () => {
                          setActionTarget(row);
                          setActionType("close");
                        },
                      }]
                    : row.status === "Closed"
                    ? [{
                        label: "Archive Assignment",
                        icon: <ArrowLeftRight className="h-4 w-4 text-amber-600" />,
                        onClick: () => {
                          setActionTarget(row);
                          setActionType("archive");
                        },
                      }]
                    : []),
                  {
                    label: "Delete Assignment",
                    icon: <Trash2 className="h-4 w-4 text-rose-600" />,
                    danger: true,
                    onClick: () => handleDeleteAssignment(row.id),
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Assignment Authoring Studio</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Author, publish, edit specifications, and manage due dates for your assigned classes.
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => {
              setEditingAssignment(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Create Assignment
          </Button>
        )}
      </div>

      {/* Control Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Input
              placeholder="Search assignment title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["All", "Draft", "Published", "Closed", "Archived"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignmentsList.map((item) => (
            <Card key={item.id} className="glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
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
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {item.maxMarks} Marks
                  </span>
                </div>

                <div>
                  <Link
                    href={`/assignments/${item.id}`}
                    className="text-lg font-extrabold text-[var(--text-primary)] hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="primary">{item.subjectName || "Mathematics"}</Badge>
                    <Badge variant="default">{item.className || "Grade 10-A"}</Badge>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-indigo-600" /> {item.teacherName || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <CountdownWidget dueDate={item.dueDate} />

                <div className="flex items-center justify-between pt-1">
                  <Link href={`/assignments/${item.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Details
                    </Button>
                  </Link>

                  {canManage && (
                    <DropdownMenu
                      trigger={
                        <Button size="sm" variant="ghost">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: "Edit Specification",
                          icon: <Pencil className="h-4 w-4 text-slate-500" />,
                          onClick: () => {
                            setEditingAssignment(item);
                            setIsModalOpen(true);
                          },
                        },
                        ...(item.status === "Draft"
                          ? [{
                              label: "Publish Assignment",
                              icon: <CheckCircle2 className="h-4 w-4 text-indigo-600" />,
                              onClick: () => {
                                setActionTarget(item);
                                setActionType("publish");
                              },
                            }]
                          : item.status === "Published"
                          ? [{
                              label: "Close Submissions",
                              icon: <Lock className="h-4 w-4 text-rose-600" />,
                              danger: true,
                              onClick: () => {
                                setActionTarget(item);
                                setActionType("close");
                              },
                            }]
                          : item.status === "Closed"
                          ? [{
                              label: "Archive Assignment",
                              icon: <ArrowLeftRight className="h-4 w-4 text-amber-600" />,
                              onClick: () => {
                                setActionTarget(item);
                                setActionType("archive");
                              },
                            }]
                          : []),
                        {
                          label: "Delete Assignment",
                          icon: <Trash2 className="h-4 w-4 text-rose-600" />,
                          danger: true,
                          onClick: () => handleDeleteAssignment(item.id),
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
        <Card className="p-4">
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
        </Card>
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
    </div>
  );
}
