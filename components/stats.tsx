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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const { count, ref } = useCountUp(stat.value)
              return (
                <Card
                  key={stat.name}
                  ref={ref}
                  className={cn(
                    "group relative overflow-hidden bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover-lift transition-all duration-500",
                    stat.glowColor,
                    `animate-slide-up stagger-${index + 1}`
                  )}
                >
                  {/* Gradient Border on Hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br p-[1px]",
                    stat.gradient
                  )}>
                    <div className="h-full w-full rounded-lg bg-gray-800" />
                  </div>

                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      {/* Icon */}
                      <div className={cn(
                        "flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110",
                        stat.gradient
                      )}>
                        <stat.icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Change Badge */}
                      <div className="flex items-center space-x-1 text-sm font-semibold text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span>{stat.change}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-400">{stat.name}</dt>
                      <dd className="mt-2 text-4xl font-bold text-white animate-pulse-glow">
                        {count.toLocaleString()}
                      </dd>
                    </div>
                  </CardContent>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 pointer-events-none" />
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
