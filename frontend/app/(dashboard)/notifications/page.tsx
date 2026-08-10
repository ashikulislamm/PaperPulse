"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  CheckCheck,
  FileText,
  Clock,
  GraduationCap,
  ExternalLink,
  Inbox,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  targetUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

interface PagedNotificationResponse {
  items: NotificationItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function notificationIcon(type: string) {
  switch (type) {
    case "AssignmentPublished":
      return <FileText className="h-4 w-4 text-indigo-500" />;
    case "DeadlineReminder":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "SubmissionGraded":
      return <GraduationCap className="h-4 w-4 text-emerald-500" />;
    case "SubmissionReceived":
      return <FileText className="h-4 w-4 text-sky-500" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
}

function notificationTypeLabel(type: string): string {
  switch (type) {
    case "AssignmentPublished": return "Assignment";
    case "DeadlineReminder": return "Deadline";
    case "SubmissionGraded": return "Graded";
    case "SubmissionReceived": return "Submission";
    default: return type;
  }
}

function notificationTypeBadgeVariant(type: string): "primary" | "warning" | "success" | "info" | "default" {
  switch (type) {
    case "AssignmentPublished": return "primary";
    case "DeadlineReminder": return "warning";
    case "SubmissionGraded": return "success";
    case "SubmissionReceived": return "info";
    default: return "default";
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(statusFilter),
    queryFn: async () => {
      const params: Record<string, unknown> = { pageNumber, pageSize };
      if (statusFilter === "Unread") params.status = "Unread";
      if (statusFilter === "Read") params.status = "Read";
      const response = await apiClient.get("/notifications", { params });
      return response.data?.data as PagedNotificationResponse;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(statusFilter) });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(statusFilter) });
    },
  });

  const filteredItems = React.useMemo(() => {
    if (!notificationsData?.items || !debouncedSearch) return notificationsData?.items || [];
    const q = debouncedSearch.toLowerCase();
    return notificationsData.items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
    );
  }, [notificationsData?.items, debouncedSearch]);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.status === "Unread") {
      markReadMutation.mutate(notification.id);
    }
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
    }
  };

  const unreadCount = notificationsData?.items?.filter((n) => n.status === "Unread").length || 0;

  const columns: Column<NotificationItem>[] = [
    {
      header: "Notification",
      cell: (row) => (
        <button
          onClick={() => handleNotificationClick(row)}
          className="flex items-start gap-3 text-left w-full cursor-pointer group"
        >
          <div className="mt-0.5 shrink-0">
            {notificationIcon(row.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm leading-snug ${
                row.status === "Unread" ? "font-bold text-slate-900" : "font-medium text-slate-700"
              }`}>
                {row.title}
              </span>
              {row.status === "Unread" && (
                <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 leading-snug mt-0.5 line-clamp-2">
              {row.message}
            </p>
          </div>
          {row.targetUrl && (
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      ),
    },
    {
      header: "Type",
      cell: (row) => (
        <Badge variant={notificationTypeBadgeVariant(row.type)}>
          {notificationTypeLabel(row.type)}
        </Badge>
      ),
    },
    {
      header: "Time",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {timeAgo(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={row.status === "Unread" ? "primary" : "default"}
          dot
        >
          {row.status === "Unread" ? "Unread" : "Read"}
        </Badge>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        row.status === "Unread" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => markReadMutation.mutate(row.id)}
            isLoading={markReadMutation.isPending}
          >
            Mark read
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Stay updated with assignments, submissions, and grades.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                Status:
              </span>
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                {["All", "Unread", "Read"].map((status) => (
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
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {notificationsData && (
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {notificationsData.totalCount} notification{notificationsData.totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardHeader>

        <div className="p-6 pt-0 space-y-4">
          <DataTable
            columns={columns}
            data={filteredItems}
            isLoading={isLoading}
            emptyMessage="No notifications found."
          />
          {notificationsData && notificationsData.totalPages > 1 && (
            <PaginationControl
              currentPage={notificationsData.pageNumber || pageNumber}
              totalPages={notificationsData.totalPages || 1}
              totalItems={notificationsData.totalCount || 0}
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
