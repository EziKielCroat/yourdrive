import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:3000/api";

interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
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
      isAuthenticated: false,
      isLoading: false,
      error: null,

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
