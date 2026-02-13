import axios from "axios";

// Use relative /api so cookies (refreshToken) are sent same-origin. Avoid full URLs that cause cross-origin and cookie issues.
function isLocalOrPrivateHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local")
    );
  } catch {
    return false;
  }
}

export const getApiBaseURL = (): string => {
  let envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && typeof envApiUrl === "string" && envApiUrl.trim() !== "") {
    envApiUrl = envApiUrl.trim();
    // Local/LAN servers usually run HTTP; force http to avoid ERR_SSL_PROTOCOL_ERROR
    if (
      envApiUrl.startsWith("https://") &&
      isLocalOrPrivateHost(envApiUrl)
    ) {
      envApiUrl = envApiUrl.replace(/^https:\/\//i, "http://");
    }
    return envApiUrl;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true, // CRITICAL - ensures cookies are sent
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If FormData is being sent, remove Content-Type so browser sets it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: refresh on 401 only (not 403 - Forbidden is "valid token, no permission")
let isRefreshing = false;

interface QueuedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let failedQueue: QueuedRequest[] = [];

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const noRetryEndpoints = [
      "/auth/refresh",
      "/auth/me",
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/device/current", // 404 when no device cookie; don't trigger refresh
    ];

    if (
      noRetryEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint),
      )
    ) {
      return Promise.reject(error);
    }

    // Only retry on 401 (Unauthorized). 403 = Forbidden, don't refresh.
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
            return Promise.reject(new Error("Token refresh failed"));
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        const newAccessToken = refreshResponse.data.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token received");
        }

        localStorage.setItem("accessToken", newAccessToken);

        try {
          const { useAuthStore } = await import("../store/authStore");
          useAuthStore.setState({
            accessToken: newAccessToken,
            isAuthenticated: true,
          });
        } catch {
          // Store not available
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        try {
          const { useAuthStore } = await import("../store/authStore");
          await useAuthStore.getState().logout();
        } catch {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
