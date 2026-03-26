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

  const approved = reports.filter((r) => r.status === "approved")
  const totalViews = approved.reduce((sum, r) => sum + r.views, 0)
  const totalVotes = approved.reduce((sum, r) => sum + r.helpfulVotes, 0)
  const cities = new Set(approved.map((r) => r.city).filter(Boolean)).size

  const stats = [
    { label: "Reports filed",    value: reports.length },
    { label: "Total views",      value: totalViews },
    { label: "Cities covered",   value: cities },
    { label: "Helpful votes",    value: totalVotes },
  ]

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const { count, ref } = useCountUp(stat.value)
              return (
                <div key={stat.label} ref={ref} className="text-center sm:text-left">
                  <dd className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                    {count.toLocaleString()}
                  </dd>
                  <dt className="mt-1 text-xs text-muted-foreground">
                    {stat.label}
                  </dt>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
