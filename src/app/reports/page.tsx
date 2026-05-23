"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, ShieldAlert, TerminalSquare, AlertTriangle, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-[#0C0A09] relative overflow-hidden">
      {/* HUD Background Elements */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.15]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,191,0,0.05),transparent_70%)]" />
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="container relative z-20 px-4 py-20 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        
        {/* Header Section - Centralized Intelligence */}
        <div className="space-y-6 border-b border-[#1F1914] pb-12">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-none">
            <TerminalSquare className="h-4 w-4" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Archive_Protocol_v4.1</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-foreground leading-none">
            COMMUNITY_<span className="text-primary text-glow-amber">DATABASE</span>
          </h1>
          <p className="text-lg text-muted-foreground/60 font-mono tracking-tight max-w-2xl border-l border-primary/30 pl-6">
            Search and filter decentralized threat telemetry verified by rigorous peer consensus protocols. Decentralized Intelligence Layer.
          </p>
        </div>

        {/* Global Control Interface */}
        <div className="space-y-8 animate-fade-in stagger-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors z-10" />
              <Input
                placeholder="QUERY_MATRIX_BY_STRING..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-[#15110E] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-primary/10 transition-all"
              />
            </div>
            <div className="md:col-span-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full h-14 bg-[#15110E] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus:ring-1 focus:ring-primary/50">
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
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-14 bg-[#15110E] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus:ring-1 focus:ring-primary/50">
                  <SelectValue placeholder="SORT_ORDER" />
                </SelectTrigger>
                <SelectContent className="bg-[#0C0A09] border-[#1F1914] text-foreground font-mono rounded-none">
                  <SelectItem value="recent" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">MOST_RECENT</SelectItem>
                  <SelectItem value="helpful" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">HIGHEST_CONSENSUS</SelectItem>
                  <SelectItem value="trust" className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">TRUST_SCORE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Forensic Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#1F1914]">
            {[
              { id: "all", label: "GLOBAL_STREAM", count: approvedReports.length },
              { id: "high-risk", label: "CRITICAL_THREATS", count: approvedReports.filter(r => r.riskLevel === 'high').length },
              { id: "recent", label: "T-MINUS_24H", count: approvedReports.filter(r => new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest transition-all relative
                  ${activeTab === tab.id ? "text-primary bg-primary/5 border-b-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-[#15110E]"}`}
              >
                {tab.label} [{tab.count}]
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="space-y-8 animate-fade-in stagger-2">
          {sortedReports.map((report) => (
            <div key={report.id} className="relative group">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-primary/20 group-hover:border-primary transition-colors pointer-events-none" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-primary/20 group-hover:border-primary transition-colors pointer-events-none" />
              
              <div className="bg-[#15110E] border border-[#1F1914] flex flex-col sm:flex-row group hover:border-primary/30 transition-all duration-500 overflow-hidden">
                {/* Visual Risk Indicator */}
                <div className={`w-1.5 shrink-0 ${report.riskLevel === 'high' ? 'bg-destructive shadow-[0_0_15px_rgba(192,41,42,0.4)]' : 'bg-[#1F1914] group-hover:bg-primary'}`} />

                <div className="flex-1 p-8 space-y-6 bg-[#15110E]">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 max-w-xl">
                      <Link href={`/reports/${report.id}`} className="block group/title">
                        <h2 className="text-xl font-bold font-mono text-foreground uppercase tracking-tight group-hover/title:text-primary transition-colors">
                          {report.title}
                        </h2>
                      </Link>
                      <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed line-clamp-2 uppercase tracking-wide">
                        {report.description}
                      </p>
                    </div>
                    {report.riskLevel === 'high' && (
                      <div className="px-3 py-1 bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-mono font-bold uppercase tracking-widest animate-pulse">
                        [ CRITICAL_VECTOR ]
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 pt-4 border-t border-[#1F1914]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-primary/50" />
                      {report.company} / {report.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-primary/50" />
                      T-{new Date(report.createdAt).toISOString().split('T')[0]}
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3 text-primary/50" />
                      NODE_ID: {report.id.substring(0, 8)}
                    </div>
                  </div>
                </div>

                {/* Tactical Actions Sidebar */}
                <div className="sm:w-56 bg-[#0C0A09] border-l border-[#1F1914] p-8 flex flex-col justify-center gap-4">
                  <Button
                    variant="outline"
                    className="w-full text-[10px] font-mono uppercase tracking-[0.15em] font-bold h-11 border-[#1F1914] hover:bg-primary hover:text-black hover:border-primary transition-all rounded-none"
                    onClick={() => handleHelpfulVote(report.id)}
                    disabled={votedReports.has(report.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-2" />
                    {votedReports.has(report.id) ? "LOGGED" : "VERIFY"} [{report.helpfulVotes}]
                  </Button>
                  
                  <Link href={`/reports/${report.id}`} className="w-full">
                    <Button 
                      className="w-full text-[10px] font-mono uppercase tracking-[0.15em] font-bold h-11 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none"
                    >
                      DOSSIER <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full h-8 text-[8px] font-mono font-bold uppercase tracking-widest text-[#1F1914] hover:text-destructive group-hover:text-muted-foreground/40 transition-all rounded-none"
                    onClick={() => handleFlag(report.id)}
                    disabled={flaggedReportsLocal.has(report.id)}
                  >
                    REPORT_ANOMALY
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {sortedReports.length === 0 && (
            <div className="border border-[#1F1914] p-24 text-center bg-[#15110E] relative overflow-hidden group">
              <TerminalSquare className="h-16 w-16 text-primary/10 mx-auto mb-8 animate-pulse" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground mb-4">[ ERROR: NO_TELEMETRY_FOUND ]</h3>
              <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] max-w-sm mx-auto leading-loose">
                Current matrix coordinates yielded zero matching signatures. Adjust filtering parameters to expand scanning radius.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
                  setSelectedIndustry("all")
                  setSortBy("recent")
                }}
                className="mt-12 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-black font-mono text-[10px] font-bold uppercase tracking-[0.2em] h-12 px-10 transition-all"
              >
                RESET_DATA_QUERY
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
