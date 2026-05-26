// 4px base grid — matches Apple HIG layout guides

export const spacing = {
  0:  "0px",
  1:  "4px",
  2:  "8px",
  3:  "12px",
  4:  "16px",
  5:  "20px",
  6:  "24px",
  7:  "28px",
  8:  "32px",
  9:  "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const radius = {
  none:   "0px",
  sm:     "6px",
  md:     "10px",   // Standard iOS control radius
  lg:     "14px",   // Cards
  xl:     "20px",   // Sheets / modals
  full:   "9999px", // Pills / avatars
} as const;

export const shadow = {
  sm:  "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  md:  "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
  lg:  "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05)",
  xl:  "0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)",
  // Dark mode shadows (lighter, using tinted glow)
  darkSm: "0 1px 3px rgba(0,0,0,0.30)",
  darkMd: "0 4px 6px rgba(0,0,0,0.40)",
  darkLg: "0 10px 15px rgba(0,0,0,0.50)",
} as const;
