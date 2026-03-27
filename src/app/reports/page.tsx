"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, ShieldAlert, TerminalSquare, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReports } from "@/contexts/reports-context"
import { toast } from "sonner"
import Link from "next/link"

export default function ReportsPage() {
  const { reports, voteHelpful, flagReport } = useReports()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("all")

  const [votedReports, setVotedReports] = useState<Set<string>>(new Set())
  const [flaggedReportsLocal, setFlaggedReportsLocal] = useState<Set<string>>(new Set())

  const approvedReports = reports.filter((report) => report.status === "approved")

  const filteredReports = approvedReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || report.scamType === selectedType
    const matchesIndustry = selectedIndustry === "all" || report.industry === selectedIndustry
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "high-risk" && report.riskLevel === "high") ||
      (activeTab === "recent" && new Date(report.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000)

    return matchesSearch && matchesType && matchesIndustry && matchesTab
  })

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpfulVotes - a.helpfulVotes
      case "trust":
        return b.trustScore - a.trustScore
      case "views":
        return b.views - a.views
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleHelpfulVote = (reportId: string) => {
    if (!votedReports.has(reportId)) {
      voteHelpful(reportId)
      setVotedReports((prev) => new Set(prev).add(reportId))
      toast("TELEMETRY LOGGED", { description: "Peer verification added to the consensus matrix." })
    } else {
      toast.error("DUPLICATE ENTRY", { description: "You have already verified this node." })
    }
  }

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId)
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId))
      toast("NODE FLAGGED", { description: "Alert dispatched to moderator protocols." })
    } else {
      toast.error("DUPLICATE ENTRY", { description: "Node already flagged for review." })
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] py-16 relative">
      {/* Decorative Scanlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 shadow-[0_0_20px_rgba(255,191,0,0.5)] z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 border-b border-[#1F1914] pb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <TerminalSquare className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">
                GLOBAL_ARCHIVE_ACCESS
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-4">
              Community <span className="text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]">Database</span>
            </h1>
            <p className="text-sm font-mono text-muted-foreground/80 uppercase tracking-widest max-w-2xl border-l-2 border-primary/50 pl-4">
              Search and filter decentralized threat telemetry. verified by rigorous peer consensus protocols.
            </p>
          </div>

          {/* Search, Filters, and Tabs */}
          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50 group-focus-within:text-primary transition-colors z-10" />
                <Input
                  placeholder="QUERY DATASTORE BY STRING..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-[#15110E] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b-2 focus-visible:border-b-primary focus-visible:bg-[#1E1915] transition-all placeholder:text-muted-foreground/30 relative z-0 shadow-inner group-focus-within:shadow-[0_0_15px_rgba(255,191,0,0.1)]"
                />
              </div>
              <div className="flex gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px] h-12 bg-[#15110E] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus:ring-1 focus:ring-primary/50">
                    <Filter className="mr-2 h-4 w-4 text-primary/50" />
                    <SelectValue placeholder="TYPE_FILTER" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0C0A09] border-[#1F1914] text-foreground font-mono rounded-none">
                    <SelectItem value="all" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">ALL_VECTORS</SelectItem>
                    <SelectItem value="Fake Job Offer" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">FAKE_JOB_OFFER</SelectItem>
                    <SelectItem value="Unpaid Work" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">UNPAID_WORK</SelectItem>
                    <SelectItem value="Portfolio Theft" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">PORTFOLIO_THEFT</SelectItem>
                    <SelectItem value="Ghost Client" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">GHOST_CLIENT</SelectItem>
                    <SelectItem value="Upfront Payment Scam" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">UPFRONT_PAYMENT</SelectItem>
                    <SelectItem value="Identity Theft" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">IDENTITY_THEFT</SelectItem>
                    <SelectItem value="Phishing Attempt" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">PHISHING_ATTEMPT</SelectItem>
                    <SelectItem value="Other" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">UNKNOWN_VECTOR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-12 bg-[#15110E] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus:ring-1 focus:ring-primary/50">
                    <SelectValue placeholder="SORT_ORDER" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0C0A09] border-[#1F1914] text-foreground font-mono rounded-none">
                    <SelectItem value="recent" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">MOST_RECENT</SelectItem>
                    <SelectItem value="helpful" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">HIGHEST_CONSENSUS</SelectItem>
                    <SelectItem value="trust" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">TRUST_SCORE</SelectItem>
                    <SelectItem value="views" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">MOST_VIEWED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex border-b border-[#1F1914]">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 sm:flex-none px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${
                  activeTab === "all" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                }`}
              >
                GLOBAL_STREAM [{approvedReports.length}]
              </button>
              <button
                onClick={() => setActiveTab("high-risk")}
                className={`flex-1 sm:flex-none px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${
                  activeTab === "high-risk" ? "border-red-500 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)_inset]" : "border-transparent text-muted-foreground hover:text-red-400 hover:bg-[#15110E]"
                }`}
              >
                CRITICAL_THREATS [{approvedReports.filter((r) => r.riskLevel === "high").length}]
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex-1 sm:flex-none px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${
                  activeTab === "recent" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                }`}
              >
                T-MINUS_24H [{approvedReports.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}]
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sortedReports.map((report) => (
              <div key={report.id} className="bg-[#15110E] border border-[#1F1914] flex flex-col sm:flex-row group hover:border-primary/50 transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,191,0,0.15)] relative">
                
                {/* HUD Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20 group-hover:border-primary/80 transition-colors pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20 group-hover:border-primary/80 transition-colors pointer-events-none z-10" />

                {/* Left Accent Bar */}
                <div className={`w-1 shrink-0 transition-colors ${report.riskLevel === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#1F1914] group-hover:bg-primary group-hover:shadow-[0_0_10px_rgba(255,191,0,0.5)]'}`} />

                {/* Main Content */}
                <div className="flex-1 min-w-0 p-6 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#1F1914] relative overflow-hidden">
                  {/* Subtle scanline overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Link href={`/reports/${report.id}`} className="hover:text-primary transition-colors block truncate w-full">
                        <h2 className="text-lg font-bold text-foreground uppercase tracking-wider truncate group-hover:drop-shadow-[0_0_5px_rgba(255,191,0,0.5)] transition-all">{report.title}</h2>
                      </Link>
                      {report.riskLevel === 'high' && (
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 border border-red-500/30 text-[9px] font-mono font-bold tracking-widest uppercase bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                          <AlertTriangle className="w-3 h-3" />
                          [ CRITICAL ]
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground/80 font-mono line-clamp-2 leading-relaxed mb-6 border-l-2 border-[#1F1914] pl-3">
                      {report.description}
                    </p>
                  </div>

                  {/* Meta layout */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 bg-[#0C0A09] border border-[#1F1914] px-2 py-1">
                      <MapPin className="h-3 w-3 text-primary/70" />
                      {report.company} ({report.location})
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0C0A09] border border-[#1F1914] px-2 py-1">
                      <Clock className="h-3 w-3 text-primary/70" />
                      T-{new Date(report.createdAt).toISOString().split('T')[0]}
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0C0A09] border border-[#1F1914] px-2 py-1">
                       <Flag className="h-3 w-3 text-primary/70" />
                       {report.scamType}
                    </div>
                  </div>
                </div>

                {/* Actions sidebar */}
                <div className="sm:w-48 bg-[#0C0A09] shrink-0 p-6 flex flex-col justify-center items-stretch gap-3">
                   <div className="text-[9px] font-mono text-center text-muted-foreground/50 tracking-[0.2em] mb-2 uppercase">
                     [ NODE_ACTIONS ]
                   </div>
                   
                  <Button
                    variant="outline"
                    className="w-full text-[10px] font-mono uppercase tracking-widest font-bold rounded-none h-9 border-[#1F1914] hover:bg-success/10 hover:border-success/30 hover:text-success transition-all disabled:opacity-50"
                    onClick={() => handleHelpfulVote(report.id)}
                    disabled={votedReports.has(report.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-2" />
                    {votedReports.has(report.id) ? "LOGGED" : "VERIFY"} [{report.helpfulVotes}]
                  </Button>
                  
                  <Link href={`/reports/${report.id}`} className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full text-[10px] font-mono uppercase tracking-widest font-bold rounded-none h-9 border-[#1F1914] hover:border-primary/50 text-foreground hover:text-primary transition-all bg-primary/5"
                    >
                      DOSSIER <TerminalSquare className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full h-8 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all mt-2"
                    onClick={() => handleFlag(report.id)}
                    disabled={flaggedReportsLocal.has(report.id)}
                  >
                    REPORT_ANOMALY
                  </Button>
                </div>
              </div>
            ))}

            {sortedReports.length === 0 && (
              <div className="border border-[#1F1914] p-16 text-center bg-[#15110E] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground mb-2">[ ERROR_404: NO_TELEMETRY_FOUND ]</h3>
                <p className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest max-w-md mx-auto">
                  The current matrix query yielded zero results. Adjust filtering parameters to expand search radius.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedType("all")
                    setSelectedIndustry("all")
                    setSortBy("recent")
                  }}
                  className="mt-8 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest h-10 px-8 transition-all"
                >
                  RESET_QUERY_MATRIX
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
