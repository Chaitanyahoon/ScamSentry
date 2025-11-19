import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Removed ThemeProvider import
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { ReportsProvider } from "@/contexts/reports-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ScamSentry - Protecting Freelancers, One Report at a Time",
  description:
    "Report, view, and discuss scam job offers. Help protect the freelancer community from fraudulent clients and companies.",
  keywords: ["scam reports", "freelancer protection", "job scams", "fraud prevention", "community safety"],
  authors: [{ name: "ScamSentry Team" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* ThemeProvider removed */}
        <ReportsProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <Toaster />
        </ReportsProvider>
      </body>
    </html>
  )
}
