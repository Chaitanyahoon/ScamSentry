import Link from "next/link"
import { Github } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card/45 border-t border-border relative overflow-hidden select-none py-16">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-border pb-12">
          
          {/* Logo & Platform Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wider uppercase font-sans">
                  SCAM<span className="text-primary">SENTRY</span>
                </span>
              </Link>
              <p className="text-xs text-muted-foreground/75 leading-relaxed max-w-xs">
                Zero-trust URL forensics and threat intelligence. Neutralizing social engineering through automated telemetry.
              </p>
            </div>
 
            {/* Live Platform Telemetry */}
            <div className="text-[11px] text-muted-foreground max-w-[280px] space-y-2.5 bg-background/50 border border-border p-4 rounded-2xl">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="font-semibold text-foreground">System Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium bg-success/15 text-success border border-success/20">
                  <span className="h-1 w-1 rounded-full bg-success animate-pulse" />
                  Live Node
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Core Engine:</span>
                  <span className="text-foreground/90 font-medium">v2.1.4-stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Forensics:</span>
                  <span className="text-foreground/90 font-medium">12 Active Layers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Latency:</span>
                  <span className="text-foreground/90 font-medium">14ms (p50)</span>
                </div>
              </div>
            </div>
          </div>
 
          {/* Navigation links - Column 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/reports" className="hover:text-primary transition-colors">
                  Threat Archives
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin/osint" className="hover:text-primary transition-colors">
                  OSINT Feed
                </Link>
              </li>
              <li>
                <Link href="/safe-companies" className="hover:text-primary transition-colors">
                  Whitelist Audit
                </Link>
              </li>
            </ul>
          </div>
 
          {/* Navigation links - Column 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/validator" className="hover:text-primary transition-colors">
                  URL Validator
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-primary transition-colors">
                  Submit Report
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-primary transition-colors">
                  Forensic API
                </Link>
              </li>
            </ul>
          </div>
 
          {/* Navigation links - Column 3 */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">
              Protocol
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="https://github.com/Chaitanyahoon/ScamSentry" className="hover:text-primary transition-colors">
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
              className="inline-flex items-center gap-1.5 px-4.5 py-2 border border-border bg-card hover:bg-card/80 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/20 rounded-xl transition-all"
            >
              <Github className="h-3.5 w-3.5" />
              Build 8A2F
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
