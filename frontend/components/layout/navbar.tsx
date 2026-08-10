"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, User, KeyRound, Settings, LogOut } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();
  const [unreadCount] = React.useState(3);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      logout();
      router.push("/login");
    }
  };

  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : "User Profile";
  const userRoleText = user?.roles?.join(", ") || "Student";

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-[var(--border-subtle)]/80 px-6 flex items-center justify-between">
      {/* Search Input / Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search assignments, users, submissions..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-100/80 border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        </div>
      </div>

      {/* Quick Actions & User Menu */}
      <div className="flex items-center gap-4">
        {/* Tenant Switcher Indicator */}
        <Badge variant="primary" className="hidden sm:inline-flex">
          Primary School Tenant
        </Badge>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative h-9 w-9 rounded-lg border border-[var(--border-subtle)] bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer select-none">
              <Avatar src={user?.avatarUrl} name={userDisplayName} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight text-[var(--text-primary)]">
                  {userDisplayName}
                </span>
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                  {userRoleText}
                </span>
              </div>
            </button>
          }
          items={[
            {
              label: "My Profile",
              icon: <User className="h-4 w-4 text-slate-500" />,
              onClick: () => router.push("/profile"),
            },
            {
              label: "Change Password",
              icon: <KeyRound className="h-4 w-4 text-slate-500" />,
              onClick: () => router.push("/profile/change-password"),
            },
            {
              label: "Settings",
              icon: <Settings className="h-4 w-4 text-slate-500" />,
              onClick: () => router.push("/settings"),
            },
            {
              label: "Log Out",
              icon: <LogOut className="h-4 w-4 text-rose-600" />,
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
