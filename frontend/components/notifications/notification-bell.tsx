"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const { data } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await apiClient.get("/notifications/unread-count");
      return response.data?.data?.unreadCount as number;
    },
    refetchInterval: 30000,
  });

  const count = data ?? 0;

  return (
    <span className="relative inline-flex items-center justify-center p-2 cursor-pointer">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center px-1 animate-pulse shadow-sm shadow-rose-500/30">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}
