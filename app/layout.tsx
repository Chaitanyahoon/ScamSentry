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
  icons: {
    icon: "/icons8-shield-48.png",
  },
    
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/shield.png" sizes="any" />
      </head>
      <body className={inter.className}>
        {/* ThemeProvider removed */}
        <ReportsProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </ReportsProvider>
      </body>
    </html>
  )
}
