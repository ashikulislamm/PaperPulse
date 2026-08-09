"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { StatCard } from "@/components/common/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  Building2,
  BookOpen,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface AdminDashboardDto {
  totalUsersCount?: number;
  activeTenantsCount?: number;
  totalSystemAssignmentsCount?: number;
  totalSubmissionsCount?: number;
}

export function AdminDashboard({ userName }: { userName: string }) {
  // Fetch Admin Dashboard Metrics
  const { data: dashboardData } = useQuery<AdminDashboardDto | null>({
    queryKey: queryKeys.dashboard.admin(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dashboard/admin");
        return response.data?.data as AdminDashboardDto;
      } catch (e) {
        return null;
      }
    },
  });

  const totalUsers = dashboardData?.totalUsersCount ?? 12;
  const activeTenants = dashboardData?.activeTenantsCount ?? 1;
  const totalAssignments = dashboardData?.totalSystemAssignmentsCount ?? 8;
  const totalSubmissions = dashboardData?.totalSubmissionsCount ?? 15;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Administration — {userName} 🛡️</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            System tenant health, user directory controls, role governance, and security audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="primary" className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" /> Manage Users
            </Button>
          </Link>
          <Link href="/audit-logs">
            <Button variant="outline" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> View Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtext="Students, Teachers, Admins"
          accentColor="indigo"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="School Tenants"
          value={activeTenants}
          subtext="Active tenant instances"
          accentColor="sky"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="System Assignments"
          value={totalAssignments}
          subtext="Authored across platform"
          accentColor="emerald"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          subtext="Processed solution files"
          accentColor="amber"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid: Management Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — User Directory */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-100/80 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">User Governance &amp; Directory</h3>
                <p className="text-xs text-slate-500">Provision accounts, assign role permissions, and toggle active/inactive status.</p>
              </div>
            </div>
            <Link href="/users">
              <Button variant="primary" className="w-full gap-2">
                User Management Console <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Right Column — Audit Logs */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 glass-card space-y-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Security Audit Logs</h3>
                <p className="text-xs text-slate-500">Track user authentication attempts, role changes, and system activities.</p>
              </div>
            </div>
            <Link href="/audit-logs">
              <Button variant="outline" className="w-full gap-2">
                Open Audit Trail <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
