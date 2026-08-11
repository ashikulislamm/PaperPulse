"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { Search, User, KeyRound, Settings, LogOut, Menu } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();
  const [searchValue, setSearchValue] = React.useState("");

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/assignments?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : "User Profile";
  const userRoleText = user?.roles?.join(", ") || "Student";

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-[var(--border-subtle)]/80 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Mobile Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-sidebar"))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 md:hidden cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Search assignments, users, submissions..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-100/80 border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        </form>
      </div>

      {/* Quick Actions & User Menu */}
      <div className="flex items-center gap-3">
        {/* Notification Dropdown */}
        <NotificationDropdown />

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
              onClick: () => router.push("/profile"),
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
