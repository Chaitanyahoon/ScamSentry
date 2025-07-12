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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {recentReports.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">No reports available yet. Be the first to report a scam!</p>
              </div>
            )}
            {recentReports.map((report) => (
              <Card
                key={report.id}
                className="bg-gray-800 border-gray-700 hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/reports/${report.id}`} className="hover:underline">
                        <CardTitle className="text-lg line-clamp-2 mb-2 text-white">{report.title}</CardTitle>
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          {report.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          {getTimeAgo(report.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(report.riskLevel)} className="text-xs px-2 py-1">
                      {report.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{report.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {report.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-500 hover:text-green-400"
                        onClick={() => handleHelpfulVote(report.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {report.helpfulVotes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400"
                        onClick={() => handleFlag(report.id)}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Flag
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-gray-600 text-gray-200 hover:bg-gray-700 bg-transparent"
                    >
                      <Link href={`/reports/${report.id}`}>Read More</Link>
                    </Button>
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
