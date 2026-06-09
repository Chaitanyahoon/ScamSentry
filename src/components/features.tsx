"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Terminal,
  Shield,
  Layers,
  Cpu,
  Database,
  Brain,
  HelpCircle,
} from "lucide-react";

interface CapabilityItem {
  step: string;
  title: string;
  tag: string;
  detail: string;
  active?: boolean;
}

export function Features() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const capabilities: CapabilityItem[] = [
    {
      step: "L1",
      title: "Static Heuristics",
      tag: "Deterministic Check",
      detail:
        "Pattern-matches against known phishing signatures — punycode homographs, dash-stuffing, IP masking, and 60+ sketchy TLDs. Catches 90% of threats instantly with near-zero latency.",
    },
    {
      step: "L2",
      title: "Infrastructure Forensics",
      tag: "Deep DNS Resolve",
      detail:
        "Resolves target domains and inspects nameserver clusters, registrar patterns, and MX/A record layouts to fingerprint spam and phishing infrastructure clusters.",
    },
    {
      step: "L3",
      title: "Global Intelligence",
      tag: "Ecosystem Crosscheck",
      detail:
        "Real-time cross-referencing against PhishTank, OpenPhish, and Google Safe Browsing APIs to check if the target has active malware or engineering reports.",
    },
    {
      step: "L4",
      title: "Neural Cluster DNA",
      tag: "Threat Fingerprint",
      detail:
        "Generates unique structural and behavioral signatures for each threat domain, tracing active campaigns across registrant nameservers and hosting networks.",
    },
    {
      step: "L5",
      title: "Semantic Intelligence",
      tag: "AI Intent Auditor",
      detail:
        "Uses Gemini-1.5 AI to analyze the semantic intent, visual layout, and login prompts of the landing target to flag brand impersonations in milliseconds.",
      active: true,
    },
  ];

  const layerConfigs: Record<
    string,
    {
      colorClass: string;
      badgeClass: string;
      glowClass: string;
      markerClass: string;
      icon: React.ReactNode;
    }
  > = {
    L1: {
      colorClass: "border-l-4 border-l-emerald-500 hover:border-emerald-500/20",
      badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      glowClass: "via-emerald-500/20",
      markerClass: "text-emerald-400/80",
      icon: <Shield className="h-4 w-4 text-emerald-400" />,
    },
    L2: {
      colorClass: "border-l-4 border-l-cyan-500 hover:border-cyan-500/20",
      badgeClass: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      glowClass: "via-cyan-500/20",
      markerClass: "text-cyan-400/80",
      icon: <Cpu className="h-4 w-4 text-cyan-400" />,
    },
    L3: {
      colorClass: "border-l-4 border-l-indigo-500 hover:border-indigo-500/20",
      badgeClass: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      glowClass: "via-indigo-500/20",
      markerClass: "text-indigo-400/80",
      icon: <Database className="h-4 w-4 text-indigo-400" />,
    },
    L4: {
      colorClass: "border-l-4 border-l-purple-500 hover:border-purple-500/20",
      badgeClass: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      glowClass: "via-purple-500/20",
      markerClass: "text-purple-400/80",
      icon: <Layers className="h-4 w-4 text-purple-400" />,
    },
    L5: {
      colorClass: "border-l-4 border-l-primary hover:border-primary/20",
      badgeClass: "bg-primary/10 border-primary/30 text-primary",
      glowClass: "via-primary/20",
      markerClass: "text-primary/80",
      icon: <Brain className="h-4 w-4 text-primary animate-pulse" />,
    },
  };

  return (
    <section className="relative py-28 sm:py-36 bg-background border-b border-border overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.04] pointer-events-none" />

      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div
            className={cn(
              "mb-20 space-y-4",
              mounted ? "animate-fade-in" : "opacity-0",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary/50" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.25em]">
                System Architecture
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none">
              The Five Layers of{" "}
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                ScamSentry.
              </span>
            </h2>
            <p className="text-sm text-muted-foreground/80 max-w-xl leading-relaxed">
              Our forensic engine doesn&apos;t just scan; it dissects. From
              deterministic static heuristics to neural intent detection, every
              URL passes through a rigorous multi-stage pipeline.
            </p>
          </div>

          {/* Interactive Layer List */}
          <div className="space-y-5">
            {capabilities.map((item, index) => {
              const config = layerConfigs[item.step] || layerConfigs.L1;
              return (
                <div
                  key={item.step}
                  className={cn(
                    "relative bg-[#090b11]/80 border border-white/[0.04] backdrop-blur-xl p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:translate-x-2 overflow-hidden flex flex-col sm:flex-row gap-6",
                    config.colorClass,
                    mounted ? "animate-fade-in" : "opacity-0",
                    item.active &&
                      "bg-primary/[0.02] shadow-[0_0_20px_rgba(249,115,22,0.06)]",
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Cyber Grid overlay inside card */}
                  <div className="absolute inset-0 bg-grid-cyber opacity-[0.02] pointer-events-none" />

                  {/* Corner bracket ticks */}
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/[0.06] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/[0.06] pointer-events-none" />

                  {/* Layer Marker */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 shrink-0 sm:w-28 relative z-10">
                    <span
                      className={cn(
                        "text-xs font-mono font-bold tracking-widest flex items-center gap-1.5",
                        config.markerClass,
                      )}
                    >
                      {config.icon}
                      {item.step}
                    </span>
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider border",
                        config.badgeClass,
                      )}
                    >
                      {item.tag}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 relative z-10">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-sans">
                      {item.detail}
                    </p>
                  </div>

                  {/* Data Visualizer (decoration) */}
                  <div className="hidden lg:flex flex-col justify-center gap-1 opacity-10 group-hover:opacity-30 transition-opacity shrink-0 w-12">
                    <div
                      className={cn(
                        "h-1 w-12 rounded-full bg-white",
                        item.active && "bg-primary",
                      )}
                    />
                    <div
                      className={cn(
                        "h-1 w-8 rounded-full bg-white",
                        item.active && "bg-primary",
                      )}
                    />
                    <div
                      className={cn(
                        "h-1 w-10 rounded-full bg-white",
                        item.active && "bg-primary",
                      )}
                    />
                  </div>

                  {/* Layer Glow border line */}
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent",
                      config.glowClass,
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
