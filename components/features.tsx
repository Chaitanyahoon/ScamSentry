"use client"

import { useEffect, useState } from "react"
import { Shield, Users, MapPin, Search, AlertTriangle, Eye, Star, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function Features() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      name: "Anonymous Reporting",
      description:
        "Submit scam reports without revealing your identity. Optional fields for location, industry, and company details.",
      icon: Shield,
      gradient: "from-red-500 to-pink-600",
      glowColor: "group-hover:shadow-red-500/50",
    },
    {
      name: "Interactive Heatmap",
      description: "Visualize scam hotspots on an interactive map with filters by city, company, or scam type.",
      icon: MapPin,
      gradient: "from-orange-500 to-yellow-600",
      glowColor: "group-hover:shadow-orange-500/50",
    },
    {
      name: "Community Ratings",
      description: "Vote on report helpfulness and build trust scores. Community-driven verification system.",
      icon: Users,
      gradient: "from-yellow-500 to-amber-600",
      glowColor: "group-hover:shadow-yellow-500/50",
    },
    {
      name: "Advanced Search",
      description:
        "Full-text search across company names, cities, and keywords. Sort by recency, trust score, or flags.",
      icon: Search,
      gradient: "from-green-500 to-emerald-600",
      glowColor: "group-hover:shadow-green-500/50",
    },
    {
      name: "Scam Categories",
      description: "Structured tagging system for fake job offers, ghost clients, unpaid work, and portfolio theft.",
      icon: AlertTriangle,
      gradient: "from-blue-500 to-cyan-600",
      glowColor: "group-hover:shadow-blue-500/50",
    },
    {
      name: "Real-time Tracking",
      description:
        "Track your report status from submission to publication. Get notified when your report is reviewed.",
      icon: Eye,
      gradient: "from-purple-500 to-indigo-600",
      glowColor: "group-hover:shadow-purple-500/50",
    },
    {
      name: "Trust Scoring",
      description:
        "Each report gets a community trust score based on votes and verification. Badges for high-quality reports.",
      icon: Star,
      gradient: "from-pink-500 to-rose-600",
      glowColor: "group-hover:shadow-pink-500/50",
    },
    {
      name: "Moderation Tools",
      description: "Admin dashboard for approving reports, detecting duplicates, and flagging high-risk posts.",
      icon: Settings,
      gradient: "from-indigo-500 to-purple-600",
      glowColor: "group-hover:shadow-indigo-500/50",
    },
  ]

  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className={cn(
            "text-center mb-16",
            mounted ? "animate-slide-up" : "opacity-0"
          )}>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Comprehensive Protection
              </span>
              {" "}Features
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Everything you need to stay safe in the freelancing world
            </p>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={feature.name}
                className={cn(
                  "group relative overflow-hidden bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover-lift transition-all duration-500",
                  feature.glowColor,
                  mounted ? `animate-slide-up stagger-${Math.min(index + 1, 6)}` : "opacity-0"
                )}
              >
                {/* Gradient Border Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br p-[1px]",
                  feature.gradient
                )}>
                  <div className="h-full w-full rounded-lg bg-gray-800" />
                </div>

                <CardHeader className="relative pb-4">
                  {/* Icon with Gradient Background */}
                  <div className={cn(
                    "inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                    feature.gradient
                  )}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white mt-4 group-hover:text-purple-300 transition-colors">
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
