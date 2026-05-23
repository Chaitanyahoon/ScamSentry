import Link from "next/link"
import { Github, Shield, Cpu, Activity, Database, Heart } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#0C0A09] border-t border-[#1F1914] relative overflow-hidden">
      {/* Subtle Background Detail */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] pointer-events-none" />
      
      <div className="container relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand & Meta Block */}
          <div className="col-span-2 lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="h-6 w-6" />
                <span className="text-sm font-bold text-white tracking-widest uppercase">
                  Scam<span className="text-primary italic">Sentry</span>
                </span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-medium">
                The world&apos;s most advanced open-source URL forensics platform. 
                Neutralizing social engineering through deterministic intelligence.
              </p>
            </div>

            {/* System Telemetry Block */}
            <div className="p-4 rounded-xl border border-[#1F1914] bg-[#12100D] space-y-3 max-w-[280px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">System Status</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">Operational</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1F1914]">
                <div className="space-y-1">
                  <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-tighter">Forensic Core</p>
                  <p className="text-[10px] font-mono text-white font-bold">v2.1.4-stable</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-tighter">Last Sync</p>
                  <p className="text-[10px] font-mono text-white font-bold">14m ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nav: Intelligence */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Intelligence</h3>
            <ul className="space-y-3 text-[13px]">
              <li><Link href="/reports" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">Threat Archives</Link></li>
              <li><Link href="/dashboard/admin/osint" className="text-muted-foreground hover:text-white transition-colors">OSINT Feed</Link></li>
              <li><Link href="/safe-companies" className="text-muted-foreground hover:text-white transition-colors">Whitelist Audit</Link></li>
              <li><Link href="/api-docs" className="text-muted-foreground hover:text-white transition-colors">Forensic API</Link></li>
            </ul>
          </div>

          {/* Nav: Platform */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Platform</h3>
            <ul className="space-y-3 text-[13px]">
              <li><Link href="/validator" className="text-muted-foreground hover:text-white transition-colors">URL Validator</Link></li>
              <li><Link href="/report" className="text-muted-foreground hover:text-white transition-colors">Submit Report</Link></li>
              <li><Link href="/docs/extension" className="text-muted-foreground hover:text-white transition-colors">Browser Shield</Link></li>
              <li><Link href="https://github.com/Chaitanyahoon/ScamSentry" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">Source Code <Github className="h-3 w-3" /></Link></li>
            </ul>
          </div>

          {/* Nav: Legal */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Protocol</h3>
            <ul className="space-y-3 text-[13px]">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/guidelines" className="text-muted-foreground hover:text-white transition-colors">Community Ethos</Link></li>
              <li><Link href="/security" className="text-muted-foreground hover:text-white transition-colors">Responsible Disclosure</Link></li>
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
              className="px-3 py-1.5 rounded-lg border border-[#1F1914] hover:border-primary/50 transition-colors flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground hover:text-primary uppercase"
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
