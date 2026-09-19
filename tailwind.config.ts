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
        // ─── Blayer Brand Violet ────────────────────────────────────────────
        brand: {
          50:  "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
        },

        // ─── Orchid — the deep half of the halftone gradients ───────────────
        orchid: {
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
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
          DEFAULT:    "hsl(var(--primary))",
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
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "#EF4444",
          foreground: "#FFFFFF",
        },

        // Brand-coloured text that stays readable on the page background
        // in BOTH themes — `primary` is a fill, this is an ink.
        iris: "hsl(var(--iris))",

        // Validated categorical chart slots — see globals.css.
        series: {
          1: "hsl(var(--series-1))",
          2: "hsl(var(--series-2))",
          3: "hsl(var(--series-3))",
          4: "hsl(var(--series-4))",
        },
        "viz-surface": "hsl(var(--viz-surface))",

        sidebar: "hsl(var(--sidebar))",
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",

        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },

      // ─── Box shadows ────────────────────────────────────────────────────────
      boxShadow: {
        card:      "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "card-md": "0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)",
        soft:      "0 4px 20px rgba(15,23,42,0.07)",
        focus:     "0 0 0 3px rgba(147,51,234,0.30)",
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

      // ─── Marquee & hero-float animations ────────────────────────────────────
      keyframes: {
        // Entrance variants. Sections deliberately do NOT share one entrance —
        // a page where everything fades up from below reads as templated.
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "clip-up": {
          from: { opacity: "0", clipPath: "inset(100% 0 0 0)" },
          to:   { opacity: "1", clipPath: "inset(0 0 0 0)" },
        },
        "unroll": {
          from: { opacity: "0", transform: "scaleX(.82)" },
          to:   { opacity: "1", transform: "scaleX(1)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        // Chat — a message landing, and the three-dot thinking indicator.
        "message-in": {
          from: { opacity: "0", transform: "translateY(10px) scale(.98)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: ".45" },
          "40%":           { transform: "translateY(-4px)", opacity: "1" },
        },
        // Charts — stroke draw-on, bar grow, and the travelling sheen.
        "draw-line": {
          from: { strokeDashoffset: "var(--draw-length, 1000)" },
          to:   { strokeDashoffset: "0" },
        },
        "grow-y": {
          from: { transform: "scaleY(0)" },
          to:   { transform: "scaleY(1)" },
        },
        "grow-x": {
          from: { transform: "scaleX(0)" },
          to:   { transform: "scaleX(1)" },
        },
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(200%)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(.8)", opacity: ".7" },
          "70%":  { transform: "scale(1.9)", opacity: "0" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        "hero-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(-0.5deg)" },
          "50%":      { transform: "translateY(-10px) rotate(0.5deg)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to:   { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up":         "fade-up .55s cubic-bezier(.22,1,.36,1) both",
        "slide-in-left":   "slide-in-left .6s cubic-bezier(.22,1,.36,1) both",
        "slide-in-right":  "slide-in-right .6s cubic-bezier(.22,1,.36,1) both",
        "clip-up":         "clip-up .7s cubic-bezier(.22,1,.36,1) both",
        unroll:            "unroll .6s cubic-bezier(.22,1,.36,1) both",
        "fade-in":         "fade-in .5s ease-out both",
        "scale-in":        "scale-in .4s cubic-bezier(.22,1,.36,1) both",
        "message-in":      "message-in .32s cubic-bezier(.22,1,.36,1) both",
        "dot-bounce":      "dot-bounce 1.2s ease-in-out infinite",
        "draw-line":       "draw-line 1.4s cubic-bezier(.4,0,.2,1) both",
        "grow-y":          "grow-y .8s cubic-bezier(.22,1,.36,1) both",
        "grow-x":          "grow-x .9s cubic-bezier(.22,1,.36,1) both",
        shimmer:           "shimmer 2.4s ease-in-out infinite",
        "pulse-ring":      "pulse-ring 2s ease-out infinite",
        "hero-float":      "hero-float 6s ease-in-out infinite",
        marquee:           "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
