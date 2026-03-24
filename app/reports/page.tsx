"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, Eye, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReports } from "@/contexts/reports-context"
import { toast } from "sonner"
import Link from "next/link"

export default function ReportsPage() {
  const { reports, voteHelpful, flagReport, incrementViews } = useReports()
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

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive drop-shadow-[0_0_5px_hsla(var(--destructive),0.5)]"
      case "medium":
        return "bg-warning/20 text-warning border-warning drop-shadow-[0_0_5px_hsla(var(--warning),0.5)]"
      case "low":
        return "bg-secondary/20 text-secondary border-secondary drop-shadow-[0_0_5px_hsla(var(--secondary),0.5)]"
      default:
        return "bg-card text-foreground border-border"
    }
  }

  const handleHelpfulVote = (reportId: string) => {
    if (!votedReports.has(reportId)) {
      voteHelpful(reportId)
      setVotedReports((prev) => new Set(prev).add(reportId))
      toast("SYSTEM: VOTE_RECORDED", { description: "Community database updated." })
    } else {
      toast("SYSTEM: ERROR", { description: "Node has already verified this instance." })
    }
  }

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId)
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId))
      toast("SYSTEM: FLAG_SET", { description: "Node marked for moderator review." })
    } else {
      toast("SYSTEM: ERROR", { description: "Node is already flagged." })
    }
  }

  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]"></div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="mb-6 inline-flex p-4 border border-secondary/50 bg-secondary/10 text-secondary shadow-[0_0_15px_hsla(var(--secondary),0.3)]">
              <Database className="h-8 w-8 drop-shadow-[0_0_8px_hsla(var(--secondary),1)]" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-widest text-foreground uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              THREAT <span className="text-secondary drop-shadow-[0_0_10px_hsla(var(--secondary),0.5)]">DATABASE</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-mono uppercase tracking-widest">
              QUERY FULL SYSTEM REPORTS OF ACTIVE MALICIOUS NODES.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card mb-10 overflow-hidden shadow-[0_0_20px_hsla(var(--border),0.5)] rounded-none">
            <div className="bg-card/80 border-b border-border p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase font-mono">
                <Search className="h-4 w-4 text-primary" /> DATABASE_QUERY_FILTERS
              </div>
            </div>
            <div className="p-6 bg-background/50 space-y-4 font-mono">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary drop-shadow-[0_0_5px_currentColor]" />
                <Input
                  placeholder="QUERY BY COMPANY ID, GEO-LOCATION, OR VECTOR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-card/50 border-border text-foreground tracking-widest rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50 border-2"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12 bg-card/50 border-border rounded-none tracking-widest uppercase text-foreground focus:ring-primary">
                    <Filter className="mr-2 h-4 w-4 text-primary" />
                    <SelectValue placeholder="VECTOR_TYPE" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-none text-foreground font-mono uppercase tracking-widest">
                    <SelectItem value="all">ALL_VECTORS</SelectItem>
                    <SelectItem value="Fake Job Offer">FAKE_JOB_OFFER</SelectItem>
                    <SelectItem value="Unpaid Work">UNPAID_WORK</SelectItem>
                    <SelectItem value="Portfolio Theft">PORTFOLIO_THEFT</SelectItem>
                    <SelectItem value="Ghost Client">GHOST_CLIENT</SelectItem>
                    <SelectItem value="Upfront Payment Scam">UPFRONT_PAYMENT</SelectItem>
                    <SelectItem value="Fake Training/Certification">FAKE_TRAINING</SelectItem>
                    <SelectItem value="Identity Theft">IDENTITY_THEFT</SelectItem>
                    <SelectItem value="Phishing Attempt">PHISHING_ATTEMPT</SelectItem>
                    <SelectItem value="Other">OTHER_VECTOR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="h-12 bg-card/50 border-border rounded-none tracking-widest uppercase text-foreground focus:ring-primary">
                    <SelectValue placeholder="INDUSTRY_SECTOR" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-none text-foreground font-mono uppercase tracking-widest">
                    <SelectItem value="all">ALL_SECTORS</SelectItem>
                    <SelectItem value="Web Development">WEB_DEV</SelectItem>
                    <SelectItem value="Graphic Design">GRAPHIC_DESIGN</SelectItem>
                    <SelectItem value="Digital Marketing">MARKETING</SelectItem>
                    <SelectItem value="Content Writing">CONTENT</SelectItem>
                    <SelectItem value="Data Entry">DATA_ENTRY</SelectItem>
                    <SelectItem value="Virtual Assistant">VIRTUAL_ASSISTANT</SelectItem>
                    <SelectItem value="Photography">PHOTOGRAPHY</SelectItem>
                    <SelectItem value="Video Editing">VIDEO_EDITING</SelectItem>
                    <SelectItem value="Translation">TRANSLATION</SelectItem>
                    <SelectItem value="Other">OTHER</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 bg-card/50 border-border rounded-none tracking-widest uppercase text-foreground focus:ring-primary">
                    <SelectValue placeholder="SORT_INDEX" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-none text-foreground font-mono uppercase tracking-widest">
                    <SelectItem value="recent">SORT_BY_TIME</SelectItem>
                    <SelectItem value="helpful">SORT_BY_VERIFICATION</SelectItem>
                    <SelectItem value="trust">SORT_BY_TRUST</SelectItem>
                    <SelectItem value="views">SORT_BY_VIEWS</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedType("all")
                    setSelectedIndustry("all")
                    setSortBy("recent")
                  }}
                  className="h-12 border-destructive text-destructive hover:bg-destructive hover:text-white rounded-none tracking-widest uppercase font-bold transition-all drop-shadow-[0_0_5px_hsla(var(--destructive),0.5)]"
                >
                  PURGE_FILTERS
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10 w-full group">
            <TabsList className="w-full bg-card/50 border border-border rounded-none flex p-1 h-auto mb-6 relative">
              <TabsTrigger value="all" className="flex-1 py-4 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary data-[state=active]:border-secondary data-[state=active]:shadow-[0_0_10px_hsla(var(--secondary),0.5)] border border-transparent rounded-none uppercase font-mono tracking-widest text-muted-foreground transition-all">
                ALL_NODES ({approvedReports.length})
              </TabsTrigger>
              <TabsTrigger value="high-risk" className="flex-1 py-4 data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive data-[state=active]:border-destructive data-[state=active]:shadow-[0_0_10px_hsla(var(--destructive),0.5)] border border-transparent rounded-none uppercase font-mono tracking-widest text-muted-foreground transition-all">
                CRITICAL_THREATS ({approvedReports.filter((r) => r.riskLevel === "high").length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 py-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:shadow-[0_0_10px_hsla(var(--primary),0.5)] border border-transparent rounded-none uppercase font-mono tracking-widest text-muted-foreground transition-all">
                RECENT_PINGS ({approvedReports.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-6">
                {sortedReports.map((report) => (
                  <div key={report.id} className="glass-card flex flex-col justify-between group overflow-hidden">
                    <div className="p-6 border-b border-border/50 bg-card/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <Link href={`/reports/${report.id}`} className="hover:text-primary transition-colors block">
                          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] mb-3">{report.title}</h2>
                        </Link>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                          <div className="flex items-center px-2 py-1 bg-card border border-border">
                            <MapPin className="h-3 w-3 mr-2 text-secondary" />
                            {report.location}
                          </div>
                          <div className="flex items-center px-2 py-1 bg-card border border-border">
                            <Clock className="h-3 w-3 mr-2 text-primary" />
                            {report.timeAgo}
                          </div>
                          <div className="flex items-center px-2 py-1 bg-card border border-border">
                            <Eye className="h-3 w-3 mr-2 text-accent" />
                            {report.views} PINGS
                          </div>
                          <div className={`px-2 py-1 border font-bold uppercase tracking-widest flex items-center gap-2 ${getRiskColor(report.riskLevel)}`}>
                            {report.riskLevel}_RISK
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-background/50 space-y-6">
                      <p className="text-sm text-foreground line-clamp-3 leading-relaxed font-mono tracking-wide px-4 border-l-2 border-border">
                        {report.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs font-mono font-bold tracking-widest uppercase">
                        <Badge variant="outline" className="rounded-none border-primary/50 text-primary bg-primary/5 shadow-[0_0_5px_hsla(var(--primary),0.2)] px-2 py-1">SCAM_TYPE: {report.scamType}</Badge>
                        <Badge variant="outline" className="rounded-none border-secondary/50 text-secondary bg-secondary/5 shadow-[0_0_5px_hsla(var(--secondary),0.2)] px-2 py-1">SECTOR: {report.industry}</Badge>
                        {report.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="rounded-none bg-card border-border px-2 py-1">
                            #{tag.replace(/\s+/g, '_')}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-bold uppercase tracking-widest text-muted-foreground hover:text-success hover:bg-success/10 text-xs border border-transparent hover:border-success/30 transition-all rounded-none"
                            onClick={() => handleHelpfulVote(report.id)}
                            disabled={votedReports.has(report.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {report.helpfulVotes > 0 ? `${report.helpfulVotes} VERIFICATIONS` : "VERIFY"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs border border-transparent hover:border-destructive/30 transition-all rounded-none"
                            onClick={() => handleFlag(report.id)}
                            disabled={flaggedReportsLocal.has(report.id)}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            FLAG_NODE
                          </Button>
                        </div>
                        <Link href={`/reports/${report.id}`}>
                          <Button variant="outline" size="sm" className="rounded-none font-bold uppercase tracking-widest border-primary text-primary hover:bg-primary hover:text-foreground bg-transparent transition-all drop-shadow-[0_0_5px_hsla(var(--primary),0.3)]">
                            READ_DUMP →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedReports.length === 0 && (
                  <div className="border border-border p-12 text-center bg-card/50 glass-card">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                    <h3 className="text-lg font-bold font-mono tracking-widest uppercase text-foreground mb-2">QUERY_RETURNED_NULL</h3>
                    <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">ATTEMPT TO PURGE FILTERS OR BROADEN SEARCH PARAMETERS.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
