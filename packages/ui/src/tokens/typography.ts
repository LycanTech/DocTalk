// Apple HIG Typography Scale
// System font stack (SF Pro on Apple, Segoe UI on Windows, Roboto on Android)

export const fontFamily = {
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
  ].join(", "),
  mono: [
    '"SF Mono"',
    '"Fira Code"',
    '"Fira Mono"',
    '"Roboto Mono"',
    "monospace",
  ].join(", "),
} as const;

// iOS/macOS Dynamic Type Scale
export const fontSize = {
  // Large titles
  largeTitle:  { size: "34px", lineHeight: "41px", weight: "700" },
  title1:      { size: "28px", lineHeight: "34px", weight: "700" },
  title2:      { size: "22px", lineHeight: "28px", weight: "700" },
  title3:      { size: "20px", lineHeight: "25px", weight: "600" },
  // Body text
  headline:    { size: "17px", lineHeight: "22px", weight: "600" },
  body:        { size: "17px", lineHeight: "22px", weight: "400" },
  callout:     { size: "16px", lineHeight: "21px", weight: "400" },
  subheadline: { size: "15px", lineHeight: "20px", weight: "400" },
  footnote:    { size: "13px", lineHeight: "18px", weight: "400" },
  caption1:    { size: "12px", lineHeight: "16px", weight: "400" },
  caption2:    { size: "11px", lineHeight: "13px", weight: "400" },
} as const;

export const fontWeight = {
  regular:   "400",
  medium:    "500",
  semibold:  "600",
  bold:      "700",
  heavy:     "800",
  black:     "900",
} as const;
