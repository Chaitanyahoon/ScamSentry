"use client"

import Link from "next/link"
import { Clock, MapPin, ThumbsUp, Flag, Terminal } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useReports } from "@/contexts/reports-context"
import { useToast } from "@/components/ui/use-toast"

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
      description: "Thank you for helping the community!",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "< 1H_AGO"
    if (diffInHours < 24) return `${diffInHours}H_AGO`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}D_AGO`
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive shadow-[0_0_8px_hsla(var(--destructive),0.3)]"
      case "medium":
        return "bg-warning/10 text-warning border-warning shadow-[0_0_8px_hsla(var(--warning),0.3)]"
      case "low":
        return "bg-secondary/10 text-secondary border-secondary shadow-[0_0_8px_hsla(var(--secondary),0.3)]"
      default:
        return "bg-card text-foreground border-border"
    }
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]"></div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 text-center sm:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 border border-secondary/50 bg-secondary/10 text-secondary font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_hsla(var(--secondary),0.2)]">
                <Terminal className="mr-2 h-4 w-4" /> LIVE_DATA_FEED
              </div>
              <h2 className="text-4xl font-extrabold tracking-widest uppercase text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                Recent <span className="text-secondary drop-shadow-[0_0_10px_hsla(var(--secondary),0.5)]">Reports</span>
              </h2>
            </div>
            <Link href="/reports">
              <Button
                variant="outline"
                className="mt-8 sm:mt-0 font-bold uppercase tracking-widest border-2 border-secondary text-secondary hover:bg-secondary hover:text-foreground bg-transparent transition-all drop-shadow-[0_0_8px_hsla(var(--secondary),0.3)]"
              >
                Query full Database
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {recentReports.length === 0 && (
              <div className="col-span-full border border-border p-12 text-center bg-card/50">
                <p className="text-muted-foreground font-mono uppercase tracking-widest">NO_THREATS_DETECTED // BE_THE_FIRST_TO_REPORT</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 col-span-full">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="glass-card flex flex-col justify-between group overflow-hidden"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className={`px-2.5 py-1 border text-xs font-bold rounded-none uppercase tracking-widest ${getRiskColor(report.riskLevel)}`}>
                        {report.riskLevel}_RISK
                      </div>
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(report.createdAt)}
                      </span>
                    </div>

                    <Link href={`/reports/${report.id}`} className="block group-hover:text-primary transition-colors duration-300 mb-4">
                      <h3 className="text-xl font-bold uppercase tracking-wider text-foreground line-clamp-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">{report.title}</h3>
                    </Link>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-mono tracking-wide mb-6">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-secondary font-mono tracking-widest uppercase font-bold">
                      <div className="flex items-center bg-secondary/10 border border-secondary/30 px-3 py-1.5 shadow-[0_0_10px_hsla(var(--secondary),0.1)]">
                        <MapPin className="h-4 w-4 mr-2" />
                        {report.location || "GLOBAL_NODE"}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-border bg-card/50 flex flex-wrap items-center justify-between gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-none font-bold uppercase tracking-widest text-muted-foreground hover:text-success hover:bg-success/10 -ml-2 text-xs border border-transparent hover:border-success/30 transition-all"
                      onClick={() => handleHelpfulVote(report.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {report.helpfulVotes > 0 ? `${report.helpfulVotes} UPVOTES` : "VERIFY"}
                    </Button>

                    <Link href={`/reports/${report.id}`} className="text-xs font-bold tracking-widest text-primary hover:text-secondary uppercase transition-colors flex items-center drop-shadow-[0_0_5px_hsla(var(--primary),0.5)] group-hover:drop-shadow-[0_0_5px_hsla(var(--secondary),0.5)]">
                      DUMP_LOGS →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
