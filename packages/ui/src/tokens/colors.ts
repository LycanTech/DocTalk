// Apple HIG System Color Palette
// https://developer.apple.com/design/human-interface-guidelines/color

export const systemColors = {
  // System Blues
  blue: { light: "#007AFF", dark: "#0A84FF" },
  // System Greens
  green: { light: "#34C759", dark: "#30D158" },
  // System Indigos
  indigo: { light: "#5856D6", dark: "#5E5CE6" },
  // System Oranges
  orange: { light: "#FF9500", dark: "#FF9F0A" },
  // System Pinks
  pink: { light: "#FF2D55", dark: "#FF375F" },
  // System Purples
  purple: { light: "#AF52DE", dark: "#BF5AF2" },
  // System Reds
  red: { light: "#FF3B30", dark: "#FF453A" },
  // System Teals
  teal: { light: "#5AC8FA", dark: "#64D2FF" },
  // System Yellows
  yellow: { light: "#FFCC00", dark: "#FFD60A" },
  // Medical mint – DocTalk brand accent
  mint: { light: "#00C7BE", dark: "#63E6E2" },
} as const;

// DocTalk Brand Colors
export const brand = {
  primary: { light: "#007AFF", dark: "#0A84FF" },      // Apple blue
  secondary: { light: "#00C7BE", dark: "#63E6E2" },    // Medical mint
  accent: { light: "#34C759", dark: "#30D158" },       // Medical green
  danger: { light: "#FF3B30", dark: "#FF453A" },       // Alert red
  warning: { light: "#FF9500", dark: "#FF9F0A" },      // Warning orange
} as const;

// System Background Fills
export const backgrounds = {
  // Primary backgrounds
  primary:       { light: "#FFFFFF",  dark: "#000000" },
  secondary:     { light: "#F2F2F7",  dark: "#1C1C1E" },
  tertiary:      { light: "#FFFFFF",  dark: "#2C2C2E" },
  // Grouped backgrounds
  groupedPrimary:    { light: "#F2F2F7", dark: "#000000" },
  groupedSecondary:  { light: "#FFFFFF", dark: "#1C1C1E" },
  groupedTertiary:   { light: "#F2F2F7", dark: "#2C2C2E" },
} as const;

// Label Colors
export const labels = {
  primary:   { light: "#000000",  dark: "#FFFFFF"  },
  secondary: { light: "#3C3C4399", dark: "#EBEBF599" },
  tertiary:  { light: "#3C3C434D", dark: "#EBEBF54D" },
  quaternary:{ light: "#3C3C432E", dark: "#EBEBF52E" },
} as const;

// Separator Colors
export const separators = {
  opaque:       { light: "#C6C6C8", dark: "#38383A" },
  nonOpaque:    { light: "#3C3C4349", dark: "#54545899" },
} as const;

// Fill Colors
export const fills = {
  primary:   { light: "#78788033", dark: "#7878805C" },
  secondary: { light: "#78788029", dark: "#78788052" },
  tertiary:  { light: "#7676801E", dark: "#7676803D" },
  quaternary:{ light: "#74748014", dark: "#74748029" },
} as const;
