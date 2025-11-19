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
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg
          className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
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
          <div className={`mb-6 inline-block ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            <Badge variant="outline" className="glass border-white/20 text-white bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Shield className="mr-2 h-4 w-4 text-purple-300" />
              Community-Driven Protection
              <Sparkles className="ml-2 h-4 w-4 text-yellow-300 animate-pulse-glow" />
            </Badge>
          </div>

          {/* Main Heading with gradient */}
          <h1 className={`text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              ScamSentry
            </span>
            <span className="mt-4 block text-3xl sm:text-5xl font-semibold text-white/90">
              Protecting Freelancers,
              <br />
              <span className="text-purple-300">One Report at a Time</span>
            </span>
          </h1>

          {/* Description */}
          <p className={`mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
            Join thousands of freelancers in building a safer work environment. Report scam job offers, view community
            alerts, and protect yourself and others from fraudulent clients and companies.
          </p>

          {/* CTA Buttons */}
          <div className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-slide-up stagger-3' : 'opacity-0'}`}>
            <Button
              asChild
              size="lg"
              className="group w-full sm:w-auto gradient-danger text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold"
            >
              <Link href="/report">
                <AlertTriangle className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Report a Scam
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group w-full sm:w-auto glass border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold"
            >
              <Link href="/reports">
                <Users className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Browse Reports
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className={`mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 ${mounted ? 'animate-fade-in stagger-4' : 'opacity-0'}`}>
            <div className="group glass rounded-2xl p-6 hover-lift transition-smooth hover:bg-white/15">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg group-hover:shadow-red-500/50 transition-shadow">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Anonymous Reporting</h3>
              <p className="mt-2 text-sm text-gray-300">Report scams without revealing your identity</p>
            </div>

            <div className="group glass rounded-2xl p-6 hover-lift transition-smooth hover:bg-white/15">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Scam Heatmap</h3>
              <p className="mt-2 text-sm text-gray-300">Visualize scam hotspots in your area</p>
            </div>

            <div className="group glass rounded-2xl p-6 hover-lift transition-smooth hover:bg-white/15">
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
