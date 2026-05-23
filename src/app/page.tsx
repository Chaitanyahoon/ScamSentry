import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HomeClientContent } from "@/components/home-client-content"
import { LiveThreatTicker } from "@/components/live-threat-ticker"
import { ShieldCTA } from "@/components/shield-cta"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col selection:bg-primary/20 selection:text-primary">
      <Hero />
      <LiveThreatTicker />
      <div className="flex-1">
        <HomeClientContent />
        <Features />
        <ShieldCTA />
      </div>
      
      {/* Platform Trust Footer Area - Intelligence Vector Attribution */}
      <div className="py-20 bg-[#0C0A09] border-t border-[#1F1914] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] pointer-events-none" />
        
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-12">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.5em] whitespace-nowrap">
                AUTHORIZED_DATA_VECTORS
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-20 grayscale transition-opacity hover:opacity-40 duration-700">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-black tracking-tighter uppercase whitespace-nowrap">GOOGLE_SAFE_BROWSING</span>
                <div className="h-0.5 w-full bg-primary/20" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-black tracking-tighter uppercase whitespace-nowrap">PHISH_TANK_DB</span>
                <div className="h-0.5 w-full bg-primary/20" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-black tracking-tighter uppercase whitespace-nowrap">OPEN_PHISH_INTEL</span>
                <div className="h-0.5 w-full bg-primary/20" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-black tracking-tighter uppercase whitespace-nowrap">GEMINI_NEURAL_CORE</span>
                <div className="h-0.5 w-full bg-primary/20" />
              </div>
            </div>

            <div className="text-[8px] font-mono text-muted-foreground/10 uppercase tracking-[0.8em]">
              ESTABLISHING_TRUST_MATRIX... COMPLETE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
