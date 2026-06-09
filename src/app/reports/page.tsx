"use client";

import { useState } from "react";
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

  const handleHelpfulVote = (reportId: string) => {
    if (!votedReports.has(reportId)) {
      voteHelpful(reportId);
      setVotedReports((prev) => new Set(prev).add(reportId));
      toast({
        title: "TELEMETRY LOGGED",
        description: "Peer verification added to the consensus matrix.",
      });
    } else {
      toast({
        title: "DUPLICATE ENTRY",
        description: "You have already verified this node.",
        variant: "destructive",
      });
    }
  };

  const handleFlag = (reportId: string) => {
    if (!flaggedReportsLocal.has(reportId)) {
      flagReport(reportId);
      setFlaggedReportsLocal((prev) => new Set(prev).add(reportId));
      toast({
        title: "NODE FLAGGED",
        description: "Alert dispatched to moderator protocols.",
      });
    } else {
      toast({
        title: "DUPLICATE ENTRY",
        description: "Node already flagged for review.",
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
    <div className="min-h-screen bg-[#070605] py-16 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-cyber opacity-[0.25]" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-destructive/[0.02] rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1300px]">
        <div className="mx-auto">
          {/* Header section with HUD frame */}
          <div className="mb-10 relative bg-card/65 border border-white/5 p-8 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-20 pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary rounded-full">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Verified Threat Database
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-3">
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
                  <Button className="w-full lg:w-auto h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 shadow-lg shadow-primary/15 transition-all">
                    <Cpu className="h-4 w-4 mr-2" /> Report a Scam
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Overwatch Live Stats Panel */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
            {/* Active Reports */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-primary/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.55)] group-hover:shadow-[0_0_18px_rgba(249,115,22,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <Database className="h-4 w-4 text-primary animate-pulse" />
                  Active Reports
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight font-mono mb-2">
                  {totalVerifiedDossiers.toString().padStart(3, "0")}
                </div>
                <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                  Verified Telemetry
                </div>
              </div>
            </div>

            {/* Critical Threats */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-destructive/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-destructive/20 group-hover:border-destructive/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-destructive/20 group-hover:border-destructive/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-destructive rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.55)] group-hover:shadow-[0_0_18px_rgba(239,68,68,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                  Critical Threats
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-destructive to-red-400 tracking-tight font-mono mb-2">
                  {criticalThreatsCount.toString().padStart(3, "0")}
                </div>
                <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                  Immediate Containment
                </div>
              </div>
            </div>

            {/* Consensus Index */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-emerald-500/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500/20 group-hover:border-emerald-500/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500/20 group-hover:border-emerald-500/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.55)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <Network className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Consensus Index
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight font-mono mb-2">
                  {averageTrust}%
                </div>
                <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                  Attestation Confidence
                </div>
              </div>
            </div>

            {/* Peer Verifications */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-primary/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.55)] group-hover:shadow-[0_0_18px_rgba(249,115,22,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <div className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  Peer Verifications
                </div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight font-mono mb-2">
                  {totalVerifications.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-mono">
                  Attestation Votes
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filters, and Tabs Console */}
          <div className="mb-8 space-y-5 bg-card/25 border border-white/5 p-6 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Query Scanner Input */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/45 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by target domain, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-background/50 border-white/5 text-foreground text-sm rounded-xl focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              {/* Selector Matrix */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[220px] h-12 bg-background/50 border-white/5 text-foreground text-xs rounded-xl focus:ring-1 focus:ring-primary/25 transition-colors">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground/50 shrink-0" />
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
                  <SelectTrigger className="w-full sm:w-[220px] h-12 bg-background/50 border-white/5 text-foreground text-xs rounded-xl focus:ring-1 focus:ring-primary/25 transition-colors">
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
            <div className="flex flex-wrap border-b border-white/5 gap-2 pb-px select-none">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Global Stream ({approvedReports.length})
              </button>
              <button
                onClick={() => setActiveTab("high-risk")}
                className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
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
                className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedReports.map((report) => (
                <div
                  key={report.id}
                  className="group flex flex-col bg-gradient-to-br from-[#0b0f19]/90 to-[#05070c]/95 border border-white/[0.04] hover:border-primary/35 hover:shadow-[0_0_35px_rgba(249,115,22,0.05)] hover:-translate-y-1 transition-all duration-500 relative rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
                >
                  {/* Sweep gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.005] to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  {/* Cyber grid pattern inside card */}
                  <div className="absolute inset-0 bg-grid-cyber opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none" />

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/5 group-hover:border-primary/30 transition-colors duration-300" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/5 group-hover:border-primary/30 transition-colors duration-300" />

                  {/* Left accent vertical indicator bar - spans full height */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 transition-all duration-500",
                      report.riskLevel === "high"
                        ? "bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.55)] group-hover:scale-y-[1.02]"
                        : "bg-primary/50 group-hover:bg-primary shadow-[0_0_12px_rgba(249,115,22,0.35)] group-hover:scale-y-[1.02]",
                    )}
                  />

                  {/* Card Header Panel */}
                  <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01] flex justify-between items-center gap-4 select-none relative z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full animate-pulse",
                          report.riskLevel === "high"
                            ? "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                            : "bg-primary shadow-[0_0_6px_rgba(249,115,22,0.8)]",
                        )}
                      />
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest font-mono">
                        Report ID: {report.id.substring(0, 10).toUpperCase()}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md transition-all duration-300",
                        report.riskLevel === "high"
                          ? "border-destructive/20 bg-destructive/10 text-destructive group-hover:border-destructive/40"
                          : "border-primary/20 bg-primary/5 text-primary group-hover:border-primary/45",
                      )}
                    >
                      {report.riskLevel === "high"
                        ? "Critical Risk"
                        : `${report.riskLevel} Risk`}
                    </span>
                  </div>

                  {/* Main Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
                    <div className="space-y-3">
                      {/* Title */}
                      <Link
                        href={`/reports/${report.id}`}
                        className="hover:text-primary transition-colors inline-block w-full"
                      >
                        <h2 className="text-base font-extrabold text-foreground capitalize tracking-wide leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-300">
                          {report.title}
                        </h2>
                      </Link>

                      {/* Description Snippet */}
                      <p className="text-xs text-muted-foreground/75 leading-relaxed line-clamp-3 mb-4 whitespace-pre-wrap">
                        {report.description}
                      </p>
                    </div>

                    {/* Clean Horizontal Metadata chips flow */}
                    <div className="space-y-5 mt-4">
                      <div className="flex flex-wrap gap-2 text-[10px] font-medium text-muted-foreground/85 select-none font-mono">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090b11] border border-white/[0.04] hover:border-primary/25 rounded-lg shrink-0 transition-all duration-300">
                          <Building className="h-3 w-3 text-primary/70" />
                          <span className="truncate max-w-[120px] text-foreground/80">
                            {report.company || "General"}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090b11] border border-white/[0.04] hover:border-primary/25 rounded-lg shrink-0 transition-all duration-300">
                          <Clock className="h-3 w-3 text-primary/70" />
                          <span className="text-foreground/80">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090b11] border border-white/[0.04] hover:border-primary/25 rounded-lg shrink-0 transition-all duration-300">
                          <ShieldAlert className="h-3 w-3 text-primary/70" />
                          <span className="truncate max-w-[120px] text-foreground/80">
                            {report.scamType}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090b11] border border-white/[0.04] hover:border-primary/25 rounded-lg shrink-0 transition-all duration-300">
                          <Eye className="h-3 w-3 text-primary/70" />
                          <span className="text-foreground/80">
                            {report.views} Reads
                          </span>
                        </span>
                      </div>

                      {/* Actions Panel inside Card */}
                      <div className="flex items-center justify-between gap-3 border-t border-white/[0.04] pt-4 select-none">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-xl border-white/10 bg-[#090b11] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-300"
                            onClick={() => handleHelpfulVote(report.id)}
                            disabled={votedReports.has(report.id)}
                          >
                            <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                            {votedReports.has(report.id)
                              ? "Verified"
                              : "Verify"}{" "}
                            ({report.helpfulVotes})
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/45 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
                            onClick={() => handleFlag(report.id)}
                            disabled={flaggedReportsLocal.has(report.id)}
                          >
                            Flag
                          </Button>
                        </div>

                        <Link href={`/reports/${report.id}`}>
                          <Button className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-primary/25 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all duration-300 shadow-md shadow-primary/5">
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
  );
}
