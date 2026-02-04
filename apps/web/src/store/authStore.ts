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

  login: (email: string, password: string) => Promise<void>;
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

      // ----------------------
      // Auth
      // ----------------------
      login: async (email, password) => {
        console.log("🔵 Login started");
        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/auth/login", { email, password });
          console.log("✅ Login response:", res.data);

          if (res.data.requires2FA) {
            console.log("⚠️ 2FA required");
            set({
              requires2FA: true,
              tempToken: res.data.tempToken,
              isLoading: false,
            });
            return;
          }

          // Set auth state
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            requires2FA: false,
            tempToken: null,
          });

          // Set axios default header
          if (res.data.accessToken) {
            api.defaults.headers.common["Authorization"] =
              `Bearer ${res.data.accessToken}`;
          }

          // Fetch devices (don't await - let it happen in background)
          get()
            .fetchDevices()
            .catch((err) => {
              console.warn("Failed to fetch devices after login:", err);
            });
        } catch (error: any) {
          console.error("❌ Login failed:", error);
          set({
            isLoading: false,
            error: error.response?.data?.error || "Login failed",
          });
          throw error;
        }
      },

      register: async (email, password, firstName) => {
        console.log("🔵 Register started");
        set({ isLoading: true, error: null });

        try {
          console.log("📝 Calling /auth/register");
          const res = await api.post("/auth/register", {
            email,
            password,
            firstName,
          });
          console.log("✅ Registration successful:", res.data);

          // Auto-login after registration
          console.log("🔵 Starting auto-login");
          await get().login(email, password);
          console.log("✅ Auto-login complete");
        } catch (error: any) {
          console.error("❌ Registration failed:", error);
          set({
            isLoading: false,
            error: error.response?.data?.error || "Registration failed",
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        } finally {
          // Clear axios auth header
          delete api.defaults.headers.common["Authorization"];

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
          console.log("checkAuth already running, skipping...");
          return;
        }

        console.log("Checking auth");
        isCheckingAuth = true;

        try {
          // Step 1: confirm session is valid via cookie
          const res = await api.get("/auth/me");

          if (res.data.authenticated && res.data.user) {
            console.log("Auth check: authenticated");

            // Step 2: get a fresh access token via the refresh cookie
            // This is required because accessToken is not persisted
            // and is null after any page reload.
            let freshToken = get().accessToken;
            if (!freshToken) {
              console.log("No access token in memory, refreshing...");
              const refreshRes = await api.post("/auth/refresh");
              freshToken = refreshRes.data.accessToken;
              api.defaults.headers.common["Authorization"] =
                `Bearer ${freshToken}`;
            }

            set({
              user: res.data.user,
              accessToken: freshToken,
              isAuthenticated: true,
              isAuthReady: true,
            });
          } else {
            console.log("Auth check: not authenticated");
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isAuthReady: true,
            });

            delete api.defaults.headers.common["Authorization"];
          }
        } catch (error) {
          console.log("Auth check failed:", error);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isAuthReady: true,
          });

          delete api.defaults.headers.common["Authorization"];
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
        } catch (error) {
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
        isAuthenticated: state.isAuthenticated,
        requires2FA: state.requires2FA,
        tempToken: state.tempToken,
      }),
    },
  ),
);
