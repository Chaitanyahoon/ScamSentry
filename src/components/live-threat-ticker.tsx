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
    <div className="w-full bg-[#0C0A09] border-y border-[#1F1914] py-3 overflow-hidden relative group">
      {/* Ticker Header / Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 bg-[#0C0A09] border-r border-[#1F1914] flex items-center px-4 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em] whitespace-nowrap">
            Live Intelligence
          </span>
        </div>
      </div>

      {/* Scrolling Container */}
      <div className="flex whitespace-nowrap animate-marquee group-hover:pause-marquee pl-[140px]">
        {scrollingThreats.map((threat, idx) => (
          <div 
            key={`${threat.domain}-${idx}`}
            className="inline-flex items-center gap-4 px-6 border-r border-[#1F1914] last:border-r-0"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3 w-3 text-primary opacity-70" />
              <span className="text-[11px] font-mono text-white font-medium lowercase tracking-tight">
                {threat.domain}
              </span>
            </div>
            <div className="px-1.5 py-0.5 rounded-[4px] bg-primary/10 border border-primary/20">
              <span className="text-[8px] font-mono text-primary font-bold uppercase tracking-tighter">
                {threat.source}
              </span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">
              {new Date(threat.firstSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Right Gradient Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0C0A09] to-transparent pointer-events-none z-10" />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 40s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
