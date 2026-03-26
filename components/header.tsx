"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Scanner", href: "/validator" },
    { name: "Reports", href: "/reports" },
    { name: "Map", href: "/map" },
    { name: "API", href: "/api-docs" },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="text-sm font-bold text-foreground tracking-wide">
            Scam<span className="text-primary">Sentry</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  isActive(item.href)
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-4 h-4 w-px bg-border" />

          <Link href="/report" className="ml-4">
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors">
              <AlertTriangle className="h-3.5 w-3.5" />
              Report
            </div>
          </Link>
        </div>

        {/* Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-foreground h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-background border-l border-border p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col p-6">
              <div className="flex items-center gap-2 mb-8 pb-4 border-b border-border">
                <Logo className="h-5 w-5" />
                <span className="text-sm font-bold">Scam<span className="text-primary">Sentry</span></span>
              </div>

              <nav className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2.5 text-sm transition-colors",
                      isActive(item.href)
                        ? "text-primary font-medium bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <Link
                href="/report"
                onClick={() => setIsOpen(false)}
                className="mt-6 flex items-center justify-center gap-2 py-3 text-sm font-semibold border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Report a scam
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
