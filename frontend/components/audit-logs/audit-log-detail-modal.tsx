"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogDetail {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string | null;
}

function parseJsonOrNull(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function actionBadgeVariant(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("login") || lower.includes("created")) return "success" as const;
  if (lower.includes("delete") || lower.includes("ban") || lower.includes("failed")) return "danger" as const;
  if (lower.includes("update") || lower.includes("change") || lower.includes("assign")) return "warning" as const;
  return "default" as const;
}

function JsonDiffView({ oldValues, newValues }: { oldValues: string | null; newValues: string | null }) {
  const oldObj = parseJsonOrNull(oldValues);
  const newObj = parseJsonOrNull(newValues);

  if (!oldObj && !newObj) {
    return (
      <p className="text-xs text-[var(--text-secondary)] italic">No state changes recorded.</p>
    );
  }

  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]);

  if (allKeys.size === 0) {
    return (
      <p className="text-xs text-[var(--text-secondary)] italic">No state changes recorded.</p>
    );
  }

  return (
    <div className="space-y-1">
      {Array.from(allKeys).map((key) => {
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];
        const oldStr = oldVal === undefined ? "—" : typeof oldVal === "object" ? JSON.stringify(oldVal) : String(oldVal);
        const newStr = newVal === undefined ? "—" : typeof newVal === "object" ? JSON.stringify(newVal) : String(newVal);
        const isChanged = oldStr !== newStr;

        return (
          <div
            key={key}
            className={`flex items-start gap-3 px-3 py-2 rounded-lg text-xs ${
              isChanged ? "bg-amber-50/60 border border-amber-200/50" : "bg-slate-50/60 border border-slate-200/40"
            }`}
          >
            <span className="font-mono font-semibold text-slate-700 min-w-[120px] shrink-0 pt-0.5">
              {key}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="font-mono text-rose-600 line-through truncate max-w-[200px]" title={oldStr}>
                {oldStr}
              </span>
              <span className="text-slate-400 shrink-0">→</span>
              <span className="font-mono text-emerald-700 truncate max-w-[200px]" title={newStr}>
                {newStr}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AuditLogDetailModal({ isOpen, onClose, logId }: AuditLogDetailModalProps) {
  const { data: detail, isLoading } = useQuery({
    queryKey: queryKeys.auditLogs.detail(logId || ""),
    queryFn: async () => {
      const response = await apiClient.get(`/audit-logs/${logId}`);
      return response.data?.data as AuditLogDetail;
    },
    enabled: isOpen && !!logId,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log Detail"
      description={detail ? `${detail.action} on ${detail.entityName}` : "Loading..."}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : detail ? (
        <div className="space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Action
              </span>
              <Badge variant={actionBadgeVariant(detail.action)}>{detail.action}</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Entity
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{detail.entityName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                User
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{detail.userName}</p>
              <p className="text-xs font-mono text-[var(--text-secondary)]">{detail.userEmail}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Timestamp
              </span>
              <p className="text-sm font-mono text-[var(--text-primary)]">
                {new Date(detail.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                IP Address
              </span>
              <p className="text-sm font-mono text-[var(--text-primary)]">
                {detail.ipAddress || "N/A"}
              </p>
            </div>
            {detail.entityId && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Entity ID
                </span>
                <p className="text-xs font-mono text-[var(--text-primary)] truncate">{detail.entityId}</p>
              </div>
            )}
          </div>

          {/* User Agent */}
          {detail.userAgent && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                User Agent
              </span>
              <p className="text-xs font-mono text-[var(--text-secondary)] break-all">{detail.userAgent}</p>
            </div>
          )}

          {/* JSON Diff */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              State Changes
            </span>
            <div className="border border-[var(--border-subtle)] rounded-xl p-3 bg-white/60">
              <JsonDiffView oldValues={detail.oldValues} newValues={detail.newValues} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Audit log not found.</p>
      )}
    </Modal>
  );
}
