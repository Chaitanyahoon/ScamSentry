"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Terminal,
  Shield,
  Cpu,
  Network,
} from "lucide-react";

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-background py-20 sm:py-28 lg:py-32 border-b border-border overflow-hidden">
      {/* Premium Cyber Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.12] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
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
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] transition-all duration-700 delay-100 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              Know if a link is safe
              <span className="block mt-1 bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent">
                before you click.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`max-w-xl text-base sm:text-lg text-muted-foreground/90 leading-relaxed transition-all duration-700 delay-200 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              Paste any URL into our forensic engine. It runs heuristic
              analysis, DNS forensics, threat-intel lookups, and community graph
              crosschecks — then tells you exactly what&apos;s wrong with it.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 pt-2 transition-all duration-700 delay-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
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
              className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground/80 pt-2 transition-all duration-700 delay-400 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
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
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
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

          {/* Hero Right Interactive Terminal Showcase */}
          <div
            className={`lg:col-span-5 relative transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-95"}`}
          >
            <div className="relative p-6 rounded-2xl bg-[#090b11]/80 border border-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50 pointer-events-none" />

              <div className="absolute inset-0 bg-grid-cyber opacity-[0.07] pointer-events-none" />

              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-destructive/60" />
                  <div className="h-2 w-2 rounded-full bg-warning/60" />
                  <div className="h-2 w-2 rounded-full bg-success/60" />
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                    scamsentry_forensics
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">
                  <Terminal className="h-3 w-3 text-primary" />
                  <span className="font-mono text-[9px] text-primary uppercase font-medium">
                    LIVE MONITOR
                  </span>
                </div>
              </div>

              {/* Terminal Steps */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-start gap-3 text-muted-foreground/80">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-[11px] font-bold">
                        L1: STATIC HEURISTICS
                      </span>
                      <span className="text-success font-semibold text-[10px]">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground/65">
                      Checking character encoding, punycode and dashes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-muted-foreground/80">
                  <Cpu className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-[11px] font-bold">
                        L2: DNS & REGISTRY PATH
                      </span>
                      <span className="text-success font-semibold text-[10px]">
                        RESOLVED
                      </span>
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground/65">
                      Nameserver cluster analyzed for domain generation patterns
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-muted-foreground/80">
                  <Network className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-[11px] font-bold">
                        L5: AI INTENT AUDITOR
                      </span>
                      <span className="text-primary font-bold animate-pulse text-[10px]">
                        SCANNING
                      </span>
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground/65">
                      Analyzing target content layout for brand spoofing and
                      fraud
                    </p>
                  </div>
                </div>
              </div>

              {/* Scanning visual indicator bar */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground/50">
                  SYSTEM_LOAD: 12%
                </span>
                <span className="text-primary animate-pulse font-semibold">
                  COGNITIVE SEARCHING...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
