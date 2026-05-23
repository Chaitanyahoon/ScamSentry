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
    <section className="relative bg-[#0C0A09] py-32 sm:py-48 lg:py-56 border-b border-[#1F1914] overflow-hidden">
      {/* HUD Background Elements */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.15] z-0" />
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_2px,3px_100%]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-[0_0_20px_rgba(255,191,0,0.2)]" />

      <div className="container relative z-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-12">
          {/* Status Diagnostic Bar */}
          <div className={`inline-flex items-center gap-6 px-4 py-2 bg-primary/5 border border-primary/20 rounded-none transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,191,0,0.8)]" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">CORE_ENGINE_ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-primary/20 hidden sm:block" />
            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em] hidden sm:block">DETERMINISTIC_LAYERS_L1-L5_READY</span>
          </div>

          <div className="space-y-8">
            <h1
              className={`text-5xl sm:text-7xl lg:text-9xl font-bold tracking-tighter text-foreground leading-[0.85] uppercase font-mono ${mounted ? "animate-fade-in stagger-1" : "opacity-0"}`}
            >
              KNOW_THE_LINK
              <span className="block mt-4 text-primary text-glow-amber">
                BEFORE_YOU_CLICK.
              </span>
            </h1>

            <p
              className={`mx-auto max-w-2xl text-sm sm:text-lg text-muted-foreground/60 font-mono tracking-tight leading-relaxed border-l-2 border-primary/20 pl-8 text-left ${mounted ? "animate-fade-in stagger-2" : "opacity-0"}`}
            >
              Paste any URL into our forensic workstation. ScamSentry runs real-time heuristic analysis,
              infrastructure forensics, and community graph cross-checks to expose malicious intent.
              Deterministic security for the modern web.
            </p>
          </div>

          <div
            className={`flex flex-col sm:flex-row justify-center gap-6 pt-8 ${mounted ? "animate-fade-in stagger-3" : "opacity-0"}`}
          >
            <Link href="/validator" className="group relative">
              <div className="absolute -inset-0.5 bg-primary/20 blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex items-center justify-center gap-4 h-16 px-10 text-xs font-mono font-bold uppercase tracking-[0.2em] bg-primary text-black transition-all hover:bg-white rounded-none">
                INITIALIZE_SCAN
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/report" className="group">
              <div className="flex items-center justify-center gap-4 h-16 px-10 text-xs font-mono font-bold uppercase tracking-[0.2em] border border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive transition-all rounded-none">
                <AlertTriangle className="h-4 w-4" />
                LOG_ADVERSARY
              </div>
            </Link>
          </div>

          {/* HUD Footer Accents */}
          <div
            className={`pt-12 flex flex-wrap justify-center items-center gap-8 text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em] ${mounted ? "animate-fade-in stagger-4" : "opacity-0"}`}
          >
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary/20" />
              2,800+ VERIFIED_LOGS
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary/20" />
              OPEN_THREAT_INTEL
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary/20" />
              LATENCY: 42MS
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Brackets */}
      <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-[#1F1914] opacity-20" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-[#1F1914] opacity-20" />
    </section>
  );
}
