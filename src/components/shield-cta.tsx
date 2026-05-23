"use client";

import { Shield, Zap, Lock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ShieldCTA() {
  const features = [
    {
      icon: <Zap className="h-4 w-4 text-primary" />,
      title: "Zero-Latency Scanning",
      description: "Heuristic engine runs locally on every link before you click.",
    },
    {
      icon: <Search className="h-4 w-4 text-primary" />,
      title: "Structural DNA Audit",
      description: "Detects pixel-perfect clones and punycode homograph attacks.",
    },
    {
      icon: <Lock className="h-4 w-4 text-primary" />,
      title: "Privacy First",
      description: "No browsing data is ever stored. Deterministic scanning is king.",
    },
  ];

  return (
    <section className="relative py-32 sm:py-48 bg-[#0C0A09] border-b border-[#1F1914] overflow-hidden">
      {/* Background Decorative - Amber Fog */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[180px] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] z-0" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Left Side: Technical Visualization */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square relative flex items-center justify-center">
              {/* Outer HUD Rings */}
              <div className="absolute inset-0 border border-primary/5 rounded-full animate-spin-slow" />
              <div className="absolute inset-12 border border-primary/10 rounded-full animate-reverse-spin" />
              
              {/* The "Shield" Module Card */}
              <div className="relative z-10 w-full max-w-[380px] aspect-[4/5] bg-[#15110E] border border-[#1F1914] p-10 shadow-2xl shadow-primary/5 overflow-hidden group">
                {/* HUD Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,191,0,0.01)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
                
                <div className="h-full flex flex-col justify-between relative z-10">
                  <div className="space-y-8">
                    <div className="h-14 w-14 bg-primary/5 border border-primary/20 flex items-center justify-center">
                      <Shield className="h-7 w-7 text-primary text-glow-amber" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-bold text-white tracking-tighter uppercase font-mono">SCAMSENTRY_SHIELD</h4>
                      <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.3em] opacity-60">
                        BROWSER_CORE_v2.8.4
                      </p>
                    </div>
                  </div>
                  
                  {/* Forensic Data Stream Visualization */}
                  <div className="flex-1 my-10 border-y border-[#1F1914] bg-[#0C0A09]/50 flex items-center justify-center overflow-hidden p-6">
                    <div className="w-full font-mono text-[10px] space-y-1 text-muted-foreground/40">
                      <div className="flex justify-between">
                        <span>INIT_BOOT_SEQUENCE</span>
                        <span className="text-primary/40 text-[8px]">0xFD2</span>
                      </div>
                      <div className="h-1 w-full bg-[#1F1914] mt-2 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-primary/40 w-3/4 animate-pulse" />
                      </div>
                      <div className="pt-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-emerald-500/50" />
                          <span className="text-emerald-500/40">HEURISTIC_MATRIX_READY</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-primary/50" />
                          <span className="text-primary/40">DOMAIN_DNA_SYNCED</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-primary/50 animate-pulse" />
                          <span className="text-primary/60">LISTENING_FOR_THREATS...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#1F1914]">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-emerald-500/80 font-bold uppercase tracking-[0.2em]">PROTECTION_LIVE</span>
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground/20">EST_LATENCY: 12MS</div>
                  </div>
                </div>

                {/* Technical Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20" />
              </div>
            </div>
          </div>

          {/* Right Side: Deployment Content */}
          <div className="space-y-12 order-1 lg:order-2">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 border border-primary/20 px-3 py-1 bg-primary/5">
                <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.3em]">
                  END-USER_TERMINAL_ACCESS
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tighter uppercase font-mono leading-none">
                NEUTRALIZE_THREATS<br/>
                <span className="text-primary text-glow-amber italic">BEFORE_YOU_CLICK.</span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground/60 font-mono tracking-tight leading-relaxed max-w-xl border-l border-primary/20 pl-8">
                The web is hostile. Speed is the adversary's only advantage. ScamSentry Shield eliminates it. Our browser module scans every link as it renders, detecting pixel-perfect clones and forensic anomalies in milliseconds.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
              {features.map((feature) => (
                <div key={feature.title} className="space-y-3 group/feat">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/5 border border-primary/10 group-hover/feat:border-primary/40 transition-colors">
                      {feature.icon}
                    </div>
                    <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">{feature.title}</h5>
                  </div>
                  <p className="text-[12px] text-muted-foreground/50 font-mono tracking-tight leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <Link 
                href="/docs/extension"
                className="group relative inline-flex items-center gap-4 px-10 py-5 bg-primary text-[#0C0A09] font-mono font-bold uppercase text-xs tracking-[0.2em] hover:bg-white transition-all overflow-hidden"
              >
                DEPLOY_BROWSER_SHIELD
                <Shield className="h-4 w-4" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
