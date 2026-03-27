import Link from "next/link"
import { Users, MessageSquare, ShieldAlert, ShieldCheck, Terminal, Radio } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center border border-primary/50 bg-primary/10 shadow-[0_0_15px_hsla(var(--primary),0.3)]">
                <Terminal className="h-8 w-8 text-primary drop-shadow-[0_0_8px_currentColor]" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-widest text-foreground sm:text-6xl mb-6 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              COMMUNITY <span className="text-primary drop-shadow-[0_0_10px_hsla(var(--primary),0.5)]">GRID</span>
            </h1>

            <p className="text-sm font-mono tracking-widest uppercase text-muted-foreground mb-8 max-w-3xl mx-auto border-l-2 border-primary pl-4 text-left">
              WE ARE CONSTRUCTING DECENTRALIZED PROTOCOLS TO CONNECT FREELANCERS, 
              SHARE EXPLOIT DATA, AND DEFEND THE NETWORK FROM ROGUE ACTORS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 font-mono text-left animate-in fade-in slide-in-from-bottom-12 duration-700">
            {/* Forum */}
            <div className="glass-card p-6 border-t-2 border-t-primary/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center w-12 h-12 border border-primary bg-primary/10 justify-center mb-4 shadow-[0_0_10px_hsla(var(--primary),0.3)]">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-widest drop-shadow-[0_0_5px_currentColor] text-primary">COMMUNICATION_CHANNELS</h3>
              <p className="text-xs text-muted-foreground tracking-widest leading-relaxed mb-4">
                SECURE FORUMS FOR FREELANCERS TO SWAP INTELLIGENCE AND AUDIT SUSPICIOUS CONTRACTS.
              </p>
              <div className="inline-flex items-center px-3 py-1 border border-warning/50 bg-warning/10 text-warning text-[10px] font-bold tracking-widest mt-auto shadow-[0_0_5px_hsla(var(--warning),0.2)]">
                [ STATUS: IN_DEVELOPMENT ]
              </div>
            </div>

            {/* Expert Network */}
            <div className="glass-card p-6 border-t-2 border-t-secondary/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center w-12 h-12 border border-secondary bg-secondary/10 justify-center mb-4 shadow-[0_0_10px_hsla(var(--secondary),0.3)]">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-widest drop-shadow-[0_0_5px_currentColor] text-secondary">EXPERT_NODE_NETWORK</h3>
              <p className="text-xs text-muted-foreground tracking-widest leading-relaxed mb-4">
                DIRECT ACCESS TO VERIFIED VETERANS AND SECURITY EXPERTS FOR IMMEDIATE THREAT TRIAGE.
              </p>
              <div className="inline-flex items-center px-3 py-1 border border-warning/50 bg-warning/10 text-warning text-[10px] font-bold tracking-widest mt-auto shadow-[0_0_5px_hsla(var(--warning),0.2)]">
                [ STATUS: IN_DEVELOPMENT ]
              </div>
            </div>

            {/* Safe Companies */}
            <div className="glass-card p-6 border-t-2 border-t-success/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center w-12 h-12 border border-success bg-success/10 justify-center mb-4 shadow-[0_0_10px_hsla(var(--success),0.3)]">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-widest drop-shadow-[0_0_5px_currentColor] text-success">WHITELISTED_ENTITIES</h3>
              <p className="text-xs text-muted-foreground tracking-widest leading-relaxed mb-4">
                COMMUNITY-CURATED LEDGER OF VERIFIED SAFE HARBOR CLIENTS AND ORGS.
              </p>
              <Link
                href="/safe-companies/submit"
                className="inline-flex items-center text-[10px] tracking-widest font-bold text-success hover:text-success/80 border-b border-success/50 hover:border-success pb-0.5 mt-auto transition-colors"
              >
                PROPOSE_NEW_NODE {'>'}
              </Link>
            </div>

            {/* Alert System */}
            <div className="glass-card p-6 border-t-2 border-t-destructive/50 hover:-translate-y-1 transition-transform">
              <div className="flex items-center w-12 h-12 border border-destructive bg-destructive/10 justify-center mb-4 shadow-[0_0_10px_hsla(var(--destructive),0.3)]">
                <ShieldAlert className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-widest drop-shadow-[0_0_5px_currentColor] text-destructive">EARLY_WARNING_RADAR</h3>
              <p className="text-xs text-muted-foreground tracking-widest leading-relaxed mb-4">
                INSTANT ALERTS WHENEVER NEW THREAT SIGNATURES MATCH YOUR SECTOR OR GEO-LOCATION.
              </p>
              <div className="inline-flex items-center px-3 py-1 border border-warning/50 bg-warning/10 text-warning text-[10px] font-bold tracking-widest mt-auto shadow-[0_0_5px_hsla(var(--warning),0.2)]">
                [ STATUS: IN_DEVELOPMENT ]
              </div>
            </div>
          </div>

          <div className="border border-border bg-card/50 p-8 glass-card rounded-none max-w-3xl mx-auto shadow-[0_0_20px_hsla(var(--primary),0.1)]">
            <div className="flex items-center gap-3 justify-center mb-6">
              <Radio className="h-6 w-6 text-primary animate-pulse" />
              <h2 className="text-lg font-mono font-bold tracking-widest text-foreground uppercase">
                ESTABLISH_COMM_LINK
              </h2>
            </div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground mb-8">
              INITIALIZE YOUR TERMINAL TO RECEIVE PING UPDATES WHEN NETWORK MODULES COME ONLINE.
            </p>
            <div className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="ENTER_SECURE_EMAIL..."
                className="flex-1 px-4 py-3 bg-background border border-border text-foreground tracking-widest text-xs font-mono focus:border-primary focus:ring-1 focus:ring-primary rounded-none placeholder:text-muted-foreground/50"
              />
              <button className="px-8 py-3 cyber-button text-xs tracking-widest whitespace-nowrap">
                SUBSCRIBE_TO_PINGS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
