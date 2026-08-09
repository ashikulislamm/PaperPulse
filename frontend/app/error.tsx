"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertOctagon, RotateCcw, LayoutDashboard } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

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
              An unexpected application runtime error occurred. Please try again or return to the dashboard.
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
