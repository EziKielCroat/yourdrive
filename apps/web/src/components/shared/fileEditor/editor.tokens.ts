import type React from "react";

/**
 * Design token system for the YourDrive file editor.
 *
 * All colour values are CSS custom properties so the editor adapts to the
 * resolved light / dark app theme at runtime.  Call `getEditorVars(theme)`
 * and apply the returned object as `style` on the root shell element —
 * every component that references `T.*` will automatically pick up the
 * correct value through CSS custom property inheritance.
 *
 * Non-theme values (radii, transitions, z-indices, fonts) are kept as
 * static strings / numbers.
 */
export const T = {
  // ── Backgrounds ─────────────────────────────────────────────
  bgShell:    "var(--ed-bgShell)",
  bgBase:     "var(--ed-bgBase)",
  bgSurface:  "var(--ed-bgSurface)",
  bgElevated: "var(--ed-bgElevated)",
  bgHover:    "var(--ed-bgHover)",
  bgActive:   "var(--ed-bgActive)",
  bgInput:    "var(--ed-bgInput)",
  bgOverlay:  "var(--ed-bgOverlay)",

  // ── Text ─────────────────────────────────────────────────────
  textPrimary:   "var(--ed-textPrimary)",
  textSecondary: "var(--ed-textSecondary)",
  textMuted:     "var(--ed-textMuted)",
  textCode:      "var(--ed-textCode)",
  textInvert:    "var(--ed-textInvert)",

  // ── Accent (brand blue) ──────────────────────────────────────
  accent:      "var(--ed-accent)",
  accentHover: "var(--ed-accentHover)",
  accentFaint: "var(--ed-accentFaint)",
  accentGlow:  "var(--ed-accentGlow)",

  // ── Semantic colours ─────────────────────────────────────────
  success:      "#22c55e",
  successFaint: "rgba(34,197,94,0.12)",
  successText:  "var(--ed-successText)",

  danger:      "#ef4444",
  dangerFaint: "rgba(239,68,68,0.12)",
  dangerText:  "var(--ed-dangerText)",

  warning:      "#f59e0b",
  warningFaint: "rgba(245,158,11,0.12)",
  warningText:  "var(--ed-warningText)",

  // ── Borders ───────────────────────────────────────────────────
  borderFaint:  "var(--ed-borderFaint)",
  borderSubtle: "var(--ed-borderSubtle)",
  borderStrong: "var(--ed-borderStrong)",
  borderAccent: "var(--ed-accent)",

  // ── Radii ─────────────────────────────────────────────────────
  rSm:   "5px",
  rMd:   "8px",
  rLg:   "12px",
  rXl:   "16px",
  rFull: "9999px",

  // ── Shadows ───────────────────────────────────────────────────
  shadowCard:     "var(--ed-shadowCard)",
  shadowElevated: "var(--ed-shadowElevated)",
  shadowSm:       "var(--ed-shadowSm)",

  // ── Transitions ───────────────────────────────────────────────
  tFast: "0.1s ease",
  tBase: "0.16s ease",
  tSlow: "0.24s ease",

  // ── Typography ────────────────────────────────────────────────
  fontUI:   `'Poppins', system-ui, -apple-system, sans-serif`,
  fontMono: `'JetBrains Mono', 'Consolas', 'Menlo', monospace`,

  // ── Z-index scale ─────────────────────────────────────────────
  zEditor:  1200,
  zPanel:   1210,
  zPalette: 1220,
  zTooltip: 1230,
} as const;

// ── Theme colour maps ─────────────────────────────────────────────────────────

const DARK: Record<string, string> = {
  "--ed-bgShell":    "#080d17",
  "--ed-bgBase":     "#0d1526",
  "--ed-bgSurface":  "#111827",
  "--ed-bgElevated": "#141e2e",
  "--ed-bgHover":    "#1a2640",
  "--ed-bgActive":   "#1e2d4a",
  "--ed-bgInput":    "#0d1526",
  "--ed-bgOverlay":  "rgba(8,13,23,0.75)",

  "--ed-textPrimary":   "#f0f4ff",
  "--ed-textSecondary": "#8fa3bf",
  "--ed-textMuted":     "#4b6177",
  "--ed-textCode":      "#e2eaf8",
  "--ed-textInvert":    "#0d1526",

  "--ed-accent":      "#2563eb",
  "--ed-accentHover": "#3b82f6",
  "--ed-accentFaint": "rgba(37,99,235,0.12)",
  "--ed-accentGlow":  "0 0 0 3px rgba(37,99,235,0.25)",

  "--ed-successText": "#4ade80",
  "--ed-dangerText":  "#f87171",
  "--ed-warningText": "#fbbf24",

  "--ed-borderFaint":  "rgba(255,255,255,0.05)",
  "--ed-borderSubtle": "rgba(255,255,255,0.09)",
  "--ed-borderStrong": "rgba(255,255,255,0.16)",

  "--ed-shadowCard":     "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)",
  "--ed-shadowElevated": "0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.7)",
  "--ed-shadowSm":       "0 1px 4px rgba(0,0,0,0.4)",
};

const LIGHT: Record<string, string> = {
  "--ed-bgShell":    "#f0f2f5",
  "--ed-bgBase":     "#ffffff",
  "--ed-bgSurface":  "#ffffff",
  "--ed-bgElevated": "#f8f9fa",
  "--ed-bgHover":    "#f1f3f4",
  "--ed-bgActive":   "#e8eaed",
  "--ed-bgInput":    "#f8f9fa",
  "--ed-bgOverlay":  "rgba(0,0,0,0.35)",

  "--ed-textPrimary":   "#1a1a2e",
  "--ed-textSecondary": "#5f6368",
  "--ed-textMuted":     "#9aa0a6",
  "--ed-textCode":      "#1a1a2e",
  "--ed-textInvert":    "#ffffff",

  "--ed-accent":      "#1a73e8",
  "--ed-accentHover": "#1967d2",
  "--ed-accentFaint": "rgba(26,115,232,0.08)",
  "--ed-accentGlow":  "0 0 0 3px rgba(26,115,232,0.20)",

  "--ed-successText": "#16a34a",
  "--ed-dangerText":  "#dc2626",
  "--ed-warningText": "#d97706",

  "--ed-borderFaint":  "rgba(0,0,0,0.06)",
  "--ed-borderSubtle": "rgba(0,0,0,0.10)",
  "--ed-borderStrong": "rgba(0,0,0,0.18)",

  "--ed-shadowCard":     "0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
  "--ed-shadowElevated": "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
  "--ed-shadowSm":       "0 1px 4px rgba(0,0,0,0.08)",
};

/**
 * Returns a React `style` object containing all `--ed-*` custom properties
 * for the given resolved theme.  Apply to the editor's root shell element.
 */
export function getEditorVars(theme: "light" | "dark"): React.CSSProperties {
  return (theme === "dark" ? DARK : LIGHT) as React.CSSProperties;
}
