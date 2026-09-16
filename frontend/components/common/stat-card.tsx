import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  isHero?: boolean;
}

export function StatCard({
  title,
  value,
  subtext,
  icon,
  trend,
  className,
  isHero = false,
}: StatCardProps) {
  return (
    <Card className={cn("p-4 sm:p-5 flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {title}
        </span>
        {icon && (
          <span className="text-slate-400 dark:text-slate-500 shrink-0">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div
          className={cn(
            "font-bold tracking-tight text-[var(--text-primary)] font-mono font-mono-numeric",
            isHero ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          )}
        >
          {value}
        </div>

        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium font-mono border",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-rose-50 text-rose-700 border-rose-200/60"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          {subtext}
        </p>
      )}
    </Card>
  );
}
