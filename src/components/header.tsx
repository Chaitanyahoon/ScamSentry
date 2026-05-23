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
    <header className="sticky top-0 z-50 w-full bg-[#0C0A09]/80 backdrop-blur-md border-b border-[#1F1914]">
      {/* HUD Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo - Forensic Style */}
        <Link href="/" className="flex items-center gap-4 group">
          <Logo className="h-6 w-6 transition-transform group-hover:scale-110" />
          <div className="flex flex-col -space-y-1">
            <span className="text-sm font-bold text-white tracking-widest uppercase font-mono">
              SCAM<span className="text-primary text-glow-amber">SENTRY</span>
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.4em]">INIT_CORE_v4.2</span>
          </div>
        </Link>

        {/* Desktop Navigation - High Density HUD */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all relative group",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground/40 hover:text-white"
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary shadow-[0_0_8px_rgba(255,191,0,0.5)]" />
                )}
                <div className="absolute -inset-1 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          <div className="h-4 w-px bg-[#1F1914]" />

          <Link href="/report" className="relative">
            <div className="flex items-center gap-3 px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] border border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive transition-all">
              <AlertTriangle className="h-3.5 w-3.5" />
              EMERGENCY_LOG
            </div>
          </Link>
        </div>

        {/* Mobile menu logic remains same but with updated styling */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9 bg-primary/5 border border-primary/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-[#0C0A09] border-l border-[#1F1914] p-0">
            <SheetTitle className="sr-only">Forensic Navigation</SheetTitle>
            <div className="flex flex-col p-8 space-y-12">
              <div className="flex items-center gap-4 border-b border-[#1F1914] pb-6">
                <Logo className="h-6 w-6" />
                <span className="text-xs font-bold font-mono tracking-widest text-white uppercase">SCAMSENTRY_<span className="text-primary text-glow-amber">HUD</span></span>
              </div>

              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] transition-all border-l-2",
                      isActive(item.href)
                        ? "text-primary border-primary bg-primary/5"
                        : "text-muted-foreground/40 border-transparent hover:text-white hover:border-white/20"
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
                className="flex items-center justify-center gap-3 py-4 text-[10px] font-mono font-bold uppercase tracking-[0.3em] border border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <AlertTriangle className="h-4 w-4" />
                REPORT_ADVERSARY
              </Link>

              <div className="mt-auto pt-10 border-t border-[#1F1914]">
                <p className="text-[8px] font-mono text-muted-foreground/20 uppercase tracking-[0.5em] text-center">
                  SECURE_SESSION_v4.2.0
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
