"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/api/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Sync store with localStorage on client mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("paperpulse-auth-storage");
      console.log("🛡️ [AuthGuard] Initializing client hydration. localStorage key present:", !!stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token && parsed?.state?.user) {
            console.log("🛡️ [AuthGuard] Hydrating state from localStorage for user:", parsed.state.user.email);
            useAuthStore.getState().setAuth(
              parsed.state.user,
              parsed.state.token,
              parsed.state.refreshToken || ""
            );
          } else {
            console.warn("🛡️ [AuthGuard] Stored data in localStorage has missing token or user.");
          }
        } catch (e) {
          console.error("🛡️ [AuthGuard] Failed parsing localStorage JSON:", e);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (isHydrated) {
      const currentToken = useAuthStore.getState().token;
      console.log(`🛡️ [AuthGuard] Checking route protection for path: [${pathname}]. Token present:`, !!currentToken);
      if (!currentToken && !pathname.includes("/login") && !pathname.includes("/register")) {
        console.warn(`🛡️ [AuthGuard] No valid token found for protected path [${pathname}]. Redirecting to /login`);
        router.push("/login");
      }
    }
  }, [isHydrated, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] text-slate-500 font-medium text-xs">
        <div className="flex items-center gap-3 p-4 rounded-xl glass-card border border-slate-200 shadow-sm">
          <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span>Verifying session security...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
