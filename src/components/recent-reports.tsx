"use client"

import Link from "next/link"
import { Clock, MapPin, ThumbsUp, Flag, TerminalSquare, ArrowRight, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useReports } from "@/contexts/reports-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function RecentReports() {
  const { reports, voteHelpful } = useReports()
  const { toast } = useToast()

  // Get the 4 most recent approved reports
  const recentReports = reports
    .filter((report) => report.status === "approved")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const handleHelpfulVote = (reportId: string) => {
    voteHelpful(reportId)
    toast({
      title: "PEER_VOTE_RECORDED",
      description: "TELEMETRY ADDED TO CONSENSUS MATRIX.",
    })
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

  return (
    <section className="py-32 bg-[#0C0A09] border-y border-[#1F1914] relative overflow-hidden">
      {/* HUD Background Ornaments */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.1]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-20 text-center sm:text-left gap-8 border-l border-primary/20 pl-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <TerminalSquare className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.4em]">
                VERIFIED_INTEL_ARCHIVE
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tighter uppercase font-mono leading-none">
              RECENT_<span className="text-primary text-glow-amber italic">TELEMETRY_LOGS</span>
            </h2>
          </div>
          <Link href="/reports" className="group">
            <div className="relative flex items-center justify-center gap-4 h-14 px-10 text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-primary/5 border border-primary/30 text-primary transition-all hover:bg-primary hover:text-black">
              ACCESS_FULL_DATABASE
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-1">
          {recentReports.length === 0 && (
            <div className="col-span-full border border-[#1F1914] p-16 text-center bg-[#15110E]">
              <p className="text-muted-foreground/30 font-mono text-[10px] uppercase tracking-[0.4em]">
                [ SYSTEM_ALERT: THREAT_BUFFER_IS_EMPTY ]
              </p>
            </div>
          )}
          
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="bg-[#15110E] flex flex-col justify-between border border-[#1F1914] transition-all duration-500 hover:border-primary/40 group relative overflow-hidden"
            >
              {/* HUD Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,191,0,0.01)_1px,transparent_1px)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="p-8 sm:p-10 flex-1 relative z-10">
                <div className="flex items-center justify-between gap-6 mb-8">
                  <div className={cn(
                    "px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.2em] border leading-none flex items-center gap-2",
                    report.riskLevel === "high" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                    report.riskLevel === "medium" ? "bg-warning/10 text-warning border-warning/30" :
                    "bg-primary/5 text-primary border-primary/20"
                  )}>
                    {report.riskLevel === 'high' && <ShieldAlert className="w-3 h-3" />}
                    NODE_RISK_{report.riskLevel.toUpperCase()}
                  </div>
                  <span className="text-[9px] text-muted-foreground/20 font-mono uppercase tracking-[0.2em]">
                    TIMESTAMP_T-{getTimeAgo(report.createdAt)}
                  </span>
                </div>

                <Link href={`/reports/${report.id}`} className="block mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase tracking-tighter line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground/40 font-mono tracking-tight line-clamp-3 leading-relaxed mb-10 border-l border-primary/10 pl-6">
                  {report.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-primary/40" />
                    {report.location || "GLOBAL_CLUSTER"}
                  </div>
                  <div className="h-1 w-1 bg-[#1F1914]" />
                  <div className="flex items-center gap-2">
                    <Flag className="h-3 w-3 text-primary/40" />
                    TYPE_{report.scamType.replace(/\s+/g, '_')}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-[#1F1914] bg-[#0C0A09]/50 flex items-center justify-between relative z-10">
                <button
                  className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-emerald-500 transition-colors flex items-center gap-3"
                  onClick={() => handleHelpfulVote(report.id)}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {report.helpfulVotes > 0 ? `VERIFIED [${report.helpfulVotes}]` : "VERIFY_NODE"}
                </button>

                <Link href={`/reports/${report.id}`} className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary transition-all flex items-center gap-3">
                  ACCESS_DOSSIER
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Technical Corners */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary/0 group-hover:border-primary/20 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-primary/0 group-hover:border-primary/20 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
