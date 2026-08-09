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

    console.error(`❌ [ApiClient] API Error Status [${status}] for URL: ${requestUrl}`, error.response?.data);

    // 1. Handle 403 Forbidden without logging out
    if (status === 403) {
      console.warn("⛔ [ApiClient] 403 Forbidden detected. Showing toast, NOT logging out.");
      if (typeof window !== "undefined") {
        toast.error("Access Denied: You do not have permission for this resource.");
      }
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

    // 3. Global Toast Notification for non-auth server errors
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      "An unexpected server error occurred.";

    if (status !== 401 && typeof window !== "undefined") {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);
