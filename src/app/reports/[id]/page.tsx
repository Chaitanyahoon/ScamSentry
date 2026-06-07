"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useReports, ScamReport, firestoreDocToScamReport } from "@/contexts/reports-context"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Tag, Clock, ThumbsUp, Flag, Eye, ShieldAlert, ArrowLeft, TerminalSquare, AlertTriangle, ExternalLink, Globe2, Radio, Server, Fingerprint } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"

export default function ReportDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { voteHelpful, flagReport, incrementViews } = useReports()
  const { toast } = useToast()

  const [report, setReport] = useState<ScamReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)

  const [hasVotedHelpful, setHasVotedHelpful] = useState(false)
  const [hasFlagged, setHasFlagged] = useState(false)
  const [flashConsensus, setFlashConsensus] = useState(false)

  // Incremental loader simulation during loading
  useEffect(() => {
    if (!loading) {
      setProgress(100)
      return
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.floor(Math.random() * 12) + 6
      })
    }, 80)
    return () => clearInterval(interval)
  }, [loading])

  // Direct single-document Firestore listener
  useEffect(() => {
    if (!id) return

    // Pre-emptive view increment
    incrementViews(id as string)

    const docRef = doc(db, "scam_reports", id as string)
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setReport(firestoreDocToScamReport(docSnap))
          setError(false)
        } else {
          setError(true)
        }
        setLoading(false)
      },
      (err) => {
        console.error("[REPORT_TELEMETRY] Connection failed:", err)
        setError(true)
        setLoading(false)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // consensus flash effect on helpful votes update
  useEffect(() => {
    if (report?.helpfulVotes) {
      setFlashConsensus(true)
      const timer = setTimeout(() => setFlashConsensus(false), 800)
      return () => clearTimeout(timer)
    }
  }, [report?.helpfulVotes])

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "< 1H"
    if (diffInHours < 24) return `${diffInHours}H`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}D`
  }

  const handleHelpfulVote = () => {
    if (!hasVotedHelpful && report) {
      voteHelpful(report.id)
      setHasVotedHelpful(true)
      toast({
        title: "CONSENSUS_LOGGED",
        description: "Node consensus score adjusted in database.",
      })
    }
  }

  const handleFlag = () => {
    if (!hasFlagged && report) {
      flagReport(report.id)
      setHasFlagged(true)
      toast({
        title: "ANOMALY_FLAGGED",
        description: "Target report marked for moderation review.",
      })
    }
  }

  // Loader Layout
  if (loading || progress < 100) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
        <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.08]" />
        
        <div className="w-full max-w-md bg-card border border-border p-8 shadow-xl relative rounded-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <span className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Retrieving Threat Dossier
            </span>
          </div>
          
          <div className="space-y-3 mb-8 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-success font-semibold">Active Connection</span>
            </div>
            <div className="flex justify-between">
              <span>Dossier ID</span>
              <span className="text-foreground truncate max-w-[200px] font-mono">{id}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Layer</span>
              <span className="text-foreground">SSL Secure</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-foreground font-semibold">
              <span>Loading telemetry...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-100 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 404 Layout
  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-16">
        <div className="bg-card border border-border w-full max-w-md text-center p-8 shadow-lg relative overflow-hidden rounded-2xl">
          <div className="flex justify-center mb-6 relative z-10">
            <div className="h-16 w-16 bg-destructive/10 flex items-center justify-center border border-destructive/20 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-base font-bold text-foreground mb-2 relative z-10">
            Dossier Not Found
          </h2>
          <p className="text-xs text-muted-foreground/80 mb-8 leading-relaxed relative z-10">
            The requested intelligence logs are restricted, missing, or have been deleted from local consensus storage.
          </p>
          <Button 
            onClick={() => router.push("/reports")}
            className="w-full text-xs font-semibold rounded-xl border border-border text-foreground bg-transparent hover:bg-card transition-all relative z-10"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Database
          </Button>
        </div>
      </div>
    )
  }

  // Source Identity calculations
  const { isOsint, sourceName, badgeColor, textColor, brandColor, sourceLink } = getSourceDetails(report)

  return (
    <div className="min-h-screen bg-background py-12 relative text-foreground">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.06]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <button 
              onClick={() => router.push("/reports")} 
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center group px-4 py-2 border border-border bg-card rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform text-primary" />
              Back to Database
            </button>

            {/* Live Connection Telemetry badge */}
            <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 text-xs font-semibold text-success rounded-xl">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Secure Link Active
            </div>
          </div>

          {/* Source node indicator header banner */}
          <div className={cn("border border-border bg-card p-6 mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl")}>
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Intel Origin Node</div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 border rounded-full", badgeColor)}>
                  {sourceName}
                </span>
                {isOsint && (
                  <span className="text-[10px] text-destructive border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-full">
                    Automated OSINT
                  </span>
                )}
              </div>
            </div>

            {sourceLink && (
              <a
                href={sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Access Source Website
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Master Dossier Console Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Main Dossier Payload (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dossier Header and Payload Core */}
              <div className="bg-card border border-border rounded-2xl relative overflow-hidden shadow-lg">
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-2 font-mono">
                    <TerminalSquare className="h-4 w-4 text-primary" />
                    ID: {report.id}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {report.title}
                  </h1>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Incident Transcript Box */}
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center border-b border-border pb-2">
                      <Radio className="h-4 w-4 mr-2" />
                      Incident Report Details
                    </div>
                    <div className="bg-background/80 border border-border p-6 text-sm leading-relaxed border-l-2 border-l-primary rounded-r-xl whitespace-pre-wrap">
                      <div className="text-foreground/90 font-sans">
                        {report.description}
                      </div>
                    </div>
                  </div>

                  {/* Target and Methodology Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-background border border-border p-5 rounded-xl">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Fingerprint className="h-4.5 w-4.5 text-primary/70" />
                        Threat Vector
                      </div>
                      <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                        {report.scamType}
                      </span>
                    </div>

                    <div className="bg-background border border-border p-5 rounded-xl">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Building className="h-4.5 w-4.5 text-primary/70" />
                        Target Sector
                      </div>
                      <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                        {report.industry || "General / Unclassified"}
                      </span>
                    </div>
                  </div>

                  {/* Meta Node Matrix */}
                  <div className="bg-background border border-border p-6 rounded-xl space-y-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-2">
                      Dossier Parameters
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs uppercase tracking-wide">
                      <div>
                        <div className="text-muted-foreground/60 text-[10px] mb-1">Company/Entity</div>
                        <div className="font-bold text-foreground truncate">{report.company || "Unknown"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 text-[10px] mb-1">Location</div>
                        <div className="font-bold text-foreground truncate">{report.location || "Global"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 text-[10px] mb-1">Reported Time</div>
                        <div className="font-bold text-foreground font-mono">T-{getTimeAgo(report.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 text-[10px] mb-1">Views Count</div>
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          {report.views}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Threat Tags */}
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center border-b border-border pb-2">
                      <Tag className="h-4 w-4 mr-2" />
                      Assigned Threat Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report.tags && report.tags.length > 0 ? (
                        report.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-background border border-border text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 text-muted-foreground hover:text-primary hover:border-primary/45 rounded-lg transition-colors"
                          >
                            #{tag.replace(/\s+/g, '_').toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                          No tags logged
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right side: Sidebar Telemetry Pane (1 col) */}
            <div className="space-y-6">
              
              {/* Telemetry Consensus dial panel */}
              <div className="bg-card border border-border p-6 rounded-2xl relative shadow-lg">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 text-center border-b border-border pb-2">
                  Node Consensus
                </div>

                <div 
                  className={cn(
                    "bg-background p-6 text-center border border-border rounded-xl mb-6 transition-all duration-300 relative overflow-hidden",
                    flashConsensus && "border-success/80 bg-success/5 text-success scale-[1.02]"
                  )}
                >
                  <div className="text-4xl font-bold text-primary tracking-tight mb-1 font-mono">
                    {report.helpfulVotes}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Peer Verifications
                  </div>
                </div>

                {/* Consensus meter gauge */}
                <div className="space-y-3 mb-6 bg-background p-4 border border-border rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Safety Score</span>
                    <span className="font-mono text-primary">{report.trustScore}%</span>
                  </div>
                  <div className="w-full bg-muted border border-border h-3 relative rounded-full overflow-hidden">
                    <div 
                      className="bg-success h-full transition-all duration-500" 
                      style={{ width: `${report.trustScore}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-muted-foreground/50 text-center uppercase tracking-wider">
                    Determines general platform trust
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full text-xs font-bold uppercase tracking-wider rounded-xl h-12 transition-all relative overflow-hidden",
                    hasVotedHelpful ? "bg-success/15 text-success border border-success/30 hover:bg-success/20" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={handleHelpfulVote}
                  disabled={hasVotedHelpful}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {hasVotedHelpful ? "Verified" : "Verify Node"}
                </Button>
              </div>

              {/* Security Risk Panel */}
              <div className="bg-card border border-border p-6 rounded-2xl relative shadow-lg">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 text-center border-b border-border pb-2">
                  Threat Index
                </div>

                <div className={cn(
                  "p-4 border rounded-xl text-center font-bold tracking-wide uppercase text-xs flex flex-col items-center justify-center gap-2",
                  report.riskLevel === 'high' 
                    ? "bg-destructive/10 border-destructive/20 text-destructive" 
                    : report.riskLevel === 'medium'
                    ? "bg-warning/10 border-warning/20 text-warning"
                    : "bg-success/10 border-success/20 text-success"
                )}>
                  <ShieldAlert className="w-5 h-5" />
                  <div>Level: {report.riskLevel} Risk</div>
                </div>
              </div>

              {/* Submitter Metadata Panel */}
              <div className="bg-card border border-border p-6 rounded-2xl relative shadow-lg flex flex-col gap-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center border-b border-border pb-2">
                  Credentials
                </div>

                <div className="text-xs text-center text-muted-foreground/75 leading-relaxed">
                  Reporter Node:<br/>
                  <span className="text-foreground font-semibold font-mono text-[10px] break-all block mt-1">
                    {report.anonymous ? "Anonymous Developer" : report.email}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 text-xs font-bold uppercase tracking-wider rounded-xl border border-border transition-all",
                    hasFlagged 
                      ? "text-destructive border-destructive/30 bg-destructive/5" 
                      : "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                  )}
                  onClick={handleFlag}
                  disabled={hasFlagged}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {hasFlagged ? "Alert Logged" : "Flag Anomaly"}
                </Button>
              </div>

            </div>

          </div>

          {/* Evidence matrix link section */}
          {report.evidenceUrls && report.evidenceUrls.length > 0 && (
            <div className="bg-card border border-border p-6 sm:p-8 mt-6 rounded-2xl shadow-lg relative">
              <h3 className="text-xs font-bold uppercase text-primary tracking-wider mb-4 flex items-center border-b border-border pb-2">
                <Server className="h-4 w-4 mr-2" />
                Attached Evidence Source Matrix
              </h3>
              
              <div className="space-y-2.5">
                {report.evidenceUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background border border-border hover:border-primary/45 rounded-xl text-xs text-muted-foreground hover:text-primary tracking-wider gap-4 group transition-all"
                  >
                    <span className="truncate max-w-[80%] font-mono">
                      ↳ Link {index + 1}: {url}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 font-bold text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Access Link <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function getSourceDetails(report: ScamReport) {
  const isOsint = report.title.toUpperCase().startsWith("OSINT:") || report.company === "OSINT Threat Feed"
  const sourceLink = report.evidenceUrls && report.evidenceUrls.length > 0 ? report.evidenceUrls[0] : null
  
  let sourceName = "COMMUNITY PEER"
  let badgeColor = "border-border text-muted-foreground bg-card"
  let textColor = "text-muted-foreground"
  let brandColor = "bg-muted-foreground/30"
  
  if (isOsint) {
    if (sourceLink) {
      const urlLower = sourceLink.toLowerCase()
      if (urlLower.includes("bleepingcomputer.com")) {
        sourceName = "Bleeping Computer"
        badgeColor = "border-destructive/20 text-destructive bg-destructive/5"
        textColor = "text-destructive"
        brandColor = "bg-destructive"
      } else if (urlLower.includes("thehackernews.com") || urlLower.includes("feedburner")) {
        sourceName = "The Hacker News"
        badgeColor = "border-primary/20 text-primary bg-primary/5"
        textColor = "text-primary"
        brandColor = "bg-primary"
      } else if (urlLower.includes("krebsonsecurity.com")) {
        sourceName = "Krebs On Security"
        badgeColor = "border-success/20 text-success bg-success/5"
        textColor = "text-success"
        brandColor = "bg-success"
      } else {
        sourceName = "Automated OSINT"
        badgeColor = "border-warning/20 text-warning bg-warning/5"
        textColor = "text-warning"
        brandColor = "bg-warning"
      }
    } else {
      sourceName = "Automated OSINT"
      badgeColor = "border-warning/20 text-warning bg-warning/5"
      textColor = "text-warning"
      brandColor = "bg-warning"
    }
  }
  
  return { isOsint, sourceName, badgeColor, textColor, brandColor, sourceLink }
}
