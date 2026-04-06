import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../../settings/service/settingsService";
import type { UserSettings } from "../../settings/types/UserSettings";

import { useAuthStore } from "../../../store/authStore";
import { useUserUiPreferencesStore } from "../../../store/userUiPreferencesStore";

interface UseSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserSettings["profile"]>) => Promise<void>;
  updateSecurity: (data: Partial<UserSettings["security"]>) => Promise<void>;
  updateAppearance: (
    data: Partial<UserSettings["appearance"]>
  ) => Promise<void>;
  updateLanguage: (data: Partial<UserSettings["language"]>) => Promise<void>;
  updateStorage: (data: Partial<UserSettings["storage"]>) => Promise<void>;
  updateSharing: (data: Partial<UserSettings["sharing"]>) => Promise<void>;
  updatePreferences: (
    data: Partial<UserSettings["preferences"]>
  ) => Promise<void>;
  updatePrivacy: (data: Partial<UserSettings["privacy"]>) => Promise<void>;
  linkAccount: (provider: string, credentials: any) => Promise<void>;
  unlinkAccount: (accountId: string) => Promise<void>;
  signOutSession: (sessionId: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      setSettings(data);
      useUserUiPreferencesStore.getState().hydrate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateProfile = async (data: Partial<UserSettings["profile"]>) => {
    try {
    setError(null);
    await settingsService.updateProfile(data);
    
    await loadSettings();
    
    // Refresh user in auth store
    const authStore = useAuthStore.getState();
    await authStore.refreshUser();
    
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update profile");
    throw err;
  }
  };

  const updateSecurity = async (data: Partial<UserSettings["security"]>) => {
    try {
      setError(null);
      await settingsService.updateSecurity(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update security settings"
      );
      throw err;
    }
  };

  const updateAppearance = async (
    data: Partial<UserSettings["appearance"]>
  ) => {
    try {
      setError(null);
      await settingsService.updateAppearance(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update appearance"
      );
      throw err;
    }
  };

  const updateLanguage = async (data: Partial<UserSettings["language"]>) => {
    try {
      setError(null);
      await settingsService.updateLanguage(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update language settings"
      );
      throw err;
    }
  };

  const updateStorage = async (data: Partial<UserSettings["storage"]>) => {
    try {
      setError(null);
      await settingsService.updateStorage(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update storage settings"
      );
      throw err;
    }
  };

  const updateSharing = async (data: Partial<UserSettings["sharing"]>) => {
    try {
      setError(null);
      await settingsService.updateSharing(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update sharing settings"
      );
      throw err;
    }
  };

  const updatePreferences = async (
    data: Partial<UserSettings["preferences"]>
  ) => {
    try {
      setError(null);
      await settingsService.updatePreferences(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update preferences"
      );
      throw err;
    }
  };

  const updatePrivacy = async (data: Partial<UserSettings["privacy"]>) => {
    try {
      setError(null);
      await settingsService.updatePrivacy(data);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update privacy settings"
      );
      throw err;
    }
  };

  const linkAccount = async (provider: string, credentials: any) => {
    try {
      setError(null);
      await settingsService.linkAccount(provider, credentials);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link account");
      throw err;
    }
  };

  const unlinkAccount = async (accountId: string) => {
    try {
      setError(null);
      await settingsService.unlinkAccount(accountId);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink account");
      throw err;
    }
  };

  const signOutSession = async (sessionId: string) => {
    try {
      setError(null);
      await settingsService.signOutSession(sessionId);
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign out session"
      );
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setError(null);
      await settingsService.uploadAvatar(file);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      await settingsService.deleteAccount();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      throw err;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  return {
    settings,
    loading,
    error,
    updateProfile,
    updateSecurity,
    updateAppearance,
    updateLanguage,
    updateStorage,
    updateSharing,
    updatePreferences,
    updatePrivacy,
    linkAccount,
    unlinkAccount,
    signOutSession,
    uploadAvatar,
    deleteAccount,
    refreshSettings,
  };
};

// Hook for optimistic updates (testiraj jel ovo zapravo uopce ima smisla)
export const useOptimisticSettings = () => {
  const {
    settings,
    loading,
    error,
    updateProfile,
    updateSecurity,
    updateAppearance,
    updateLanguage,
    updateStorage,
    updateSharing,
    updatePreferences,
    updatePrivacy,
    ...rest
  } = useSettings();

  const [optimisticSettings, setOptimisticSettings] = useState(settings);

  useEffect(() => {
    setOptimisticSettings(settings);
  }, [settings]);

  const makeOptimisticUpdate = async <T>(
    updateFn: (data: T) => Promise<void>,
    data: T,
    settingsKey: keyof UserSettings
  ) => {
    const previousSettings = optimisticSettings;

    if (optimisticSettings) {
      setOptimisticSettings({
        ...optimisticSettings,
        [settingsKey]: {
          ...optimisticSettings[settingsKey],
          ...data,
        },
      });
    }

    try {
      await updateFn(data);
    } catch (err) {
      setOptimisticSettings(previousSettings);
      throw err;
    }
  };

  return {
    settings: optimisticSettings,
    loading,
    error,
    updateProfile: (data: any) =>
      makeOptimisticUpdate(updateProfile, data, "profile"),
    updateSecurity: (data: any) =>
      makeOptimisticUpdate(updateSecurity, data, "security"),
    updateAppearance: (data: any) =>
      makeOptimisticUpdate(updateAppearance, data, "appearance"),
    updateLanguage: (data: any) =>
      makeOptimisticUpdate(updateLanguage, data, "language"),
    updateStorage: (data: any) =>
      makeOptimisticUpdate(updateStorage, data, "storage"),
    updateSharing: (data: any) =>
      makeOptimisticUpdate(updateSharing, data, "sharing"),
    updatePreferences: (data: any) =>
      makeOptimisticUpdate(updatePreferences, data, "preferences"),
    updatePrivacy: (data: any) =>
      makeOptimisticUpdate(updatePrivacy, data, "privacy"),
    ...rest,
  };
};
