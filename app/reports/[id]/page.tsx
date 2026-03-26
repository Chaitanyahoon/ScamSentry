"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useReports } from "@/contexts/reports-context"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Tag, Clock, ThumbsUp, Flag, Eye, ShieldAlert, ArrowLeft, TerminalSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function ReportDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reports, voteHelpful, flagReport, incrementViews } = useReports()
  const { toast } = useToast()

  const [hasVotedHelpful, setHasVotedHelpful] = useState(false)
  const [hasFlagged, setHasFlagged] = useState(false)

  const report = reports.find((r) => r.id === id)

  useEffect(() => {
    if (id) {
      incrementViews(id as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-16">
        <div className="bg-card border border-border w-full max-w-md text-center p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Report not found
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            This report may have been removed or marked as a false positive by moderators.
          </p>
          <Button 
            onClick={() => router.push("/reports")}
            className="w-full"
            variant="outline"
          >
            ← Back to Database
          </Button>
        </div>
      </div>
    )
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "< 1 hr ago"
    if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const handleHelpfulVote = () => {
    if (!hasVotedHelpful) {
      voteHelpful(report.id)
      setHasVotedHelpful(true)
      toast({
        title: "Peer verification recorded",
        description: "Your vote has been added to the trust consensus.",
      })
    }
  }

  const handleFlag = () => {
    if (!hasFlagged) {
      flagReport(report.id)
      setHasFlagged(true)
      toast({
        title: "Report flagged",
        description: "Moderators will review this entry.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/reports")} 
            className="mb-8 text-muted-foreground hover:text-foreground -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to reports
          </Button>

          {/* Header Card */}
          <div className="bg-card border border-border mb-6">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {report.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center text-foreground">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      {report.company || "Unknown Company"}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {report.location || "No location specified"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {getTimeAgo(report.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      {report.views} views
                    </div>
                  </div>
                </div>

                {report.riskLevel === 'high' && (
                  <div className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold">
                    <ShieldAlert className="w-4 h-4" />
                    High Risk
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="border-t border-border">
              {/* Report Description */}
              <div className="p-6 sm:p-8 space-y-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-4 flex items-center">
                    <TerminalSquare className="h-4 w-4 mr-2" />
                    Incident Details
                  </h3>
                  <div className="prose prose-sm prose-invert max-w-none text-foreground leading-relaxed">
                    <p className="whitespace-pre-wrap">{report.description}</p>
                  </div>
                </div>

                {/* Classification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background/50 border border-border p-4 rounded-sm">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Scam Methodology</h4>
                    <span className="text-sm font-semibold text-foreground">{report.scamType}</span>
                  </div>
                  <div className="bg-background/50 border border-border p-4 rounded-sm">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Target Sector</h4>
                    <span className="text-sm font-semibold text-foreground">{report.industry || "Not specified"}</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3 flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-2" />
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.tags.length > 0 ? (
                      report.tags.map((tag) => (
                        <span key={tag} className="bg-background border border-border text-xs px-2.5 py-1 text-muted-foreground">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No tags provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 sm:p-8 border-t border-border bg-background/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant={hasVotedHelpful ? "secondary" : "default"}
                      className={cn("w-full sm:w-auto font-medium", hasVotedHelpful && "bg-success/20 text-success hover:bg-success/20")}
                      onClick={handleHelpfulVote}
                      disabled={hasVotedHelpful}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {hasVotedHelpful ? "Verified by You" : "Verify Report"} ({report.helpfulVotes})
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={handleFlag}
                      disabled={hasFlagged}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Flag
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center sm:text-right font-mono">
                    ID: {report.id.slice(0,8)}<br/>
                    {report.anonymous ? "Anonymous Submission" : `Submitted by ${report.email}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
