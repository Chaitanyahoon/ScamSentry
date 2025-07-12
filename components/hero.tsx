import Link from "next/link"
import { Shield, AlertTriangle, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 sm:py-32 lg:py-40">
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Subtle background pattern */}
        <svg
          className="absolute inset-0 h-full w-full stroke-gray-700 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid-pattern" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
        </svg>
      </div>
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 border-red-600 text-red-400 bg-red-900/20">
            <Shield className="mr-1 h-3 w-3" />
            Community-Driven Protection
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="text-red-500">ScamSentry</span>
            <br />
            <span className="mt-4 block text-2xl sm:text-4xl font-medium text-gray-300">
              Protecting Freelancers, One Report at a Time
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Join thousands of freelancers in building a safer work environment. Report scam job offers, view community
            alerts, and protect yourself and others from fraudulent clients and companies.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              <Link href="/report">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Report a Scam
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-gray-600 text-gray-200 hover:bg-gray-800 bg-transparent"
            >
              <Link href="/reports">
                <Users className="mr-2 h-5 w-5" />
                Browse Reports
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Anonymous Reporting</h3>
              <p className="mt-2 text-sm text-gray-400">Report scams without revealing your identity</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-900/30">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Scam Heatmap</h3>
              <p className="mt-2 text-sm text-gray-400">Visualize scam hotspots in your area</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-900/30">
                <Users className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Community Ratings</h3>
              <p className="mt-2 text-sm text-gray-400">Help verify and rate scam reports</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
