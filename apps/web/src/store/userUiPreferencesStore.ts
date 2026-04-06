import { create } from "zustand";
import type { UserSettings } from "../components/settings/types/UserSettings";

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export type ResolvedTheme = "light" | "dark";

function resolveTheme(
  theme: "light" | "dark" | "system" | undefined,
): ResolvedTheme {
  const t = theme ?? "system";
  if (t === "dark") return "dark";
  if (t === "light") return "light";
  return getSystemDark() ? "dark" : "light";
}

type State = {
  appearance: UserSettings["appearance"] | null;
  language: UserSettings["language"] | null;
  preferences: UserSettings["preferences"] | null;
  privacy: UserSettings["privacy"] | null;
  /** Synced subset for dashboard file list / storage UI */
  storage: UserSettings["storage"] | null;
  resolvedTheme: ResolvedTheme;
  hydrate: (settings: UserSettings) => void;
  setResolvedTheme: (t: ResolvedTheme) => void;
};

export const useUserUiPreferencesStore = create<State>((set) => ({
  appearance: null,
  language: null,
  preferences: null,
  privacy: null,
  storage: null,
  resolvedTheme: "light",

  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),

  hydrate: (settings) => {
    const appearance = settings.appearance ?? null;
    const language = settings.language ?? null;
    const preferences = settings.preferences ?? null;
    const privacy = settings.privacy ?? null;
    const storage = settings.storage ?? null;
    const resolvedTheme = resolveTheme(appearance?.theme);
    set({
      appearance,
      language,
      preferences,
      privacy,
      storage,
      resolvedTheme,
    });
    applyDocumentTheme(resolvedTheme, language?.displayLanguage);
  },
}));

/** Call when system theme may change while theme is "system". */
export function refreshResolvedThemeFromSystem(): void {
  const { appearance } = useUserUiPreferencesStore.getState();
  if (!appearance || appearance.theme === "system") {
    const resolved = resolveTheme("system");
    useUserUiPreferencesStore.getState().setResolvedTheme(resolved);
    applyDocumentTheme(resolved, useUserUiPreferencesStore.getState().language?.displayLanguage);
  }
}

function applyDocumentTheme(resolved: ResolvedTheme, lang?: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.appTheme = resolved;
  document.documentElement.style.colorScheme = resolved === "dark" ? "dark" : "light";
  if (lang) {
    document.documentElement.lang = lang;
  }
}

export function subscribeSystemTheme(): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => refreshResolvedThemeFromSystem();
  mq.addEventListener?.("change", handler);
  return () => mq.removeEventListener?.("change", handler);
}
