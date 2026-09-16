import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-normal select-none border transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        primary:
          "bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80",
        success:
          "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80",
        warning:
          "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80",
        danger:
          "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80",
        info:
          "bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80",
        draft:
          "bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        published:
          "bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80",
        closed:
          "bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        submitted:
          "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80",
        overdue:
          "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80",
        graded:
          "bg-purple-50 text-purple-700 border-purple-200/70 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success" || variant === "submitted"
              ? "bg-emerald-500"
              : variant === "warning" || variant === "draft"
              ? "bg-amber-500"
              : variant === "danger" || variant === "overdue"
              ? "bg-rose-500"
              : variant === "info"
              ? "bg-sky-500"
              : variant === "graded"
              ? "bg-purple-500"
              : "bg-indigo-500"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
