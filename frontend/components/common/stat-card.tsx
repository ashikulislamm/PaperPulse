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
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "sky";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = "indigo",
  className,
}: StatCardProps) {
  const accentGradients = {
    indigo: "from-indigo-500/10 to-indigo-500/0 text-indigo-600 border-indigo-200/60",
    emerald: "from-emerald-500/10 to-emerald-500/0 text-emerald-600 border-emerald-200/60",
    amber: "from-amber-500/10 to-amber-500/0 text-amber-600 border-amber-200/60",
    rose: "from-rose-500/10 to-rose-500/0 text-rose-600 border-rose-200/60",
    sky: "from-sky-500/10 to-sky-500/0 text-sky-600 border-sky-200/60",
  };

  return (
    <Card className={cn("p-4 md:p-6 relative overflow-hidden glass-card", className)}>
      {/* Accent Gradient Blur */}
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br blur-2xl pointer-events-none -z-10", accentGradients[accentColor])} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {title}
        </span>
        {icon && (
          <div className={cn("h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border shrink-0", accentGradients[accentColor])}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono font-mono-numeric">
          {value}
        </div>

        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold font-mono",
              trend.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          {subtext}
        </p>
      )}
    </Card>
  );
}
