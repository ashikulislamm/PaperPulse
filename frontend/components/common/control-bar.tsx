"use client";

import * as React from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ControlBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  statusFilters?: string[];
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  children?: React.ReactNode;
  className?: string;
}

export function ControlBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilters,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  children,
  className,
}: ControlBarProps) {
  return (
    <Card className={cn("p-3 flex flex-col md:flex-row md:items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-3 flex-1">
        {onSearchChange !== undefined && (
          <div className="relative w-full md:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:ring-1 focus-visible:ring-indigo-600"
            />
          </div>
        )}

        {statusFilters && statusFilters.length > 0 && onStatusChange && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                  selectedStatus === status
                    ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {children}

        {onViewModeChange && viewMode && (
          <div className="flex items-center rounded-md border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              )}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
