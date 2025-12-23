"use client"

import { useEffect, useState, useRef } from "react"
import { TrendingUp, Shield, Users, MapPin } from "lucide-react"
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
      name: "Reports Submitted",
      value: reports.length,
      icon: Shield,
      change: "+12%",
      gradient: "from-red-500 to-pink-600",
      glowColor: "group-hover:shadow-red-500/50",
    },
    {
      name: "Total Views",
      value: totalViews,
      icon: Users,
      change: "+8%",
      gradient: "from-blue-500 to-cyan-600",
      glowColor: "group-hover:shadow-blue-500/50",
    },
    {
      name: "Cities Covered",
      value: uniqueCities,
      icon: MapPin,
      change: "+23%",
      gradient: "from-orange-500 to-yellow-600",
      glowColor: "group-hover:shadow-orange-500/50",
    },
    {
      name: "Community Votes",
      value: totalHelpfulVotes,
      icon: TrendingUp,
      change: "+15%",
      gradient: "from-green-500 to-emerald-600",
      glowColor: "group-hover:shadow-green-500/50",
    },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Community <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Impact</span>
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Together, we're building a safer freelancing ecosystem
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const { count, ref } = useCountUp(stat.value)
              return (
                <div
                  key={stat.name}
                  ref={ref}
                  className={`relative overflow-hidden glass-card p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${stat.glowColor.replace('shadow-', 'hover:shadow-')}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 backdrop-blur-md shadow-inner`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Change Badge */}
                    <div className="flex items-center space-x-1 text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-400">{stat.name}</dt>
                    <dd className="mt-2 text-3xl font-bold text-white tracking-tight">
                      {count.toLocaleString()}
                    </dd>
                  </div>
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </section>
  )
}
