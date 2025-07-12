"use client"

import { useEffect, useState } from "react" // Import useState
import { useParams, useRouter } from "next/navigation"
import { useReports } from "@/contexts/reports-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Tag, Clock, ThumbsUp, Flag, Eye, Shield, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReportDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reports, voteHelpful, flagReport, incrementViews } = useReports()
  const { toast } = useToast()

  // Client-side state to track if a user has voted/flagged this specific report
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false)
  const [hasFlagged, setHasFlagged] = useState(false)

  const report = reports.find((r) => r.id === id)

  // Increment views when the component mounts
  useEffect(() => {
    if (id) {
      incrementViews(id as string)
    }
    // we intentionally omit incrementViews from deps – the callback is stable now
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Report Not Found</CardTitle>
            <CardDescription>The scam report you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/reports")}>Back to All Reports</Button>
          </CardContent>
        </Card>
      </div>
    )
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

  const handleHelpfulVote = () => {
    if (!hasVotedHelpful) {
      voteHelpful(report.id)
      setHasVotedHelpful(true)
      toast({
        title: "Vote Recorded",
        description: "Thank you for helping the community!",
      })
    } else {
      toast({
        title: "Already Voted",
        description: "You have already marked this report as helpful.",
        variant: "info",
      })
    }
  }

  const handleFlag = () => {
    if (!hasFlagged) {
      flagReport(report.id)
      setHasFlagged(true)
      toast({
        title: "Report Flagged",
        description: "Thank you for helping maintain quality. This report will be reviewed.",
      })
    } else {
      toast({
        title: "Already Flagged",
        description: "You have already flagged this report.",
        variant: "info",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            ← Back to Reports
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">{report.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {report.company || "Unknown Company"}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {report.location || "Location not specified"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {getTimeAgo(report.createdAt)}
                    </div>
                  </CardDescription>
                </div>
                <Badge variant={getRiskColor(report.riskLevel)} className="text-base px-3 py-1">
                  {report.riskLevel} risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Scam Details
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Scam Type:</h4>
                  <Badge variant="secondary" className="text-base">
                    {report.scamType}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Industry:</h4>
                  <Badge variant="secondary" className="text-base">
                    {report.industry || "Not specified"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.tags.length > 0 ? (
                    report.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags provided.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Trust Score
                  </h4>
                  <Badge variant="outline" className="text-base">
                    {report.trustScore}%
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Views
                  </h4>
                  <Badge variant="outline" className="text-base">
                    {report.views}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="text-green-600 hover:text-green-700"
                  onClick={handleHelpfulVote}
                  disabled={hasVotedHelpful}
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  Helpful ({report.helpfulVotes})
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleFlag}
                  disabled={hasFlagged}
                >
                  <Flag className="h-5 w-5 mr-2" />
                  Flag ({report.flagCount})
                </Button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Report ID: {report.id} | Submitted: {new Date(report.createdAt).toLocaleString()}
                {report.anonymous ? " (Anonymous)" : ` (Contact: ${report.email})`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
