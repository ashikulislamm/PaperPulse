"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditLogDetailModal } from "@/components/audit-logs/audit-log-detail-modal";
import {
  Shield,
  Eye,
  Globe,
  AlertTriangle,
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
  "BanUser",
  "ActivateUser",
  "DeactivateUser",
  "PasswordChanged",
  "RolesAssigned",
  "AssignmentCreated",
  "AssignmentUpdated",
  "AssignmentPublished",
  "AssignmentClosed",
  "SubmissionCreated",
  "SubmissionGraded",
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

  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

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
        const res = response.data?.data || response.data;
        return res as PagedAuditLogResponse;
      }

      const params: Record<string, unknown> = { pageNumber, pageSize };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedAction !== "All") params.action = selectedAction;
      if (entityFilter) params.entityName = entityFilter;
      if (userIdFilter) params.userId = userIdFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get("/audit-logs", { params });
      const res = response.data?.data || response.data;
      return res as PagedAuditLogResponse;
    },
  });

  const handleViewDetail = (id: string) => {
    setSelectedLogId(id);
    setDetailModalOpen(true);
  };

  const columns: Column<AuditLogItem>[] = [
    {
      header: "Timestamp",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {timeAgo(row.createdAt)}
          </span>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            {new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      cell: (row) => (
        <Badge variant={actionBadgeVariant(row.action)} dot>
          {row.action}
        </Badge>
      ),
    },
    {
      header: "Actor",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--text-primary)]">
            {row.userName || "System"}
          </span>
          {row.userEmail && (
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {row.userEmail}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Entity",
      cell: (row) => (
        <span className="font-medium text-[var(--text-secondary)]">
          {row.entityName || "—"}
        </span>
      ),
    },
    {
      header: "Network IP",
      cell: (row) => (
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {row.ipAddress || "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <Button
          size="sm"
          variant="ghost"
          className="gap-1 h-7 px-2 text-xs"
          onClick={() => handleViewDetail(row.id)}
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Audit &amp; Security Logs"
        description="Inspect authenticated user activity, track data mutations, and monitor security events."
        badge="Audit"
        icon={<Shield className="h-4 w-4" />}
        actions={
          userIdFilter ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUserIdFilter("");
                router.replace("/audit-logs");
              }}
              className="text-xs"
            >
              Clear User Filter
            </Button>
          ) : undefined
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Events Recorded"
          value={data?.totalCount || 0}
          subtext="Indexed security & data operations"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          title="Security Events"
          value={isSecurityTab ? data?.totalCount || 0 : "Active"}
          subtext="Login attempts & access changes"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="Distinct Actors"
          value={
            data?.items
              ? new Set(data.items.map((i) => i.userId).filter(Boolean)).size
              : 0
          }
          subtext="Active operators in period"
          icon={<Globe className="h-4 w-4" />}
        />
      </div>

      {/* Control Bar with Tabs */}
      <ControlBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search action, entity, or actor..."
      >
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={activeTab === "all" ? "primary" : "ghost"}
            onClick={() => {
              setActiveTab("all");
              setPageNumber(1);
            }}
          >
            All Logs
          </Button>
          <Button
            size="sm"
            variant={activeTab === "security" ? "primary" : "ghost"}
            onClick={() => {
              setActiveTab("security");
              setPageNumber(1);
            }}
          >
            Security Events
          </Button>
        </div>
      </ControlBar>

      {/* Action Filters Bar (if on All tab) */}
      {!isSecurityTab && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0">Action:</span>
          {ACTION_FILTERS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                setSelectedAction(action);
                setPageNumber(1);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedAction === action
                  ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Table & Pagination */}
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyMessage="No audit logs recorded for this criteria."
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

      {/* Audit Log Detail Modal */}
      {selectedLogId && (
        <AuditLogDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedLogId(null);
          }}
          logId={selectedLogId}
        />
      )}
    </div>
  );
}
