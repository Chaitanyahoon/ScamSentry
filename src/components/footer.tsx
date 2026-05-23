import Link from "next/link"
import { Github } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#070605] border-t border-[#1F1914] relative overflow-hidden select-none py-12">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-[#1F1914] pb-12">
          
          {/* Logo & Platform Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-white tracking-[0.25em] uppercase">
                  SCAM<span className="text-primary">SENTRY</span>
                </span>
              </Link>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-mono uppercase tracking-widest max-w-xs">
                Zero-trust decentralized URL forensics and threat intelligence. Neutralizing social engineering through automated telemetry.
              </p>
            </div>

            {/* ASCII System Telemetry */}
            <div className="font-mono text-[9px] text-muted-foreground/80 max-w-[280px]">
              <pre className="border border-[#1F1914] bg-[#0C0A09] p-3 leading-normal font-mono text-muted-foreground/50 whitespace-pre-wrap select-text">
{`+-----------------------------------+
| TELEMETRY MATRIX NODE    [ LIVE ] |
+-----------------------------------+
| CORE_ENGINE    : V2.1.4-STABLE    |
| FORENSIC_NODES : 12 ACTIVE        |
| LATENCY_P50    : 14MS             |
| STATUS_CHECK   : NOMINAL          |
+-----------------------------------+`}
              </pre>
            </div>
          </div>

          {/* Navigation links - Column 1 */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.3em]">
              [ INTELLIGENCE ]
            </h4>
            <ul className="space-y-2 text-[10px] font-mono uppercase tracking-widest">
              <li>
                <Link href="/reports" className="text-muted-foreground hover:text-primary transition-colors">
                  Threat Archives
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin/osint" className="text-muted-foreground hover:text-primary transition-colors">
                  OSINT Feed
                </Link>
              </li>
              <li>
                <Link href="/safe-companies" className="text-muted-foreground hover:text-primary transition-colors">
                  Whitelist Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation links - Column 2 */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.3em]">
              [ PLATFORM ]
            </h4>
            <ul className="space-y-2 text-[10px] font-mono uppercase tracking-widest">
              <li>
                <Link href="/validator" className="text-muted-foreground hover:text-primary transition-colors">
                  URL Validator
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Report
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">
                  Forensic API
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation links - Column 3 */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.3em]">
              [ PROTOCOL ]
            </h4>
            <ul className="space-y-2 text-[10px] font-mono uppercase tracking-widest">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="https://github.com/Chaitanyahoon/ScamSentry" className="text-muted-foreground hover:text-primary transition-colors">
                  Source Code
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-[9px] font-mono text-muted-foreground/40 tracking-widest uppercase">
              © {currentYear} SCAMSENTRY RESEARCH LABS
            </p>
            <div className="hidden md:block w-[1px] h-3 bg-[#1F1914]" />
            <p className="text-[9px] font-mono text-muted-foreground/60 tracking-widest uppercase">
              CRAFTED BY CHAITANYA FOR A SAFER WEB
            </p>
          </div>

          <div>
            <a
              href="https://github.com/Chaitanyahoon/ScamSentry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1F1914] bg-[#0C0A09] text-[9px] font-mono font-black text-muted-foreground hover:text-primary hover:border-primary/20 uppercase tracking-widest transition-all"
            >
              <Github className="h-3 w-3" />
              Build 8A2F
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
