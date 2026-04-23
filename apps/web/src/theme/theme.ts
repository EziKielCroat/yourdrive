/**
 * NEXA Core design system theme for styled-components.
 * Use via ThemeProvider and theme prop in styled components.
 */
export const theme = {
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    secondary: "#f3f4f6",
    secondaryHover: "#e5e7eb",
    danger: "#dc2626",
    dangerHover: "#b91c1c",
    success: "#16a34a",
    successHover: "#15803d",
    text: {
      primary: "#111827",
      secondary: "#6b7280",
      muted: "#9ca3af",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
    border: {
      light: "#e5e7eb",
      medium: "#d1d5db",
      dark: "#9ca3af",
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "2.5rem",
    "3xl": "3rem",
  },
  fontSize: {
    xs: "0.8125rem",
    sm: "0.9375rem",
    base: "1.0625rem",
    lg: "1.1875rem",
    xl: "1.3125rem",
    "2xl": "1.625rem",
    "3xl": "1.9375rem",
    "4xl": "2.375rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    fast: "150ms ease-in-out",
    base: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;

export type Theme = typeof theme;
