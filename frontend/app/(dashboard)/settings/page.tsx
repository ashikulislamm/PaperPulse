"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/api/auth-store";
import { useSettingsStore } from "@/lib/api/settings-store";
import { apiClient } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageBanner } from "@/components/common/page-banner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Settings,
  ShieldCheck,
  BookOpen,
  Bell,
  Activity,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Timer,
  PlayCircle,
  Server,
  Database,
  Lock,
  FileCheck,
  AlertTriangle,
  Megaphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface HealthCheckResult {
  canConnectDb: boolean;
  dbLatencyMs?: number;
  status?: string;
  timestamp?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes("Admin");

  // Redirect non-admins
  React.useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  // Settings Zustand Store
  const {
    academic,
    security,
    notifications,
    updateAcademicSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    resetToDefaults,
  } = useSettingsStore();

  // Local Form States
  const [academicForm, setAcademicForm] = React.useState(academic);
  const [securityForm, setSecurityForm] = React.useState(security);
  const [notificationForm, setNotificationForm] = React.useState(notifications);

  // Sync state if store updates externally
  React.useEffect(() => {
    setAcademicForm(academic);
  }, [academic]);

  React.useEffect(() => {
    setSecurityForm(security);
  }, [security]);

  React.useEffect(() => {
    setNotificationForm(notifications);
  }, [notifications]);

  // Tab State
  const [activeTab, setActiveTab] = React.useState("academic");

  // Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);

  // Advanced Maintenance Drawer Accordion
  const [isMaintenanceOpen, setIsMaintenanceOpen] = React.useState(false);

  // System Health Query
  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
    isRefetching: isHealthRefetching,
  } = useQuery({
    queryKey: ["system", "health"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/health");
        return res.data?.data as HealthCheckResult;
      } catch (err: any) {
        return { canConnectDb: false } as HealthCheckResult;
      }
    },
    refetchInterval: 30000,
  });

  // Background Manual Job Mutations (Accessible in Advanced Diagnostics Drawer)
  const [jobResults, setJobResults] = React.useState<Record<string, string>>({});

  const autoCloseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/system/jobs/auto-close-assignments");
      return res.data?.data as number;
    },
    onSuccess: (count) => {
      setJobResults((prev) => ({ ...prev, "auto-close": `Closed ${count} assignments` }));
      toast.success(`Auto-closed ${count} expired assignments.`);
    },
    onError: () => toast.error("Failed to execute auto-close job."),
  });

  const cleanupTokensMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/system/jobs/cleanup-tokens");
      return res.data?.data as number;
    },
    onSuccess: (count) => {
      setJobResults((prev) => ({ ...prev, "cleanup-tokens": `Purged ${count} tokens` }));
      toast.success(`Purged ${count} expired refresh tokens.`);
    },
    onError: () => toast.error("Failed to execute token cleanup."),
  });

  const cleanupNotificationsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/system/jobs/cleanup-notifications", null, {
        params: { retentionDays: 30 },
      });
      return res.data?.data as number;
    },
    onSuccess: (count) => {
      setJobResults((prev) => ({ ...prev, "cleanup-notifications": `Purged ${count} notifications` }));
      toast.success(`Purged ${count} old read notifications.`);
    },
    onError: () => toast.error("Failed to execute notification cleanup."),
  });

  const deadlineRemindersMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/notifications/trigger-deadline-reminders", null, {
        params: { hoursThreshold: 24 },
      });
      return res.data?.data as number;
    },
    onSuccess: (count) => {
      setJobResults((prev) => ({ ...prev, "deadline-reminders": `Sent ${count} reminders` }));
      toast.success(`Sent ${count} deadline reminders to students.`);
    },
    onError: () => toast.error("Failed to send deadline reminders."),
  });

  // Save Handlers
  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcademicSettings(academicForm);
    toast.success("Academic & Submission policies updated!");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSecuritySettings(securityForm);
    toast.success("Security & Access policies updated!");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationSettings(notificationForm);
    toast.success("Notification & Announcement preferences updated!");
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setIsResetModalOpen(false);
    toast.success("All system settings restored to default values!");
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header Banner */}
      <PageBanner
        badge="Admin Controls"
        heading="System Settings & Governance"
        description="Configure academic submission rules, security controls, notification lead times, and monitor platform health."
        icon={<Settings className="h-5 w-5" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="gap-2 bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset Defaults
          </Button>
        }
      />

      {/* Top Quick Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DB Connection Status */}
        <Card className="p-4 glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Database Node</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">Supabase PostgreSQL</span>
            </div>
          </div>
          {isHealthLoading ? (
            <Badge variant="default" className="animate-pulse">Checking...</Badge>
          ) : healthData?.canConnectDb ? (
            <Badge variant="success" className="gap-1 font-bold">
              <CheckCircle2 className="h-3 w-3" /> Healthy
            </Badge>
          ) : (
            <Badge variant="danger" className="gap-1 font-bold">
              <XCircle className="h-3 w-3" /> Offline
            </Badge>
          )}
        </Card>

        {/* Storage Engine */}
        <Card className="p-4 glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Storage Engine</p>
            <p className="text-sm font-extrabold text-slate-900">Supabase Storage</p>
          </div>
          <Badge variant="primary" className="gap-1 font-bold">
            <FileCheck className="h-3 w-3" /> Active
          </Badge>
        </Card>

        {/* Security Policy */}
        <Card className="p-4 glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Security Guard</p>
            <p className="text-sm font-extrabold text-slate-900">JWT + Tokens</p>
          </div>
          <Badge variant="primary" className="gap-1 font-bold">
            <Lock className="h-3 w-3" /> Enforced
          </Badge>
        </Card>

        {/* Background Cron Workers */}
        <Card className="p-4 glass-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Background Jobs</p>
            <p className="text-sm font-extrabold text-slate-900">Auto-Scheduled</p>
          </div>
          <Badge variant="success" className="gap-1 font-bold">
            <Clock className="h-3 w-3" /> Active
          </Badge>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: "academic",
            label: "Academic & Submissions",
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            id: "security",
            label: "Security & Authentication",
            icon: <ShieldCheck className="h-4 w-4" />,
          },
          {
            id: "notifications",
            label: "Notifications & Alerts",
            icon: <Bell className="h-4 w-4" />,
          },
          {
            id: "health",
            label: "System Health & Maintenance",
            icon: <Activity className="h-4 w-4" />,
          },
        ]}
      />

      {/* Tab 1: Academic & Submission Rules */}
      {activeTab === "academic" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BookOpen className="h-5 w-5 text-indigo-600" /> Academic & Submission Rules
            </CardTitle>
            <CardDescription className="text-slate-600">
              Set global rules for student assignment submissions, file attachment size limits, and grading thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveAcademic} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    type="number"
                    label="Submission Grace Period (Minutes)"
                    value={academicForm.submissionGracePeriodMinutes}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({
                        ...prev,
                        submissionGracePeriodMinutes: parseInt(e.target.value) || 0,
                      }))
                    }
                    min={0}
                    max={120}
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Grace time allowed after due date before marking a submission as late.
                  </p>
                </div>

                <div>
                  <Input
                    type="number"
                    label="Late Submission Penalty (% per day)"
                    value={academicForm.lateSubmissionPenaltyPercent}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({
                        ...prev,
                        lateSubmissionPenaltyPercent: parseFloat(e.target.value) || 0,
                      }))
                    }
                    min={0}
                    max={50}
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Automated grade reduction applied for every 24 hours past deadline.
                  </p>
                </div>

                <div>
                  <Input
                    type="number"
                    label="Maximum File Upload Size (MB)"
                    value={academicForm.maxFileUploadSizeMB}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({
                        ...prev,
                        maxFileUploadSizeMB: parseInt(e.target.value) || 5,
                      }))
                    }
                    min={1}
                    max={100}
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Maximum size limit per student submission attachment file.
                  </p>
                </div>

                <div>
                  <Input
                    type="number"
                    label="Default Course Pass Percentage (%)"
                    value={academicForm.defaultPassPercentage}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({
                        ...prev,
                        defaultPassPercentage: parseInt(e.target.value) || 40,
                      }))
                    }
                    min={1}
                    max={100}
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Standard passing percentage threshold across courses.
                  </p>
                </div>
              </div>

              <div>
                <Input
                  label="Allowed Attachment File Extensions"
                  value={academicForm.allowedFileExtensions}
                  onChange={(e) =>
                    setAcademicForm((prev) => ({
                      ...prev,
                      allowedFileExtensions: e.target.value,
                    }))
                  }
                  placeholder=".pdf, .docx, .zip, .png, .jpg"
                />
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Comma-separated list of permitted file formats for assignment attachments.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button type="submit" variant="primary" className="gap-2 font-bold">
                  <Save className="h-4 w-4" /> Save Academic Rules
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Security & Authentication */}
      {activeTab === "security" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-5 w-5 text-amber-600" /> Security & Authentication Policies
            </CardTitle>
            <CardDescription className="text-slate-600">
              Manage session tokens, user onboarding policies, and login security controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    type="number"
                    label="Refresh Token Lifespan (Days)"
                    value={securityForm.refreshTokenValidityDays}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        refreshTokenValidityDays: parseInt(e.target.value) || 7,
                      }))
                    }
                    min={1}
                    max={90}
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Number of days a user refresh token remains valid before requiring re-login.
                  </p>
                </div>

                <div>
                  <Input
                    type="number"
                    label="Max Failed Login Attempts"
                    value={securityForm.maxFailedLoginAttempts}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        maxFailedLoginAttempts: parseInt(e.target.value) || 5,
                      }))
                    }
                    min={3}
                    max={10}
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Failed password attempts before temporarily locking an account.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      Force Password Reset on First Login
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      Requires newly created users to set a custom password upon logging in.
                    </p>
                  </div>
                  <Switch
                    checked={securityForm.forcePasswordResetOnFirstLogin}
                    onCheckedChange={(checked) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        forcePasswordResetOnFirstLogin: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      Allow Student Self-Registration
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      When disabled, only Administrators can invite or create student accounts.
                    </p>
                  </div>
                  <Switch
                    checked={securityForm.allowSelfRegistration}
                    onCheckedChange={(checked) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        allowSelfRegistration: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button type="submit" variant="primary" className="gap-2 font-bold">
                  <Save className="h-4 w-4" /> Save Security Policies
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Notifications & Communication */}
      {activeTab === "notifications" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Bell className="h-5 w-5 text-sky-600" /> Notifications & Announcements
            </CardTitle>
            <CardDescription className="text-slate-600">
              Configure automated deadline reminder lead times and system broadcast messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div>
                <Input
                  type="number"
                  label="Deadline Reminder Lead Time (Hours)"
                  value={notificationForm.deadlineReminderLeadHours}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({
                      ...prev,
                      deadlineReminderLeadHours: parseInt(e.target.value) || 24,
                    }))
                  }
                  min={1}
                  max={72}
                />
                <p className="text-xs text-slate-500 font-medium mt-1">
                  How many hours prior to an assignment deadline to send automated student reminders.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      Enable Real-Time In-App Notifications
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      Delivers submission alerts, grade updates, and reminders in the app header.
                    </p>
                  </div>
                  <Switch
                    checked={notificationForm.enableInAppNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        enableInAppNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      Enable Email Notification Gateway
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      Dispatches email alerts for critical assignment milestones and account updates.
                    </p>
                  </div>
                  <Switch
                    checked={notificationForm.enableEmailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        enableEmailNotifications: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Textarea
                  label="System Broadcast Announcement (Optional)"
                  placeholder="Enter a system-wide banner message visible to all active users..."
                  value={notificationForm.systemAnnouncementBanner}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({
                      ...prev,
                      systemAnnouncementBanner: e.target.value,
                    }))
                  }
                  rows={3}
                />
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Leave empty to disable broadcast banner.
                </p>
              </div>

              {notificationForm.systemAnnouncementBanner.trim() && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
                  <Megaphone className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-indigo-900">
                      Live Preview Banner:
                    </p>
                    <p className="text-xs text-indigo-800 font-medium">
                      {notificationForm.systemAnnouncementBanner}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button type="submit" variant="primary" className="gap-2 font-bold">
                  <Save className="h-4 w-4" /> Save Notification Rules
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: System Health & Maintenance */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {/* Health Diagnostics Card */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Activity className="h-5 w-5 text-emerald-600" /> Live Backend System Diagnostics
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Real-time status of backend services, database connections, and operational health.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchHealth()}
                isLoading={isHealthRefetching}
                className="gap-2 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Refresh Health
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-3.5 hover:border-indigo-300 transition-colors">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">API Server Status</p>
                    <p className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Operational
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-3.5 hover:border-indigo-300 transition-colors">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Database Status</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {isHealthLoading
                        ? "Checking..."
                        : healthData?.canConnectDb
                        ? "Connected (Supabase)"
                        : "Disconnected"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-3.5 hover:border-indigo-300 transition-colors">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Last Checked</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scheduled Worker Overview */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" /> Automated Cron Schedules
                  </h4>
                  <Badge variant="success" className="font-bold">All Jobs Active</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-extrabold text-xs text-slate-900 block">Auto-Close Assignments</span>
                    <span className="text-[11px] text-slate-600 font-medium block">Runs every hour</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-extrabold text-xs text-slate-900 block">Refresh Token Purge</span>
                    <span className="text-[11px] text-slate-600 font-medium block">Runs daily at 00:00</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-extrabold text-xs text-slate-900 block">Notification Cleanup</span>
                    <span className="text-[11px] text-slate-600 font-medium block">Runs weekly</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-extrabold text-xs text-slate-900 block">Deadline Alerts</span>
                    <span className="text-[11px] text-slate-600 font-medium block">Runs hourly</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Diagnostics Drawer / Accordion */}
          <Card className="glass-card">
            <CardHeader
              className="cursor-pointer select-none flex flex-row items-center justify-between py-4"
              onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <CardTitle className="text-base text-slate-900">Advanced Diagnostics & Manual Triggers</CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Manually execute maintenance tasks for troubleshooting and administrative overrides.
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-600">
                {isMaintenanceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardHeader>

            {isMaintenanceOpen && (
              <CardContent className="pt-4 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job 1 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-3.5 hover:border-indigo-300 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-600" /> Auto-Close Expired Assignments
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        Immediately closes published assignments whose due dates have passed.
                      </p>
                    </div>
                    {jobResults["auto-close"] && (
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {jobResults["auto-close"]}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={autoCloseMutation.isPending}
                      onClick={() => autoCloseMutation.mutate()}
                      className="w-full gap-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-50"
                    >
                      <PlayCircle className="h-4 w-4" /> Execute Now
                    </Button>
                  </div>

                  {/* Job 2 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-3.5 hover:border-indigo-300 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-amber-600" /> Purge Expired Tokens
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        Removes stale refresh tokens from the database.
                      </p>
                    </div>
                    {jobResults["cleanup-tokens"] && (
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {jobResults["cleanup-tokens"]}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={cleanupTokensMutation.isPending}
                      onClick={() => cleanupTokensMutation.mutate()}
                      className="w-full gap-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-50"
                    >
                      <PlayCircle className="h-4 w-4" /> Execute Now
                    </Button>
                  </div>

                  {/* Job 3 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-3.5 hover:border-indigo-300 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600" /> Cleanup Read Notifications
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        Deletes read notifications older than 30 days.
                      </p>
                    </div>
                    {jobResults["cleanup-notifications"] && (
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {jobResults["cleanup-notifications"]}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={cleanupNotificationsMutation.isPending}
                      onClick={() => cleanupNotificationsMutation.mutate()}
                      className="w-full gap-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-50"
                    >
                      <PlayCircle className="h-4 w-4" /> Execute Now
                    </Button>
                  </div>

                  {/* Job 4 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-3.5 hover:border-indigo-300 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Timer className="h-4 w-4 text-sky-600" /> Trigger Deadline Reminders
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        Sends immediate notifications for assignments due within 24 hours.
                      </p>
                    </div>
                    {jobResults["deadline-reminders"] && (
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {jobResults["deadline-reminders"]}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={deadlineRemindersMutation.isPending}
                      onClick={() => deadlineRemindersMutation.mutate()}
                      className="w-full gap-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-50"
                    >
                      <PlayCircle className="h-4 w-4" /> Execute Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset System Settings?"
        description="Are you sure you want to reset all academic, security, and notification settings back to their original factory defaults? This action cannot be undone."
        confirmLabel="Reset Defaults"
        variant="danger"
      />
    </div>
  );
}
