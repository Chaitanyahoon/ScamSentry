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
    <section className="relative py-28 sm:py-36 bg-[#0C0A09] border-b border-[#1F1914] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={cn("mb-20 space-y-4", mounted ? "animate-fade-in" : "opacity-0")}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary/50" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">
                System Architecture
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none">
              The Five Layers of <span className="text-primary italic">ScamSentry.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Our forensic engine doesn't just scan; it dissects. From deterministic heuristics to neural intent detection, every URL passes through a gauntlet of verification.
            </p>
          </div>

          {/* Interactive Layer List */}
          <div className="space-y-4">
            {capabilities.map((item, index) => (
              <div
                key={item.step}
                className={cn(
                  "group relative p-6 sm:p-8 rounded-2xl border border-[#1F1914] bg-[#12100D] transition-all duration-300 hover:border-primary/30 hover:bg-[#15110E] hover:translate-x-1",
                  mounted ? "animate-fade-in" : "opacity-0",
                  item.active && "border-primary/20 bg-primary/[0.02]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Layer Marker */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4 shrink-0 sm:w-24">
                    <span className={cn(
                      "text-xs font-mono font-bold tracking-widest",
                      item.active ? "text-primary" : "text-muted-foreground/50"
                    )}>
                      {item.step}
                    </span>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-tighter border",
                      item.active ? "bg-primary/10 border-primary/30 text-primary" : "border-[#1F1914] text-muted-foreground/30"
                    )}>
                      {item.tag}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  {/* Data Visualizer (decoration) */}
                  <div className="hidden lg:flex flex-col justify-center gap-1 opacity-10 group-hover:opacity-30 transition-opacity">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <div className="h-1 w-8 bg-primary rounded-full"></div>
                    <div className="h-1 w-10 bg-primary rounded-full"></div>
                  </div>
                </div>

                {/* Layer Glow for active L5 */}
                {item.active && (
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
