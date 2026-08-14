import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-800 border border-slate-200",
        primary:
          "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200/80",
        danger:
          "bg-rose-50 text-rose-700 border border-rose-200/80",
        info:
          "bg-sky-50 text-sky-700 border border-sky-200/80",
        draft:
          "bg-slate-100 text-slate-600 border border-slate-300/80",
        published:
          "bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium",
        closed:
          "bg-slate-200 text-slate-700 border border-slate-300",
        submitted:
          "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
        overdue:
          "bg-rose-50 text-rose-700 border border-rose-200/80",
        graded:
          "bg-purple-50 text-purple-700 border border-purple-200/80",
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
            "h-1.5 w-1.5 rounded-full",
            variant === "success" || variant === "submitted" ? "bg-emerald-500" :
            variant === "warning" || variant === "draft" ? "bg-amber-500" :
            variant === "danger" || variant === "overdue" ? "bg-rose-500" :
            variant === "info" ? "bg-sky-500" : "bg-indigo-500"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
