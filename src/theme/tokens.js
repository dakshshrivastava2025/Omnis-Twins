/**
 * Industrial Engineering Design Tokens
 * Neutral Charcoal / Slate Gray Palette
 */
export const TOKENS = {
  colors: {
    bgApp: "#14171B",
    bgSidebar: "#1B1F24",
    bgHeader: "#1B1F24",
    bgCard: "#1B1F24",
    bgCardSecondary: "#22272D",
    bgCardElevated: "#282E35",
    bgCardActive: "#2A3037",
    bgInput: "#14171B",
    border: "#343A42",
    borderSubtle: "#282E35",
    borderFocus: "#5C6470",
    
    textPrimary: "#E2E5E8",
    textSecondary: "#969DA6",
    textMuted: "#69717B",
    textInverse: "#14171B",

    // Muted Semantic Status Colors
    healthy: "#3A9B72",
    healthyBg: "rgba(58, 155, 114, 0.12)",
    healthyBorder: "rgba(58, 155, 114, 0.3)",

    attention: "#C28A32",
    attentionBg: "rgba(194, 138, 50, 0.12)",
    attentionBorder: "rgba(194, 138, 50, 0.3)",

    warning: "#C28A32",
    warningBg: "rgba(194, 138, 50, 0.12)",
    warningBorder: "rgba(194, 138, 50, 0.3)",

    critical: "#C94A4A",
    criticalBg: "rgba(201, 74, 74, 0.12)",
    criticalBorder: "rgba(201, 74, 74, 0.3)",

    info: "#969DA6",
    infoBg: "rgba(150, 157, 166, 0.12)",
    infoBorder: "rgba(150, 157, 166, 0.3)",

    offline: "#69717B",
    offlineBg: "rgba(105, 113, 123, 0.12)",
    offlineBorder: "rgba(105, 113, 123, 0.3)",

    // Chart Lines & Instrumentation (Neutral with Status Lines)
    chartPrimary: "#969DA6",
    chartSecondary: "#C94A4A",
    chartGrid: "#282E35",
  },
  
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
    md: "0 2px 4px 0 rgba(0, 0, 0, 0.5)",
    lg: "0 4px 8px 0 rgba(0, 0, 0, 0.6)",
  },

  radius: {
    sm: "0.25rem", // 4px
    md: "0.375rem",// 6px
    lg: "0.5rem",  // 8px
    full: "9999px",
  },
};

export const STATUS_LOOKUP = {
  healthy: { label: "NOMINAL", color: "#3A9B72", bg: "rgba(58, 155, 114, 0.12)", border: "rgba(58, 155, 114, 0.3)" },
  attention: { label: "ATTN", color: "#C28A32", bg: "rgba(194, 138, 50, 0.12)", border: "rgba(194, 138, 50, 0.3)" },
  warning: { label: "WARN", color: "#C28A32", bg: "rgba(194, 138, 50, 0.12)", border: "rgba(194, 138, 50, 0.3)" },
  critical: { label: "CRITICAL", color: "#C94A4A", bg: "rgba(201, 74, 74, 0.12)", border: "rgba(201, 74, 74, 0.3)" },
  info: { label: "INFO", color: "#969DA6", bg: "rgba(150, 157, 166, 0.12)", border: "rgba(150, 157, 166, 0.3)" },
  offline: { label: "OFFLINE", color: "#69717B", bg: "rgba(105, 113, 123, 0.12)", border: "rgba(105, 113, 123, 0.3)" },
};
