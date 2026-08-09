import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface ScoreIndicatorProps {
  scoreObtained?: number | null;
  maxMarks: number;
  passMarks?: number | null;
  isPassed?: boolean | null;
  showBar?: boolean;
  className?: string;
}

export function ScoreIndicator({
  scoreObtained,
  maxMarks,
  passMarks,
  isPassed,
  showBar = true,
  className,
}: ScoreIndicatorProps) {
  if (scoreObtained === null || scoreObtained === undefined) {
    return (
      <span className="text-xs text-[var(--text-muted)] italic font-mono">
        Not Graded
      </span>
    );
  }

  const percentage = Math.min(100, Math.max(0, Math.round((scoreObtained / maxMarks) * 100)));
  const passed = isPassed !== null && isPassed !== undefined 
    ? isPassed 
    : passMarks !== null && passMarks !== undefined 
      ? scoreObtained >= passMarks 
      : percentage >= 50;

  return (
    <div className={cn("flex flex-col gap-1.5 min-w-[140px]", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1 font-mono font-mono-numeric">
          <span className="text-base font-bold text-[var(--text-primary)]">
            {scoreObtained}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            / {maxMarks}
          </span>
          <span className="text-xs font-semibold text-slate-500 ml-1">
            ({percentage}%)
          </span>
        </div>
        <Badge variant={passed ? "success" : "danger"} dot>
          {passed ? "Passed" : "Failed"}
        </Badge>
      </div>

      {showBar && (
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              passed
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-rose-500 to-amber-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
