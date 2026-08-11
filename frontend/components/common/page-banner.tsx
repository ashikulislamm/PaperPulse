"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageBannerProps {
  badge: string;
  heading: string;
  description: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageBanner({
  badge,
  heading,
  description,
  icon,
  actions,
  className,
}: PageBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden",
        className
      )}
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-white/10 text-indigo-300 backdrop-blur-md">
            {icon}
          </span>
          <Badge
            variant="primary"
            className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30"
          >
            {badge}
          </Badge>
        </div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
          {heading}
        </h1>
        <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
