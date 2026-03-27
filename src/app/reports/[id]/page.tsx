"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useReports } from "@/contexts/reports-context"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Tag, Clock, ThumbsUp, Flag, Eye, ShieldAlert, ArrowLeft, TerminalSquare, AlertTriangle } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] py-16">
        <div className="bg-[#15110E] border border-red-900/50 w-full max-w-md text-center p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden">
          {/* Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="h-16 w-16 bg-red-500/10 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-mono font-bold text-red-500 tracking-widest uppercase mb-2 relative z-10">
            [ ERROR 404: NODE NOT FOUND ]
          </h2>
          <p className="text-xs font-mono text-muted-foreground/80 uppercase tracking-widest mb-8 relative z-10">
            The requested forensic dossier has been expunged or is restricted under current protocol clearance.
          </p>
          <Button 
            onClick={() => router.push("/reports")}
            className="w-full font-mono text-xs uppercase tracking-widest font-bold rounded-none border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-all relative z-10"
            variant="outline"
          >
           <ArrowLeft className="h-4 w-4 mr-2" /> RETURN_TO_DATABASE
          </Button>
        </div>
      </div>
    )
  }

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
    if (!hasVotedHelpful) {
      voteHelpful(report.id)
      setHasVotedHelpful(true)
      toast({
        title: "PEER_VOTE_RECORDED",
        description: "Your verification adds weight to the consensus matrix.",
      })
    }
  }

  const handleFlag = () => {
    if (!hasFlagged) {
      flagReport(report.id)
      setHasFlagged(true)
      toast({
        title: "ANOMALY_LOGGED",
        description: "Node flagged for moderator arbitration.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] py-12 relative">
      {/* Matrix background subtle */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.1]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button 
            onClick={() => router.push("/reports")} 
            className="mb-8 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors flex items-center group -ml-2 p-2"
          >
            <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            [ ABORT_READ ] RETURN_TO_DATABASE
          </button>

          {/* Master Frame */}
          <div className="bg-[#15110E] border border-[#1F1914] mb-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group">
            
            {/* HUD Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 pointer-events-none z-20 group-hover:border-primary transition-colors duration-500" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50 pointer-events-none z-20 group-hover:border-primary transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50 pointer-events-none z-20 group-hover:border-primary transition-colors duration-500" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 pointer-events-none z-20 group-hover:border-primary transition-colors duration-500" />
            
            {/* Header Area */}
            <div className="p-8 sm:p-10 relative overflow-hidden border-b border-[#1F1914]">
              {/* Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,191,0,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 mb-6 relative z-10">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <TerminalSquare className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">
                      DOSSIER_ID: {report.id.slice(0,12)}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground uppercase tracking-widest mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                    {report.title}
                  </h1>
                  
                  {/* Meta Data Grid */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                    <div className="flex items-center bg-[#0C0A09] px-3 py-2 border border-[#1F1914]">
                       <span className="text-primary/50 mr-2">ORG:</span>
                      {report.company || "UNKNOWN_ENTITY"}
                    </div>
                    <div className="flex items-center bg-[#0C0A09] px-3 py-2 border border-[#1F1914]">
                      <span className="text-primary/50 mr-2">LOC:</span>
                      {report.location || "GLOBAL"}
                    </div>
                    <div className="flex items-center bg-[#0C0A09] px-3 py-2 border border-[#1F1914]">
                      <span className="text-primary/50 mr-2">TIME:</span>
                      T-{getTimeAgo(report.createdAt)}
                    </div>
                    <div className="flex items-center bg-[#0C0A09] px-3 py-2 border border-[#1F1914]">
                      <Eye className="h-3 w-3 mr-2 text-primary/70" />
                      {report.views} READS
                    </div>
                  </div>
                </div>

                {report.riskLevel === 'high' && (
                  <div className="shrink-0 inline-flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-[pulse_2s_infinite]">
                    <ShieldAlert className="w-8 h-8 mb-2" />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase">CRITICAL</span>
                    <span className="text-[10px] font-mono tracking-widest opacity-70">THREAT_LEVEL</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Main Content Area */}
              <div className="flex-1 p-8 sm:p-10 space-y-10 border-b md:border-b-0 md:border-r border-[#1F1914]">
                
                {/* Text Block */}
                <div className="group/transcript relative">
                  <h3 className="text-[10px] font-mono font-bold uppercase text-primary tracking-[0.2em] mb-4 flex items-center border-b border-[#1F1914] pb-2">
                    <TerminalSquare className="h-3 w-3 mr-2" />
                    [ INCIDENT_TRANSCRIPT ]
                  </h3>
                  <div className="bg-[#0C0A09] p-6 text-xs text-foreground/90 font-mono leading-loose uppercase tracking-wide border-l-2 border-primary/50 whitespace-pre-wrap relative overflow-hidden shadow-inner group-hover/transcript:border-primary transition-colors duration-500">
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-primary shadow-[0_0_10px_rgba(255,191,0,0.8)] opacity-0 group-hover/transcript:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      {report.description}
                    </div>
                  </div>
                </div>

                {/* Classification Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0C0A09] border border-[#1F1914] p-5">
                    <h4 className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">SCAM_METHODOLOGY</h4>
                    <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">{report.scamType}</span>
                  </div>
                  <div className="bg-[#0C0A09] border border-[#1F1914] p-5">
                    <h4 className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">TARGET_SECTOR</h4>
                    <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">{report.industry || "UNCLASSIFIED"}</span>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-[0.2em] mb-4 flex items-center border-b border-[#1F1914] pb-2">
                    <Tag className="h-3 w-3 mr-2" />
                    [ ASSIGNED_TAGS ]
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.tags.length > 0 ? (
                      report.tags.map((tag) => (
                        <span key={tag} className="bg-[#0C0A09] border border-[#1F1914] text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 text-muted-foreground">
                          #{tag.replace(/\s+/g, '_')}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest italic">[ NO_TAGS_DETECTED ]</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="w-full md:w-64 bg-[#0C0A09] p-8 sm:p-10 flex flex-col justify-start items-stretch gap-6">
                 
                 <div>
                   <div className="text-[9px] font-mono font-bold text-muted-foreground/50 tracking-[0.2em] uppercase mb-4 text-center border-b border-[#1F1914] pb-2">
                     [ NODE_CONSENSUS ]
                   </div>
                   
                   <div className="bg-[#15110E] p-4 text-center border border-[#1F1914] mb-6 shadow-inner">
                      <div className="text-3xl font-mono font-bold text-primary mb-1">{report.helpfulVotes}</div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">VERIFIED_LOGS</div>
                   </div>

                    <Button
                      variant="outline"
                      className={cn(
                        "w-full text-xs font-mono uppercase tracking-widest font-bold rounded-none h-12 border-[#1F1914] transition-all relative overflow-hidden group",
                        hasVotedHelpful ? "bg-success/10 text-success border-success/30" : "hover:bg-primary hover:text-black hover:border-primary text-primary"
                      )}
                      onClick={handleHelpfulVote}
                      disabled={hasVotedHelpful}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {hasVotedHelpful ? "VERIFIED" : "VERIFY_NODE"}
                      </span>
                      {/* Hover fill animation */}
                      {!hasVotedHelpful && <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />}
                    </Button>
                 </div>

                 <div className="mt-auto pt-8 border-t border-[#1F1914]">
                    <div className="text-[9px] font-mono text-center text-muted-foreground/40 mb-4 tracking-widest">
                      SUBMITTER_ID:<br/>{report.anonymous ? "[ REDACTED_BY_USER ]" : report.email}
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full h-10 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all group"
                      onClick={handleFlag}
                      disabled={hasFlagged}
                    >
                      <Flag className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform" />
                      {hasFlagged ? "ANOMALY_LOGGED" : "REPORT_ANOMALY"}
                    </Button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
