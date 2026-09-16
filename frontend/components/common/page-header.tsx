"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  heading: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  heading,
  description,
  badge,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-[var(--text-secondary)] shrink-0">
              {icon}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {heading}
          </h1>
          {badge && (
            <Badge variant="primary">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
