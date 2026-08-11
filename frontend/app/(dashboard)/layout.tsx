"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/providers/auth-guard";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] relative">
        {/* Sidebar Navigation — handles its own mobile/desktop visibility internally */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>

        {/* Sonner Toast Notifications Integration */}
        <Toaster position="top-right" richColors />
      </div>
    </AuthGuard>
  );
}
