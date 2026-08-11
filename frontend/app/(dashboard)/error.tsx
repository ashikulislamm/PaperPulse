"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertOctagon, RotateCcw, LayoutDashboard } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard Error Boundary:", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Card className="glass-card p-8 border border-rose-200/80 shadow-2xl space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Something Went Wrong
            </h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              An unexpected error occurred in the dashboard. Please try again or return to the main view.
            </p>
          </div>

          {error?.message && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-left font-mono text-[11px] text-rose-800 break-words max-h-32 overflow-y-auto">
              {error.message}
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-2">
            <Button variant="primary" size="lg" className="w-full gap-2" onClick={() => reset()}>
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
