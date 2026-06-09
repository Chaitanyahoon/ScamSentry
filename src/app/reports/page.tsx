"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  MapPin,
  ThumbsUp,
  Flag,
  ShieldAlert,
  TerminalSquare,
  AlertTriangle,
  Cpu,
  Radio,
  Network,
  Database,
  Eye,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReports } from "@/contexts/reports-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { reports, voteHelpful, flagReport, isLoadingReports } = useReports();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");

  const [votedReports, setVotedReports] = useState<Set<string>>(new Set());
  const [flaggedReportsLocal, setFlaggedReportsLocal] = useState<Set<string>>(
    new Set(),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedIndustry, sortBy, activeTab]);

  const approvedReports = reports.filter(
    (report) => report.status === "approved",
  );

  const latestReportTime =
    approvedReports.length > 0
      ? Math.max(
          ...approvedReports.map((r) => {
            const t = new Date(r.createdAt).getTime();
            return isNaN(t) ? 0 : t;
          }),
        )
      : Date.now();

  const referenceTime = latestReportTime > 0 ? latestReportTime : Date.now();

  const filteredReports = approvedReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || report.scamType === selectedType;
    const matchesIndustry =
      selectedIndustry === "all" || report.industry === selectedIndustry;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "high-risk" && report.riskLevel === "high") ||
      (activeTab === "recent" &&
        new Date(report.createdAt).getTime() >
          referenceTime - 24 * 60 * 60 * 1000);

    return matchesSearch && matchesType && matchesIndustry && matchesTab;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpfulVotes - a.helpfulVotes;
      case "trust":
        return b.trustScore - a.trustScore;
      case "views":
        return b.views - a.views;
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const totalPages = Math.ceil(sortedReports.length / ITEMS_PER_PAGE);
  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleHelpfulVote = (reportId: string) => {
    if (!votedReports.has(reportId)) {
      voteHelpful(reportId);
      setVotedReports((prev) => new Set(prev).add(reportId));
      toast({
        title: "Vote Recorded",
        description: "Thank you for verifying this report.",
      });
    } else {
      toast({
        title: "Already Verified",
        description: "You have already verified this report.",
        variant: "destructive",
      });
    }
  };

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId);
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId));
      toast({
        title: "Report Flagged",
        description:
          "Thank you. This report has been flagged for moderator review.",
      });
    } else {
      toast({
        title: "Already Flagged",
        description: "This report is already flagged for review.",
        variant: "destructive",
      });
    }
  };

  // Calculate high-tech metrics
  const totalVerifiedDossiers = approvedReports.length;
  const criticalThreatsCount = approvedReports.filter(
    (r) => r.riskLevel === "high",
  ).length;

  // Calculate average trust score
  const averageTrust =
    approvedReports.length > 0
      ? Math.round(
          approvedReports.reduce((acc, curr) => acc + curr.trustScore, 0) /
            approvedReports.length,
        )
      : 100;

  // Calculate total consensus interactions
  const totalVerifications = approvedReports.reduce(
    (acc, curr) => acc + curr.helpfulVotes,
    0,
  );

  return (
    <div className="min-h-screen bg-background py-10 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-cyber opacity-[0.15]" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-destructive/[0.02] rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1300px]">
        <div className="mx-auto">
          {/* Header section with HUD frame */}
          <div className="mb-5 relative bg-card/65 border border-border p-4 sm:p-5 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-20 pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary rounded-full">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Verified Threat Database
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-2">
                  Community{" "}
                  <span className="text-primary gradient-text">Reports</span>
                </h1>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl border-l-2 border-primary/50 pl-4 py-0.5">
                  Scan, analyze, and verify decentralized threat telemetry.
                  Peer-attested evidence modules secured by community consensus
                  mechanisms.
                </p>
              </div>

              {/* Top Level Action */}
              <div className="flex shrink-0">
                <Link href="/report" className="w-full lg:w-auto">
                  <Button className="w-full lg:w-auto h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 shadow-lg shadow-primary/15 transition-all">
                    <Cpu className="h-4 w-4 mr-2" /> Report a Scam
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Overwatch Live Stats Panel */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 select-none">
            {/* Active Reports */}
            <div className="group relative bg-card/90 hover:bg-card/95 border border-border hover:border-primary/45 p-3 sm:p-4 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.55)] group-hover:shadow-[0_0_18px_rgba(249,115,22,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-2 font-mono">
                  <Database className="h-4 w-4 text-primary animate-pulse" />
                  Active Reports
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight font-mono mb-1">
                  {totalVerifiedDossiers.toString().padStart(3, "0")}
                </div>
                <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                  Verified Telemetry
                </div>
              </div>
            </div>

            {/* Critical Threats */}
            <div className="group relative bg-card/90 hover:bg-card/95 border border-border hover:border-destructive/45 p-3 sm:p-4 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-destructive/20 group-hover:border-destructive/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-destructive/20 group-hover:border-destructive/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-destructive rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.55)] group-hover:shadow-[0_0_18px_rgba(239,68,68,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-2 font-mono">
                  <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                  Critical Threats
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-destructive to-red-400 tracking-tight font-mono mb-1">
                  {criticalThreatsCount.toString().padStart(3, "0")}
                </div>
                <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                  Immediate Containment
                </div>
              </div>
            </div>

            {/* Consensus Index */}
            <div className="group relative bg-card/90 hover:bg-card/95 border border-border hover:border-emerald-500/45 p-3 sm:p-4 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500/20 group-hover:border-emerald-500/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500/20 group-hover:border-emerald-500/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.55)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-2 font-mono">
                  <Network className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Consensus Index
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight font-mono mb-1">
                  {averageTrust}%
                </div>
                <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                  Attestation Confidence
                </div>
              </div>
            </div>

            {/* Peer Verifications */}
            <div className="group relative bg-card/90 hover:bg-card/95 border border-border hover:border-primary/45 p-3 sm:p-4 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.55)] group-hover:shadow-[0_0_18px_rgba(249,115,22,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-2 font-mono">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  Peer Verifications
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight font-mono mb-1">
                  {totalVerifications.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                  Attestation Votes
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filters, and Tabs Console */}
          <div className="mb-4 space-y-3 bg-card/25 border border-border p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Query Scanner Input */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/45 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by target domain, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-10 bg-background/50 border-border text-foreground text-sm rounded-xl focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              {/* Selector Matrix */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background/50 border-border text-foreground text-xs rounded-xl focus:ring-1 focus:ring-primary/25 transition-colors">
                    <Filter className="mr-1.5 h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/5 text-foreground rounded-xl">
                    <SelectItem
                      value="all"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      All Threats
                    </SelectItem>
                    <SelectItem
                      value="Fake Job Offer"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Fake Job Offer
                    </SelectItem>
                    <SelectItem
                      value="Unpaid Work"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Unpaid Work
                    </SelectItem>
                    <SelectItem
                      value="Portfolio Theft"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Portfolio Theft
                    </SelectItem>
                    <SelectItem
                      value="Ghost Client"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Ghost Client
                    </SelectItem>
                    <SelectItem
                      value="Upfront Payment Scam"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Upfront Payment
                    </SelectItem>
                    <SelectItem
                      value="Identity Theft"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Identity Theft
                    </SelectItem>
                    <SelectItem
                      value="Phishing Attempt"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Phishing Attempt
                    </SelectItem>
                    <SelectItem
                      value="Cybersecurity Advisory"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Cybersecurity Advisory
                    </SelectItem>
                    <SelectItem
                      value="Other"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Other Vectors
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background/50 border-border text-foreground text-xs rounded-xl focus:ring-1 focus:ring-primary/25 transition-colors">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/5 text-foreground rounded-xl">
                    <SelectItem
                      value="recent"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Most Recent
                    </SelectItem>
                    <SelectItem
                      value="helpful"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Highest Consensus
                    </SelectItem>
                    <SelectItem
                      value="trust"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Trust Score
                    </SelectItem>
                    <SelectItem
                      value="views"
                      className="text-xs focus:bg-primary/20 focus:text-primary"
                    >
                      Most Viewed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Tab selectors */}
            <div className="flex flex-wrap border-b border-border gap-2 pb-px select-none">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Global Stream ({approvedReports.length})
              </button>
              <button
                onClick={() => setActiveTab("high-risk")}
                className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "high-risk"
                    ? "border-destructive text-destructive"
                    : "border-transparent text-muted-foreground hover:text-destructive"
                }`}
              >
                Critical Threats (
                {approvedReports.filter((r) => r.riskLevel === "high").length})
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "recent"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Past 24 Hours (
                {
                  approvedReports.filter(
                    (r) =>
                      new Date(r.createdAt).getTime() >
                      referenceTime - 24 * 60 * 60 * 1000,
                  ).length
                }
                )
              </button>
            </div>
          </div>

          {/* Dossiers Grid / Loading / Empty Fallbacks */}
          {isLoadingReports ? (
            <div className="py-24 text-center border border-white/5 bg-card/10 rounded-2xl shadow-lg">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono">
                Accessing decentralized intelligence registry...
              </p>
            </div>
          ) : sortedReports.length === 0 ? (
            <div className="border border-white/5 p-16 text-center bg-card/45 rounded-2xl backdrop-blur-md shadow-lg">
              <ShieldAlert className="h-12 w-12 text-muted-foreground/35 mx-auto mb-4 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
                No telemetry found
              </h3>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The current query yielded zero matching logs. Adjust query
                search inputs or category filter options.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedIndustry("all");
                  setSortBy("recent");
                }}
                className="mt-6 rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold px-8 transition-all"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Column Headers */}
              <div className="hidden md:flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider font-mono border-b border-border select-none">
                <div className="flex-1 pr-4">Threat Details</div>
                <div className="w-36 shrink-0">Target Company</div>
                <div className="w-40 shrink-0">Scam Classification</div>
                <div className="w-28 shrink-0">Reported Date</div>
                <div className="w-48 shrink-0 text-right pr-4">Actions</div>
              </div>

              {/* Rows List */}
              <div className="space-y-2">
                {paginatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between bg-card/60 border border-border hover:border-primary/30 p-3 sm:px-4 sm:py-3 rounded-xl transition-all duration-300 gap-3 md:gap-4 animate-fade-in"
                  >
                    {/* Left risk indicator dot & title column */}
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0 animate-pulse",
                          report.riskLevel === "high"
                            ? "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                            : "bg-primary shadow-[0_0_6px_rgba(249,115,22,0.8)]",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/reports/${report.id}`}
                          className="hover:text-primary transition-colors inline-block text-sm font-bold text-foreground capitalize truncate max-w-full"
                        >
                          {report.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground/60">
                          <span className="font-mono">
                            ID: {report.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>{report.views} reads</span>
                        </div>
                      </div>
                    </div>

                    {/* Company / Entity Column */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 md:w-36 shrink-0">
                      <Building className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      <span className="truncate font-medium text-foreground/80">
                        {report.company || "General"}
                      </span>
                    </div>

                    {/* Scam Type / Vector Column */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 md:w-40 shrink-0">
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <span className="truncate">{report.scamType}</span>
                    </div>

                    {/* Date Column */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 md:w-28 shrink-0">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-border shrink-0 select-none md:w-48">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-semibold rounded-lg border-border bg-background hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 px-2.5 transition-all duration-300"
                          onClick={() => handleHelpfulVote(report.id)}
                          disabled={votedReports.has(report.id)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {votedReports.has(report.id)
                            ? "Verified"
                            : `Verify (${report.helpfulVotes})`}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] font-semibold text-muted-foreground/45 hover:text-destructive hover:bg-destructive/10 rounded-lg px-2 transition-all duration-300"
                          onClick={() => handleFlag(report.id)}
                          disabled={flaggedReportsLocal.has(report.id)}
                        >
                          Flag
                        </Button>
                      </div>

                      <Link href={`/reports/${report.id}`}>
                        <Button className="h-7 text-[10px] font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 px-3 shadow-sm">
                          Read Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4 mt-6 select-none">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="h-9 px-4 rounded-xl border-border bg-background text-xs font-semibold hover:bg-muted text-muted-foreground disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="h-9 px-4 rounded-xl border-border bg-background text-xs font-semibold hover:bg-muted text-muted-foreground disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
