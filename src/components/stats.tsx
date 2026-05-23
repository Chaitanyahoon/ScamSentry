"use client"

import { useEffect, useState, useRef } from "react"
import { useReports } from "@/contexts/reports-context"

function useCountUp(end: number, duration: number = 1600) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime: number | null = null
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return { count, ref }
}

export function Stats() {
  const { reports } = useReports()

  // Real data plus some global metrics (simulated)
  const approved = reports.filter((r) => r.status === "approved")
  const threatsTotal = 42891 + reports.length;
  const coverage = 99.8;
  const syncs = 24;

  const stats = [
    { label: "Neural Detections", value: threatsTotal, sub: "Global Intel Count", symbol: "+" },
    { label: "Community Intel",  value: reports.length, sub: "Verified Submissions", symbol: "" },
    { label: "Platform Uptime",  value: coverage, sub: "Forensic Availability", symbol: "%" },
    { label: "Daily Feed Syncs", value: syncs, sub: "OSINT Updates", symbol: "" },
  ]

  return (
    <section className="relative py-32 bg-[#0C0A09] border-y border-[#1F1914] overflow-hidden">
      {/* Background Decorative - HUD Ornaments */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-[0_0_15px_rgba(255,191,0,0.1)]" />
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] pointer-events-none" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Telemetry Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-l border-primary/20 pl-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 bg-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em]">SYSTEM_METRICS</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tighter uppercase font-mono">GLOBAL_THREAT_CORRELATION</h2>
          </div>
          <div className="hidden md:block">
            <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em]">REFRESH_RATE: 30S_REALTIME</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1F1914] border border-[#1F1914] shadow-2xl shadow-primary/5">
          {stats.map((stat, i) => {
            const { count, ref } = useCountUp(stat.value)
            return (
              <div 
                key={stat.label} 
                ref={ref} 
                className="bg-[#15110E] p-10 space-y-6 hover:bg-[#1A1612] transition-all group relative overflow-hidden"
              >
                {/* HUD Scanline per Card */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,191,0,0.01)_1px,transparent_1px)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <dt className="text-[10px] font-mono font-bold text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="h-1 w-3 bg-primary/20 group-hover:bg-primary/60 transition-colors" />
                    {stat.label}
                  </dt>
                  <dd className="text-4xl sm:text-5xl font-bold text-foreground font-mono tracking-tighter tabular-nums flex items-baseline gap-1">
                    <span className="group-hover:text-primary group-hover:text-glow-amber transition-all duration-500">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-primary/30 text-xl font-normal tracking-normal">{stat.symbol}</span>
                  </dd>
                </div>
                
                <div className="pt-6 border-t border-[#1F1914] group-hover:border-primary/20 transition-colors relative z-10">
                  <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest leading-none">
                    DATA_SOURCE: <span className="text-muted-foreground/60">{stat.sub}</span>
                  </p>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#1F1914] group-hover:border-primary/20 transition-colors" />
              </div>
            )
          })}
        </div>

        {/* Distributed Computing Overlay status */}
        <div className="mt-16 bg-[#15110E]/50 border border-[#1F1914] p-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-mono text-muted-foreground/60 font-bold uppercase tracking-widest">GLOBAL_WATCH_ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-mono text-muted-foreground/60 font-bold uppercase tracking-widest">DRM_VERIFIED: FORENSIC_INTEGRITY</span>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-[#1F1914] pl-8">
            <span className="text-[9px] font-mono text-muted-foreground/20 italic">v4.2.0_STABLE_RELEASE</span>
          </div>
        </div>
      </div>
    </section>
  )
}
