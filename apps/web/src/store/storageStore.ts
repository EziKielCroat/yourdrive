import { create } from "zustand";
import api from "../lib/axios";

interface StorageState {
  usedBytes: number;
  totalBytes: number;
  hasUserUploadedFolder: boolean;

  setUsed: (bytes: number) => void;
  addUsage: (bytes: number) => void;
  removeUsage: (bytes: number) => void;

  getUsedFormatted: () => string;
  getTotalFormatted: () => string;
  getPercentage: () => number;

  refreshStorage: () => Promise<void>;
}

// 50 GB in bytes
const DEFAULT_TOTAL_BYTES = 50 * 1024 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
}

export const useStorageStore = create<StorageState>((set, get) => ({
  usedBytes: 0,
  totalBytes: DEFAULT_TOTAL_BYTES,
  hasUserUploadedFolder: false,

  setUsed: (bytes) => set({ usedBytes: bytes }),

  addUsage: (bytes) =>
    set((state) => ({
      usedBytes: Math.min(state.usedBytes + bytes, state.totalBytes),
    })),

  removeUsage: (bytes) =>
    set((state) => ({
      usedBytes: Math.max(0, state.usedBytes - bytes),
    })),

  getUsedFormatted: () => formatBytes(get().usedBytes),

  getTotalFormatted: () => formatBytes(get().totalBytes),

  getPercentage: () => {
    const { usedBytes, totalBytes } = get();
    return totalBytes === 0 ? 0 : usedBytes / totalBytes;
  },

  refreshStorage: async () => {
    try {
      // Use unified storage info so sidebar matches Settings -> Storage
      const infoRes = await api.get("/storage/info");
      const { success, limit, used } = infoRes.data ?? {};

      if (!success) {
        throw new Error("Failed to load storage info");
      }

      const totalBytes = Number(BigInt(limit));
      const usedBytes = Number(BigInt(used));

      const foldersRes = await api.get("/files/folders");
      const hasUploadedFolder =
        Array.isArray(foldersRes.data?.folders) &&
        foldersRes.data.folders.length > 0;

      set({
        usedBytes,
        totalBytes: Number.isFinite(totalBytes) ? totalBytes : DEFAULT_TOTAL_BYTES,
        hasUserUploadedFolder: hasUploadedFolder,
      });

      if (import.meta.env.DEV) {
        console.log(
          `📦 Storage refreshed: ${formatBytes(usedBytes)} / ${formatBytes(
            get().totalBytes,
          )}, folders: ${hasUploadedFolder}`,
        );
      }
    } catch (error: any) {
      // Enhanced error logging
      if (import.meta.env.DEV) {
        console.error("❌ Failed to refresh storage:", {
          message: error?.message,
          code: error?.code,
          url: error?.config?.url,
          baseURL: error?.config?.baseURL,
          fullURL: error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url,
        });
      } else {
        console.error("❌ Failed to refresh storage:", error?.message || error);
      }
      // Don't throw - allow app to continue with default values
      // throw error;
    }
  },
}));
