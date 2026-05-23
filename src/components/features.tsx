"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Features() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const capabilities = [
    {
      step: "L1",
      title: "Static Heuristics",
      tag: "Deterministic",
      detail:
        "Pattern-matches against known phishing signatures — punycode homographs, dash-stuffing, IP masking, and 60+ sketchy TLDs. Catches 90% of threats instantly, zero latency.",
    },
    {
      step: "L2",
      title: "Infrastructure Forensics",
      tag: "Deep Resolve",
      detail:
        "Resolves target domains and inspects nameserver clusters, registrar clusters, and MX/A record patterns for infrastructure-based threat fingerprinting.",
    },
    {
      step: "L3",
      title: "Global Intelligence",
      tag: "Collective Intel",
      detail:
        "Real-time cross-referencing against PhishTank, OpenPhish, and Google Safe Browsing ecosystems to identify reported malware and social engineering campaigns.",
    },
    {
      step: "L4",
      title: "Neural Cluster DNA",
      tag: "Forensic SHA-256",
      detail:
        "Generates unique structural fingerprints for every threat, tracking the technical 'DNA' of threat actor infrastructure across different URLs and campaigns.",
    },
    {
      step: "L5",
      title: "Semantic Intelligence",
      tag: "AI Intent Detection",
      detail:
        "Uses Gemini-1.5 AI to analyze the semantic intent and visual structure of the page, identifying high-fidelity psychological triggers in milliseconds.",
      active: true
    },
  ];

  return (
    <section className="relative py-32 sm:py-48 bg-[#0C0A09] border-b border-[#1F1914] overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] z-0" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-24">
          {/* Section Header - Command Center Style */}
          <div className={cn("space-y-8 text-center sm:text-left", mounted ? "animate-fade-in" : "opacity-0")}>
            <div className="inline-flex items-center gap-4 border border-primary/20 px-4 py-2 bg-primary/5">
              <span className="h-1 w-1 bg-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em]">
                DETECTION_ARCHITECTURE_v4
              </span>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tighter uppercase font-mono leading-none">
                THE_FIVE_LAYERS_OF_<span className="text-primary text-glow-amber italic">SCAMSENTRY.</span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground/60 font-mono tracking-tight max-w-2xl border-l border-primary/20 pl-8 leading-relaxed">
                Our forensic engine doesn't just scan; it dissects. From deterministic heuristics to neural intent detection, every URL passes through a gauntlet of verification protocols. Multi-stage cross-correlation.
              </p>
            </div>
          </div>

          {/* Forensic Intelligence Gauntlet */}
          <div className="grid grid-cols-1 gap-8 stagger-2">
            {capabilities.map((item, index) => (
              <div
                key={item.step}
                className={cn(
                  "group relative bg-[#15110E] border border-[#1F1914] transition-all duration-700 hover:border-primary/40 hover:-translate-y-1 overflow-hidden",
                  mounted ? "animate-fade-in" : "opacity-0",
                  item.active && "border-primary/20 shadow-[0_0_30px_rgba(255,191,0,0.05)_inset]"
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* HUD Scanline Overlay on Hover */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,191,0,0.02)_1px,transparent_1px)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="p-8 sm:p-12 flex flex-col md:flex-row gap-8 md:items-center relative z-10">
                  {/* Layer Metadata Node */}
                  <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-6 shrink-0 md:w-40 border-b md:border-b-0 md:border-r border-primary/10 pb-6 md:pb-0 md:pr-10">
                    <div className="space-y-1">
                      <span className={cn(
                        "text-3xl font-mono font-black tracking-tighter leading-none block",
                        item.active ? "text-primary text-glow-amber" : "text-muted-foreground/20"
                      )}>
                        {item.step}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em]">NODE_INDEX</span>
                    </div>
                    <div className={cn(
                      "px-3 py-1 border font-mono text-[9px] font-bold uppercase tracking-widest leading-none",
                      item.active ? "bg-primary/10 border-primary/30 text-primary" : "border-[#1F1914] text-muted-foreground/20"
                    )}>
                      {item.tag}
                    </div>
                  </div>

                  {/* Core Content Layer */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase tracking-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground/60 font-mono tracking-tight leading-relaxed max-w-xl">
                      {item.detail}
                    </p>
                  </div>

                  {/* Decorative Terminal Data Stream hide on mobile */}
                  <div className="hidden lg:flex flex-col items-end gap-2 opacity-5 group-hover:opacity-20 transition-all duration-700">
                    <div className="h-0.5 w-24 bg-primary/20" />
                    <div className="h-0.5 w-16 bg-primary" />
                    <div className="h-0.5 w-32 bg-primary/40" />
                    <div className="text-[8px] font-mono text-primary uppercase tracking-[0.4em] mt-2">PARSING_DNA_{index}</div>
                  </div>
                </div>

                {/* Corner Decorative Brackets */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/0 group-hover:border-primary transition-all duration-300" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/0 group-hover:border-primary transition-all duration-300" />
                
                {/* Active Layer Status Bar */}
                {item.active && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-primary/40 shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
                )}
              </div>
            ))}
          </div>

          {/* Source Verification Footer */}
          <div className="pt-20 border-t border-[#1F1914] flex flex-wrap justify-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
             {["Deterministic Heuristics", "OSINT Threat Feeds", "Community Consensus", "Neural Intent Matrix"].map((source) => (
                <div key={source} className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-primary" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">{source}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
