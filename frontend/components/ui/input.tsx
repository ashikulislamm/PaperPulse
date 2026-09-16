import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold tracking-normal text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--border-focused)] focus-visible:ring-1 focus-visible:ring-[var(--border-focused)] disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-medium text-[var(--color-danger)]">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
