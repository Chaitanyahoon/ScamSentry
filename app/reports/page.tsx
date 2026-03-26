"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      toast("Vote recorded", { description: "Thank you for verifying this report." })
    } else {
      toast.error("Already voted", { description: "You have already verified this report." })
    }
  }

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId)
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId))
      toast("Report flagged", { description: "This report has been marked for moderator review." })
    } else {
      toast.error("Already flagged", { description: "You have already flagged this report." })
    }
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Community Threat Database
            </h1>
            <p className="text-base text-muted-foreground">
              Search and filter freelancer-verified scam reports and malicious organizations.
            </p>
          </div>

          {/* Search, Filters, and Tabs */}
          <div className="mb-10 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by company, location, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-card border-border text-foreground"
                />
              </div>
              <div className="flex gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[160px] h-12 bg-card border-border text-foreground">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Fake Job Offer">Fake Job Offer</SelectItem>
                    <SelectItem value="Unpaid Work">Unpaid Work</SelectItem>
                    <SelectItem value="Portfolio Theft">Portfolio Theft</SelectItem>
                    <SelectItem value="Ghost Client">Ghost Client</SelectItem>
                    <SelectItem value="Upfront Payment Scam">Upfront Payment</SelectItem>
                    <SelectItem value="Identity Theft">Identity Theft</SelectItem>
                    <SelectItem value="Phishing Attempt">Phishing Attempt</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[160px] h-12 bg-card border-border text-foreground">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                    <SelectItem value="Content Writing">Content Writing</SelectItem>
                    <SelectItem value="Data Entry">Data Entry</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Virtual Assistant">Virtual Assistant</SelectItem>
                    <SelectItem value="Software Development">Software Development</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-12 bg-card border-border text-foreground">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                    <SelectItem value="trust">Highest Trust</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full sm:w-auto bg-card border border-border p-1 h-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors">
                  All Reports ({approvedReports.length})
                </TabsTrigger>
                <TabsTrigger value="high-risk" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive transition-colors">
                  High Risk ({approvedReports.filter((r) => r.riskLevel === "high").length})
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary transition-colors">
                  Past 24h ({approvedReports.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {sortedReports.map((report) => (
              <div key={report.id} className="bg-card border border-border p-6 flex flex-col sm:flex-row gap-6 hover:border-primary/50 transition-colors">
                
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Link href={`/reports/${report.id}`} className="hover:text-primary transition-colors block truncate">
                      <h2 className="text-lg font-semibold text-foreground truncate">{report.title}</h2>
                    </Link>
                    {report.riskLevel === 'high' && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        High Risk
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {report.description}
                  </p>

                  {/* Meta layout */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {report.company} ({report.location})
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 bg-background border border-border rounded-sm">{report.scamType}</span>
                    </div>
                  </div>
                </div>

                {/* Actions sidebar */}
                <div className="sm:w-40 flex sm:flex-col justify-end sm:justify-between items-center sm:items-end gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center sm:justify-start text-xs font-medium text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
                    onClick={() => handleHelpfulVote(report.id)}
                    disabled={votedReports.has(report.id)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-2" />
                    {report.helpfulVotes > 0 ? `${report.helpfulVotes} Helpful` : "Helpful"}
                  </Button>
                  
                  <div className="flex gap-2 w-full">
                     <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleFlag(report.id)}
                      disabled={flaggedReportsLocal.has(report.id)}
                      title="Flag for review"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/reports/${report.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-medium border-border hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-colors px-2">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {sortedReports.length === 0 && (
              <div className="border border-border p-12 text-center bg-card">
                <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-1">No reports found</h3>
                <p className="text-sm text-muted-foreground">Adjust your filters or search terms to find what you're looking for.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedType("all")
                    setSelectedIndustry("all")
                    setSortBy("recent")
                  }}
                  className="mt-6"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
