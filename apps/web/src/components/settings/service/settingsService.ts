import { getStorageTierLabel } from "@yourdrive/plans";
import type {
  UserSettings,
  UpdateProfileRequest,
  UpdateSecurityRequest,
  UpdateAppearanceRequest,
  UpdateLanguageRequest,
  UpdateStorageRequest,
  UpdateSharingRequest,
  SharingDefaultsResponse,
  UpdatePreferencesRequest,
  UpdatePrivacyRequest,
  LinkedAccount,
  ActiveSession,
} from "../types/UserSettings";

import api from "../../../lib/axios";

export interface StorageInfo {
  limit: string;
  used: string;
  available: string;
  usagePercentage: number;
  tier: string;
  deviceName: string;
}

export interface StorageStats {
  total: StorageInfo;
  byType: Array<{
    mimeType: string;
    size: string;
    count: number;
  }>;
  largestFiles: Array<{
    name: string;
    size: string;
    type: string;
    uploaded: Date;
  }>;
}

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const response = await api.get("/settings");
    const payload = response.data;
    return payload?.settings ?? payload;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await api.patch("/settings/profile", data);
  },

  async updateSecurity(data: UpdateSecurityRequest): Promise<void> {
    await api.patch("/settings/security", data);
  },

  async updateAppearance(data: UpdateAppearanceRequest): Promise<void> {
    await api.patch("/settings/appearance", data);
  },

  async updateLanguage(data: UpdateLanguageRequest): Promise<void> {
    await api.patch("/settings/language", data);
  },

  async updateStorage(data: UpdateStorageRequest): Promise<void> {
    await api.patch("/settings/storage", data);
  },

  async getSharing(): Promise<SharingDefaultsResponse> {
    const response = await api.get<{ success: boolean; sharing: SharingDefaultsResponse }>(
      "/settings/sharing",
    );
    return response.data.sharing ?? {};
  },

  async updateSharing(data: UpdateSharingRequest): Promise<SharingDefaultsResponse> {
    const response = await api.patch<{
      success: boolean;
      sharing: SharingDefaultsResponse;
    }>("/settings/sharing", data);
    return response.data.sharing ?? {};
  },

  async updatePreferences(data: UpdatePreferencesRequest): Promise<void> {
    await api.patch("/settings/preferences", data);
  },

  async updatePrivacy(data: UpdatePrivacyRequest): Promise<void> {
    await api.patch("/settings/privacy", data);
  },

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.patch("/settings/password", data);
  },

  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    const response = await api.get("/settings/linked-accounts");
    return response.data;
  },

  async linkAccount(
    provider: string,
    credentials: any,
  ): Promise<LinkedAccount> {
    const response = await api.post("/settings/linked-accounts", {
      provider,
      credentials,
    });
    return response.data;
  },

  async unlinkAccount(accountId: string): Promise<void> {
    await api.delete(`/settings/linked-accounts/${accountId}`);
  },

  async getActiveSessions(): Promise<ActiveSession[]> {
    const response = await api.get<{
      success?: boolean;
      sessions?: ActiveSession[];
    }>("/settings/sessions");
    const raw = response.data;
    const sessions = raw?.sessions ?? (Array.isArray(raw) ? raw : []);
    return Array.isArray(sessions) ? sessions : [];
  },

  async signOutSession(sessionId: string): Promise<void> {
    await api.delete(`/settings/sessions/${sessionId}`);
  },

  async signOutAllSessions(): Promise<void> {
    await api.delete("/settings/sessions/all");
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/settings/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async deleteAvatar(): Promise<void> {
    await api.delete("/settings/avatar");
  },

  async enableTwoFactor(): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    const response = await api.post("/settings/2fa/enable");
    return response.data;
  },

  async verifyTwoFactor(code: string): Promise<void> {
    await api.post("/settings/2fa/verify", { code });
  },

  async disableTwoFactor(password: string): Promise<void> {
    await api.post("/settings/2fa/disable", { password });
  },

  async regenerateBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await api.post("/settings/2fa/backup-codes");
    return response.data;
  },

  async getStorageUsage(): Promise<{
    total: number;
    used: number;
    breakdown: {
      documents: number;
      images: number;
      videos: number;
      other: number;
    };
  }> {
    // Get real storage info first
    const storageInfoResponse = await api.get("/storage/info");
    const storageInfo: StorageInfo = storageInfoResponse.data;

    // Get detailed stats
    const statsResponse = await api.get("/storage/stats");
    const stats: StorageStats = statsResponse.data;

    // Calculate breakdown by type
    const breakdown = {
      documents: 0,
      images: 0,
      videos: 0,
      other: 0,
    };

    stats.byType.forEach((item) => {
      const size = Number(item.size);
      const mimeType = item.mimeType.toLowerCase();

      if (
        mimeType.startsWith("text/") ||
        mimeType.includes("pdf") ||
        mimeType.includes("document") ||
        mimeType.includes("word") ||
        mimeType.includes("excel") ||
        mimeType.includes("powerpoint")
      ) {
        breakdown.documents += size;
      } else if (mimeType.startsWith("image/")) {
        breakdown.images += size;
      } else if (
        mimeType.startsWith("video/") ||
        mimeType.startsWith("audio/")
      ) {
        breakdown.videos += size;
      } else {
        breakdown.other += size;
      }
    });

    return {
      total: Number(storageInfo.limit),
      used: Number(storageInfo.used),
      breakdown,
    };
  },

  async clearCache(): Promise<void> {
    await api.post("/storage/clear-cache");
  },

  async removeDuplicates(): Promise<{
    filesRemoved: number;
    spaceFreed: number;
  }> {
    const response = await api.post("/storage/remove-duplicates");
    return response.data;
  },

  async deleteOldVersions(olderThanDays: number = 30): Promise<{
    versionsDeleted: number;
    spaceFreed: number;
  }> {
    const response = await api.post("/storage/delete-old-versions", {
      olderThanDays,
    });
    return response.data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete("/settings/account");
  },

  async cancelAccountDeletion(): Promise<void> {
    await api.post("/settings/account/deletion/cancel");
  },

  async requestDataExport(): Promise<{ exportId: string }> {
    const response = await api.post("/settings/export");
    return response.data;
  },

  async getExportStatus(exportId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    downloadUrl?: string;
  }> {
    const response = await api.get(`/settings/export/${exportId}`);
    return response.data;
  },

  async getSharedFilesStats(): Promise<{
    sharedByMe: number;
    sharedWithMe: number;
    publicLinks: number;
  }> {
    const response = await api.get("/settings/sharing/stats");
    return response.data;
  },

  async revokeAllPublicLinks(): Promise<{ linksRevoked: number }> {
    const response = await api.post("/settings/sharing/links/revoke-all");
    return response.data;
  },

  // ============================================
  // STORAGE METHODS
  // ============================================

  async getRealStorageInfo(): Promise<StorageInfo> {
    const response = await api.get("/storage/info");
    return response.data;
  },

  async getStorageStats(): Promise<StorageStats> {
    const response = await api.get("/storage/stats");
    return response.data;
  },

  async updateStorageSettings(data: any): Promise<void> {
    await api.put("/storage/settings", data);
  },

  // Helper function to format bytes
  formatBytes(bytes: string | number | bigint): string {
    let bytesNum: number;

    if (typeof bytes === "bigint") {
      bytesNum = Number(bytes);
    } else if (typeof bytes === "string") {
      bytesNum = Number(bytes);
    } else {
      bytesNum = bytes;
    }

    if (bytesNum === 0) return "0 B";
    if (isNaN(bytesNum)) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytesNum) / Math.log(k));

    return `${(bytesNum / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  },

  // Get storage tier name (aligned with API @yourdrive/plans getStorageTierLabel)
  getStorageTier(
    limitBytes: string | bigint | number,
    isEducational = false,
  ): string {
    let bytes: number;

    if (typeof limitBytes === "string") {
      bytes = Number(limitBytes);
    } else if (typeof limitBytes === "bigint") {
      bytes = Number(limitBytes);
    } else {
      bytes = limitBytes;
    }

    const inGB = bytes / (1024 * 1024 * 1024);
    return getStorageTierLabel(inGB, isEducational);
  },

  // Get color based on usage percentage
  getUsageColor(percentage: number): string {
    if (percentage < 70) return "#10b981"; // green
    if (percentage < 90) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  },
};

// Mock service for testing
export const mockSettingsService = {
  async getSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          profile: {
            email: "user@example.com",
            firstName: "John",
            lastName: "",
            avatarInitials: "J",
          },
          security: {
            twoFactorEnabled: false,
            clientSideEncryption: false,
            offlineModeEnabled: false,
            activeSessions: [],
          },
          appearance: {
            theme: "light",
            fileView: "grid",
            thumbnailQuality: "medium",
          },
          language: {
            displayLanguage: "en",
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12-hour",
            timezone: "UTC",
          },
          storage: {
            totalStorage: 32212254720,
            usedStorage: 20937995520,
            autoSync: true,
            fileVersioning: true,
            maxVersionsToKeep: 10,
            cacheSize: 0,
          },
          sharing: {
            defaultLinkPermission: "view",
            allowPublicSharing: true,
            requirePasswordForLinks: false,
            linkExpirationDays: null,
            notifyOnShare: true,
            allowDownload: true,
          },
          linkedAccounts: [],
          preferences: {
            emailNotifications: true,
            desktopNotifications: false,
            pushNotifications: false,
            notifyOnUpload: true,
            notifyOnShare: true,
            notifyOnComment: true,
            notifyOnMention: true,
            weeklyDigest: false,
          },
          privacy: {
            showOnlineStatus: true,
            allowActivityTracking: true,
            shareUsageData: false,
            indexFilesForSearch: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }, 1000);
    });
  },

  async updateProfile(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateSecurity(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateAppearance(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateLanguage(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateStorage(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateSharing(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updatePreferences(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updatePrivacy(_data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async linkAccount(): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async unlinkAccount(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async signOutSession(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async uploadAvatar(): Promise<any> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve({ avatarUrl: "https://via.placeholder.com/150" }),
        500,
      ),
    );
  },

  async deleteAccount(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },
};
