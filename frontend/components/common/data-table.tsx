"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No records found.",
  onSort,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !column.accessorKey) return;
    const isSameKey = sortKey === column.accessorKey;
    const newDir = isSameKey && sortDir === "asc" ? "desc" : "asc";
    setSortKey(column.accessorKey);
    setSortDir(newDir);
    if (onSort) {
      onSort(column.accessorKey, newDir);
    }
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] glass-panel shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--text-primary)]">
          <thead className="bg-slate-100/70 border-b border-[var(--border-subtle)] text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col)}
                  className={cn(
                    "px-4 py-3.5",
                    col.sortable && "cursor-pointer hover:text-indigo-600 transition-colors",
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortKey === col.accessorKey ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]/60 bg-white/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-4">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100/80 flex items-center justify-center text-slate-400">
                      <FolderOpen className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-indigo-50/30 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn("px-4 py-3.5 text-sm", col.className)}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
