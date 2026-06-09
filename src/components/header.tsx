"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Scanner", href: "/validator" },
    { name: "Reports", href: "/reports" },
    { name: "Map", href: "/map" },
    { name: "API", href: "/api-docs" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

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
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-4 h-4 w-px bg-border" />

          <Link href="/report" className="ml-4">
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors rounded-md">
              <AlertTriangle className="h-3.5 w-3.5" />
              Report a Scam
            </div>
          </Link>
        </div>

        {/* Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground h-9 w-9 hover:bg-muted/30 hover:text-primary transition-colors rounded-md border border-transparent"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[290px] sm:w-[320px] bg-card/95 backdrop-blur-md border-l border-border p-0 text-foreground"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col p-6 h-full justify-between relative">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Logo className="h-5 w-5" />
                    <span className="text-sm font-bold text-foreground">
                      Scam<span className="text-primary">Sentry</span>
                    </span>
                  </Link>
                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-bold tracking-wider uppercase select-none">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Secure
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 select-none">
                    Menu Links
                  </span>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-4 py-3 text-xs font-semibold tracking-wider transition-all border rounded-md flex items-center justify-between",
                        isActive(item.href)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] font-bold opacity-30">
                        &rarr;
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Action Trigger CTA */}
              <div className="space-y-4">
                <Link
                  href="/report"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md w-full"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Report a Scam
                </Link>

                <div className="text-center text-[8px] text-muted-foreground/35 uppercase tracking-wider select-none font-mono">
                  v3.8.4
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
