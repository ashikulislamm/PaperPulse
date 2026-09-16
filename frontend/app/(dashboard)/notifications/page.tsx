"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { timeAgo, notificationIcon } from "@/lib/utils";

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
          className="flex items-start gap-2.5 text-left w-full cursor-pointer group"
        >
          <div className="mt-0.5 shrink-0 text-slate-400">
            {notificationIcon(row.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs leading-snug ${
                row.status === "Unread" ? "font-bold text-[var(--text-primary)]" : "font-normal text-[var(--text-secondary)]"
              }`}>
                {row.title}
              </span>
              {row.status === "Unread" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-snug mt-0.5 line-clamp-1">
              {row.message}
            </p>
          </div>
          {row.targetUrl && (
            <ExternalLink className="h-3 w-3 text-slate-400 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      ),
    },
    {
      header: "Category",
      cell: (row) => (
        <Badge variant={notificationTypeBadgeVariant(row.type)}>
          {notificationTypeLabel(row.type)}
        </Badge>
      ),
    },
    {
      header: "Time",
      cell: (row) => (
        <span className="text-[11px] font-mono text-[var(--text-muted)] whitespace-nowrap">
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
      className: "text-right",
      cell: (row) => (
        row.status === "Unread" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => markReadMutation.mutate(row.id)}
            isLoading={markReadMutation.isPending}
          >
            Mark Read
          </Button>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="System Notifications"
        description="Review academic alerts, evaluation notices, and course deadline reminders."
        badge="Notifications"
        icon={<Bell className="h-4 w-4" />}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark All Read ({unreadCount})
            </Button>
          ) : undefined
        }
      />

      {/* Unified Control Bar */}
      <ControlBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notifications..."
        statusFilters={["All", "Unread", "Read"]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      >
        {notificationsData && (
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {notificationsData.totalCount} item{notificationsData.totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </ControlBar>

      {/* Table & Pagination */}
      <div className="space-y-3">
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
    </div>
  );
}
