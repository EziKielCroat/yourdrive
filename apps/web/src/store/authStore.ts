import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:3000/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Device {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentDevice: Device | null;
  devices: Device[];

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setCurrentDevice: (device: Device | null) => void;
  setDevices: (devices: Device[]) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;

  fetchCurrentDevice: (accessToken: string) => Promise<void>;
  fetchDevices: (accessToken: string) => Promise<void>;
}

interface LoginResponse {
  success: boolean;
  user: User;
  accessToken: string;
}

interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

interface MeResponse {
  success: boolean;
  user: User;
}

interface ErrorResponse {
  success: false;
  error: string;
}

function isAxiosError(error: unknown): error is AxiosError<ErrorResponse> {
  return axios.isAxiosError(error);
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error || error.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      currentDevice: null,
      devices: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
      setCurrentDevice: (device) => set({ currentDevice: device }),
      setDevices: (devices) => set({ devices }),

      login: async (email: string, password: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post<LoginResponse>(
            `${API_URL}/auth/login`,
            { email, password },
            { withCredentials: true }
          );

          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      register: async (
        email: string,
        password: string,
        name?: string
      ): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(
            `${API_URL}/auth/register`,
            { email, password, name },
            { withCredentials: true }
          );

          await get().login(email, password);
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      logout: async (): Promise<void> => {
        try {
          await axios.post(
            `${API_URL}/auth/logout`,
            {},
            { withCredentials: true }
          );
        } catch (error: unknown) {
          console.error("Logout error:", getErrorMessage(error));
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            currentDevice: null,
            devices: [],
            error: null,
          });
        }
      },

      refreshToken: async (): Promise<void> => {
        try {
          const response = await axios.post<RefreshResponse>(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          set({ accessToken: response.data.accessToken });
        } catch (error: unknown) {
          await get().logout();
          throw new Error(getErrorMessage(error));
        }
      },

      checkAuth: async (): Promise<void> => {
        const token = get().accessToken;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await axios.get<MeResponse>(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          set({
            user: response.data.user,
            isAuthenticated: true,
          });
        } catch (error: unknown) {
          console.error("Auth check error:", getErrorMessage(error));
          try {
            await get().refreshToken();
            await get().checkAuth();
          } catch (refreshError: unknown) {
            console.error(
              "Token refresh error:",
              getErrorMessage(refreshError)
            );
            await get().logout();
          }
        }
      },

      fetchCurrentDevice: async (accessToken: string) => {
        try {
          const response = await fetch(`${API_URL}/auth/device/current`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

          const data = await response.json();
          if (data.success) {
            set({ currentDevice: data.device });
          }
        } catch (error) {
          console.error("Failed to fetch current device:", error);
        }
      },

      fetchDevices: async (accessToken: string) => {
        try {
          const response = await fetch(`${API_URL}/auth/devices`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

          const data = await response.json();
          if (data.success) {
            set({ devices: data.devices });
          }
        } catch (error) {
          console.error("Failed to fetch devices:", error);
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state): Partial<AuthState> => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
