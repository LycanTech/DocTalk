import type { Metadata, Viewport } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "DocTalk", template: "%s | DocTalk" },
  description: "Nigeria's offline-first medical records platform for doctors",
  manifest: "/manifest.json",
  keywords: ["medical records", "Nigeria", "doctors", "EMR", "health"],
  authors: [{ name: "DocTalk" }],
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DocTalk" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "DocTalk",
    title: "DocTalk — Nigeria's Doctor Platform",
    description: "Offline-first medical records for Nigerian doctors",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F3EF" },
    { media: "(prefers-color-scheme: dark)",  color: "#0C0C0C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${jetbrains.variable}`}>
      <head />
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
