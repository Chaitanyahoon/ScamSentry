import Link from "next/link"
import { Github } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Logo className="h-6 w-6" />
                <span className="text-sm font-bold text-foreground tracking-wide">
                  Scam<span className="text-primary">Sentry</span>
                </span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open-source URL forensics and scam intelligence for freelancers.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/validator" className="text-muted-foreground hover:text-foreground transition-colors">URL Scanner</Link></li>
                <li><Link href="/reports" className="text-muted-foreground hover:text-foreground transition-colors">Scam Reports</Link></li>
                <li><Link href="/report" className="text-muted-foreground hover:text-foreground transition-colors">Submit a Report</Link></li>
                <li><Link href="/safe-companies" className="text-muted-foreground hover:text-foreground transition-colors">Verified Companies</Link></li>
                <li><Link href="/api-docs" className="text-muted-foreground hover:text-foreground transition-colors">API Docs</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/guidelines" className="text-muted-foreground hover:text-foreground transition-colors">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ScamSentry
            </p>
            <Link
              href="https://github.com/Chaitanyahoon/ScamSentry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open ScamSentry on GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
