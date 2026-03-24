"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, Search, AlertTriangle, MapPin, Database, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Validator", href: "/validator", icon: Shield },
    { name: "Threat DB", href: "/reports", icon: Database },
    { name: "Global Map", href: "/map", icon: MapPin },
    { name: "API Docs", href: "/api-docs", icon: Terminal },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center space-x-3 transition-transform hover:-translate-y-0.5">
          <div className="relative flex items-center justify-center text-primary group-hover:text-secondary transition-colors duration-300 drop-shadow-[0_0_8px_hsla(var(--primary),0.8)]">
            <Terminal className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-widest uppercase truncate">
            Scam<span className="text-primary group-hover:text-secondary transition-colors">Sentry</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <nav className="flex items-center space-x-1 text-sm font-bold uppercase tracking-wider">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center space-x-2 px-4 py-2 transition-all duration-300 border-b-2",
                  isActive(item.href)
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive(item.href) ? "drop-shadow-[0_0_5px_hsla(var(--primary),0.8)]" : "")} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Link href="/report" className="ml-6">
            <div className="flex items-center px-5 py-2 border-2 border-destructive text-destructive font-bold uppercase tracking-widest hover:bg-destructive hover:text-white transition-all duration-300 shadow-[0_0_15px_hsla(var(--destructive),0.4)]">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report
            </div>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="border-border text-foreground bg-transparent hover:text-primary hover:border-primary rounded-none">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-l border-primary p-0">
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full p-6 text-foreground font-mono">
              <div className="flex items-center space-x-3 mb-8 border-b border-border pb-6">
                <Terminal className="h-6 w-6 text-primary drop-shadow-[0_0_8px_hsla(var(--primary),1)]" />
                <span className="text-xl font-bold tracking-widest uppercase">
                  Sys Menu
                </span>
              </div>
              <div className="flex flex-col space-y-4 font-bold uppercase tracking-wider">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 p-3 border-l-2 transition-all duration-300",
                      isActive(item.href)
                        ? "border-primary text-primary bg-primary/10"
                        : "border-transparent text-muted-foreground hover:border-secondary hover:text-foreground hover:bg-secondary/5"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <Link 
                  href="/report" 
                  onClick={() => setIsOpen(false)}
                  className="mt-8 flex items-center justify-center p-4 border-2 border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-white transition-all duration-300 tracking-widest font-bold shadow-[0_0_15px_hsla(var(--destructive),0.4)]"
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  INIT_REPORT
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
