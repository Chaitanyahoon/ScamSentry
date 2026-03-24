"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useReports } from "@/contexts/reports-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Tag, Clock, ThumbsUp, Flag, Eye, Shield, AlertTriangle, Terminal } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-background py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />
        
        <div className="glass-strong border border-destructive/50 w-full max-w-md text-center p-8 z-10 shadow-[0_0_20px_hsla(var(--destructive),0.2)]">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-destructive/10 border border-destructive/50 flex items-center justify-center shadow-[0_0_10px_hsla(var(--destructive),0.3)]">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold font-mono tracking-widest text-destructive mb-3 uppercase">
            SYS_ERR: 404_NOT_FOUND
          </h2>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase leading-relaxed mb-6">
            THE REQUESTED DATA NODE DOES NOT EXIST OR HAS BEEN QUARANTINED.
          </p>
          <Button 
            onClick={() => router.push("/reports")}
            className="w-full text-xs font-bold tracking-widest uppercase rounded-none border border-primary/50 text-primary bg-transparent hover:bg-primary hover:text-black transition-all"
          >
            RETURN_TO_SYSTEM_LEDGER
          </Button>
        </div>
      </div>
    )
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "< 1 HOUR AGO"
    if (diffInHours < 24) return `${diffInHours} HOUR${diffInHours > 1 ? "S" : ""} AGO`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} DAY${diffInDays > 1 ? "S" : ""} AGO`
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive shadow-[0_0_5px_hsla(var(--destructive),0.5)]"
      case "medium":
        return "bg-warning/20 text-warning border-warning shadow-[0_0_5px_hsla(var(--warning),0.5)]"
      case "low":
        return "bg-secondary/20 text-secondary border-secondary shadow-[0_0_5px_hsla(var(--secondary),0.5)]"
      default:
        return "bg-border text-muted-foreground border-border"
    }
  }

  const handleHelpfulVote = () => {
    if (!hasVotedHelpful) {
      voteHelpful(report.id)
      setHasVotedHelpful(true)
      toast({
        title: "SIGNAL_AMPLIFIED",
        description: "YOUR VERIFICATION HAS BEEN ADDED TO THE REPUTATION LEDGER.",
      })
    } else {
      toast({
        title: "SYS_MSG: DUPLICATE_VOTE",
        description: "YOU HAVE ALREADY VERIFIED THIS NODE.",
        variant: "default",
      })
    }
  }

  const handleFlag = () => {
    if (!hasFlagged) {
      flagReport(report.id)
      setHasFlagged(true)
      toast({
        title: "RADAR_FLAG_SET",
        description: "REPORT FORWARDED TO ADMIN QUARANTINE PROTOCOLS.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "SYS_MSG: DUPLICATE_FLAG",
        description: "NODE ALREADY MARKED FOR REVIEW.",
        variant: "default",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Button 
            variant="outline" 
            onClick={() => router.back()} 
            className="mb-8 font-mono text-xs uppercase tracking-widest rounded-none border-primary/50 text-primary hover:bg-primary/20 hover:text-primary"
          >
            ← BACK_TO_LEDGER
          </Button>

          <div className="glass-strong border-t-2 border-t-primary/50 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="p-6 md:p-8 bg-card/80 border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-4 uppercase tracking-widest text-foreground drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                    {report.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center text-primary">
                      <Building className="h-4 w-4 mr-2" />
                      {report.company || "UNKNOWN_NODE"}
                    </div>
                    <div className="flex items-center text-secondary">
                      <MapPin className="h-4 w-4 mr-2" />
                      {report.location || "SECTOR_NULL"}
                    </div>
                    <div className="flex items-center border border-border px-2 py-1 bg-background/50">
                      <Clock className="h-4 w-4 mr-2" />
                      {getTimeAgo(report.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge className={cn("text-xs font-bold uppercase px-3 py-1.5 rounded-none border shrink-0 text-center tracking-widest", getRiskColor(report.riskLevel))}>
                  {report.riskLevel}_RISK
                </Badge>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-background/40 space-y-8">
              <div className="font-mono">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center text-primary drop-shadow-[0_0_5px_currentColor]">
                  <Terminal className="h-5 w-5 mr-3" />
                  RAW_THREAT_LOGS:
                </h3>
                <div className="p-6 bg-[#050510] border border-border/50 shadow-inner">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono tracking-wide">
                    {report.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                <div className="glass-card p-4 border-l-2 border-l-secondary/50 bg-card/50">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2">VECTOR_CLASSIFICATION:</h4>
                  <span className="text-sm font-bold uppercase tracking-widest text-secondary">{report.scamType}</span>
                </div>
                <div className="glass-card p-4 border-l-2 border-l-primary/50 bg-card/50">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2">TARGET_INDUSTRY:</h4>
                  <span className="text-sm font-bold uppercase tracking-widest text-primary">{report.industry || "NULL"}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center">
                  <Tag className="h-3 w-3 mr-2" />
                  METADATA_TAGS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.tags.length > 0 ? (
                    report.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-none border-border bg-card/50 text-[10px] font-mono uppercase tracking-widest text-foreground px-2 py-1">
                        #{tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">NO_TAGS_DETECTED.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-card/30 p-6 border border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-success" />
                    SYSTEM_TRUST_SCORE
                  </h4>
                  <span className="text-lg font-extrabold text-success drop-shadow-[0_0_5px_currentColor]">
                    {report.trustScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between pl-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    TOTAL_VIEWS
                  </h4>
                  <span className="text-lg font-extrabold tracking-widest font-mono text-foreground">
                    {report.views}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto rounded-none font-bold uppercase tracking-widest text-xs h-12 transition-all font-mono",
                    hasVotedHelpful 
                      ? "bg-success/20 text-success border-success cursor-default" 
                      : "border-success/50 text-success hover:bg-success hover:text-black hover:border-success hover:shadow-[0_0_10px_hsla(var(--success),0.5)]"
                  )}
                  onClick={handleHelpfulVote}
                  disabled={hasVotedHelpful}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  CONFIRM_INTELLIGENCE ({report.helpfulVotes})
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto rounded-none font-bold uppercase tracking-widest text-xs h-12 transition-all font-mono",
                    hasFlagged 
                      ? "bg-destructive/20 text-destructive border-destructive cursor-default" 
                      : "border-destructive/50 text-destructive hover:bg-destructive hover:text-white hover:border-destructive hover:shadow-[0_0_10px_hsla(var(--destructive),0.5)]"
                  )}
                  onClick={handleFlag}
                  disabled={hasFlagged}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  FLAG_FOR_REVIEW ({report.flagCount})
                </Button>
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-8 p-4 border border-border/50 bg-black/50 text-center">
                TARGET_ID: {report.id} // TIMESTAMP: {new Date(report.createdAt).toISOString()}
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> // </span>
                {report.anonymous ? "GHOST_PROTOCOL_ACTIVE" : `TRANSMITTER_ID: ${report.email}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
