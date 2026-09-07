/**
 * Pink & Black Design Tokens
 * Muted Dusty Rose (#C9547A) + Deep Black (#111111) + Soft Blush (#E091A8)
 */
export const TOKENS = {
  colors: {
    primary: "#C9547A",
    primaryDark: "#A03F5C",
    primaryHover: "#B54A6C",
    primaryLight: "rgba(201, 84, 122, 0.12)",

    secondary: "#E091A8",
    secondaryDark: "#D07D96",
    secondaryLight: "rgba(224, 145, 168, 0.12)",

    accent: "#EDAFC0",
    accentDark: "#D9A0B0",
    accentLight: "rgba(237, 175, 192, 0.10)",

    canvas: "#111111",
    surface: "#1A1A1A",
    surfaceCard: "#1E1E1E",
    surfaceElevated: "#252525",
    surfaceDark: "#0D0D0D",

    border: "#2A2A2A",
    borderMuted: "#333333",
    borderFocus: "#C9547A",

    textPrimary: "#F0F0F0",
    textSecondary: "#B0B0B0",
    textMuted: "#6A6A6A",
    textAccent: "#C9547A",
    textSecondaryAccent: "#E091A8",

    danger: "#E5466B",
    dangerBg: "rgba(229, 70, 107, 0.12)",
    dangerBorder: "rgba(229, 70, 107, 0.30)",

    warning: "#D4915C",
    warningBg: "rgba(212, 145, 92, 0.12)",
    warningBorder: "rgba(212, 145, 92, 0.30)",

    healthy: "#5CB88A",
    healthyBg: "rgba(92, 184, 138, 0.12)",
    healthyBorder: "rgba(92, 184, 138, 0.30)",

    info: "#7BA4C9",
    infoBg: "rgba(123, 164, 201, 0.12)",
    infoBorder: "rgba(123, 164, 201, 0.30)",

    offline: "#4A4A4A",
    offlineBg: "rgba(74, 74, 74, 0.12)",
    offlineBorder: "rgba(74, 74, 74, 0.30)",

    chartPrimary: "#C9547A",
    chartSecondary: "#E091A8",
    chartAccent: "#EDAFC0",
    chartHealthy: "#5CB88A",
    chartGrid: "#222222",
  },

  typography: {
    fontFamily: '"Poppins", system-ui, sans-serif',
    fontFamilyMono: '"JetBrains Mono", ui-monospace, monospace',
  },

  shadows: {
    card: "0 2px 16px rgba(0, 0, 0, 0.35)",
    glow: "0 0 20px rgba(201, 84, 122, 0.15)",
    glowSoft: "0 0 20px rgba(224, 145, 168, 0.12)",
  },

  radius: {
    DEFAULT: "12px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
};

export const STATUS_LOOKUP = {
  healthy: {
    label: "NOMINAL",
    color: "#5CB88A",
    bg: "rgba(92, 184, 138, 0.12)",
    border: "rgba(92, 184, 138, 0.30)",
  },
  attention: {
    label: "ATTENTION",
    color: "#EDAFC0",
    bg: "rgba(237, 175, 192, 0.10)",
    border: "rgba(237, 175, 192, 0.25)",
  },
  warning: {
    label: "WARNING",
    color: "#D4915C",
    bg: "rgba(212, 145, 92, 0.12)",
    border: "rgba(212, 145, 92, 0.30)",
  },
  critical: {
    label: "CRITICAL",
    color: "#E5466B",
    bg: "rgba(229, 70, 107, 0.12)",
    border: "rgba(229, 70, 107, 0.30)",
  },
  info: {
    label: "DIAGNOSTIC",
    color: "#7BA4C9",
    bg: "rgba(123, 164, 201, 0.12)",
    border: "rgba(123, 164, 201, 0.30)",
  },
  offline: {
    label: "OFFLINE",
    color: "#6A6A6A",
    bg: "rgba(74, 74, 74, 0.12)",
    border: "rgba(74, 74, 74, 0.30)",
  },
};
