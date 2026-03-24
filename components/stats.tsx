"use client"

import { useEffect, useState, useRef } from "react"
import { TrendingUp, Shield, Users, MapPin, Terminal } from "lucide-react"
import { useReports } from "@/contexts/reports-context"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Animated Counter Hook
function useCountUp(end: number, duration: number = 2000) {
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
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return { count, ref }
}

export function Stats() {
  const { reports } = useReports()

  const approvedReports = reports.filter((r) => r.status === "approved")
  const totalViews = approvedReports.reduce((sum, report) => sum + report.views, 0)
  const totalHelpfulVotes = approvedReports.reduce((sum, report) => sum + report.helpfulVotes, 0)
  const uniqueCities = new Set(approvedReports.map((r) => r.city).filter(Boolean)).size

  const stats = [
    {
      name: "THREATS_LOGGED",
      value: reports.length,
      icon: Shield,
      change: "+12.4%",
      color: "text-primary",
      bgClass: "bg-primary/10",
      borderClass: "border-primary/50",
      shadowClass: "shadow-[0_0_15px_hsla(var(--primary),0.3)]"
    },
    {
      name: "DATABASE_QUERIES",
      value: totalViews,
      icon: Terminal,
      change: "+8.1%",
      color: "text-secondary",
      bgClass: "bg-secondary/10",
      borderClass: "border-secondary/50",
      shadowClass: "shadow-[0_0_15px_hsla(var(--secondary),0.3)]"
    },
    {
      name: "SECTORS_TRACKED",
      value: uniqueCities,
      icon: MapPin,
      change: "+23.7%",
      color: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/50",
      shadowClass: "shadow-[0_0_15px_hsla(var(--warning),0.3)]"
    },
    {
      name: "PEER_VALIDATIONS",
      value: totalHelpfulVotes,
      icon: Users,
      change: "+15.2%",
      color: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/50",
      shadowClass: "shadow-[0_0_15px_hsla(var(--success),0.3)]"
    },
  ]

  return (
    <section className="relative py-24 bg-background overflow-hidden border-y border-border">
      {/* Background Cyber Matriz */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-4xl font-extrabold tracking-widest uppercase text-foreground sm:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              SYSTEM <span className="text-primary drop-shadow-[0_0_10px_hsla(var(--primary),0.5)]">TELEMETRY</span>
            </h2>
            <p className="mt-4 text-sm font-mono tracking-widest uppercase text-muted-foreground">
              LIVE NETWORK VITAL STATISTICS. CONSTANT VIGILANCE.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const { count, ref } = useCountUp(stat.value)
              return (
                <div
                  key={stat.name}
                  ref={ref}
                  className={cn("relative overflow-hidden glass-card p-6 transition-all duration-300 hover:scale-105 border-t-2", stat.borderClass, stat.shadowClass)}
                >
                  <div className="flex items-center justify-between mb-6">
                    {/* Icon */}
                    <div className={cn("flex items-center justify-center w-12 h-12 border", stat.bgClass, stat.borderClass)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>

                    {/* Change Badge */}
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold tracking-widest uppercase text-success bg-success/10 px-2 py-1 border border-success/30 shadow-[0_0_5px_hsla(var(--success),0.2)]">
                      <TrendingUp className="w-3 h-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>

                  <div>
                    <dt className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.name}</dt>
                    <dd className={cn("mt-2 text-4xl font-extrabold tracking-tight drop-shadow-[0_0_5px_currentColor]", stat.color)}>
                      {count.toLocaleString()}
                    </dd>
                  </div>
                  
                  {/* Decorative Scanline */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </section>
  )
}
