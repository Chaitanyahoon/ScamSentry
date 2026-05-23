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
            <Button variant="ghost" size="icon" className="text-foreground h-9 w-9 hover:bg-[#15110E] hover:text-primary transition-colors rounded-none border border-transparent active:border-[#1F1914]">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[290px] sm:w-[320px] bg-[#0C0A09]/95 backdrop-blur-md border-l border-[#1F1914] p-0 font-mono text-[#E8DBC8] rounded-none">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col p-6 h-full justify-between relative">
              {/* Corner Notches */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-primary/30 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-primary/30 pointer-events-none" />
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1F1914]">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Logo className="h-5 w-5" />
                    <span className="text-xs font-black text-foreground">Scam<span className="text-primary">Sentry</span></span>
                  </Link>
                  <div className="flex items-center gap-1.5 text-[8px] text-emerald-500 font-bold tracking-widest uppercase select-none">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    CONN_SECURE
                  </div>
                </div>

                {/* Live Telemetry Info Panel */}
                <div className="mb-6 bg-[#15110E] border border-[#1F1914] p-4 text-[9px] uppercase tracking-widest text-muted-foreground/60 space-y-1.5 select-none relative">
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-primary/30" />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>[ CORE_NODE ]</span>
                    <span>OVERWATCH_M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INTEGRITY</span>
                    <span className="text-emerald-500 font-bold">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LATENCY</span>
                    <span>24MS</span>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  <span className="text-[8px] font-bold text-muted-foreground/45 uppercase tracking-[0.25em] mb-1 select-none">
                    // INDEXED_CHANNELS
                  </span>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all border relative flex items-center justify-between rounded-none",
                        isActive(item.href)
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-transparent border-[#1F1914] text-muted-foreground hover:text-foreground hover:border-primary/20"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.name}</span>
                      <span className="text-[8.5px] font-bold opacity-50">
                        {isActive(item.href) ? "[ ACTIVE ]" : ">>"}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Ingestion Trigger CTA */}
              <div className="space-y-4">
                <Link
                  href="/report"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-widest border border-red-500/40 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all rounded-none w-full"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 group-hover:text-black" />
                  LOG_NEW_INCIDENT
                </Link>
                
                <div className="text-center text-[7px] text-muted-foreground/30 uppercase tracking-[0.2em] select-none">
                  SYSTEM_VERSION_3.8.4_SECURE
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
