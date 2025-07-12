"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Copy, Twitter, Facebook, Linkedin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ScamReport } from "@/contexts/reports-context"

interface ShareableReportCardProps {
  report: ScamReport
  reportUrl: string // The full URL to the detailed report page
}

export function ShareableReportCard({ report, reportUrl }: ShareableReportCardProps) {
  const { toast } = useToast()

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportUrl)
    toast({
      title: "Link Copied!",
      description: "The report link has been copied to your clipboard.",
    })
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `🚨 New Scam Alert! "${report.title}" reported on ScamSentry. Protect yourself and others! #ScamSentry #FreelanceScam #ScamAlert`,
    )
    const url = encodeURIComponent(reportUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank")
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(reportUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank")
  }

  const shareOnLinkedin = () => {
    const title = encodeURIComponent(report.title)
    const summary = encodeURIComponent(`New scam reported on ScamSentry: "${report.title}". Learn more and stay safe!`)
    const url = encodeURIComponent(reportUrl)
    window.open(
      `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`,
      "_blank",
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">{report.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {report.company || "Unknown Company"}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {report.location || "Location not specified"}
              </div>
            </div>
          </div>
          <Badge variant={getRiskColor(report.riskLevel)} className="text-base px-3 py-1">
            {report.riskLevel} risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{report.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{report.scamType}</Badge>
          <Badge variant="outline">{report.industry || "Other"}</Badge>
          {report.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {report.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{report.tags.length - 2} more
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t dark:border-gray-700">
          <Button variant="outline" onClick={handleCopyLink} className="w-full sm:w-auto bg-transparent">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Share on:</span>
            <Button variant="ghost" size="icon" onClick={shareOnTwitter}>
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="sr-only">Share on Twitter</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={shareOnFacebook}>
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="sr-only">Share on Facebook</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={shareOnLinkedin}>
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span className="sr-only">Share on LinkedIn</span>
            </Button>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Link href={reportUrl} className="hover:underline">
            View Full Report Details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
