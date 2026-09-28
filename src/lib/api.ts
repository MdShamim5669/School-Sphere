import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

let rawBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://school-sphere-server-production.up.railway.app/api/v1"
).trim();

// Strip trailing slash
if (rawBaseUrl.endsWith("/")) {
  rawBaseUrl = rawBaseUrl.slice(0, -1);
}

// Automatically append /api/v1 if domain was configured without it
if (!rawBaseUrl.includes("/api/v1")) {
  rawBaseUrl = `${rawBaseUrl}/api/v1`;
}

export const API_BASE_URL = rawBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("school_sphere_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errorSources?: Array<{ message: string }> }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If unauthorized and hasn't retried yet
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken;
          if (typeof window !== "undefined") {
            localStorage.setItem("school_sphere_token", newToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("school_sphere_token");
          localStorage.removeItem("school_sphere_user");
          // Never force redirect when browsing public campus pages
          if (
            !window.location.pathname.includes("/login") &&
            !window.location.pathname.includes("/public")
          ) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errData = error.response?.data;
    if (errData?.message) return errData.message;
    if (errData?.errorSources && errData.errorSources.length > 0) {
      return errData.errorSources.map((s: { message: string }) => s.message).join(", ");
    }
    if (error.message === "Network Error" || !error.response) {
      return "Network Error: Unable to reach backend server. Please verify backend status and CORS configuration.";
    }
    return error.message || "An unexpected network error occurred";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export default api;
