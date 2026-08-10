"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/api/auth-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Upload,
  ClipboardList,
  Bell,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isSidebarOpen, toggleSidebar } = useAuthStore();

  const userRoles = user?.roles || ["Student"];
  const isStudent = userRoles.includes("Student") && !userRoles.includes("Teacher") && !userRoles.includes("Admin");

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "User Management", href: "/users", icon: Users, roles: ["Admin"] },
    {
      label: isStudent ? "My Assignments & Submissions" : "Assignment Studio",
      href: isStudent ? "/student-assignments" : "/assignments",
      icon: BookOpen,
    },
    { label: "My Grades", href: "/grades", icon: Award, roles: ["Student"] },
    { label: "Grading & Evaluations", href: "/grading", icon: ClipboardList, roles: ["Teacher", "Admin"] },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck, roles: ["Admin"] },
    { label: "Settings", href: "/settings", icon: Settings, roles: ["Admin"] },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((r) => userRoles.includes(r));
  });

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen glass-panel border-r border-[var(--border-subtle)] flex flex-col justify-between transition-all duration-300 z-40 select-none",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]/60">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/20 shrink-0">
              P
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
                  PaperPulse
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Academic Platform
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {filteredNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <IconComponent
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                  )}
                />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Collapse Toggle */}
      <div className="p-3 border-t border-[var(--border-subtle)]/60">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-semibold cursor-pointer"
        >
          {isSidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
