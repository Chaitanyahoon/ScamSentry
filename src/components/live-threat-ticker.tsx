"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert, Globe, ExternalLink } from "lucide-react";

interface Threat {
  domain: string;
  source: string;
  firstSeen: string;
}

export function LiveThreatTicker() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchThreats = async () => {
      try {
        const res = await fetch("/api/threats/recent");
        if (!res.ok) {
          console.warn("[Ticker] Intelligence feed currently unavailable (Rules Sync Pending)");
          return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setThreats(data);
        }
      } catch (error) {
        console.error("Failed to fetch live threats", error);
      }
    };

    fetchThreats();
    const interval = setInterval(fetchThreats, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, []);

  if (!mounted || threats.length === 0) return null;

  // Double the array for seamless infinite scroll
  const scrollingThreats = [...threats, ...threats];

  return (
    <div className="w-full bg-[#0C0A09] border-y border-[#1F1914] py-4 overflow-hidden relative group">
      {/* Ticker Header / Label - Pro HUD Style */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#0C0A09]/95 backdrop-blur-sm border-r border-primary/20 flex items-center px-6 shadow-[20px_0_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,191,0,0.8)]" />
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          </div>
          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em] whitespace-nowrap text-glow-amber">
            LIVE_INTEL_STREAM
          </span>
        </div>
      </div>

      {/* Scrolling Container */}
      <div className="flex whitespace-nowrap animate-marquee group-hover:pause-marquee pl-[180px]">
        {scrollingThreats.map((threat, idx) => (
          <div 
            key={`${threat.domain}-${idx}`}
            className="inline-flex items-center gap-6 px-10 border-r border-[#1F1914] last:border-r-0 group/item transition-colors hover:bg-primary/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 bg-primary/5 border border-primary/10">
                <ShieldAlert className="h-3 w-3 text-primary opacity-70" />
              </div>
              <span className="text-[11px] font-mono text-white/90 font-medium lowercase tracking-tight group-hover/item:text-primary transition-colors">
                {threat.domain}
              </span>
            </div>
            <div className="px-2 py-0.5 border border-primary/20 bg-primary/5">
              <span className="text-[8px] font-mono text-primary font-bold uppercase tracking-[0.2em] leading-none">
                {threat.source}
              </span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/30 tabular-nums">
              [{new Date(threat.firstSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}]
            </span>
          </div>
        ))}
      </div>

      {/* HUD Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />

      {/* Right Gradient Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0C0A09] via-[#0C0A09]/50 to-transparent pointer-events-none z-10" />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 60s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
