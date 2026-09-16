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
    <header className="sticky top-0 z-30 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Mobile Hamburger + Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-sidebar"))}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 md:hidden cursor-pointer transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            placeholder="Search assignments..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--border-focused)] focus-visible:ring-1 focus-visible:ring-[var(--border-focused)]"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5 pointer-events-none" />
        </form>
      </div>

      {/* Quick Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer select-none">
              <Avatar src={user?.avatarUrl} name={userDisplayName} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-[var(--text-primary)]">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {userRoleText}
                </span>
              </div>
            </button>
          }
          items={[
            {
              label: "My Profile",
              icon: <User className="h-3.5 w-3.5" />,
              onClick: () => router.push("/profile"),
            },
            {
              label: "Change Password",
              icon: <KeyRound className="h-3.5 w-3.5" />,
              onClick: () => router.push("/profile"),
            },
            {
              label: "Settings",
              icon: <Settings className="h-3.5 w-3.5" />,
              onClick: () => router.push("/settings"),
            },
            {
              label: "Sign Out",
              icon: <LogOut className="h-3.5 w-3.5 text-rose-600" />,
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
