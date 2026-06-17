"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Cpu } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [latency, setLatency] = useState(14);
  const [threatCount, setThreatCount] = useState(42891);

  // Live telemetry animation
  useEffect(() => {
    const latencyInterval = setInterval(() => {
      setLatency((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(10, Math.min(22, next));
      });
    }, 3000);

    const threatInterval = setInterval(() => {
      setThreatCount((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 5000);

    return () => {
      clearInterval(latencyInterval);
      clearInterval(threatInterval);
    };
  }, []);

  return (
    <footer className="bg-[#030712] border-t border-border relative overflow-hidden select-none py-16">
      {/* High-tech grid overlay and glow nodes */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-grid-cyber" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-border pb-12">
          {/* Logo & Platform Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5 group w-fit">
                <div className="relative">
                  <Logo className="h-6 w-6 relative z-10 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="text-sm font-bold text-white tracking-wider uppercase font-sans">
                  SCAM<span className="text-primary transition-colors duration-300 group-hover:text-primary/80">SENTRY</span>
                </span>
              </Link>
              <p className="text-xs text-muted-foreground/75 leading-relaxed max-w-xs">
                Zero-trust URL forensics and threat intelligence. Neutralizing
                social engineering through automated real-time telemetry.
              </p>
            </div>

            {/* Live Platform Telemetry */}
            <div className="text-[11px] text-muted-foreground max-w-[280px] space-y-2.5 bg-card/20 backdrop-blur-sm border border-border/60 p-4 rounded-2xl transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_15px_rgba(249,115,22,0.02)]">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-primary animate-pulse" />
                  System Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Node
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Core Engine:</span>
                  <span className="text-foreground/90 font-medium">
                    v2.1.4-stable
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Forensics:</span>
                  <span className="text-foreground/90 font-medium">
                    12 Active Layers
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Latency:</span>
                  <span className="text-primary font-bold transition-all duration-300">
                    {latency}ms (p50)
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-1.5 mt-1">
                  <span className="text-muted-foreground/70">Neutralized:</span>
                  <span className="text-emerald-400 font-bold">
                    {threatCount.toLocaleString()}+
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation links - Column 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase flex items-center gap-1.5">
              <span className="h-1 w-1 bg-primary rounded-full animate-ping" />
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/reports"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Threat Archives
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/osint"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  OSINT Feed
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Community Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/safe-companies"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Whitelist Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation links - Column 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase flex items-center gap-1.5">
              <span className="h-1 w-1 bg-primary rounded-full" />
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/validator"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  URL Validator
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Submit Report
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Forensic API
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation links - Column 3 */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase flex items-center gap-1.5">
              <span className="h-1 w-1 bg-primary rounded-full" />
              Protocol
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/Chaitanyahoon/ScamSentry"
                  className="hover:text-primary transition-all duration-200 flex items-center gap-1 hover:translate-x-1"
                >
                  Source Code
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-xs text-muted-foreground/50 tracking-wider">
              © {currentYear} ScamSentry Research Labs
            </p>
            <div className="hidden md:block w-[1px] h-3 bg-border" />
            <p className="text-xs text-muted-foreground/60 tracking-wider">
              Crafted for a safer web
            </p>
          </div>

          <div>
            <a
              href="https://github.com/Chaitanyahoon/ScamSentry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-[#070b14] hover:bg-[#0c1220] hover:text-primary hover:border-primary/30 text-xs font-semibold text-muted-foreground rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]"
            >
              <Github className="h-3.5 w-3.5" />
              Build 8A2F
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
