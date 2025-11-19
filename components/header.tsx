"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, Search, AlertTriangle, MapPin, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Report Scam", href: "/report", icon: AlertTriangle },
    { name: "Browse Reports", href: "/reports", icon: Search },
    { name: "Scam Map", href: "/map", icon: MapPin },
    { name: "Safe Companies", href: "/safe-companies", icon: CheckCircle },
    { name: "Community", href: "/community", icon: Users },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center space-x-2 transition-transform hover:scale-105">
          <div className="relative">
            <Shield className="h-8 w-8 text-purple-500 group-hover:text-purple-400 transition-colors" />
            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ScamSentry
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                  isActive(item.href)
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isActive(item.href) && "text-purple-600 dark:text-purple-400"
                )} />
                <span>{item.name}</span>
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Button
            asChild
            className="hidden md:inline-flex gradient-danger text-white hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
          >
            <Link href="/report">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Scam
            </Link>
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] glass border-l border-white/10">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center space-x-3 text-lg font-medium p-3 rounded-lg transition-all duration-300",
                      isActive(item.href)
                        ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30"
                        : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 gradient-danger text-white hover:shadow-lg hover:shadow-red-500/50 transition-all"
                >
                  <Link href="/report" onClick={() => setIsOpen(false)}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
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
