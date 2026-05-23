"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert, Activity } from "lucide-react";

interface TickerItem {
  text: string;
  source: string;
  isIncident: boolean;
  isHighlight: boolean;
  time: string;
}

export function LiveThreatTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchThreatsAndIncidents = async () => {
      try {
        const res = await fetch("/api/threats/recent");
        if (!res.ok) {
          console.warn("[Ticker] Intelligence feed currently unavailable");
          return;
        }
        const data = await res.json();
        
        const parsedThreats = (data.threats || []).map((t: any) => ({
          text: t.domain,
          source: t.source || "OSINT",
          isIncident: false,
          isHighlight: false,
          time: t.firstSeen || new Date().toISOString()
        }));

        const parsedIncidents = (data.incidents || []).map((i: any) => ({
          text: i.title,
          source: i.source || "Advisory",
          isIncident: true,
          isHighlight: i.isHighlight || false,
          time: i.publishedAt || new Date().toISOString()
        }));

        // Sort: Highlights at the front, then alternate
        const highlights = parsedIncidents.filter((i: any) => i.isHighlight);
        const regularIncidents = parsedIncidents.filter((i: any) => !i.isHighlight);
        
        const combined = [...highlights, ...parsedThreats, ...regularIncidents];
        if (combined.length > 0) {
          setItems(combined);
        }
      } catch (error) {
        console.error("Failed to fetch live threat ledger", error);
      }
    };

    fetchThreatsAndIncidents();
    const interval = setInterval(fetchThreatsAndIncidents, 45000); // Sync every 45s
    return () => clearInterval(interval);
  }, []);

  if (!mounted || items.length === 0) return null;

  // Double the array for seamless infinite marquee scroll
  const scrollingItems = [...items, ...items];

  return (
    <div className="w-full bg-[#0C0A09] border-y border-[#1F1914] py-3 overflow-hidden relative group">
      {/* Ticker Header / Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 bg-[#0C0A09] border-r border-[#1F1914] flex items-center px-4 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em] whitespace-nowrap">
            Live Overwatch Telemetry
          </span>
        </div>
      </div>

      {/* Scrolling Container */}
      <div className="flex whitespace-nowrap animate-marquee group-hover:pause-marquee pl-[180px]">
        {scrollingItems.map((item, idx) => (
          <div 
            key={`${item.text}-${idx}`}
            className={cn(
              "inline-flex items-center gap-4 px-6 border-r border-[#1F1914] last:border-r-0 transition-colors",
              item.isHighlight ? "bg-red-500/[0.03]" : ""
            )}
          >
            <div className="flex items-center gap-2">
              {item.isIncident ? (
                <ShieldAlert className={cn(
                  "h-3.5 w-3.5", 
                  item.isHighlight ? "text-red-500 animate-bounce" : "text-amber-500"
                )} />
              ) : (
                <ShieldAlert className="h-3 w-3 text-primary opacity-70" />
              )}
              <span className={cn(
                "text-[11px] font-mono tracking-tight",
                item.isHighlight 
                  ? "text-red-400 font-bold uppercase tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                  : item.isIncident 
                  ? "text-amber-300 font-medium uppercase" 
                  : "text-white lowercase"
              )}>
                {item.text}
              </span>
            </div>
            <div className={cn(
              "px-1.5 py-0.5 rounded-[4px] border",
              item.isHighlight 
                ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse font-black" 
                : item.isIncident 
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                : "bg-primary/10 border-primary/20 text-primary"
            )}>
              <span className="text-[8px] font-mono font-bold uppercase tracking-tighter">
                {item.isHighlight ? "CRITICAL BULLETIN" : item.source}
              </span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">
              {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
          animation: marquee 50s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
