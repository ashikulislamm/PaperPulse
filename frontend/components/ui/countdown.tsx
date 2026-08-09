"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CountdownWidgetProps {
  dueDate: string | Date;
  className?: string;
  showLabels?: boolean;
}

export function CountdownWidget({
  dueDate,
  className,
  showLabels = true,
}: CountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
    totalHours: 0,
  });

  React.useEffect(() => {
    const calculateTime = () => {
      const target = new Date(dueDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOverdue: true,
          totalHours: 0,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const totalHours = difference / (1000 * 60 * 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isOverdue: false,
        totalHours,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [dueDate]);

  if (timeLeft.isOverdue) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold font-mono", className)}>
        <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
        <span>PASSED DUE DATE</span>
      </div>
    );
  }

  const isCritical = timeLeft.totalHours <= 24;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-mono-numeric transition-colors",
        isCritical
          ? "bg-amber-50/90 border-amber-300 text-amber-900 shadow-sm shadow-amber-500/10"
          : "bg-slate-50 border-slate-200 text-slate-700",
        className
      )}
    >
      {isCritical && (
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      )}
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <span>
            <strong className="font-bold text-sm">{String(timeLeft.days).padStart(2, "0")}</strong>
            {showLabels && <span className="text-[10px] text-slate-500 ml-0.5 mr-1">d</span>}
          </span>
        )}
        <span>
          <strong className="font-bold text-sm">{String(timeLeft.hours).padStart(2, "0")}</strong>
          {showLabels && <span className="text-[10px] text-slate-500 ml-0.5 mr-1">h</span>}
        </span>
        <span>:</span>
        <span>
          <strong className="font-bold text-sm">{String(timeLeft.minutes).padStart(2, "0")}</strong>
          {showLabels && <span className="text-[10px] text-slate-500 ml-0.5 mr-1">m</span>}
        </span>
        <span>:</span>
        <span>
          <strong className="font-bold text-sm">{String(timeLeft.seconds).padStart(2, "0")}</strong>
          {showLabels && <span className="text-[10px] text-slate-500 ml-0.5">s</span>}
        </span>
      </div>
    </div>
  );
}
