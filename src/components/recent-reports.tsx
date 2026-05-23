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
    <section className="py-24 bg-[#0C0A09] border-y border-[#1F1914] relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 text-center sm:text-left gap-6 border-b border-[#1F1914] pb-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">
                  COMMUNITY_THREAT_FEED
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Recent <span className="text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]">Telemetry</span>
              </h2>
            </div>
            <Link href="/reports">
              <Button
                variant="outline"
                className="font-mono text-xs font-bold tracking-widest uppercase px-6 h-10 border-primary/50 text-primary hover:bg-primary hover:text-black rounded-none shadow-[0_0_15px_rgba(255,191,0,0.1)] transition-all"
              >
                ACCESS_DATABASE <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReports.length === 0 && (
              <div className="col-span-full border border-[#1F1914] p-12 text-center bg-[#15110E]">
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                  [ SYSERR: NO_RECENT_REPORTS_FOUND_IN_BUFFER ]
                </p>
              </div>
            )}
            
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#15110E] flex flex-col justify-between border border-[#1F1914] hover:border-primary/50 transition-all duration-300 ease-out group relative shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,191,0,0.15)]"
              >
                {/* HUD Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20 group-hover:border-primary/80 transition-colors pointer-events-none" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/20 group-hover:border-primary/80 transition-colors pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/20 group-hover:border-primary/80 transition-colors pointer-events-none z-10" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20 group-hover:border-primary/80 transition-colors pointer-events-none z-10" />

                {/* Top decorative bar */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />

                <div className="p-6 sm:p-8 flex-1">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-none text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border cursor-default",
                        report.riskLevel === "high" ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                        report.riskLevel === "medium" ? "bg-warning/10 text-warning border-warning/30 shadow-[0_0_10px_hsla(var(--warning),0.2)]" :
                        "bg-secondary/10 text-secondary border-secondary/30"
                      )}
                    >
                      {report.riskLevel === 'high' && <ShieldAlert className="w-3 h-3 mr-1 inline" />}
                      LVL_{report.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1.5 uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      T-{getTimeAgo(report.createdAt)}
                    </span>
                  </div>

                  <Link href={`/reports/${report.id}`} className="block mb-4">
                    <h3 className="text-lg font-bold text-foreground line-clamp-2 uppercase tracking-wide group-hover:text-primary transition-colors">
                      {report.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-muted-foreground/80 line-clamp-3 leading-relaxed mb-6 font-mono border-l-2 border-[#1F1914] pl-4">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                    <div className="flex items-center bg-[#0C0A09] px-2 py-1 border border-[#1F1914]">
                      <MapPin className="h-3 w-3 mr-1.5 text-primary/70" />
                      <span className="truncate max-w-[150px]">{report.location || "GLOBAL_NODE"}</span>
                    </div>
                    <div className="flex items-center bg-[#0C0A09] px-2 py-1 border border-[#1F1914]">
                      <Flag className="h-3 w-3 mr-1.5 text-primary/70" />
                      {report.scamType}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#1F1914] bg-[#0C0A09] flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-none font-mono text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-success hover:bg-success/10 -ml-2 transition-colors border border-transparent hover:border-success/30"
                    onClick={() => handleHelpfulVote(report.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-2" />
                    {report.helpfulVotes > 0 ? `VERIFIED [${report.helpfulVotes}]` : "VERIFY_NODE"}
                  </Button>

                  <Link href={`/reports/${report.id}`} className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center group/link">
                    READ_DOSSIER <ArrowRight className="ml-1 h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
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
