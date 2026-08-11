"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuditLogDetailModal } from "@/components/audit-logs/audit-log-detail-modal";
import { PageBanner } from "@/components/common/page-banner";
import {
  Shield,
  Search,
  Eye,
  Clock,
  Globe,
  AlertTriangle,
  Filter,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  action: string;
  entityName: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface PagedAuditLogResponse {
  items: AuditLogItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const ACTION_FILTERS = [
  "All",
  "UserLogin",
  "UserLoginFailed",
  "UserCreated",
  "UserDeleted",
  "UserBanned",
  "UserActivated",
  "UserDeactivated",
  "PasswordChanged",
  "RolesAssigned",
  "AssignmentCreated",
  "AssignmentUpdated",
  "AssignmentPublished",
  "SubmissionCreated",
  "SubmissionGraded",
];

const SECURITY_ACTIONS = [
  "UserLogin",
  "UserLoginFailed",
  "PasswordChanged",
  "UserBanned",
  "UserActivated",
  "UserDeactivated",
  "RolesAssigned",
  "UserCreated",
  "UserDeleted",
];

function actionBadgeVariant(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("login") && !lower.includes("failed")) return "success" as const;
  if (lower.includes("failed") || lower.includes("delete") || lower.includes("ban")) return "danger" as const;
  if (lower.includes("update") || lower.includes("change") || lower.includes("assign") || lower.includes("publish")) return "warning" as const;
  if (lower.includes("created")) return "info" as const;
  return "default" as const;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AuditLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [activeTab, setActiveTab] = React.useState<"all" | "security">(
    (searchParams.get("tab") as "all" | "security") || "all"
  );
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedAction, setSelectedAction] = React.useState<string>("All");
  const [entityFilter, setEntityFilter] = React.useState(searchParams.get("entity") || "");
  const [userIdFilter, setUserIdFilter] = React.useState(searchParams.get("userId") || "");
  const [startDate, setStartDate] = React.useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = React.useState(searchParams.get("endDate") || "");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch audit logs
  const isSecurityTab = activeTab === "security";

  const { data, isLoading } = useQuery({
    queryKey: isSecurityTab
      ? queryKeys.auditLogs.security()
      : queryKeys.auditLogs.all({
          search: debouncedSearch,
          action: selectedAction === "All" ? undefined : selectedAction,
          entityName: entityFilter || undefined,
          userId: userIdFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          pageNumber,
          pageSize,
        }),
    queryFn: async () => {
      if (isSecurityTab) {
        const response = await apiClient.get("/audit-logs/security", {
          params: { pageNumber, pageSize },
        });
        return response.data?.data as PagedAuditLogResponse;
      }

      const params: Record<string, unknown> = { pageNumber, pageSize };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedAction !== "All") params.action = selectedAction;
      if (entityFilter) params.entityName = entityFilter;
      if (userIdFilter) params.userId = userIdFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get("/audit-logs", { params });
      return response.data?.data as PagedAuditLogResponse;
    },
  });

  const handleViewDetail = (logId: string) => {
    setSelectedLogId(logId);
    setDetailModalOpen(true);
  };

  const columns: Column<AuditLogItem>[] = [
    {
      header: "Timestamp",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-[var(--text-primary)]">
              {new Date(row.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {new Date(row.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "User",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {row.userName || "System"}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">
            {row.userEmail || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Badge variant={actionBadgeVariant(row.action)}>
          {row.action}
        </Badge>
      ),
    },
    {
      header: "Entity",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {row.entityName}
          </span>
          {row.entityId && (
            <span className="text-[10px] font-mono text-[var(--text-secondary)] truncate max-w-[120px]">
              {row.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "IP Address",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-slate-400" />
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            {row.ipAddress || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "",
      cell: (row) => (
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 h-7 px-2"
          onClick={() => handleViewDetail(row.id)}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Banner */}
      <PageBanner
        badge="Audit"
        heading="Audit Logs"
        description="Monitor system activity, track changes, and review security events."
        icon={<Shield className="h-5 w-5" />}
        actions={
          userIdFilter ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUserIdFilter("");
                router.replace("/audit-logs");
              }}
              className="gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              ✕ Clear User Filter
            </Button>
          ) : undefined
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Events"
          value={data?.totalCount || 0}
          accentColor="indigo"
          icon={<Shield className="h-5 w-5" />}
        />
        <StatCard
          title="Security Events"
          value={isSecurityTab ? data?.totalCount || 0 : "—"}
          accentColor="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Unique Users"
          value={
            data?.items
              ? new Set(data.items.map((i) => i.userId).filter(Boolean)).size
              : 0
          }
          accentColor="emerald"
          icon={<Globe className="h-5 w-5" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 w-fit">
        {(["all", "security"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setPageNumber(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "all" ? "All Logs" : "Security Events"}
          </button>
        ))}
      </div>

      {/* Filter & Table */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-4">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Search by action, entity, or user..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                />
              </div>
              {(search || selectedAction !== "All" || entityFilter || userIdFilter || startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedAction("All");
                    setEntityFilter("");
                    setUserIdFilter("");
                    setStartDate("");
                    setEndDate("");
                    setPageNumber(1);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 self-start sm:self-auto"
                >
                  Reset Filters
                </Button>
              )}
            </div>

            {/* Filters Row (only for All tab) */}
            {!isSecurityTab && (
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[var(--border-subtle)]">
                {/* Action Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Action:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 max-w-[500px] overflow-x-auto">
                    {ACTION_FILTERS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => {
                          setSelectedAction(action);
                          setPageNumber(1);
                        }}
                        className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[40px] ${
                          selectedAction === action
                            ? "bg-white text-indigo-600 shadow-xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {action === "All" ? "All" : action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* Entity & Date Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    placeholder="Entity name..."
                    value={entityFilter}
                    onChange={(e) => {
                      setEntityFilter(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-36 h-10 text-xs"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPageNumber(1);
                      }}
                      className="h-10 px-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-white/80 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPageNumber(1);
                      }}
                      className="h-10 px-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-white/80 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Indicator */}
            {userIdFilter && (
              <div className="flex items-center gap-2 pt-2">
                <Filter className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600">
                  Filtered by User ID: {userIdFilter}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <div className="p-6 pt-0 space-y-4">
          <DataTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            emptyMessage={
              isSecurityTab
                ? "No security events found."
                : userIdFilter
                ? "No audit logs found for this user."
                : "No audit logs found."
            }
          />

          <PaginationControl
            currentPage={data?.pageNumber || pageNumber}
            totalPages={data?.totalPages || 1}
            totalItems={data?.totalCount || 0}
            pageSize={pageSize}
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <AuditLogDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLogId(null);
        }}
        logId={selectedLogId}
      />
    </div>
  );
}
