/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#00503a",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#feb700",
          foreground: "#6b4b00",
        },
        destructive: {
          DEFAULT: "#b3261e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── DESIGN.md Color System ─────────────────────
        primary2: {
          DEFAULT: "#00503a",
          container: "#006a4e",
          fixed: "#9ef4d0",
          on: "#ffffff",
        },
        secondary2: {
          DEFAULT: "#7c5800",
          container: "#feb700",
          on: "#6b4b00",
        },
        // Surface hierarchy
        surface: "#f8faf7",
        sur_low: "#f2f4f2",
        sur_mid: "#eceeed",
        sur_high: "#e1e3e1",
        sur_highest: "#dcdede",
        on_surface: "#191c1b",
        on_sur_var: "#3f4945",
        outline: "#6f7975",
        out_var: "#bec9c2",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.75rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        tonal: "0 2px 8px 0 rgba(0,80,58,0.08), 0 1px 3px 0 rgba(0,80,58,0.04)",
        float: "0 8px 24px 0 rgba(25,28,27,0.05)",
        modal: "0 20px 60px 0 rgba(25,28,27,0.08)",
        glow: "0 0 32px 0 rgba(0,80,58,0.15)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #00503a 0%, #006a4e 100%)",
        "amber-gradient": "linear-gradient(135deg, #7c5800 0%, #a37400 100%)",
        "hero-mesh":
          "radial-gradient(ellipse at 20% 50%, rgba(0,80,58,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(254,183,0,0.08) 0%, transparent 50%)",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-right": "slide-right 0.4s ease-out both",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
