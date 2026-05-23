"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, ShieldAlert, TerminalSquare, AlertTriangle, Cpu, Radio, Network, Database, Eye } from "lucide-react"
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
      toast.success("TELEMETRY LOGGED", {
        description: "Peer verification added to the consensus matrix.",
        style: { background: "#0C0A09", border: "1px solid #4D7A2A", color: "#F59E0B", fontFamily: "monospace" }
      })
    } else {
      toast.error("DUPLICATE ENTRY", {
        description: "You have already verified this node.",
        style: { background: "#0C0A09", border: "1px solid #EF4444", color: "#EF4444", fontFamily: "monospace" }
      })
    }
  }

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId)
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId))
      toast.success("NODE FLAGGED", {
        description: "Alert dispatched to moderator protocols.",
        style: { background: "#0C0A09", border: "1px solid #F59E0B", color: "#F59E0B", fontFamily: "monospace" }
      })
    } else {
      toast.error("DUPLICATE ENTRY", {
        description: "Node already flagged for review.",
        style: { background: "#0C0A09", border: "1px solid #EF4444", color: "#EF4444", fontFamily: "monospace" }
      })
    }
  }

  // Calculate high-tech metrics
  const totalVerifiedDossiers = approvedReports.length
  const criticalThreatsCount = approvedReports.filter((r) => r.riskLevel === "high").length
  
  // Calculate average trust score
  const averageTrust = approvedReports.length > 0 
    ? Math.round(approvedReports.reduce((acc, curr) => acc + curr.trustScore, 0) / approvedReports.length)
    : 100

  // Calculate total consensus interactions
  const totalVerifications = approvedReports.reduce((acc, curr) => acc + curr.helpfulVotes, 0)

  return (
    <div className="min-h-screen bg-[#0C0A09] py-16 relative overflow-hidden font-mono">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/[0.02] rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1300px]">
        <div className="mx-auto">
          
          {/* Header section with HUD frame */}
          <div className="mb-10 relative bg-[#15110E]/60 border border-[#1F1914] p-8 shadow-[0_0_30px_rgba(245,158,11,0.02)] backdrop-blur-md">
            {/* HUD Corner notches */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-[0.25em]">
                  <TerminalSquare className="h-3.5 w-3.5" />
                  DATABASE_LEVEL_ACCESS_AUTHENTICATED
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-widest uppercase mb-3">
                  COMMUNITY <span className="text-primary">DATABASE</span>
                </h1>
                <p className="text-xs text-muted-foreground/80 uppercase tracking-widest leading-relaxed max-w-3xl border-l border-primary/30 pl-4">
                  Scan, analyze, and verify decentralized threat telemetry. peer-attested evidence modules secured by cryptographic consensus mechanisms.
                </p>
              </div>

              {/* Top Level Action */}
              <div className="flex shrink-0">
                <Link href="/report" className="w-full lg:w-auto">
                  <Button className="w-full lg:w-auto h-12 bg-primary hover:bg-primary/95 text-black font-bold uppercase tracking-widest rounded-none border border-primary hover:scale-[1.02] active:scale-[0.98] transition-all px-8 shadow-lg shadow-primary/15 relative group overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> SUBMIT_NEW_DOSSIER
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Overwatch Live Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#15110E]/60 border border-[#1F1914] p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Database className="h-3 w-3 text-primary/70" />
                ACTIVE_DOSSIERS
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {totalVerifiedDossiers.toString().padStart(3, '0')}
              </div>
              <div className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-1">Verified Node Telemetry</div>
            </div>

            <div className="bg-[#15110E]/60 border border-[#1F1914] p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3 w-3 text-red-500/70" />
                CRITICAL_THREATS
              </div>
              <div className="text-2xl font-black text-red-500 tracking-tight">
                {criticalThreatsCount.toString().padStart(3, '0')}
              </div>
              <div className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-1">Immediate Containment Class</div>
            </div>

            <div className="bg-[#15110E]/60 border border-[#1F1914] p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Network className="h-3 w-3 text-emerald-500/70" />
                CONSENSUS_INDEX
              </div>
              <div className="text-2xl font-black text-emerald-500 tracking-tight">
                {averageTrust}%
              </div>
              <div className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-1">Attestation Confidence Rate</div>
            </div>

            <div className="bg-[#15110E]/60 border border-[#1F1914] p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Radio className="h-3 w-3 text-amber-500/70" />
                PEER_ATTESTATIONS
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {totalVerifications.toLocaleString()}
              </div>
              <div className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mt-1">Attestation Verification Nodes</div>
            </div>
          </div>

          {/* Search, Filters, and Tabs Console */}
          <div className="mb-8 space-y-5 bg-[#15110E]/40 border border-[#1F1914] p-6 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Query Scanner Input */}
              <div className="relative flex-1 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-primary/70 font-black tracking-[0.25em] select-none">
                  &gt;_SCAN_QUERY:
                </span>
                <Input
                  placeholder="INPUT TARGET FIELD FOR REALTIME TELEMETRY SCAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-28 h-12 bg-[#0C0A09] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b-2 focus-visible:border-b-primary focus-visible:bg-[#12100E] transition-all placeholder:text-muted-foreground/20"
                />
              </div>

              {/* Selector Matrix */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[220px] h-12 bg-[#0C0A09] border-[#1F1914] text-foreground font-mono text-[10px] uppercase tracking-widest rounded-none focus:ring-1 focus:ring-primary/50 transition-colors">
                    <Filter className="mr-2 h-4.5 w-4.5 text-primary/50 shrink-0" />
                    <SelectValue placeholder="FILTER_BY_TYPE" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0C0A09] border-[#1F1914] text-foreground font-mono rounded-none">
                    <SelectItem value="all" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">ALL_THREAT_VECTORS</SelectItem>
                    <SelectItem value="Fake Job Offer" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">FAKE_JOB_OFFER</SelectItem>
                    <SelectItem value="Unpaid Work" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">UNPAID_WORK</SelectItem>
                    <SelectItem value="Portfolio Theft" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">PORTFOLIO_THEFT</SelectItem>
                    <SelectItem value="Ghost Client" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">GHOST_CLIENT</SelectItem>
                    <SelectItem value="Upfront Payment Scam" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">UPFRONT_PAYMENT</SelectItem>
                    <SelectItem value="Identity Theft" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">IDENTITY_THEFT</SelectItem>
                    <SelectItem value="Phishing Attempt" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">PHISHING_ATTEMPT</SelectItem>
                    <SelectItem value="Other" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">UNKNOWN_VECTOR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[220px] h-12 bg-[#0C0A09] border-[#1F1914] text-foreground font-mono text-[10px] uppercase tracking-widest rounded-none focus:ring-1 focus:ring-primary/50 transition-colors">
                    <SelectValue placeholder="SORT_ORDER" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0C0A09] border-[#1F1914] text-foreground font-mono rounded-none">
                    <SelectItem value="recent" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">MOST_RECENT</SelectItem>
                    <SelectItem value="helpful" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">HIGHEST_CONSENSUS</SelectItem>
                    <SelectItem value="trust" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">TRUST_SCORE</SelectItem>
                    <SelectItem value="views" className="uppercase tracking-widest text-[9px] focus:bg-primary/20 focus:text-primary">MOST_VIEWED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Tab selectors */}
            <div className="flex flex-wrap border-b border-[#1F1914] gap-px">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 font-mono text-[9px] uppercase tracking-widest font-black transition-all border-b-2 ${
                  activeTab === "all" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                }`}
              >
                GLOBAL_STREAM [{approvedReports.length}]
              </button>
              <button
                onClick={() => setActiveTab("high-risk")}
                className={`px-6 py-3 font-mono text-[9px] uppercase tracking-widest font-black transition-all border-b-2 ${
                  activeTab === "high-risk" ? "border-red-500 text-red-500 bg-red-500/5" : "border-transparent text-muted-foreground hover:text-red-400 hover:bg-[#15110E]"
                }`}
              >
                CRITICAL_THREATS [{approvedReports.filter((r) => r.riskLevel === "high").length}]
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-6 py-3 font-mono text-[9px] uppercase tracking-widest font-black transition-all border-b-2 ${
                  activeTab === "recent" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                }`}
              >
                T-MINUS_24H [{approvedReports.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}]
              </button>
            </div>
          </div>

          {/* Dossiers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedReports.map((report) => (
              <div 
                key={report.id} 
                className="group flex flex-col bg-[#15110E]/65 border border-[#1F1914] hover:border-primary/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.03)] transition-all duration-300 relative rounded-sm"
              >
                {/* HUD Card Corner Accents */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-primary/40 group-hover:border-primary transition-colors pointer-events-none" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-primary/40 group-hover:border-primary transition-colors pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-primary/40 group-hover:border-primary transition-colors pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-primary/40 group-hover:border-primary transition-colors pointer-events-none" />

                {/* Left accent vertical indicator bar */}
                <div className={`absolute left-0 top-3 bottom-3 w-1 transition-all ${
                  report.riskLevel === 'high' ? 'bg-red-500/80 group-hover:bg-red-500' : 'bg-primary/20 group-hover:bg-primary'
                }`} />

                {/* Card Header Panel */}
                <div className="pl-6 pr-4 py-4 border-b border-[#1F1914]/80 flex justify-between items-center gap-4 select-none">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                      report.riskLevel === 'high' ? 'bg-red-500' : 'bg-primary'
                    }`} />
                    <span className="text-[8px] font-bold text-muted-foreground/70 uppercase tracking-[0.25em]">
                      DOSSIER_ID: {report.id.substring(0, 10).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[8.5px] font-bold tracking-widest uppercase ${
                    report.riskLevel === 'high' 
                      ? 'border-red-500/40 bg-red-500/10 text-red-500' 
                      : 'border-primary/20 bg-primary/5 text-primary'
                  }`}>
                    {report.riskLevel === 'high' ? '[ CRITICAL_RISK ]' : `[ ${report.riskLevel.toUpperCase()}_RISK ]`}
                  </span>
                </div>

                {/* Main Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between pl-8">
                  <div>
                    {/* Title */}
                    <Link href={`/reports/${report.id}`} className="hover:text-primary transition-colors inline-block w-full mb-3 group-hover:translate-x-0.5 transition-transform duration-200">
                      <h2 className="text-sm font-black text-foreground uppercase tracking-wider leading-snug line-clamp-1 border-b border-transparent group-hover:border-primary/20 pb-0.5">
                        {report.title}
                      </h2>
                    </Link>

                    {/* Description Snippet */}
                    <p className="text-[11px] text-muted-foreground/80 font-mono leading-relaxed line-clamp-3 mb-6 border-l border-[#1F1914] pl-3 whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>

                  {/* High Tech Mini Data Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-[9px] text-muted-foreground font-mono uppercase tracking-widest select-none bg-[#0C0A09]/60 p-3 border border-[#1F1914]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                        <span className="text-foreground truncate">{report.company || "OSINT"} ({report.location || "GLOBAL"})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                        <span className="text-foreground">T-{new Date(report.createdAt).toISOString().split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldAlert className="h-3 w-3 text-primary/70 shrink-0" />
                        <span className="text-foreground truncate">{report.scamType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3 w-3 text-primary/70 shrink-0" />
                        <span className="text-foreground">{report.views} READS</span>
                      </div>
                    </div>

                    {/* Actions Panel inside Card */}
                    <div className="flex items-center justify-between gap-3 border-t border-[#1F1914] pt-4 select-none">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="h-8 text-[9px] font-bold uppercase tracking-widest rounded-none border-[#1F1914] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-all disabled:opacity-50"
                          onClick={() => handleHelpfulVote(report.id)}
                          disabled={votedReports.has(report.id)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1.5" />
                          {votedReports.has(report.id) ? "VERIFIED" : "VERIFY"} [{report.helpfulVotes}]
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="h-8 text-[8.5px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all"
                          onClick={() => handleFlag(report.id)}
                          disabled={flaggedReportsLocal.has(report.id)}
                        >
                          FLAG
                        </Button>
                      </div>

                      <Link href={`/reports/${report.id}`}>
                        <Button 
                          className="h-8 text-[9px] font-bold uppercase tracking-widest rounded-none border border-primary/50 text-primary bg-primary/5 hover:bg-primary hover:text-black transition-all"
                        >
                          DECRYPT_DOSSIER &gt;&gt;
                        </Button>
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Empty query result matrix fall back */}
          {sortedReports.length === 0 && (
            <div className="border border-[#1F1914] p-16 text-center bg-[#15110E]/60 relative overflow-hidden backdrop-blur-sm rounded-sm">
              <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6 animate-pulse" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground mb-2">
                [ ERROR_404: NO_TELEMETRY_FOUND ]
              </h3>
              <p className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The current matrix query yielded zero matching logs. Adjust query search inputs or category filter options.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
                  setSelectedIndustry("all")
                  setSortBy("recent")
                }}
                className="mt-8 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-black font-mono text-[9px] font-bold uppercase tracking-widest h-10 px-8 transition-all"
              >
                RESET_QUERY_MATRIX
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
