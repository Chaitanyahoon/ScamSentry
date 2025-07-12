import { TrendingUp, Shield, Users, MapPin } from "lucide-react"
import { useReports } from "@/contexts/reports-context"
import { Card, CardContent } from "@/components/ui/card"

export function Stats() {
  const { reports } = useReports()

  const approvedReports = reports.filter((r) => r.status === "approved")
  const totalViews = approvedReports.reduce((sum, report) => sum + report.views, 0)
  const totalHelpfulVotes = approvedReports.reduce((sum, report) => sum + report.helpfulVotes, 0)
  const uniqueCities = new Set(approvedReports.map((r) => r.city).filter(Boolean)).size

  const stats = [
    {
      name: "Reports Submitted",
      value: reports.length.toLocaleString(),
      icon: Shield,
      change: "+12%",
      changeType: "increase",
      color: "text-red-500",
      bgColor: "bg-red-900/20",
    },
    {
      name: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Users,
      change: "+8%",
      changeType: "increase",
      color: "text-blue-500",
      bgColor: "bg-blue-900/20",
    },
    {
      name: "Cities Covered",
      value: uniqueCities.toString(),
      icon: MapPin,
      change: "+23%",
      changeType: "increase",
      color: "text-orange-500",
      bgColor: "bg-orange-900/20",
    },
    {
      name: "Community Votes",
      value: totalHelpfulVotes.toLocaleString(),
      icon: TrendingUp,
      change: "+15%",
      changeType: "increase",
      color: "text-green-500",
      bgColor: "bg-green-900/20",
    },
  ]

  return (
    <section className="py-16 bg-gray-950">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Community Impact</h2>
            <p className="mt-4 text-lg text-gray-400">Together, we're building a safer freelancing ecosystem</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.name}
                className="relative overflow-hidden bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6 flex items-center">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${stat.bgColor}`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline mt-1">
                        <div className="text-2xl font-semibold text-white">{stat.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-500">
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
