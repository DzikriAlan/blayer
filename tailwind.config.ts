import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // General Sans — default body text & general UI (Professional & Clear)
        sans: ["General Sans", "system-ui", "sans-serif"],
        // Clash Display — headlines, titles, emphasis (Powerful & Modern)
        gudlak: ["Clash Display", "system-ui", "sans-serif"],
        mono: ["Fira Code", "ui-monospace", "monospace"],
      },

      // ─── Custom rem-based font sizes used across components ────────────────
      fontSize: {
        "rem-65":  ["0.65rem",  { lineHeight: "1.4" }],
        "rem-70":  ["0.70rem",  { lineHeight: "1.4" }],
        "rem-75":  ["0.75rem",  { lineHeight: "1.4" }],
        "rem-80":  ["0.80rem",  { lineHeight: "1.5" }],
        "rem-85":  ["0.85rem",  { lineHeight: "1.5" }],
        "rem-90":  ["0.90rem",  { lineHeight: "1.5" }],
        "rem-95":  ["0.95rem",  { lineHeight: "1.5" }],
        "rem-100": ["1.00rem",  { lineHeight: "1.5" }],
        "rem-110": ["1.10rem",  { lineHeight: "1.5" }],
        "rem-120": ["1.20rem",  { lineHeight: "1.4" }],
        "rem-130": ["1.30rem",  { lineHeight: "1.35" }],
        "rem-140": ["1.40rem",  { lineHeight: "1.3" }],
        "rem-150": ["1.50rem",  { lineHeight: "1.3" }],
        "rem-160": ["1.60rem",  { lineHeight: "1.25" }],
        "rem-200": ["2.00rem",  { lineHeight: "1.2" }],
      },

      colors: {
        // ─── chaplin Brand Blue-Indigo (from logo) ───────────────────────────
        brand: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#5075EF",
          600: "#3B5BD9",
          700: "#2B46C0",
          800: "#1E3A9A",
          900: "#172E7A",
        },

        // ─── Purple accent ──────────────────────────────────────────────────
        purple: {
          50:  "#F8F5FF",
          100: "#F1EAFF",
          200: "#E5D8FF",
          300: "#D4BCFF",
          400: "#BB95FF",
          500: "#9D6BFF",
          600: "#8B5CF6",
          700: "#7C3AED",
          800: "#6D28D9",
          900: "#5B21B6",
        },

        // ─── Design surfaces ────────────────────────────────────────────────
        surface: {
          DEFAULT:   "#FFFFFF",
          secondary: "#FAFBFD",
          tertiary:  "#F5F7FB",
          hover:     "#F1F4FA",
        },

        borderSoft: {
          DEFAULT: "#E7ECF5",
          strong:  "#D8E0EE",
        },

        // ─── Semantic text ──────────────────────────────────────────────────
        text: {
          primary:   "#0F172A",
          secondary: "#475569",
          tertiary:  "#64748B",
          muted:     "#94A3B8",
        },

        // ─── Status colors ──────────────────────────────────────────────────
        success: { DEFAULT: "#22C55E", soft: "#DCFCE7" },
        warning: { DEFAULT: "#F59E0B", soft: "#FEF3C7" },
        danger:  { DEFAULT: "#EF4444", soft: "#FEE2E2" },

        blue: {
          DEFAULT: "#5075EF",
          hover:   "#3B5BD9",
          "12":    "rgba(80,117,239,0.12)",
          "15":    "rgba(80,117,239,0.15)",
          "20":    "rgba(80,117,239,0.20)",
          "30":    "rgba(80,117,239,0.30)",
          "50":    "rgba(80,117,239,0.50)",
          "70":    "rgba(80,117,239,0.70)",
        },
        ink: {
          primary:   "#E2E2E2",
          secondary: "#A0A0A0",
          muted:     "#7A7A7A",
          faint:     "#585858",
          disabled:  "#404040",
          inverse:   "#111111",
          warm:      "#F5F1EA",
        },
        "dark-surface": {
          DEFAULT: "#1A1A1A",
          deep:    "#161616",
          dark:    "#1C1C1C",
          hover:   "#1E1E1E",
          input:   "#232323",
          subtle:  "#252525",
          raised:  "#2A2A2A",
          card:    "#2D2D2D",
          overlay: "#2D2F3E",
        },
        rim: {
          DEFAULT: "#252525",
          soft:    "#2A2A2A",
          medium:  "#333333",
          strong:  "#3A3A3A",
          overlay: "#2D2F3E",
          gold:    "#C7A56A",
        },

        // ─── shadcn / CSS-variable tokens ───────────────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",            // gold in both modes
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",             // light cream (light) / dark amber (dark)
          foreground: "hsl(var(--accent-foreground))",  // dark amber (light) / gold (dark)
        },
        destructive: {
          DEFAULT:    "#EF4444",
          foreground: "#FFFFFF",
        },

        sidebar: "hsl(var(--sidebar))",
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",

        chart: {
          1: "#5075EF",
          2: "#8B5CF6",
          3: "#0EA5E9",
          4: "#F59E0B",
          5: "#EF4444",
        },
      },

      // ─── Box shadows ────────────────────────────────────────────────────────
      boxShadow: {
        card:      "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "card-md": "0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)",
        soft:      "0 4px 20px rgba(15,23,42,0.07)",
        focus:     "0 0 0 3px rgba(80,117,239,0.25)",
        popup:     "0 8px 32px rgba(15,23,42,0.14)",
      },

      // ─── Border radii ───────────────────────────────────────────────────────
      borderRadius: {
        xs:   "8px",
        sm:   "10px",
        md:   "12px",
        lg:   "16px",
        xl:   "20px",
        "2xl": "24px",
        full: "9999px",
      },

      // ─── Spacing ────────────────────────────────────────────────────────────
      spacing: {
        sidebar:    "280px",
        content:    "760px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
