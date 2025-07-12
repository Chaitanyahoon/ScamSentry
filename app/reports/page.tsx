"use client"

import { useState } from "react"
import { Search, Filter, Clock, MapPin, ThumbsUp, Flag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReports } from "@/contexts/reports-context"
import { toast } from "sonner"
import Link from "next/link" // Import Link for navigation

export default function ReportsPage() {
  const { reports, voteHelpful, flagReport, incrementViews } = useReports()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("all")

  // Client-side state to track if a user has voted/flagged a report in the current session
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // Sort by recent by default
    }
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleHelpfulVote = (reportId: string) => {
    if (!votedReports.has(reportId)) {
      voteHelpful(reportId)
      setVotedReports((prev) => new Set(prev).add(reportId))
      toast({
        title: "Vote Recorded",
        description: "Thank you for helping the community!",
      })
    } else {
      toast({
        title: "Already Voted",
        description: "You have already marked this report as helpful.",
        variant: "info",
      })
    }
  }

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId)
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId))
      toast({
        title: "Report Flagged",
        description: "Thank you for helping maintain quality. This report will be reviewed.",
      })
    } else {
      toast({
        title: "Already Flagged",
        description: "You have already flagged this report.",
        variant: "info",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Scam Reports
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Browse and search through community-reported scams
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by company, location, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Scam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Fake Job Offer">Fake Job Offer</SelectItem>
                      <SelectItem value="Unpaid Work">Unpaid Work</SelectItem>
                      <SelectItem value="Portfolio Theft">Portfolio Theft</SelectItem>
                      <SelectItem value="Ghost Client">Ghost Client</SelectItem>
                      <SelectItem value="Upfront Payment Scam">Upfront Payment Scam</SelectItem>
                      <SelectItem value="Fake Training/Certification">Fake Training</SelectItem>
                      <SelectItem value="Identity Theft">Identity Theft</SelectItem>
                      <SelectItem value="Phishing Attempt">Phishing Attempt</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="Content Writing">Content Writing</SelectItem>
                      <SelectItem value="Data Entry">Data Entry</SelectItem>
                      <SelectItem value="Virtual Assistant">Virtual Assistant</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Video Editing">Video Editing</SelectItem>
                      <SelectItem value="Translation">Translation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                      <SelectItem value="trust">Highest Trust Score</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
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
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Reports ({approvedReports.length})</TabsTrigger>
              <TabsTrigger value="high-risk">
                High Risk ({approvedReports.filter((r) => r.riskLevel === "high").length})
              </TabsTrigger>
              <TabsTrigger value="recent">
                Recent (
                {
                  approvedReports.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000)
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-6">
                {sortedReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/reports/${report.id}`} className="hover:underline">
                            <CardTitle className="text-xl mb-2 cursor-pointer">{report.title}</CardTitle>
                          </Link>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {report.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {report.timeAgo}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {report.views} views
                            </div>
                            <Badge variant="outline">Trust Score: {report.trustScore}%</Badge>
                          </div>
                        </div>
                        <Badge variant={getRiskColor(report.riskLevel)}>{report.riskLevel} risk</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{report.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{report.scamType}</Badge>
                        <Badge variant="outline">{report.industry}</Badge>
                        {report.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {report.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{report.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleHelpfulVote(report.id)}
                            disabled={votedReports.has(report.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {report.helpfulVotes} helpful
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleFlag(report.id)}
                            disabled={flaggedReportsLocal.has(report.id)}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reports/${report.id}`}>Read Full Report</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {sortedReports.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reports found</h3>
                      <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
