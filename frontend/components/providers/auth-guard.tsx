"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

interface AuthMeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  permissions?: string[];
  mustChangePassword: boolean;
  tenantId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Step 1: Hydrate Zustand from localStorage on client mount (fast, instant UI)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("paperpulse-auth-storage");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token && parsed?.state?.user) {
            useAuthStore.getState().setAuth(
              parsed.state.user,
              parsed.state.token,
              parsed.state.refreshToken || ""
            );
          }
        } catch {
          // Corrupted storage — clear it
          localStorage.removeItem("paperpulse-auth-storage");
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Step 2: Validate session by calling GET /auth/me
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);

  const { data: meData, isError: meError } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data?.data as AuthMeResponse;
    },
    enabled: isHydrated && !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Step 3: If /auth/me succeeds, update store with fresh user data
  React.useEffect(() => {
    if (meData) {
      const currentUser = useAuthStore.getState().user;
      // Only update if data actually changed
      if (
        currentUser?.email !== meData.email ||
        currentUser?.firstName !== meData.firstName ||
        currentUser?.lastName !== meData.lastName ||
        currentUser?.status !== meData.status ||
        JSON.stringify(currentUser?.roles) !== JSON.stringify(meData.roles)
      ) {
        updateUser({
          email: meData.email,
          firstName: meData.firstName,
          lastName: meData.lastName,
          status: meData.status,
          roles: meData.roles,
          permissions: meData.permissions,
          mustChangePassword: meData.mustChangePassword,
          tenantId: meData.tenantId,
          phoneNumber: meData.phoneNumber,
          avatarUrl: meData.avatarUrl,
        });
      }
    }
  }, [meData, updateUser]);

  // Step 4: If /auth/me fails (and not just hydration wait), logout and redirect
  // Note: 401 is handled by the token refresh interceptor in client.ts.
  // If we still get an error here, the refresh failed and the interceptor already logged us out.
  React.useEffect(() => {
    if (meError && isHydrated && token) {
      // The refresh interceptor in client.ts already handled logout for 401.
      // This catch is for other unexpected errors — don't force logout, just let the interceptor handle it.
    }
  }, [meError, isHydrated, token]);

  // Step 5: Route protection — redirect to /login if no token on protected path
  React.useEffect(() => {
    if (isHydrated) {
      const currentToken = useAuthStore.getState().token;
      if (!currentToken && !pathname.includes("/login") && !pathname.includes("/register")) {
        router.push("/login");
      }
    }
  }, [isHydrated, router, pathname]);

  // Show loading until hydration completes
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
