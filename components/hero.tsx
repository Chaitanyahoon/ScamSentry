"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, Database, Terminal, Globe, AlertTriangle, Radar, Hexagon } from "lucide-react"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32 lg:py-40 border-b border-border">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.3]"></div>
      
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className={`mb-8 inline-block ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-1.5 border border-primary/50 bg-primary/10 text-primary font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_15px_hsla(var(--primary),0.3)]">
              <Terminal className="mr-2 h-4 w-4" />
              SYSTEM.ONLINE()
              <span className="ml-3 h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsla(var(--primary),1)]"></span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className={`text-4xl font-extrabold tracking-tighter sm:text-6xl lg:text-7xl text-foreground uppercase ${mounted ? 'animate-fade-in stagger-1' : 'opacity-0'}`}>
            <span className="block mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              CROWD-SOURCED
            </span>
            <span className="mt-4 block text-2xl sm:text-5xl lg:text-6xl break-words sm:break-normal font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-[gradient-flow_4s_linear_infinite]">
              THREAT_INTELLIGENCE
            </span>
          </h1>

          {/* Description */}
          <p className={`mx-auto mt-8 max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground font-mono ${mounted ? 'animate-fade-in stagger-2' : 'opacity-0'}`}>
            <span className="text-foreground font-bold">DEFEND THE NETWORK.</span> Investigate suspicious links using our 5-Layer AI URL Forensics Engine, or query the global community databank of verified scam reports to protect your operations.
          </p>

          {/* Dual CTAs - Split Purpose */}
          <div className={`mt-14 flex flex-col sm:flex-row items-start justify-center gap-10 sm:gap-6 max-w-3xl mx-auto ${mounted ? 'animate-fade-in stagger-3' : 'opacity-0'}`}>
            
            {/* Proactive CTA — Scan a URL */}
            <div className="flex-1 w-full relative pt-4 sm:pt-0">
              <div className="absolute top-0 sm:-top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-[10px] font-mono tracking-widest text-primary font-bold z-10 border border-primary/50 uppercase whitespace-nowrap">PROACTIVE DEFENSE</div>
              <Link href="/validator" className="w-full">
                <div className="cyber-button w-full flex items-center justify-center h-16 shadow-[0_0_20px_hsla(var(--primary),0.4)] border-2 border-primary group">
                  <Radar className="mr-3 h-5 w-5 group-hover:animate-ping" />
                  INIT URL FORENSICS
                </div>
              </Link>
            </div>

            {/* Reactive CTA — Report a Scam (Red Alert) */}
            <div className="flex-1 w-full relative pt-4 sm:pt-0">
              <div className="absolute top-0 sm:-top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-[10px] font-mono tracking-widest text-destructive font-bold z-10 border border-destructive/50 uppercase whitespace-nowrap">REPORT THREAT</div>
              <div className="flex flex-col items-center gap-3 w-full">
                <Link href="/report" className="w-full">
                  <div className="group w-full flex items-center justify-center h-16 border-2 border-destructive text-destructive font-bold uppercase tracking-widest transition-all hover:bg-destructive hover:text-white hover:shadow-[0_0_20px_hsla(var(--destructive),0.6)] bg-destructive/5 font-mono text-sm">
                    <AlertTriangle className="mr-3 h-5 w-5 group-hover:animate-bounce" />
                    REPORT A SCAM
                  </div>
                </Link>
                <Link href="/reports" className="text-[10px] font-mono tracking-widest text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground/30 hover:border-foreground pb-0.5">
                  browse {">"}2,400 community reports →
                </Link>
              </div>
            </div>
            
          </div>

          {/* Feature Cards - Mixed */}
          <div className={`mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 place-items-stretch ${mounted ? 'animate-fade-in stagger-4' : 'opacity-0'}`}>
            
            <div className="glass-card p-6 text-left group border-t-2 border-t-primary/50 relative overflow-hidden">
               <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-primary/5 group-hover:text-primary/10 transition-colors">
                <Globe className="h-32 w-32" />
               </div>
              <div className="mb-6 relative z-10 inline-flex p-3 border border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_hsla(var(--primary),0.2)] group-hover:shadow-[0_0_20px_hsla(var(--primary),0.6)] transition-all">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg relative z-10 font-bold text-foreground mb-3 uppercase tracking-widest border-b border-border pb-2">LIVE_URL_SCANNER</h3>
              <p className="text-xs relative z-10 font-mono text-muted-foreground tracking-widest leading-relaxed">
                Scan suspicious URLs through our 5-layer heuristic engine. Gemini-backed semantic analysis prevents phishing traps.
              </p>
            </div>

            <div className="glass-card p-6 text-left group border-t-2 border-t-secondary/50 relative overflow-hidden">
               <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-secondary/5 group-hover:text-secondary/10 transition-colors">
                <Hexagon className="h-32 w-32" />
               </div>
              <div className="mb-6 relative z-10 inline-flex p-3 border border-secondary/30 bg-secondary/10 text-secondary shadow-[0_0_15px_hsla(var(--secondary),0.2)] group-hover:shadow-[0_0_20px_hsla(var(--secondary),0.6)] transition-all">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-lg relative z-10 font-bold text-foreground mb-3 uppercase tracking-widest border-b border-border pb-2">COMMUNITY_LEDGER</h3>
              <p className="text-xs relative z-10 font-mono text-muted-foreground tracking-widest leading-relaxed">
                Log and query verified threat reports from freelancers globally. A decentralized database of known rogue actors.
              </p>
            </div>

            <div className="glass-card p-6 text-left group border-t-2 border-t-accent/50 relative overflow-hidden">
               <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-accent/5 group-hover:text-accent/10 transition-colors">
                <Radar className="h-32 w-32" />
               </div>
              <div className="mb-6 relative z-10 inline-flex p-3 border border-accent/30 bg-accent/10 text-accent shadow-[0_0_15px_hsla(var(--accent),0.2)] group-hover:shadow-[0_0_20px_hsla(var(--accent),0.6)] transition-all">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg relative z-10 font-bold text-foreground mb-3 uppercase tracking-widest border-b border-border pb-2">RISK_DETECTION</h3>
              <p className="text-xs relative z-10 font-mono text-muted-foreground tracking-widest leading-relaxed">
                Real-time DNS Spoofing checks combined with the Google SafeBrowsing API to ensure maximum operational security.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
