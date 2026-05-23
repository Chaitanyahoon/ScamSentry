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
    <section className="relative py-24 sm:py-32 bg-background border-b border-[#1F1914] overflow-hidden">
      {/* Background Decorative - Amber Fog */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      
      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Illustration / Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square relative flex items-center justify-center">
              {/* Stylized Shield Layer 1 */}
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse blur-3xl opacity-50" />
              
              {/* The "Shield" Card */}
              <div className="relative z-10 w-full max-w-[340px] aspect-[4/5] bg-[#0C0A09] border border-[#1F1914] rounded-[32px] p-8 shadow-2xl shadow-primary/10 overflow-hidden group">
                {/* Internal Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,13,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
                
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-white tracking-tight">ScamSentry Shield</h4>
                      <p className="text-[11px] font-mono text-primary font-bold uppercase tracking-widest opacity-70">
                        Browser Intelligence v2.1
                      </p>
                    </div>
                  </div>
                  
                  {/* Visual Scanning Animation Placeholder */}
                  <div className="flex-1 my-8 border-y border-[#1F1914] bg-[#12100D] rounded-xl flex items-center justify-center overflow-hidden font-mono text-[10px] text-muted-foreground/30 leading-tight p-4">
                    <code>
                      DETERMINISTIC_SCAN_START...<br/>
                      L1_HEURISTICS: OK<br/>
                      L2_DOM_STRUCTURE: OK<br/>
                      L3_BLOCKLIST: NO_MATCH<br/>
                      <span className="text-primary/50 animate-pulse">SCANNING_L5_INTENT...</span>
                    </code>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#1F1914]">
                    <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Active Protect</span>
                    <div className="flex gap-1">
                      <div className="h-1 w-4 bg-primary rounded-full"></div>
                      <div className="h-1 w-2 bg-[#1F1914] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="space-y-10 order-1 lg:order-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.2em]">
                  Extension Now Live
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                Neutralize threats before you <span className="text-primary italic">click.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Most scams win because of speed. We take that advantage away. ScamSentry Shield scans every link as it renders in your browser, stopping forensic anomalies in milliseconds.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <h5 className="text-sm font-bold text-white tracking-tight">{feature.title}</h5>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Link 
                href="/docs/extension"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#0C0A09] font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
              >
                Add to Browser (Free)
                <Shield className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
