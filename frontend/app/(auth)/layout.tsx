import * as React from "react";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-4 sm:p-6">
      {/* Main Auth Container */}
      <div className="w-full max-w-sm space-y-6">
        {/* Clean Monochrome Brand Header */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="h-9 w-9 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-base">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            PaperPulse
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Academic Operations &amp; Assignment Platform
          </span>
        </div>

        {children}
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
