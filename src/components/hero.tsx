"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-background py-24 sm:py-32 lg:py-36 border-b border-border overflow-hidden">
      {/* Premium Cyber Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.12] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center space-y-6">
          {/* Status line */}
          <div
            className={`inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] px-3 py-1.5 rounded-full transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-medium tracking-wide text-muted-foreground uppercase">
              Engine active — 5 deterministic layers operational
            </span>
          </div>

          {/* Heading */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Know if a link is safe
            <span className="block mt-1 bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent">
              before you click.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`max-w-2xl text-base sm:text-lg text-muted-foreground/90 leading-relaxed mx-auto transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Paste any URL into our forensic engine. It runs heuristic analysis,
            DNS forensics, threat-intel lookups, and community graph crosschecks
            — then tells you exactly what&apos;s wrong with it.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 pt-2 justify-center transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <Link href="/validator" className="group">
              <div className="relative flex items-center justify-center gap-3 h-14 px-8 text-sm font-bold text-black bg-gradient-to-r from-primary to-orange-600 rounded-2xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:scale-[1.02] border border-primary/30">
                <span>Scan a URL</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/report" className="group">
              <div className="flex items-center justify-center gap-3 h-14 px-8 text-sm font-semibold border border-destructive/40 text-destructive bg-destructive/[0.02] hover:bg-destructive/10 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-[1.02]">
                <AlertTriangle className="h-4 w-4" />
                <span>Report a Scam</span>
              </div>
            </Link>
          </div>

          {/* Browser Extension Promotion */}
          <div
            className={`flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground/80 pt-2 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full text-primary font-mono text-[10px] uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Shield Active
            </div>
            <span>Stop threats before they load:</span>
            <a
              href="/extension.zip"
              download="ScamSentry-Extension.zip"
              className="font-semibold text-white hover:text-primary transition-colors flex items-center gap-1 underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
            >
              Get ScamSentry Extension (Free){" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Social proof */}
          <p
            className={`text-xs text-muted-foreground/60 transition-all duration-700 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <Link
              href="/reports"
              className="text-muted-foreground hover:text-white transition-colors border-b border-muted-foreground/30 hover:border-white pb-0.5"
            >
              2,400+ community-verified scam reports
            </Link>
            {" · "}Open source threat intelligence
          </p>
        </div>
      </div>
    </section>
  );
}
