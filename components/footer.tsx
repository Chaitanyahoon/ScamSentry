import Link from "next/link"
import { Shield, Github, Twitter, Mail, CheckCircle, Terminal, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-background border-t border-border text-foreground overflow-hidden">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.1]"></div>

      <div className="container relative z-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="group flex items-center space-x-3 mb-6 w-fit">
              <div className="relative flex items-center justify-center text-primary transition-colors duration-300 drop-shadow-[0_0_8px_hsla(var(--primary),0.8)]">
                <Terminal className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-widest uppercase">
                Scam<span className="text-primary transition-colors">Sentry</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed font-mono">
              Deterministic URL forensice and gig-economy scam detection protocol. Securing freelance infrastructure layer by layer.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="group flex items-center justify-center p-3 border border-border bg-card hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-[0_0_3px_currentColor]" />
              </Link>
              <Link
                href="#"
                className="group flex items-center justify-center p-3 border border-border bg-card hover:border-secondary hover:bg-secondary/10 transition-all duration-300"
              >
                <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors drop-shadow-[0_0_3px_currentColor]" />
              </Link>
              <Link
                href="#"
                className="group flex items-center justify-center p-3 border border-border bg-card hover:border-accent hover:bg-accent/10 transition-all duration-300"
              >
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors drop-shadow-[0_0_3px_currentColor]" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-foreground mb-6">Quick Links</h3>
            <ul className="space-y-4 font-mono text-sm uppercase">
              <li>
                <Link href="/report" className="group text-muted-foreground hover:text-accent transition-colors flex items-center">
                  <span className="relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-accent before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:origin-left">Report Threat</span>
                </Link>
              </li>
              <li>
                <Link href="/reports" className="group text-muted-foreground hover:text-secondary transition-colors flex items-center">
                  <span className="relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-secondary before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:origin-left">Query Database</span>
                </Link>
              </li>
              <li>
                <Link href="/map" className="group text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <span className="relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-primary before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:origin-left">Global Map</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/safe-companies"
                  className="group text-muted-foreground hover:text-success transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2 group-hover:text-success drop-shadow-[0_0_3px_currentColor]" />
                  <span className="relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-success before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:origin-left">Verified Nodes</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-foreground mb-6">System Protocol</h3>
            <ul className="space-y-4 font-mono text-sm uppercase">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-primary before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:origin-left">
                  Command Center
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-primary before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:origin-left">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-primary before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:origin-left">
                  Privacy Core
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors relative before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-primary before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:origin-left">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-16 pt-8 text-center bg-card/50 p-4">
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-2">
            © 2026 ScamSentry. Compiled with
            <Heart className="h-4 w-4 text-accent animate-pulse drop-shadow-[0_0_5px_currentColor]" />
            for the freelance perimeter.
          </p>
        </div>
      </div>
    </footer>
  )
}
