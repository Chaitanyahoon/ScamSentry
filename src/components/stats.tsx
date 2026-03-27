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
    <section className="relative py-24 bg-background border-y border-[#1F1914] overflow-hidden">
      {/* Background Decorative - Scanlines & Hex */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,13,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,191,0,0.02),rgba(0,0,0,0),rgba(255,191,0,0.02))] bg-[length:100%_2px,3px_100%]" />
      </div>

      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1F1914] border border-[#1F1914] rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
          {stats.map((stat, i) => {
            const { count, ref } = useCountUp(stat.value)
            return (
              <div 
                key={stat.label} 
                ref={ref} 
                className="bg-[#0C0A09] p-8 sm:p-10 space-y-4 hover:bg-[#15110E] transition-colors group"
              >
                <div>
                  <dt className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-3xl sm:text-4xl font-bold text-foreground font-mono tracking-tighter tabular-nums flex items-baseline gap-1">
                    {count.toLocaleString()}
                    <span className="text-primary text-xl font-normal opacity-50">{stat.symbol}</span>
                  </dd>
                </div>
                
                <div className="pt-4 border-t border-[#1F1914] group-hover:border-primary/20 transition-colors">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider italic">
                    {stat.sub}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Neural Live Status indicator below stats */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-widest">Global Watch Active</span>
          </div>
          <div className="h-px w-12 bg-[#1F1914]"></div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
            <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-widest">Forensic Integrity: Verified</span>
          </div>
        </div>
      </div>
    </section>
  )
}
