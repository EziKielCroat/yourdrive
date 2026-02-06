import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";
import { hardReload } from "../lib/hardReload";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  emailVerified: boolean;
  createdAt: string;
  totpEnabled?: boolean;
}

interface LoginResponse {
  requires2FA: boolean;
  userId?: string;
  tempToken?: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  currentDevice?: Device | null;
}

export interface Device {
  id: string;
  device_name: string;
  device_nickname?: string;
  device_type: string;
  device_color: string;
  browser: string;
  os: string;
  ip_address?: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
  is_trusted: boolean;
  sync_enabled: boolean;
  notifications_enabled: boolean;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  error: string | null;

  currentDevice: Device | null;
  devices: Device[];

  requires2FA: boolean;
  tempToken: string | null;

  refreshUser: () => Promise<void>;

  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;

  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (
    email: string,
    password: string,
    firstName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;

  fetchCurrentDevice: () => Promise<void>;
  fetchDevices: () => Promise<void>;
}

let isCheckingAuth = false;

// Resolved when persisted auth state has been rehydrated from localStorage (so router sees correct isAuthenticated).
let resolveRehydrated: () => void;
export const authRehydratedPromise = new Promise<void>((r) => {
  resolveRehydrated = r;
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAuthReady: false,
      isLoading: false,
      error: null,

      currentDevice: null,
      devices: [],

      requires2FA: false,
      tempToken: null,

      refreshUser: async () => {
        try {
          const res = await api.get("/auth/me");
          set({
            user: res.data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      },

      // Helper setters
      setUser: (user) => set({ user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),

      // ----------------------
      // Auth
      // ----------------------
      login: async (
        email: string,
        password: string,
      ): Promise<LoginResponse> => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/login", { email, password });
          const data: LoginResponse = response.data;

          // Check if 2FA is required
          if (data.requires2FA) {
            set({
              isLoading: false,
              requires2FA: true,
              tempToken: data.tempToken,
            });
            return {
              requires2FA: true,
              userId: data.userId,
              tempToken: data.tempToken,
            };
          }

          // Normal login (no 2FA) - persist token so axios interceptor sends it on next request
          const token = data.accessToken;
          if (token) {
            localStorage.setItem("accessToken", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }
          set({
            user: data.user,
            accessToken: token ?? null,
            isAuthenticated: true,
            isAuthReady: true,
            isLoading: false,
            requires2FA: false,
            tempToken: null,
            currentDevice: data.currentDevice || null,
          });

          await get().fetchDevices();

          return {
            requires2FA: false,
            user: data.user,
            accessToken: data.accessToken,
          };
        } catch (error: unknown) {
          const msg =
            (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            (error instanceof Error ? error.message : null) ??
            "Login failed";
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      register: async (email, password, firstName) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/register", { email, password, firstName });
          await get().login(email, password);
        } catch (error: unknown) {
          const msg =
            (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            (error instanceof Error ? error.message : null) ??
            "Registration failed";
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        } finally {
          delete api.defaults.headers.common["Authorization"];
          if (typeof localStorage !== "undefined") {
            localStorage.removeItem("accessToken");
          }
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            currentDevice: null,
            devices: [],
            requires2FA: false,
            tempToken: null,
            error: null,
            isAuthReady: true,
          });
          hardReload();
        }
      },

      refreshToken: async () => {
        console.log("Refreshing token");
        const res = await api.post("/auth/refresh");
        const newToken = res.data.accessToken;

        set({ accessToken: newToken });

        if (newToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        }
      },

      checkAuth: async () => {
        if (isCheckingAuth) {
          return;
        }
        isCheckingAuth = true;

        try {
          const res = await api.get("/auth/me");

          if (res.data.authenticated && res.data.user) {
            let freshToken = get().accessToken;
            if (!freshToken) {
              const refreshRes = await api.post("/auth/refresh");
              freshToken = refreshRes.data.accessToken;
              if (freshToken) {
                localStorage.setItem("accessToken", freshToken);
                api.defaults.headers.common["Authorization"] =
                  `Bearer ${freshToken}`;
              }
            }

            set({
              user: res.data.user,
              accessToken: freshToken ?? get().accessToken,
              isAuthenticated: true,
              isAuthReady: true,
            });
          } else {
            // Explicit unauthenticated response from /auth/me (no cookie or invalid)
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isAuthReady: true,
            });
            if (typeof localStorage !== "undefined") {
              localStorage.removeItem("accessToken");
            }
            delete api.defaults.headers.common["Authorization"];
          }
        } catch (error: unknown) {
          // Don't clear state on network/transient errors - only clear on explicit 401
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status === 401) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isAuthReady: true,
            });
            if (typeof localStorage !== "undefined") {
              localStorage.removeItem("accessToken");
            }
            delete api.defaults.headers.common["Authorization"];
          } else {
            // Leave auth state as is; just mark ready so we don't block navigation
            set({ isAuthReady: true });
          }
        } finally {
          isCheckingAuth = false;
        }
      },
      // ----------------------
      // Devices
      // ----------------------
      fetchCurrentDevice: async () => {
        try {
          const res = await api.get("/auth/device/current");
          if (res.data?.device) {
            set({ currentDevice: res.data.device });
          }
        } catch (error: unknown) {
          const status = (error as { response?: { status?: number } })?.response?.status;
          // 404 = no device cookie or device not found; treat as "no current device", don't log
          if (status === 404) {
            set({ currentDevice: null });
            return;
          }
          console.warn("Failed to fetch current device:", error);
        }
      },

      fetchDevices: async () => {
        try {
          const res = await api.get("/devices");
          if (res.data?.devices) {
            set({ devices: res.data.devices });

            const current = res.data.devices.find((d: Device) => d.is_current);
            if (current) set({ currentDevice: current });
          }
        } catch (error) {
          console.warn("Failed to fetch devices:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        requires2FA: state.requires2FA,
        tempToken: state.tempToken,
      }),
      onRehydrateStorage: () => (_state, err) => {
        if (err) console.warn("Auth rehydration error:", err);
        resolveRehydrated();
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.setState({ isAuthReady: true });
        }
      },
    },
  ),
);
