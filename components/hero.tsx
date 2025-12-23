"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, AlertTriangle, Users, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-24 sm:py-32 lg:py-40">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animated-gradient opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <svg
          className="absolute inset-0 h-full w-full stroke-white/20 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid-pattern" width="80" height="80" x="50%" y="-1" patternUnits="userSpaceOnUse">
              <path d="M.5 80V.5H80" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with animation */}
          <div className={`mb-8 inline-block ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            <Badge variant="outline" className="glass-card border-white/10 text-white bg-white/5 px-6 py-2 text-sm backdrop-blur-md rounded-full">
              <Shield className="mr-2 h-4 w-4 text-purple-300" />
              Community-Driven Protection
              <Sparkles className="ml-2 h-4 w-4 text-yellow-300 animate-pulse-glow" />
            </Badge>
          </div>

          {/* Main Heading with gradient */}
          <h1 className={`text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
            <span className="block bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent pb-2">
              ScamSentry
            </span>
            <span className="mt-4 block text-xl sm:text-3xl font-medium text-gray-200 tracking-wide">
              Protecting Freelancers,
              <br />
              <span className="text-purple-200/80">One Report at a Time</span>
            </span>
          </h1>

          {/* Description */}
          <p className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-300/80 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
            Join thousands of freelancers in building a safer work environment. Report scam job offers, view community
            alerts, and protect yourself.
          </p>

          {/* CTA Buttons */}
          <div className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 ${mounted ? 'animate-slide-up stagger-3' : 'opacity-0'}`}>
            <Button
              asChild
              size="lg"
              className="group w-3/4 max-w-xs sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20 transition-all duration-300 px-8 py-7 text-lg font-medium rounded-2xl backdrop-blur-sm"
            >
              <Link href="/report">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-400 group-hover:text-red-300 transition-colors" />
                Report a Scam
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group w-3/4 max-w-xs sm:w-auto glass-card border-white/10 text-white hover:bg-white/10 transition-all duration-300 px-8 py-7 text-lg font-medium rounded-2xl"
            >
              <Link href="/reports">
                <Users className="mr-2 h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                Browse Reports
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className={`mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 place-items-center ${mounted ? 'animate-fade-in stagger-4' : 'opacity-0'}`}>
            <div className="group glass rounded-2xl p-6 hover-lift transition-smooth hover:bg-white/15 w-full max-w-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg group-hover:shadow-red-500/50 transition-shadow">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Anonymous Reporting</h3>
              <p className="mt-2 text-sm text-gray-300">Report scams without revealing your identity</p>
            </div>

            <div className="group glass rounded-2xl p-6 hover-lift transition-smooth hover:bg-white/15 w-full max-w-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Scam Heatmap</h3>
              <p className="mt-2 text-sm text-gray-300">Visualize scam hotspots in your area</p>
            </div>

            <div className="group glass rounded-2xl p-6 hover-lift transition-smooth hover:bg-white/15 w-full max-w-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Community Ratings</h3>
              <p className="mt-2 text-sm text-gray-300">Help verify and rate scam reports</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
