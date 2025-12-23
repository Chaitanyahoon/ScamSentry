"use client"

import Link from "next/link"
import { Clock, MapPin, ThumbsUp, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useReports } from "@/contexts/reports-context"
import { useToast } from "@/components/ui/use-toast"

export function RecentReports() {
  const { reports, voteHelpful, flagReport } = useReports()
  const { toast } = useToast()

  // Get the 4 most recent approved reports
  const recentReports = reports
    .filter((report) => report.status === "approved")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const handleHelpfulVote = (reportId: string) => {
    voteHelpful(reportId)
    toast({
      title: "Vote Recorded",
      description: "Thank you for helping the community!",
    })
  }

  const handleFlag = (reportId: string) => {
    flagReport(reportId)
    toast({
      title: "Report Flagged",
      description: "This report will be reviewed by our moderation team.",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <section className="py-16 bg-gray-950">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 text-center sm:text-left">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Recent Reports</h2>
              <p className="mt-4 text-lg text-gray-400">Latest scam reports from the community</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="mt-6 sm:mt-0 border-gray-600 text-gray-200 hover:bg-gray-800 bg-transparent"
            >
              <Link href="/reports">View All Reports</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentReports.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">No reports available yet. Be the first to report a scam!</p>
              </div>
            )}
            {recentReports.map((report) => (
              <Card
                key={report.id}
                className="glass-card border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <Badge variant={getRiskColor(report.riskLevel)} className="rounded-full px-2.5 py-0.5 text-[10px] bg-white/5 border-white/10 backdrop-blur-sm shadow-sm">
                      {report.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 font-mono">{getTimeAgo(report.createdAt)}</span>
                  </div>

                  <Link href={`/reports/${report.id}`} className="block group-hover:text-purple-300 transition-colors mb-3">
                    <CardTitle className="text-lg font-bold leading-snug text-white line-clamp-2">{report.title}</CardTitle>
                  </Link>

                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4">{report.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center bg-white/5 rounded-full px-2 py-1">
                      <MapPin className="h-3 w-3 mr-1.5" />
                      {report.location || "Online"}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-400/10 -ml-2 text-xs"
                    onClick={() => handleHelpfulVote(report.id)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                    {report.helpfulVotes > 0 ? `${report.helpfulVotes} Helpful` : "Helpful?"}
                  </Button>

                  <Link href={`/reports/${report.id}`} className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    Read More →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
