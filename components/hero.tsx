"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, AlertTriangle } from "lucide-react"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative bg-background py-20 sm:py-28 lg:py-36 border-b border-border">
      {/* Subtle grid — no glow orbs */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.15]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Status line */}
          <div className={`mb-6 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Engine active — 5 forensic layers operational
            </span>
          </div>

          {/* Heading — human language, not SCREAMING_CODENAMES */}
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] ${mounted ? 'animate-fade-in stagger-1' : 'opacity-0'}`}>
            Know if a link is safe
            <span className="block mt-1 text-primary">before you click it.</span>
          </h1>

          {/* Subtitle — conversational, not military jargon */}
          <p className={`mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed ${mounted ? 'animate-fade-in stagger-2' : 'opacity-0'}`}>
            Paste any URL into our forensic engine. It runs heuristic analysis, DNS forensics, threat-intel lookups, and AI semantic review — then tells you exactly what&apos;s wrong with it.
          </p>

          {/* CTAs — simple, direct */}
          <div className={`mt-10 flex flex-col sm:flex-row gap-4 ${mounted ? 'animate-fade-in stagger-3' : 'opacity-0'}`}>
            <Link href="/validator" className="group">
              <div className="cyber-button flex items-center justify-center gap-3 h-14 px-8 text-sm">
                Scan a URL
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/report" className="group">
              <div className="flex items-center justify-center gap-3 h-14 px-8 text-sm border border-destructive/40 text-destructive font-mono font-semibold uppercase tracking-wider hover:bg-destructive/10 transition-colors">
                <AlertTriangle className="h-4 w-4" />
                Report a scam
              </div>
            </Link>
          </div>

          {/* Social proof — one quiet line */}
          <p className={`mt-8 text-xs text-muted-foreground font-mono ${mounted ? 'animate-fade-in stagger-4' : 'opacity-0'}`}>
            <Link href="/reports" className="hover:text-foreground transition-colors border-b border-muted-foreground/30 hover:border-foreground pb-0.5">
              2,400+ community-verified scam reports
            </Link>
            {" · "}Open source threat intelligence
          </p>
        </div>
      </div>
    </section>
  )
}
