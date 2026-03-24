"use client"

import { useEffect, useState } from "react"
import { Shield, Users, MapPin, Search, AlertTriangle, Eye, Star, Settings, Terminal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function Features() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      name: "GHOST_PROTOCOL",
      description:
        "SUBMIT THREAT INTELLIGENCE WITHOUT COMPROMISING YOUR IDENTITY. SECURE DATA SANITIZATION ACTIVE.",
      icon: Shield,
      color: "text-primary",
      bgClass: "bg-primary/10",
      borderClass: "border-primary/50 group-hover:border-primary",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--primary),0.3)]",
    },
    {
      name: "RADAR_SWEEP",
      description: "LIVE THREAT HEATMAPS WITH TARGETED GEO-FILTERS AND VECTOR CLASSIFICATION.",
      icon: MapPin,
      color: "text-secondary",
      bgClass: "bg-secondary/10",
      borderClass: "border-secondary/50 group-hover:border-secondary",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--secondary),0.3)]",
    },
    {
      name: "CONSENSUS_ENGINE",
      description: "DECENTRALIZED WORKER VALIDATION. CROWD-SOURCED TRUST MATRICES FOR EACH LOGGED THREAT.",
      icon: Users,
      color: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/50 group-hover:border-warning",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--warning),0.3)]",
    },
    {
      name: "DEEP_QUERY",
      description:
        "FULL-TEXT INDEXING ACROSS SCAM LEDGERS. SORT BY SECTOR, ACTIVE STATUS, AND DESTRUCTIVE POTENTIAL.",
      icon: Search,
      color: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/50 group-hover:border-success",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--success),0.3)]",
    },
    {
      name: "THREAT_VECTORS",
      description: "STANDARDIZED CLASSIFYING OF FAKE CONTRACTS, MALICIOUS NODES, AND PHISHING OPERATIONS.",
      icon: AlertTriangle,
      color: "text-destructive",
      bgClass: "bg-destructive/10",
      borderClass: "border-destructive/50 group-hover:border-destructive",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--destructive),0.3)]",
    },
    {
      name: "LINK_MONITOR",
      description:
        "PING REAL-TIME UPDATES. TRACE YOUR FILED EXPLOITS THROUGH MODERATOR REVIEW PROTOCOLS.",
      icon: Eye,
      color: "text-primary",
      bgClass: "bg-primary/10",
      borderClass: "border-primary/50 group-hover:border-primary",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--primary),0.3)]",
    },
    {
      name: "TRUST_METRICS",
      description:
        "ACCUMULATING HEURISTIC WEIGHT FOR VERIFIED IDENTITIES. FILTER OUT FALSE POSITIVES RAPIDLY.",
      icon: Star,
      color: "text-secondary",
      bgClass: "bg-secondary/10",
      borderClass: "border-secondary/50 group-hover:border-secondary",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--secondary),0.3)]",
    },
    {
      name: "ROOT_ACCESS",
      description: "OVERWATCH CONSOLE FOR SYSTEM ADMINISTRATORS TO QUARANTINE SPAM AND PATCH VULNERABILITIES.",
      icon: Settings,
      color: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/50 group-hover:border-warning",
      shadowClass: "group-hover:shadow-[0_0_20px_hsla(var(--warning),0.3)]",
    },
  ]

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.2]" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className={cn(
            "text-center mb-16",
            mounted ? "animate-in fade-in slide-in-from-bottom-8 duration-500" : "opacity-0"
          )}>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/50 bg-primary/10 text-primary mb-6 shadow-[0_0_10px_hsla(var(--primary),0.3)]">
              <Terminal className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">CORE_MODULES_ONLINE</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-widest uppercase text-foreground sm:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <span className="text-primary drop-shadow-[0_0_10px_hsla(var(--primary),0.5)]">DEFENSIVE</span>{" "}
              UTILITIES
            </h2>
            <p className="mt-4 text-sm font-mono tracking-widest uppercase text-muted-foreground">
              ALL ASSETS REQUIRED TO IDENTIFY AND NEUTRALIZE ROGUE ENTITIES.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className={cn(
                  "group relative overflow-hidden glass-card transition-all duration-300 border-t-2",
                  feature.borderClass,
                  feature.shadowClass,
                  mounted ? `animate-in fade-in slide-in-from-bottom-12 duration-700 delay-${(index % 4) * 100}` : "opacity-0"
                )}
              >
                <div className="p-6">
                  {/* Icon with Glowing Border */}
                  <div className={cn(
                    "inline-flex h-12 w-12 items-center justify-center border transition-all duration-300 group-hover:scale-110",
                    feature.bgClass,
                    feature.borderClass
                  )}>
                    <feature.icon className={cn("h-6 w-6 drop-shadow-[0_0_8px_currentColor]", feature.color)} />
                  </div>
                  
                  <h3 className={cn("text-sm font-bold tracking-widest uppercase mt-6 mb-3 transition-colors drop-shadow-[0_0_5px_currentColor]", feature.color)}>
                    {feature.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed tracking-wide border-l border-border pl-3">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
