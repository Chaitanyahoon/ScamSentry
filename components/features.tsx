import { Shield, Users, MapPin, Search, AlertTriangle, Eye, Star, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Features() {
  const features = [
    {
      name: "Anonymous Reporting",
      description:
        "Submit scam reports without revealing your identity. Optional fields for location, industry, and company details.",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-900/20",
    },
    {
      name: "Interactive Heatmap",
      description: "Visualize scam hotspots on an interactive map with filters by city, company, or scam type.",
      icon: MapPin,
      color: "text-orange-500",
      bgColor: "bg-orange-900/20",
    },
    {
      name: "Community Ratings",
      description: "Vote on report helpfulness and build trust scores. Community-driven verification system.",
      icon: Users,
      color: "text-yellow-500",
      bgColor: "bg-yellow-900/20",
    },
    {
      name: "Advanced Search",
      description:
        "Full-text search across company names, cities, and keywords. Sort by recency, trust score, or flags.",
      icon: Search,
      color: "text-green-500",
      bgColor: "bg-green-900/20",
    },
    {
      name: "Scam Categories",
      description: "Structured tagging system for fake job offers, ghost clients, unpaid work, and portfolio theft.",
      icon: AlertTriangle,
      color: "text-blue-500",
      bgColor: "bg-blue-900/20",
    },
    {
      name: "Real-time Tracking",
      description:
        "Track your report status from submission to publication. Get notified when your report is reviewed.",
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-900/20",
    },
    {
      name: "Trust Scoring",
      description:
        "Each report gets a community trust score based on votes and verification. Badges for high-quality reports.",
      icon: Star,
      color: "text-pink-500",
      bgColor: "bg-pink-900/20",
    },
    {
      name: "Moderation Tools",
      description: "Admin dashboard for approving reports, detecting duplicates, and flagging high-risk posts.",
      icon: Settings,
      color: "text-indigo-500",
      bgColor: "bg-indigo-900/20",
    },
  ]

  return (
    <section className="py-16 bg-gray-900">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Comprehensive Protection Features
            </h2>
            <p className="mt-4 text-lg text-gray-400">Everything you need to stay safe in the freelancing world</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.name}
                className="relative overflow-hidden bg-gray-800 border-gray-700 hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="pb-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg text-white mt-4">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
