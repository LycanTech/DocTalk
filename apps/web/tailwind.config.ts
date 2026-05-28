import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", '"Segoe UI"',
          "Roboto", '"Helvetica Neue"', "Arial", "sans-serif",
        ],
        serif: ["var(--font-serif)", "Georgia", '"Times New Roman"', "serif"],
        mono:  ["var(--font-mono)", '"SF Mono"', '"Fira Code"', "monospace"],
      },
      colors: {
        accent:  { DEFAULT: "#E85D4A", hover: "#D44E3B" },
        gold:    { DEFAULT: "#C9A84C" },
        "bg-editorial":  { DEFAULT: "#0C0C0C" },
        "bg-card":       { DEFAULT: "#111111" },
        "bg-surface":    { DEFAULT: "#1A1A1A" },
        "text-editorial":{ DEFAULT: "#FFFFFF"  },
        "text-muted":    { DEFAULT: "#888888"  },
        // legacy aliases
        primary:   { DEFAULT: "#E85D4A" },
        secondary: { DEFAULT: "#C9A84C" },
        success:   { DEFAULT: "#4ADE80" },
        danger:    { DEFAULT: "#E85D4A" },
        warning:   { DEFAULT: "#FBBF24" },
      },
      borderRadius: {
        "apple-sm": "4px",
        "apple-md": "8px",
        "apple-lg": "12px",
        "apple-xl": "16px",
      },
      boxShadow: {
        "apple-sm": "0 1px 3px rgba(0,0,0,0.4)",
        "apple-md": "0 4px 8px rgba(0,0,0,0.5)",
        "apple-lg": "0 10px 24px rgba(0,0,0,0.6)",
        "accent":   "0 4px 14px rgba(232,93,74,0.35)",
      },
      keyframes: {
        "fade-in":  { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
      },
      animation: {
        "fade-in":  "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s cubic-bezier(0.32,0.72,0,1)",
      },
    },
  },
  plugins: [],
};

export default config;
