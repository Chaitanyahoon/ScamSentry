import Link from "next/link"
import { Github, Shield, Cpu, Activity, Database, Heart } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#070605] border-t border-[#1F1914] relative overflow-hidden select-none">
      {/* Subtle Background Detail */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] pointer-events-none" />
      
      <div className="container relative z-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand & Meta Block */}
          <div className="col-span-2 lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="h-6 w-6" />
                <span className="text-sm font-mono font-black text-white tracking-[0.25em] uppercase">
                  SCAM<span className="text-primary italic">SENTRY</span>
                </span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-mono uppercase tracking-wider">
                THE WORLD&apos;S MOST ADVANCED OPEN-SOURCE URL FORENSICS PLATFORM. 
                NEUTRALIZING SOCIAL ENGINEERING THROUGH DETERMINISTIC INTELLIGENCE.
              </p>
            </div>

            {/* System Telemetry Block */}
            <div className="p-4 border border-[#1F1914] bg-[#0C0A09] font-mono text-[9px] text-muted-foreground space-y-3 max-w-[280px]">
              <div className="flex items-center justify-between border-b border-[#1F1914] pb-1.5 select-none">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                  <span className="font-bold text-foreground uppercase tracking-widest">SYSTEM_TELEMETRY</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-bold uppercase">OK</span>
                </div>
              </div>
              <div className="space-y-1.5 select-text">
                <div className="flex justify-between">
                  <span>[CORE_ENGINE]</span>
                  <span className="text-foreground font-bold">V2.1.4-STABLE</span>
                </div>
                <div className="flex justify-between">
                  <span>[GEOGRAPHY_NODES]</span>
                  <span className="text-foreground font-bold">12_ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>[LAST_DB_SYNC]</span>
                  <span className="text-foreground font-bold">14M_AGO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav: Intelligence */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Intelligence</h3>
            <ul className="space-y-3 text-[11px] font-mono uppercase tracking-widest">
              <li><Link href="/reports" className="text-muted-foreground hover:text-primary transition-colors">[ THREAT_ARCHIVES ]</Link></li>
              <li><Link href="/dashboard/admin/osint" className="text-muted-foreground hover:text-primary transition-colors">[ OSINT_FEED ]</Link></li>
              <li><Link href="/safe-companies" className="text-muted-foreground hover:text-primary transition-colors">[ WHITELIST_AUDIT ]</Link></li>
              <li><Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">[ FORENSIC_API ]</Link></li>
            </ul>
          </div>

          {/* Nav: Platform */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Platform</h3>
            <ul className="space-y-3 text-[11px] font-mono uppercase tracking-widest">
              <li><Link href="/validator" className="text-muted-foreground hover:text-primary transition-colors">[ URL_VALIDATOR ]</Link></li>
              <li><Link href="/report" className="text-muted-foreground hover:text-primary transition-colors">[ SUBMIT_REPORT ]</Link></li>
              <li><Link href="/docs/extension" className="text-muted-foreground hover:text-primary transition-colors">[ BROWSER_SHIELD ]</Link></li>
              <li><Link href="https://github.com/Chaitanyahoon/ScamSentry" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">[ SOURCE_CODE ] <Github className="h-3 w-3" /></Link></li>
            </ul>
          </div>

          {/* Nav: Legal */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Protocol</h3>
            <ul className="space-y-3 text-[11px] font-mono uppercase tracking-widest">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">[ PRIVACY_POLICY ]</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">[ TERMS_OF_USE ]</Link></li>
              <li><Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors">[ COMMUNITY_ETHOS ]</Link></li>
              <li><Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">[ RESP_DISCLOSURE ]</Link></li>
            </ul>
          </div>

        </div>

        {/* Global Footer Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-[#1F1914] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase">
              © {currentYear} SCAMSENTRY RESEARCH LABS
            </p>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/20 hidden md:block" />
            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              Crafted with <Heart className="h-2 w-2 text-primary fill-primary mx-0.5 animate-pulse" /> for a safer web
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="https://github.com/Chaitanyahoon/ScamSentry"
              target="_blank"
              className="px-3 py-1.5 rounded-none border border-[#1F1914] bg-[#070605] hover:border-primary/50 transition-colors flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground hover:text-primary uppercase"
            >
              <Github className="h-3.5 w-3.5" />
              Build 8A2F
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
