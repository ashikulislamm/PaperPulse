"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Clock,
  Trash2,
  Bell,
  PlayCircle,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

interface JobStatus {
  lastRunAt: string | null;
  lastResult: number | null;
  isRunning: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes("Admin");

  const [jobStatuses, setJobStatuses] = React.useState<Record<string, JobStatus>>({
    "auto-close-assignments": { lastRunAt: null, lastResult: null, isRunning: false },
    "cleanup-tokens": { lastRunAt: null, lastResult: null, isRunning: false },
    "cleanup-notifications": { lastRunAt: null, lastResult: null, isRunning: false },
  });

  const updateJobStatus = (jobKey: string, updates: Partial<JobStatus>) => {
    setJobStatuses((prev) => ({
      ...prev,
      [jobKey]: { ...prev[jobKey], ...updates },
    }));
  };

  // Auto-close assignments mutation
  const autoCloseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/system/jobs/auto-close-assignments");
      return response.data?.data as number;
    },
    onMutate: () => {
      updateJobStatus("auto-close-assignments", { isRunning: true });
    },
    onSuccess: (count) => {
      updateJobStatus("auto-close-assignments", {
        lastRunAt: new Date().toISOString(),
        lastResult: count,
        isRunning: false,
      });
      toast.success(`Auto-closed ${count} expired assignment${count !== 1 ? "s" : ""}.`);
    },
    onError: () => {
      updateJobStatus("auto-close-assignments", { isRunning: false });
      toast.error("Failed to auto-close assignments.");
    },
  });

  // Cleanup tokens mutation
  const cleanupTokensMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/system/jobs/cleanup-tokens");
      return response.data?.data as number;
    },
    onMutate: () => {
      updateJobStatus("cleanup-tokens", { isRunning: true });
    },
    onSuccess: (count) => {
      updateJobStatus("cleanup-tokens", {
        lastRunAt: new Date().toISOString(),
        lastResult: count,
        isRunning: false,
      });
      toast.success(`Cleaned up ${count} expired refresh token${count !== 1 ? "s" : ""}.`);
    },
    onError: () => {
      updateJobStatus("cleanup-tokens", { isRunning: false });
      toast.error("Failed to cleanup refresh tokens.");
    },
  });

  // Cleanup notifications mutation
  const cleanupNotificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/system/jobs/cleanup-notifications", null, {
        params: { retentionDays: 30 },
      });
      return response.data?.data as number;
    },
    onMutate: () => {
      updateJobStatus("cleanup-notifications", { isRunning: true });
    },
    onSuccess: (count) => {
      updateJobStatus("cleanup-notifications", {
        lastRunAt: new Date().toISOString(),
        lastResult: count,
        isRunning: false,
      });
      toast.success(`Cleaned up ${count} old notification${count !== 1 ? "s" : ""}.`);
    },
    onError: () => {
      updateJobStatus("cleanup-notifications", { isRunning: false });
      toast.error("Failed to cleanup notifications.");
    },
  });

  // Redirect non-admins
  React.useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  const jobs = [
    {
      key: "auto-close-assignments",
      title: "Auto-Close Expired Assignments",
      description:
        "Automatically closes all published assignments whose due date has passed. This prevents students from submitting work after the deadline.",
      icon: <Clock className="h-6 w-6" />,
      accentColor: "indigo" as const,
      mutation: autoCloseMutation,
      permission: "Closes published assignments past their due date",
    },
    {
      key: "cleanup-tokens",
      title: "Cleanup Expired Refresh Tokens",
      description:
        "Removes expired and revoked refresh tokens from the database. This helps maintain security and reduces storage overhead.",
      icon: <Trash2 className="h-6 w-6" />,
      accentColor: "amber" as const,
      mutation: cleanupTokensMutation,
      permission: "Purges expired and revoked refresh tokens",
    },
    {
      key: "cleanup-notifications",
      title: "Cleanup Old Notifications",
      description:
        "Removes read notifications older than 30 days. Unread notifications are never deleted. This keeps the notification system performant.",
      icon: <Bell className="h-6 w-6" />,
      accentColor: "emerald" as const,
      mutation: cleanupNotificationsMutation,
      permission: "Purges read notifications older than 30 days",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage system jobs, perform maintenance tasks, and configure platform settings.
          </p>
        </div>
        <Badge variant="primary" className="gap-1.5 w-fit">
          <ShieldAlert className="h-3.5 w-3.5" /> Admin Only
        </Badge>
      </div>

      {/* System Jobs Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            System Jobs
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manually trigger background maintenance jobs. These jobs also run automatically on schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const status = jobStatuses[job.key];
            const isRunning = job.mutation.isPending;
            const lastRunAt = status?.lastRunAt;
            const lastResult = status?.lastResult;

            return (
              <Card key={job.key} className="glass-card flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2.5 rounded-xl ${
                        job.accentColor === "indigo"
                          ? "bg-indigo-100/70 text-indigo-600"
                          : job.accentColor === "amber"
                          ? "bg-amber-100/70 text-amber-600"
                          : "bg-emerald-100/70 text-emerald-600"
                      }`}
                    >
                      {job.icon}
                    </div>
                    {isRunning && (
                      <Badge variant="warning" className="gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        Running...
                      </Badge>
                    )}
                    {!isRunning && lastResult !== null && (
                      <Badge variant="success" className="gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3">{job.title}</CardTitle>
                  <CardDescription>{job.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  {/* Last Run Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Last Run</span>
                      <span className="font-mono font-semibold text-[var(--text-primary)]">
                        {lastRunAt
                          ? new Date(lastRunAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Items Processed</span>
                      <span className="font-mono font-semibold text-[var(--text-primary)]">
                        {lastResult !== null ? lastResult : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Action</span>
                      <span className="text-[var(--text-primary)]">{job.permission}</span>
                    </div>
                  </div>

                  {/* Run Now Button */}
                  <Button
                    variant={isRunning ? "secondary" : "primary"}
                    className="w-full gap-2"
                    isLoading={isRunning}
                    disabled={isRunning}
                    onClick={() => job.mutation.mutate()}
                  >
                    {!isRunning && <PlayCircle className="h-4 w-4" />}
                    {isRunning ? "Processing..." : "Run Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Information Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              System jobs are idempotent — running them multiple times is safe and will not cause duplicate processing.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              Auto-close assignments only affects published assignments with past due dates. Already closed or archived assignments are unaffected.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              Token cleanup removes expired tokens and tokens revoked more than 7 days ago. Active tokens are never deleted.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              Notification cleanup only removes read notifications older than 30 days. Unread notifications are preserved.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
