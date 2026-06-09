import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HomeClientContent } from "@/components/home-client-content";
import { LiveThreatTicker } from "@/components/live-threat-ticker";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Hero />
      <LiveThreatTicker />
      <div className="flex-1">
        <HomeClientContent />
        <Features />
      </div>

      {/* Platform Trust Footer Area - Source Attribution */}
      <div className="py-12 bg-muted/20 border-t border-border">
        <div className="container px-4 text-center space-y-6">
          <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">
            Global Forensic Intelligence Sources
          </p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-40 grayscale contrast-[150%]">
            <span className="text-sm font-bold tracking-tighter italic">
              Google Safe Browsing
            </span>
            <span className="text-sm font-bold tracking-tighter italic">
              PhishTank
            </span>
            <span className="text-sm font-bold tracking-tighter italic">
              OpenPhish
            </span>
            <span className="text-sm font-bold tracking-tighter italic">
              Gemini Neural
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
