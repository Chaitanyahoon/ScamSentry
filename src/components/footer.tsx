import Link from "next/link"
import { Github, Shield, Cpu, Activity, Database, Heart } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#0C0A09] border-t border-[#1F1914] relative overflow-hidden">
      {/* Background Decorative - HUD Artifacts */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      
      <div className="container relative z-10 px-4 py-24 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 lg:gap-12">
          
          {/* Brand & Forensic Metadata */}
          <div className="col-span-2 lg:col-span-2 space-y-10">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-4 group">
                <Logo className="h-7 w-7 transition-all group-hover:drop-shadow-[0_0_8px_rgba(255,191,0,0.5)]" />
                <span className="text-sm font-bold text-white tracking-[0.3em] uppercase font-mono">
                  SCAM<span className="text-primary text-glow-amber italic">SENTRY</span>
                </span>
              </Link>
              <p className="text-[11px] font-mono text-muted-foreground/40 leading-relaxed max-w-sm tracking-tight border-l border-primary/10 pl-6">
                THE_WORLD&apos;S_MOST_ADVANCED_OPEN-SOURCE_URL_FORENSICS_PLATFORM. 
                NEUTRALIZING_SOCIAL_ENGINEERING_THROUGH_DETERMINISTIC_INTELLIGENCE.
                OPERATIONAL_AUTHORITY: ALPHA_NODE_01.
              </p>
            </div>

            {/* System Telemetry Terminal */}
            <div className="p-6 bg-[#15110E] border border-[#1F1914] space-y-4 max-w-[320px] relative group">
              <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                <Cpu className="h-3 w-3 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,191,0,0.8)]" />
                  <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.3em]">SYSTEM_HEALTH</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">ACTIVE_100%</span>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#1F1914]">
                <div className="space-y-1">
                  <p className="text-[8px] font-mono text-muted-foreground/20 uppercase tracking-tighter">CORE_BUILD</p>
                  <p className="text-[10px] font-mono text-white/50 font-bold">V4.2.0-PRO</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-mono text-muted-foreground/20 uppercase tracking-tighter">DATA_SYNC</p>
                  <p className="text-[10px] font-mono text-white/50 font-bold">REALTIME</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nav: Intelligence Feed */}
          <div className="space-y-8">
            <h3 className="text-[9px] font-mono font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
              <div className="h-1 w-2 bg-primary/40" />
              INTELLIGENCE
            </h3>
            <ul className="space-y-4 text-[11px] font-mono uppercase tracking-widest">
              <li><Link href="/reports" className="text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-2">THREAT_ARCHIVES</Link></li>
              <li><Link href="/dashboard/admin/osint" className="text-muted-foreground/40 hover:text-primary transition-colors">OSINT_CLUSTER</Link></li>
              <li><Link href="/safe-companies" className="text-muted-foreground/40 hover:text-primary transition-colors">WHITELIST_MGMT</Link></li>
              <li><Link href="/api-docs" className="text-muted-foreground/40 hover:text-primary transition-colors hover:text-glow-amber">FORENSIC_API</Link></li>
            </ul>
          </div>

          {/* Nav: Workstation Profile */}
          <div className="space-y-8">
            <h3 className="text-[9px] font-mono font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
              <div className="h-1 w-2 bg-primary/40" />
              WORKSTATION
            </h3>
            <ul className="space-y-4 text-[11px] font-mono uppercase tracking-widest">
              <li><Link href="/validator" className="text-muted-foreground/40 hover:text-primary transition-colors">URL_VALIDATOR</Link></li>
              <li><Link href="/report" className="text-muted-foreground/40 hover:text-primary transition-colors">LOG_ADVERSARY</Link></li>
              <li><Link href="/docs/extension" className="text-muted-foreground/40 hover:text-primary transition-colors">BROWSER_SHIELD</Link></li>
              <li><Link href="https://github.com/Chaitanyahoon/ScamSentry" className="text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-2">SOURCE_ACCESS <Github className="h-3 w-3" /></Link></li>
            </ul>
          </div>

          {/* Nav: Security Protocols */}
          <div className="space-y-8">
            <h3 className="text-[9px] font-mono font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
              <div className="h-1 w-2 bg-primary/40" />
              PROTOCOLS
            </h3>
            <ul className="space-y-4 text-[11px] font-mono uppercase tracking-widest">
              <li><Link href="/privacy" className="text-muted-foreground/40 hover:text-primary transition-colors">PRIVACY_MD</Link></li>
              <li><Link href="/terms" className="text-muted-foreground/40 hover:text-primary transition-colors">TERMS_OF_USE</Link></li>
              <li><Link href="/guidelines" className="text-muted-foreground/40 hover:text-primary transition-colors">COMMUNITY_ETHOS</Link></li>
              <li><Link href="/security" className="text-muted-foreground/40 hover:text-primary transition-colors">DISCLOSURE_PUB</Link></li>
            </ul>
          </div>

        </div>

        {/* Global System Shutdown / Footer Bottom */}
        <div className="mt-24 pt-10 border-t border-[#1F1914] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <p className="text-[9px] font-mono text-muted-foreground/20 tracking-[0.4em] uppercase">
              [ © {currentYear} SCAMSENTRY_RESEARCH_LABS ]
            </p>
            <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground/20 uppercase tracking-[0.3em]">
              DEPLOYED_WITH <Heart className="h-2 w-2 text-primary fill-primary animate-pulse" /> FOR_A_SECURE_WEB
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="px-5 py-2 border border-[#1F1914] text-[9px] font-mono font-black text-muted-foreground/20 uppercase tracking-[0.5em]">
              BUILD_REF: 0x8A2F
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
