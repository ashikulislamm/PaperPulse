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
  ClipboardList,
  Bell,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Award,
  GraduationCap,
  X,
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
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const userRoles = user?.roles || ["Student"];
  const isStudent = userRoles.includes("Student") && !userRoles.includes("Teacher") && !userRoles.includes("Admin");

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "User Management", href: "/users", icon: Users, roles: ["Admin"] },
    { label: "Classes & Subjects", href: "/academic", icon: GraduationCap, roles: ["Admin"] },
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

  const sidebarContent = (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between transition-all duration-200 z-40 select-none",
        isSidebarOpen ? "w-60" : "w-16"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-[var(--border-subtle)]">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs shrink-0">
              P
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold tracking-tight text-[var(--text-primary)]">
                  PaperPulse
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Workspace
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 md:hidden cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {filteredNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md font-medium text-xs transition-colors group cursor-pointer",
                  isActive
                    ? "bg-[var(--color-primary)] text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <IconComponent
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                  )}
                />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Collapse Toggle (desktop only) */}
      <div className="p-2 border-t border-[var(--border-subtle)]">
        <button
          onClick={toggleSidebar}
          className="w-full hidden md:flex items-center justify-center gap-2 p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-medium cursor-pointer"
        >
          {isSidebarOpen ? (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative h-full w-60 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Mobile trigger — exposed via Navbar's hamburger button */}
      <MobileSidebarTrigger onOpen={() => setIsMobileOpen(true)} />
    </>
  );
}

function MobileSidebarTrigger({ onOpen }: { onOpen: () => void }) {
  React.useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener("open-mobile-sidebar", handler);
    return () => window.removeEventListener("open-mobile-sidebar", handler);
  }, [onOpen]);

  return null;
}
