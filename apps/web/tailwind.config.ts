import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Apple HIG system font stack
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ['"SF Mono"', '"Fira Code"', '"Roboto Mono"', "monospace"],
      },
      colors: {
        // DocTalk brand palette
        primary:    { DEFAULT: "#007AFF", dark: "#0A84FF" },
        secondary:  { DEFAULT: "#00C7BE", dark: "#63E6E2" },
        success:    { DEFAULT: "#34C759", dark: "#30D158" },
        danger:     { DEFAULT: "#FF3B30", dark: "#FF453A" },
        warning:    { DEFAULT: "#FF9500", dark: "#FF9F0A" },
        // Apple system backgrounds
        "surface-primary":   { DEFAULT: "#FFFFFF",  dark: "#000000" },
        "surface-secondary": { DEFAULT: "#F2F2F7",  dark: "#1C1C1E" },
        "surface-tertiary":  { DEFAULT: "#FFFFFF",  dark: "#2C2C2E" },
        "surface-grouped":   { DEFAULT: "#F2F2F7",  dark: "#000000" },
        // Label colors
        "label-primary":     { DEFAULT: "#000000",  dark: "#FFFFFF"  },
        "label-secondary":   { DEFAULT: "#6B6B80",  dark: "#ABABC0"  },
        "label-tertiary":    { DEFAULT: "#ADADBD",  dark: "#6B6B80"  },
        // Separator
        separator:           { DEFAULT: "#C6C6C8",  dark: "#38383A"  },
      },
      borderRadius: {
        "apple-sm": "6px",
        "apple-md": "10px",
        "apple-lg": "14px",
        "apple-xl": "20px",
      },
      boxShadow: {
        "apple-sm": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "apple-md": "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
        "apple-lg": "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
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
