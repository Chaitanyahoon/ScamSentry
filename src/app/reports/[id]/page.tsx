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
      <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-6 relative font-mono text-[#F59E0B]">
        <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.08]" />
        
        {/* Decorative elements */}
        <div className="absolute top-8 left-8 text-[9px] text-muted-foreground/30 select-none">
          SYSTEM_TERM_V3.8 // HOST: SCAMSENTRY
        </div>

        <div className="w-full max-w-lg bg-[#15110E] border border-[#1F1914] p-8 shadow-[0_0_40px_rgba(245,158,11,0.03)] relative">
          {/* HUD Corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#F59E0B]/30" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#F59E0B]/30" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#F59E0B]/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#F59E0B]/30" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1F1914]">
            <div className="h-2 w-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#F59E0B]">
              SECURE_INTEL_STREAM // DECRYPTOR
            </span>
          </div>
          
          <div className="space-y-3 mb-8 text-[10px] leading-relaxed uppercase tracking-widest text-muted-foreground/80">
            <div className="flex justify-between">
              <span>[ NET_CORE ]</span>
              <span className="text-[#4D7A2A]">STABLE</span>
            </div>
            <div className="flex justify-between">
              <span>[ DOSSIER_ID ]</span>
              <span className="text-foreground truncate max-w-[200px]">{id}</span>
            </div>
            <div className="flex justify-between">
              <span>[ ALGORITHM ]</span>
              <span>AES_256_GCM_LIVE</span>
            </div>
            <div className="border-t border-[#1F1914] pt-3 text-[9px] space-y-1.5 text-muted-foreground/50">
              <div className="flex items-center gap-2">
                <span className="text-[#4D7A2A]">✓</span> ESTABLISHING FIREBASE PERSISTENT PORT...
              </div>
              <div className="flex items-center gap-2">
                {progress > 35 ? <span className="text-[#4D7A2A]">✓</span> : <span className="animate-pulse">_</span>}
                SYNCING CLIENT NODE TELEMETRY...
              </div>
              <div className="flex items-center gap-2">
                {progress > 70 ? <span className="text-[#4D7A2A]">✓</span> : progress > 35 ? <span className="animate-pulse">_</span> : null}
                EXTRACTING PAYLOAD TRANCHE...
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-foreground tracking-widest font-bold">
              <span>DECRYPTING DATA MATRIX</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[#0C0A09] border border-[#1F1914] h-2 relative overflow-hidden">
              <div 
                className="bg-[#F59E0B] h-full transition-all duration-100 ease-out" 
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
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] py-16">
        <div className="bg-[#15110E] border border-red-900/50 w-full max-w-md text-center p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden font-mono">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="h-16 w-16 bg-red-500/10 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-sm font-bold text-red-500 tracking-widest uppercase mb-2 relative z-10">
            [ ERROR 404: DOSSIER NOT FOUND ]
          </h2>
          <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest mb-8 leading-relaxed relative z-10">
            The requested intelligence logs are restricted, missing, or have been deleted from local consensus storage.
          </p>
          <Button 
            onClick={() => router.push("/reports")}
            className="w-full font-mono text-xs uppercase tracking-widest font-bold rounded-none border border-red-500/50 text-red-500 bg-transparent hover:bg-red-500 hover:text-black transition-all relative z-10"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> RETURN_TO_DATABASE
          </Button>
        </div>
      </div>
    )
  }

  // Source Identity calculations
  const { isOsint, sourceName, badgeColor, textColor, brandColor, sourceLink } = getSourceDetails(report)

  return (
    <div className="min-h-screen bg-[#0C0A09] py-12 relative font-mono text-[#E8DBC8]">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.06]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <button 
              onClick={() => router.push("/reports")} 
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-[#F59E0B] transition-colors flex items-center group p-2 border border-[#1F1914]/40 bg-[#15110E]/30"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2 group-hover:-translate-x-1 transition-transform text-[#F59E0B]" />
              [ ABORT_READ ] RETURN_TO_DATABASE
            </button>

            {/* Live Connection Telemetry badge */}
            <div className="flex items-center gap-2 bg-[#15110E] border border-[#1F1914] px-4 py-2 text-[9px] font-bold text-[#4D7A2A] uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-[#4D7A2A] animate-pulse" />
              LIVE_TELEMETRY_LINK_ACTIVE
            </div>
          </div>

          {/* Source node indicator header banner */}
          <div className={cn("border border-[#1F1914] bg-[#15110E] p-6 mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6")}>
            <div className={cn("absolute top-0 left-0 w-1.5 h-full", brandColor)} />
            <div className="pl-4">
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.25em] mb-1">INTEL_ORIGIN_NODE</div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-bold uppercase tracking-widest px-2.5 py-1 border", badgeColor)}>
                  {sourceName}
                </span>
                {isOsint && (
                  <span className="text-[9px] text-red-500 border border-red-500/20 bg-red-500/5 px-2 py-0.5 font-bold uppercase tracking-widest">
                    OSINT_AUTOMATED
                  </span>
                )}
              </div>
            </div>

            {sourceLink && (
              <a
                href={sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#F59E0B]/80 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-black font-bold text-xs uppercase tracking-widest transition-all duration-200"
              >
                [ ACCESS ORIGINAL SOURCE ]
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Master Dossier Console Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Main Dossier Payload (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dossier Header and Payload Core */}
              <div className="bg-[#15110E] border border-[#1F1914] relative group">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#F59E0B]/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#F59E0B]/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#F59E0B]/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#F59E0B]/30" />
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-[#1F1914]">
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                    <TerminalSquare className="h-3.5 w-3.5 text-[#F59E0B]" />
                    DOSSIER_ID: {report.id}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-widest text-foreground leading-snug">
                    {report.title}
                  </h1>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Incident Transcript Box */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-[#F59E0B] tracking-[0.2em] mb-4 flex items-center border-b border-[#1F1914] pb-2">
                      <Radio className="h-3.5 w-3.5 mr-2 text-[#F59E0B]" />
                      [ INCIDENT_READOUT_TRANSCRIPT ]
                    </div>
                    <div className="bg-[#0C0A09] border border-[#1F1914] p-6 text-xs leading-loose uppercase tracking-wide border-l-2 border-l-[#F59E0B] whitespace-pre-wrap relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#070605] opacity-20 pointer-events-none" />
                      <div className="relative z-10 text-[#E8DBC8]/90">
                        {report.description}
                      </div>
                    </div>
                  </div>

                  {/* Target and Methodology Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#0C0A09] border border-[#1F1914] p-5">
                      <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Fingerprint className="h-3 w-3 text-primary/70" />
                        SCAM_METHODOLOGY
                      </div>
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {report.scamType}
                      </span>
                    </div>

                    <div className="bg-[#0C0A09] border border-[#1F1914] p-5">
                      <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-primary/70" />
                        TARGET_SECTOR
                      </div>
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {report.industry || "UNCLASSIFIED"}
                      </span>
                    </div>
                  </div>

                  {/* Meta Node Matrix */}
                  <div className="bg-[#0C0A09] border border-[#1F1914] p-6 space-y-4">
                    <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest border-b border-[#1F1914] pb-2">
                      DOSSIER_TELEMETRY_PARAMETERS
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] uppercase tracking-widest">
                      <div>
                        <div className="text-muted-foreground/60 text-[8px] mb-1">COMPANY_ENTITY</div>
                        <div className="font-bold text-foreground truncate">{report.company || "UNKNOWN"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 text-[8px] mb-1">LOCATION_STAMP</div>
                        <div className="font-bold text-foreground truncate">{report.location || "GLOBAL"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 text-[8px] mb-1">TIME_STAMP</div>
                        <div className="font-bold text-foreground">T-{getTimeAgo(report.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 text-[8px] mb-1">CONCURRENT_READS</div>
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <Eye className="h-3 w-3 text-[#F59E0B]" />
                          {report.views}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Threat Tags */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] mb-4 flex items-center border-b border-[#1F1914] pb-2">
                      <Tag className="h-3.5 w-3.5 mr-2" />
                      [ ASSIGNED_THREAT_TAGS ]
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report.tags && report.tags.length > 0 ? (
                        report.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-[#0C0A09] border border-[#1F1914] text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          >
                            #{tag.replace(/\s+/g, '_').toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest italic">
                          [ NO_TAGS_LOGGED ]
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
              <div className="bg-[#15110E] border border-[#1F1914] p-6 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#F59E0B]/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#F59E0B]/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#F59E0B]/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#F59E0B]/30" />

                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 text-center border-b border-[#1F1914] pb-2">
                  [ NODE_CONSENSUS ]
                </div>

                <div 
                  className={cn(
                    "bg-[#0C0A09] p-6 text-center border border-[#1F1914] mb-6 transition-all duration-300 relative overflow-hidden",
                    flashConsensus && "border-[#4D7A2A]/80 bg-[#4D7A2A]/5 text-[#4D7A2A] scale-[1.02]"
                  )}
                >
                  <div className="text-4xl font-extrabold text-[#F59E0B] tracking-tight mb-1">
                    {report.helpfulVotes}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    PEER_VERIFICATIONS
                  </div>
                </div>

                {/* Consensus meter gauge */}
                <div className="space-y-3 mb-6 bg-[#0C0A09] p-4 border border-[#1F1914]">
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Trust Index</span>
                    <span>{report.trustScore}%</span>
                  </div>
                  <div className="w-full bg-[#15110E] border border-[#1F1914] h-3 relative">
                    <div 
                      className="bg-[#4D7A2A] h-full transition-all duration-500" 
                      style={{ width: `${report.trustScore}%` }}
                    />
                    <div className="absolute inset-0 flex justify-between px-2 pointer-events-none text-[8px] text-muted-foreground/30 leading-none items-center font-mono">
                      <span>|</span>
                      <span>|</span>
                      <span>|</span>
                    </div>
                  </div>
                  <div className="text-[8px] text-muted-foreground/40 text-center uppercase tracking-widest">
                    INDICATOR DETERMINES THREAT VALIDITY
                  </div>
                </div>

                <Button
                  variant="outline"
                  className={cn(
                    "w-full text-xs font-bold uppercase tracking-widest rounded-none h-12 border-[#1F1914] transition-all relative overflow-hidden group bg-transparent",
                    hasVotedHelpful ? "bg-[#4D7A2A]/10 text-[#4D7A2A] border-[#4D7A2A]/30" : "hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] text-[#F59E0B]"
                  )}
                  onClick={handleHelpfulVote}
                  disabled={hasVotedHelpful}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {hasVotedHelpful ? "VERIFIED" : "VERIFY_NODE"}
                  </span>
                  {!hasVotedHelpful && (
                    <div className="absolute inset-0 bg-[#F59E0B] translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-0" />
                  )}
                </Button>
              </div>

              {/* Security Risk Panel */}
              <div className="bg-[#15110E] border border-[#1F1914] p-6 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#F59E0B]/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#F59E0B]/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#F59E0B]/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#F59E0B]/30" />

                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 text-center border-b border-[#1F1914] pb-2">
                  [ INCIDENT_THREAT_INDEX ]
                </div>

                <div className={cn(
                  "p-4 border text-center font-bold tracking-widest uppercase text-xs flex flex-col items-center justify-center gap-2",
                  report.riskLevel === 'high' 
                    ? "bg-[#C0292A]/10 border-[#C0292A]/30 text-[#C0292A]" 
                    : report.riskLevel === 'medium'
                    ? "bg-[#D4950A]/10 border-[#D4950A]/30 text-[#D4950A]"
                    : "bg-[#4D7A2A]/10 border-[#4D7A2A]/30 text-[#4D7A2A]"
                )}>
                  <ShieldAlert className="w-6 h-6" />
                  <div>LEVEL: {report.riskLevel}</div>
                </div>
              </div>

              {/* Submitter Metadata Panel */}
              <div className="bg-[#15110E] border border-[#1F1914] p-6 relative flex flex-col gap-4">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#F59E0B]/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#F59E0B]/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#F59E0B]/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#F59E0B]/30" />

                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] text-center border-b border-[#1F1914] pb-2">
                  [ SUBMITTER_CREDENTIALS ]
                </div>

                <div className="text-[9px] text-center text-muted-foreground/75 leading-loose">
                  NODE_AUTHOR:<br/>
                  <span className="text-foreground font-bold font-mono">
                    {report.anonymous ? "[ ANONYMOUS_DECENTRALIZED_PEER ]" : report.email}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 text-[10px] font-bold uppercase tracking-widest rounded-none border border-[#1F1914] transition-all group bg-transparent",
                    hasFlagged 
                      ? "text-[#C0292A] border-[#C0292A]/30 bg-[#C0292A]/5" 
                      : "text-muted-foreground/60 hover:text-[#C0292A] hover:bg-[#C0292A]/10 hover:border-[#C0292A]/30"
                  )}
                  onClick={handleFlag}
                  disabled={hasFlagged}
                >
                  <Flag className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform" />
                  {hasFlagged ? "ANOMALY_RECORDED" : "REPORT_ANOMALY"}
                </Button>
              </div>

            </div>

          </div>

          {/* Evidence matrix link section */}
          {report.evidenceUrls && report.evidenceUrls.length > 0 && (
            <div className="bg-[#15110E] border border-[#1F1914] p-6 sm:p-8 mt-6 relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#F59E0B]/30" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#F59E0B]/30" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#F59E0B]/30" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#F59E0B]/30" />

              <h3 className="text-[10px] font-bold uppercase text-[#F59E0B] tracking-[0.2em] mb-4 flex items-center border-b border-[#1F1914] pb-2">
                <Server className="h-3.5 w-3.5 mr-2" />
                [ ATTACHED_EVIDENCE_SOURCE_MATRIX ]
              </h3>
              
              <div className="space-y-2">
                {report.evidenceUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#0C0A09] border border-[#1F1914] hover:border-[#F59E0B]/30 transition-all text-[10px] text-muted-foreground hover:text-[#F59E0B] uppercase tracking-widest gap-4 group"
                  >
                    <span className="truncate max-w-[80%] font-mono">
                      ↳ LINK_NODE_{index + 1}: {url}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 font-bold text-[#F59E0B] border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-3 py-1 group-hover:bg-[#F59E0B] group-hover:text-black transition-all">
                      ACCESS_NODE <ExternalLink className="h-3 w-3 ml-1" />
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
  
  let sourceName = "COMMUNITY_PEER"
  let badgeColor = "border-[#F59E0B]/20 text-muted-foreground bg-[#15110E]"
  let textColor = "text-muted-foreground"
  let brandColor = "bg-muted-foreground/30"
  
  if (isOsint) {
    if (sourceLink) {
      const urlLower = sourceLink.toLowerCase()
      if (urlLower.includes("bleepingcomputer.com")) {
        sourceName = "BLEEPING_COMPUTER"
        badgeColor = "border-red-950 text-red-500 bg-red-950/20"
        textColor = "text-red-500"
        brandColor = "bg-red-650"
      } else if (urlLower.includes("thehackernews.com") || urlLower.includes("feedburner")) {
        sourceName = "THE_HACKER_NEWS"
        badgeColor = "border-orange-950 text-orange-500 bg-orange-950/20"
        textColor = "text-orange-500"
        brandColor = "bg-orange-600"
      } else if (urlLower.includes("krebsonsecurity.com")) {
        sourceName = "KREBS_ON_SECURITY"
        badgeColor = "border-emerald-950 text-emerald-500 bg-emerald-950/20"
        textColor = "text-emerald-500"
        brandColor = "bg-emerald-600"
      } else {
        sourceName = "AUTOMATED_OSINT"
        badgeColor = "border-amber-950 text-amber-500 bg-amber-950/20"
        textColor = "text-amber-500"
        brandColor = "bg-amber-600"
      }
    } else {
      sourceName = "AUTOMATED_OSINT"
      badgeColor = "border-amber-950 text-amber-500 bg-amber-950/20"
      textColor = "text-amber-500"
      brandColor = "bg-amber-600"
    }
  }
  
  return { isOsint, sourceName, badgeColor, textColor, brandColor, sourceLink }
}
