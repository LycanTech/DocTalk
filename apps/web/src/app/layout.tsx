import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: { default: "DocTalk", template: "%s | DocTalk" },
  description: "Nigeria's offline-first medical records platform for doctors",
  manifest: "/manifest.json",
  keywords: ["medical records", "Nigeria", "doctors", "EMR", "health"],
  authors: [{ name: "DocTalk" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DocTalk",
  },
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
    { media: "(prefers-color-scheme: light)", color: "#007AFF" },
    { media: "(prefers-color-scheme: dark)",  color: "#0A84FF" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
