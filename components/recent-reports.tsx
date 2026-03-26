"use client"

import Link from "next/link"
import { Clock, MapPin, ThumbsUp, Flag, TerminalSquare, ArrowRight } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useReports } from "@/contexts/reports-context"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

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
      description: "Thank you for verifying this report.",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "< 1h ago"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 text-center sm:text-left gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary font-semibold text-sm rounded-sm">
                <TerminalSquare className="mr-2 h-4 w-4" /> Community Feed
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Recent Reports
              </h2>
            </div>
            <Link href="/reports">
              <Button
                variant="outline"
                className="font-semibold px-6"
              >
                View Database <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReports.length === 0 && (
              <div className="col-span-full border border-border p-12 text-center bg-card shadow-sm">
                <p className="text-muted-foreground font-medium text-sm">No recent threat reports available.</p>
              </div>
            )}
            
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-card flex flex-col justify-between border border-border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <Badge
                      className={cn(
                        "rounded-sm text-xs font-semibold shrink-0 cursor-default",
                        report.riskLevel === "high" && "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
                        report.riskLevel === "medium" && "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
                        report.riskLevel === "low" && "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10"
                      )}
                    >
                      {report.riskLevel} Risk
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {getTimeAgo(report.createdAt)}
                    </span>
                  </div>

                  <Link href={`/reports/${report.id}`} className="block group mb-3">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {report.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 text-primary/70" />
                      {report.location || "Online/Global"}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-border bg-card flex flex-wrap items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 font-medium text-muted-foreground hover:text-success hover:bg-success/10 -ml-2 text-sm transition-colors"
                    onClick={() => handleHelpfulVote(report.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {report.helpfulVotes > 0 ? `${report.helpfulVotes} Verified` : "Verify"}
                  </Button>

                  <Link href={`/reports/${report.id}`} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center">
                    Read Report →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
