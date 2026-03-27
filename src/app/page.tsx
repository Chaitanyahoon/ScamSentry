import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HomeClientContent } from "@/components/home-client-content"
import { LiveThreatTicker } from "@/components/live-threat-ticker"
import { ShieldCTA } from "@/components/shield-cta"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Hero />
      <LiveThreatTicker />
      <div className="flex-1">
        <HomeClientContent />
        <Features />
        <ShieldCTA />
      </div>
      
      {/* Platform Trust Footer Area - Source Attribution */}
      <div className="py-12 bg-[#0C0A09] border-t border-[#1F1914]">
        <div className="container px-4 text-center space-y-6">
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em]">
            Global Forensic Intelligence Sources
          </p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-30 grayscale contrast-[150%]">
            <span className="text-sm font-bold tracking-tighter italic">Google Safe Browsing</span>
            <span className="text-sm font-bold tracking-tighter italic">PhishTank</span>
            <span className="text-sm font-bold tracking-tighter italic">OpenPhish</span>
            <span className="text-sm font-bold tracking-tighter italic">Gemini Neural</span>
          </div>
        </div>
      </div>
    </div>
  )
}
