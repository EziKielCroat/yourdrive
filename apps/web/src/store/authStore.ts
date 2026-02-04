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

      // Helper setters
      setUser: (user) => set({ user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),

      // ----------------------
      // Auth
      // ----------------------
      login: async (email: string, password: string): Promise<LoginResponse> => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/login", { email, password });
          const data: LoginResponse = response.data;

          // Check if 2FA is required
          if (data.requires2FA) {
            set({ 
              isLoading: false, 
              requires2FA: true, 
              tempToken: data.tempToken 
            });
            return {
              requires2FA: true,
              userId: data.userId,
              tempToken: data.tempToken,
            };
          }

          // Normal login (no 2FA)
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            requires2FA: false,
            tempToken: null,
          });

          await get().fetchDevices();

          return {
            requires2FA: false,
            user: data.user,
            accessToken: data.accessToken,
          };
        } catch (error: any) {
          set({ 
            error: error.message || "Login failed", 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (email, password, firstName) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/register", { email, password, firstName });
          await get().login(email, password);
        } catch (error: any) {
          set({ 
            error: error.message || "Registration failed", 
            isLoading: false 
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
        const res = await api.post("/auth/refresh");
        set({ accessToken: res.data.accessToken });
      },

      checkAuth: async () => {
        try {
          await get().refreshToken();
          const res = await api.get("/auth/me");

          set({
            user: res.data.user,
            isAuthenticated: true,
            isAuthReady: true,
          });

          await get().fetchDevices();
        } catch {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isAuthReady: true,
          });
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
        } catch {
          // DO NOT retry, DO NOT logout
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
        } catch {
          // silent fail
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
    },
  ),
);