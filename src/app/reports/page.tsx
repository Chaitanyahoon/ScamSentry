"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, ShieldAlert, TerminalSquare, AlertTriangle, Cpu, Radio, Network, Database, Eye, Building, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReports } from "@/contexts/reports-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  const { reports, voteHelpful, flagReport, isLoadingReports } = useReports()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("all")

  const [votedReports, setVotedReports] = useState<Set<string>>(new Set())
  const [flaggedReportsLocal, setFlaggedReportsLocal] = useState<Set<string>>(new Set())

  const approvedReports = reports.filter((report) => report.status === "approved")

  const latestReportTime = approvedReports.length > 0
    ? Math.max(...approvedReports.map((r) => {
        const t = new Date(r.createdAt).getTime();
        return isNaN(t) ? 0 : t;
      }))
    : Date.now()

  const referenceTime = latestReportTime > 0 ? latestReportTime : Date.now()

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
      (activeTab === "recent" && new Date(report.createdAt).getTime() > referenceTime - 24 * 60 * 60 * 1000)

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
      toast({
        title: "TELEMETRY LOGGED",
        description: "Peer verification added to the consensus matrix.",
      })
    } else {
      toast({
        title: "DUPLICATE ENTRY",
        description: "You have already verified this node.",
        variant: "destructive",
      })
    }
  }

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId)
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId))
      toast({
        title: "NODE FLAGGED",
        description: "Alert dispatched to moderator protocols.",
      })
    } else {
      toast({
        title: "DUPLICATE ENTRY",
        description: "Node already flagged for review.",
        variant: "destructive",
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
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/[0.02] rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1300px]">
        <div className="mx-auto">
          
          {/* Header section with HUD frame */}
          <div className="mb-10 relative bg-card/40 border border-border p-8 shadow-xl backdrop-blur-md rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-primary/10 border border-primary/20 text-xs font-semibold text-primary rounded-full">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Verified Threat Database
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-3">
                  Community <span className="text-primary">Reports</span>
                </h1>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl border-l-2 border-border pl-4">
                  Scan, analyze, and verify decentralized threat telemetry. Peer-attested evidence modules secured by community consensus mechanisms.
                </p>
              </div>

              {/* Top Level Action */}
              <div className="flex shrink-0">
                <Link href="/report" className="w-full lg:w-auto">
                  <Button className="w-full lg:w-auto h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl px-8 shadow-lg shadow-primary/15 transition-all">
                    <Cpu className="h-4 w-4 mr-2" /> Report a Scam
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Overwatch Live Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 rounded-2xl transition-all duration-300">
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <Database className="h-3.5 w-3.5 text-primary/70" />
                Active Reports
              </div>
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {totalVerifiedDossiers.toString().padStart(3, '0')}
              </div>
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">Verified Telemetry</div>
            </div>

            <div className="bg-card border border-border p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 rounded-2xl transition-all duration-300">
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-destructive rounded-r-md" />
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive/70" />
                Critical Threats
              </div>
              <div className="text-3xl font-bold text-destructive tracking-tight">
                {criticalThreatsCount.toString().padStart(3, '0')}
              </div>
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">Immediate Containment</div>
            </div>

            <div className="bg-card border border-border p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 rounded-2xl transition-all duration-300">
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-success rounded-r-md" />
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <Network className="h-3.5 w-3.5 text-success/70" />
                Consensus Index
              </div>
              <div className="text-3xl font-bold text-success tracking-tight">
                {averageTrust}%
              </div>
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">Attestation Confidence</div>
            </div>

            <div className="bg-card border border-border p-5 relative overflow-hidden backdrop-blur-sm group hover:border-primary/30 rounded-2xl transition-all duration-300">
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-warning rounded-r-md" />
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <Radio className="h-3.5 w-3.5 text-warning/70" />
                Peer Verifications
              </div>
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {totalVerifications.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">Attestation Votes</div>
            </div>
          </div>

          {/* Search, Filters, and Tabs Console */}
          <div className="mb-8 space-y-5 bg-card/25 border border-border p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Query Scanner Input */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/45" />
                <Input
                  placeholder="Search by target domain, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-background border-border text-foreground text-sm rounded-xl focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              {/* Selector Matrix */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[220px] h-12 bg-background border-border text-foreground text-xs rounded-xl focus:ring-1 focus:ring-primary/30 transition-colors">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl">
                    <SelectItem value="all" className="text-xs focus:bg-primary/20 focus:text-primary">All Threats</SelectItem>
                    <SelectItem value="Fake Job Offer" className="text-xs focus:bg-primary/20 focus:text-primary">Fake Job Offer</SelectItem>
                    <SelectItem value="Unpaid Work" className="text-xs focus:bg-primary/20 focus:text-primary">Unpaid Work</SelectItem>
                    <SelectItem value="Portfolio Theft" className="text-xs focus:bg-primary/20 focus:text-primary">Portfolio Theft</SelectItem>
                    <SelectItem value="Ghost Client" className="text-xs focus:bg-primary/20 focus:text-primary">Ghost Client</SelectItem>
                    <SelectItem value="Upfront Payment Scam" className="text-xs focus:bg-primary/20 focus:text-primary">Upfront Payment</SelectItem>
                    <SelectItem value="Identity Theft" className="text-xs focus:bg-primary/20 focus:text-primary">Identity Theft</SelectItem>
                    <SelectItem value="Phishing Attempt" className="text-xs focus:bg-primary/20 focus:text-primary">Phishing Attempt</SelectItem>
                    <SelectItem value="Cybersecurity Advisory" className="text-xs focus:bg-primary/20 focus:text-primary">Cybersecurity Advisory</SelectItem>
                    <SelectItem value="Other" className="text-xs focus:bg-primary/20 focus:text-primary">Other Vectors</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[220px] h-12 bg-background border-border text-foreground text-xs rounded-xl focus:ring-1 focus:ring-primary/30 transition-colors">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl">
                    <SelectItem value="recent" className="text-xs focus:bg-primary/20 focus:text-primary">Most Recent</SelectItem>
                    <SelectItem value="helpful" className="text-xs focus:bg-primary/20 focus:text-primary">Highest Consensus</SelectItem>
                    <SelectItem value="trust" className="text-xs focus:bg-primary/20 focus:text-primary">Trust Score</SelectItem>
                    <SelectItem value="views" className="text-xs focus:bg-primary/20 focus:text-primary">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Tab selectors */}
            <div className="flex flex-wrap border-b border-border gap-2 pb-px">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Global Stream ({approvedReports.length})
              </button>
              <button
                onClick={() => setActiveTab("high-risk")}
                className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "high-risk" ? "border-destructive text-destructive" : "border-transparent text-muted-foreground hover:text-destructive"
                }`}
              >
                Critical Threats ({approvedReports.filter((r) => r.riskLevel === "high").length})
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "recent" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Past 24 Hours ({approvedReports.filter((r) => new Date(r.createdAt).getTime() > referenceTime - 24 * 60 * 60 * 1000).length})
              </button>
            </div>
          </div>

          {/* Dossiers Grid / Loading / Empty Fallbacks */}
          {isLoadingReports ? (
            <div className="py-24 text-center border border-border bg-card/10 rounded-2xl">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Accessing decentralized intelligence registry...
              </p>
            </div>
          ) : sortedReports.length === 0 ? (
            <div className="border border-border p-16 text-center bg-card/40 rounded-2xl backdrop-blur-sm">
              <ShieldAlert className="h-12 w-12 text-muted-foreground/45 mx-auto mb-4 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
                No telemetry found
              </h3>
              <p className="text-xs text-muted-foreground/70 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The current query yielded zero matching logs. Adjust query search inputs or category filter options.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
                  setSelectedIndustry("all")
                  setSortBy("recent")
                }}
                className="mt-6 rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold px-8 transition-all"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedReports.map((report) => (
                <div 
                  key={report.id} 
                  className="group flex flex-col bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.02] transition-all duration-300 relative rounded-2xl overflow-hidden"
                >
                  {/* Left accent vertical indicator bar - spans full height */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
                    report.riskLevel === 'high' ? 'bg-destructive/80 group-hover:bg-destructive' : 'bg-primary/30 group-hover:bg-primary'
                  )} />

                  {/* Card Header Panel */}
                  <div className="px-6 py-4 border-b border-border/60 flex justify-between items-center gap-4 select-none">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full animate-pulse",
                        report.riskLevel === 'high' ? 'bg-destructive' : 'bg-primary'
                      )} />
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider font-mono">
                        Report ID: {report.id.substring(0, 10).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 border text-[10px] font-semibold rounded-full",
                      report.riskLevel === 'high' 
                        ? 'border-destructive/20 bg-destructive/10 text-destructive' 
                        : 'border-primary/20 bg-primary/5 text-primary'
                    )}>
                      {report.riskLevel === 'high' ? 'Critical Risk' : `${report.riskLevel} Risk`}
                    </span>
                  </div>

                  {/* Main Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Title */}
                      <Link href={`/reports/${report.id}`} className="hover:text-primary transition-colors inline-block w-full">
                        <h2 className="text-base font-bold text-foreground capitalize tracking-wide leading-snug line-clamp-1">
                          {report.title}
                        </h2>
                      </Link>

                      {/* Description Snippet */}
                      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 mb-4 whitespace-pre-wrap">
                        {report.description}
                      </p>
                    </div>

                    {/* Clean Horizontal Metadata chips flow (No weird inner box) */}
                    <div className="space-y-5 mt-4">
                      <div className="flex flex-wrap gap-2 text-[10px] font-medium text-muted-foreground/80 select-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/30 border border-border/60 rounded-full shrink-0">
                          <Building className="h-3 w-3 text-primary/70" />
                          <span className="truncate max-w-[120px] text-foreground/80">{report.company || "General"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/30 border border-border/60 rounded-full shrink-0">
                          <Clock className="h-3 w-3 text-primary/70" />
                          <span className="text-foreground/80">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/30 border border-border/60 rounded-full shrink-0">
                          <ShieldAlert className="h-3 w-3 text-primary/70" />
                          <span className="truncate max-w-[120px] text-foreground/80">{report.scamType}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/30 border border-border/60 rounded-full shrink-0">
                          <Eye className="h-3 w-3 text-primary/70" />
                          <span className="text-foreground/80 font-mono">{report.views} Reads</span>
                        </span>
                      </div>

                      {/* Actions Panel inside Card */}
                      <div className="flex items-center justify-between gap-3 border-t border-border pt-4 select-none">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-xl border-border hover:bg-success/10 hover:border-success/30 hover:text-success transition-all"
                            onClick={() => handleHelpfulVote(report.id)}
                            disabled={votedReports.has(report.id)}
                          >
                            <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                            {votedReports.has(report.id) ? "Verified" : "Verify"} ({report.helpfulVotes})
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                            onClick={() => handleFlag(report.id)}
                            disabled={flaggedReportsLocal.has(report.id)}
                          >
                            Flag
                          </Button>
                        </div>

                        <Link href={`/reports/${report.id}`}>
                          <Button 
                            className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            Read dossier
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
