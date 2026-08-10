import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "./auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5109/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── Token Refresh State ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Synchronous Token Resolution ─────────────────────────────────────────────
const getValidToken = (): string | null => {
  let token = useAuthStore.getState().token;
  if (!token && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("paperpulse-auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          token = parsed.state.token;
          if (parsed?.state?.user) {
            useAuthStore.getState().setAuth(
              parsed.state.user,
              token as string,
              parsed.state.refreshToken || ""
            );
          }
        }
      }
    } catch (e) {
      console.error("[ApiClient] Failed parsing localStorage:", e);
    }
  }
  return token;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getValidToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (with Token Refresh) ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; title?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const requestUrl = originalRequest?.url || "";
    const status = error.response?.status;

    // Suppress console.error for expected 404 responses
    if (status === 404) {
      return Promise.reject(error);
    }

    // 403 Forbidden — handled silently
    if (status === 403) {
      return Promise.reject(error);
    }

    // ── 401 Unauthorized → Attempt Token Refresh ──────────────────────────
    if (
      status === 401 &&
      !requestUrl.includes("/login") &&
      !requestUrl.includes("/register") &&
      !requestUrl.includes("/auth/refresh") &&
      !originalRequest._retry
    ) {
      const refreshToken = useAuthStore.getState().refreshToken;

      // No refresh token available → force logout
      if (!refreshToken) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark as retrying and attempt refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { accessToken, token: newToken, refreshToken: newRefreshToken } =
          response.data?.data || {};

        const validToken = accessToken || newToken;

        if (!validToken) {
          throw new Error("No token in refresh response");
        }

        // Update auth store with new tokens
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(
            currentUser,
            validToken,
            newRefreshToken || refreshToken
          );
        }

        // Process all queued requests with the new token
        processQueue(null, validToken);

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${validToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout and redirect
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Global Toast for other server errors ───────────────────────────────
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      "An unexpected server error occurred.";

    if (status !== 401 && status !== 403 && status !== 404 && typeof window !== "undefined") {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);
