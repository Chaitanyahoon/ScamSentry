"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Menu, Search, AlertTriangle, MapPin, Users, CheckCircle } from "lucide-react" // Added CheckCircle
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Report Scam", href: "/report", icon: AlertTriangle },
    { name: "Browse Reports", href: "/reports", icon: Search },
    { name: "Scam Map", href: "/map", icon: MapPin },
    { name: "Safe Companies", href: "/safe-companies", icon: CheckCircle }, // New link
    { name: "Community", href: "/community", icon: Users },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-red-600" />
          <span className="text-xl font-bold">ScamSentry</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <Button asChild className="hidden md:inline-flex">
            <Link href="/report">Report Scam</Link>
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Button asChild className="mt-4">
                  <Link href="/report" onClick={() => setIsOpen(false)}>
                    Report Scam
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
