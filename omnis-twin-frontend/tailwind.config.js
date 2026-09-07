/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./DigitalTwinCore.jsx"],
  theme: {
    extend: {
      colors: {
        canvas: "#111111",
        surface: "#1A1A1A",
        "surface-card": "#1E1E1E",
        "surface-elevated": "#252525",
        "surface-dark": "#0D0D0D",
        primary: {
          DEFAULT: "#C9547A",
          dark: "#A03F5C",
          hover: "#B54A6C",
          light: "rgba(201, 84, 122, 0.12)",
        },
        secondary: {
          DEFAULT: "#E091A8",
          dark: "#D07D96",
          hover: "#D4859C",
          light: "rgba(224, 145, 168, 0.12)",
        },
        accent: {
          DEFAULT: "#EDAFC0",
          dark: "#D9A0B0",
          light: "rgba(237, 175, 192, 0.10)",
        },
        muted: "#F7FAFC",
        frio: "#3A3A3A",
        claro: "#B0B0B0",
        branco: "#F0F0F0",
        border: "#2A2A2A",
        "border-muted": "#333333",
        danger: {
          DEFAULT: "#E5466B",
          hover: "#D03B5E",
        },
        warning: {
          DEFAULT: "#D4915C",
          hover: "#C07E4E",
        },
        healthy: "#5CB88A",
        info: "#7BA4C9",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "36px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.12)",
        "card-dark": "0 2px 16px rgba(0, 0, 0, 0.35)",
        "card-dark-hover": "0 8px 28px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(201, 84, 122, 0.15)",
        "glow-soft": "0 0 20px rgba(224, 145, 168, 0.12)",
      },
      animation: {
        "fade-in-up": "fadeInUp 420ms ease-out both",
        "fade-in": "fadeIn 300ms ease-out both",
        shimmer: "shimmer 2s infinite linear",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
