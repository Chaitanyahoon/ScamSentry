import Link from "next/link";
import {
  Users,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Radio,
} from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.05]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              Community <span className="text-primary">Network</span>
            </h1>

            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              We are building a collaborative network for freelancers to share
              security intelligence, verify contracts, and defend our workspace
              from fraudulent clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left animate-in fade-in slide-in-from-bottom-12 duration-700">
            {/* Forum */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center w-11 h-11 rounded-xl border border-primary/20 bg-primary/5 justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Discussion Forums
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Secure community spaces to swap client reviews, flag
                  suspicious clauses, and audit contracts.
                </p>
              </div>
              <div className="inline-flex items-center self-start px-2.5 py-1 rounded-full border border-warning/20 bg-warning/10 text-warning text-xs font-medium">
                In Development
              </div>
            </div>

            {/* Expert Network */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center w-11 h-11 rounded-xl border border-secondary/20 bg-secondary/5 justify-center mb-4">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Expert Consultation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Direct access to experienced freelancers and legal advisors
                  for assistance with payment disputes.
                </p>
              </div>
              <div className="inline-flex items-center self-start px-2.5 py-1 rounded-full border border-warning/20 bg-warning/10 text-warning text-xs font-medium">
                In Development
              </div>
            </div>

            {/* Safe Companies */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center w-11 h-11 rounded-xl border border-success/20 bg-success/5 justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Verified Companies
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  A curated database of vetted organizations with verified
                  prompt payments and positive reviews.
                </p>
              </div>
              <Link
                href="/safe-companies/submit"
                className="inline-flex items-center text-sm font-semibold text-success hover:text-success/80 transition-colors self-start"
              >
                Propose a Company →
              </Link>
            </div>

            {/* Alert System */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center w-11 h-11 rounded-xl border border-destructive/20 bg-destructive/5 justify-center mb-4">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Early Warning System
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Real-time alerts when scam patterns, bad faith contracts, or
                  fake jobs match your criteria.
                </p>
              </div>
              <div className="inline-flex items-center self-start px-2.5 py-1 rounded-full border border-warning/20 bg-warning/10 text-warning text-xs font-medium">
                In Development
              </div>
            </div>
          </div>

          <div className="border border-border bg-card/60 p-8 rounded-2xl max-w-2xl mx-auto shadow-lg">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Radio className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-lg font-semibold text-foreground">
                Get Feature Updates
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Subscribe to receive updates when new community modules and
              protection tools are launched.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-2 bg-background border border-border text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 placeholder:text-muted-foreground/50"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/95 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
