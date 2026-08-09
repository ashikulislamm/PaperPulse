import * as React from "react";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden p-6">
      {/* Soft Ambient Background Blur Glows */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25">
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
            PaperPulse
          </span>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Multi-Tenant Academic Platform
          </span>
        </div>

        {children}
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
