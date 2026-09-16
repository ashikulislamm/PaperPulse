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
    <div className={cn("w-full overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col)}
                  className={cn(
                    "px-3.5 py-2.5",
                    col.sortable && "cursor-pointer hover:text-indigo-600 transition-colors",
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400 text-[10px]">
                        {sortKey === col.accessorKey ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-3">
                      <Skeleton className="h-3.5 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-[var(--text-muted)]">
                    <FolderOpen className="h-5 w-5" />
                    <p className="text-xs">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn("px-3.5 py-3", col.className)}>
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
