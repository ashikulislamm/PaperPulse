"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  FileText,
  Clock,
  AlertTriangle,
  MessageSquare,
  GraduationCap,
  ExternalLink,
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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

interface NotificationDropdownProps {
  onNavigate?: () => void;
}

export function NotificationDropdown({ onNavigate }: NotificationDropdownProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list("All"),
    queryFn: async () => {
      const response = await apiClient.get("/notifications", {
        params: { pageNumber: 1, pageSize: 8 },
      });
      return response.data?.data;
    },
    enabled: isOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list("All") });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list("All") });
    },
  });

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.status === "Unread") {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
    }
    onNavigate?.();
  };

  const notifications: NotificationItem[] = notificationsData?.items || [];
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-lg border border-[var(--border-subtle)] bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-96 max-h-[480px] rounded-xl border border-[var(--border-subtle)] bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 z-[60] sm:z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 px-2 gap-1"
                  onClick={() => markAllReadMutation.mutate()}
                  isLoading={markAllReadMutation.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </Button>
              )}
              <Link
                href="/notifications"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                }}
              >
                View all
              </Link>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You&apos;ll see notifications for assignments and grades here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                    notification.status === "Unread" ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs leading-snug truncate ${
                        notification.status === "Unread"
                          ? "font-bold text-slate-900"
                          : "font-medium text-slate-700"
                      }`}>
                        {notification.title}
                      </p>
                      {notification.status === "Unread" && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                  {notification.targetUrl && (
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] px-4 py-2.5">
              <Link
                href="/notifications"
                className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                }}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
