"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/api/auth-store";
import { Tooltip } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  GraduationCap,
  Bell,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users, roles: ["Admin"] },
  { label: "Assignments", href: "/assignments", icon: BookOpen },
  { label: "Submissions", href: "/submissions", icon: Upload, roles: ["Teacher", "Student"] },
  { label: "Grading", href: "/grading", icon: GraduationCap, roles: ["Teacher", "Admin"] },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck, roles: ["Admin"] },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isSidebarOpen, toggleSidebar } = useAuthStore();

  const userRoles = user?.roles || ["Student"];

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
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Academic Platform
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-lg border border-[var(--border-subtle)] bg-white/80 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {filteredNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-[var(--text-secondary)] hover:bg-slate-100/80 hover:text-[var(--text-primary)]"
                )}
              >
                <IconComponent className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );

            return !isSidebarOpen ? (
              <Tooltip key={item.href} content={item.label} position="right">
                {linkContent}
              </Tooltip>
            ) : (
              linkContent
            );
          })}
        </nav>
      </div>

      {/* User Role Badge Footer */}
      {isSidebarOpen && user && (
        <div className="p-4 border-t border-[var(--border-subtle)]/60 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Logged in as <strong className="text-[var(--text-primary)]">{userRoles.join(", ")}</strong>
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
