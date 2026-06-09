import type React from "react";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { ReportsProvider } from "@/contexts/reports-context";

import { AuthProvider } from "@/contexts/auth-context";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ScamSentry — Zero-Trust Threat Intelligence",
  description:
    "Investigate suspicious URLs with our 5-Layer AI Forensics Engine. Community-powered scam intelligence for freelancers and developers.",
  keywords: [
    "scam reports",
    "phishing detection",
    "url scanner",
    "threat intelligence",
    "cybersecurity",
    "fraud prevention",
  ],
  authors: [{ name: "ScamSentry Team" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${ibmPlexMono.variable} flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ReportsProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ReportsProvider>
      </body>
    </html>
  );
}
