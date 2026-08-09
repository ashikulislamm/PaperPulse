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

// Synchronously resolve JWT Access Token from Zustand store or localStorage fallback
const getValidToken = (): string | null => {
  let token = useAuthStore.getState().token;
  if (!token && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("paperpulse-auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          token = parsed.state.token;
          console.log("📦 [ApiClient] Recovered token from localStorage fallback:", token?.substring(0, 20) + "...");
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
      console.error("❌ [ApiClient] Failed parsing localStorage:", e);
    }
  }
  return token;
};

// Request Interceptor: Always inject Bearer Access Token into headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getValidToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🌐 [ApiClient] Request -> ${config.method?.toUpperCase()} ${config.url} (Bearer Token attached: Yes)`);
    } else {
      console.warn(`⚠️ [ApiClient] Request -> ${config.method?.toUpperCase()} ${config.url} (Bearer Token attached: NO)`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle API Responses, 403 Access Denied & Expired 7-Day Tokens
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [ApiClient] Response 200 OK -> ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<{ message?: string; title?: string }>) => {
    const requestUrl = error.config?.url || "";
    const status = error.response?.status;

    // Suppress console.error for expected 404 responses (e.g. checking unsubmitted tasks)
    if (status === 404) {
      console.log(`ℹ️ [ApiClient] Resource 404 for URL: ${requestUrl}`);
    } else {
      console.error(`❌ [ApiClient] API Error Status [${status}] for URL: ${requestUrl}`, error.response?.data);
    }

    // 1. Handle 403 Forbidden gracefully without toast popups or logging out
    if (status === 403) {
      console.warn(`⛔ [ApiClient] 403 Forbidden for URL [${requestUrl}]. Handled silently without toast.`);
      return Promise.reject(error);
    }

    // 2. Handle 401 Unauthorized (Only when 7-day token has expired or is invalid)
    if (status === 401 && !requestUrl.includes("/login") && !requestUrl.includes("/register")) {
      console.error("🚨 [ApiClient] 401 Unauthorized detected! Executing Logout & Redirecting to /login.");
      console.trace();

      useAuthStore.getState().logout();

      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        console.warn("🔄 [ApiClient] Redirecting browser window to /login");
        window.location.href = "/login";
        toast.error("Session expired. Please log in again.");
      }
      return Promise.reject(error);
    }

    // 3. Global Toast Notification for server errors (excluding 401, 403, and 404 missing resource queries)
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
