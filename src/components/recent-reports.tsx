"use client";

import Link from "next/link";
import {
  Clock,
  MapPin,
  ThumbsUp,
  Flag,
  TerminalSquare,
  ArrowRight,
  ShieldAlert,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReports } from "@/contexts/reports-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function RecentReports() {
  const { reports, voteHelpful } = useReports();
  const { toast } = useToast();

  // Get the 4 most recent approved reports
  const recentReports = reports
    .filter((report) => report.status === "approved")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const handleHelpfulVote = (reportId: string) => {
    voteHelpful(reportId);
    toast({
      title: "Vote Recorded",
      description: "Thank you for verifying this report.",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const reportDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "< 1H";
    if (diffInHours < 24) return `${diffInHours}H`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}D`;
  };

  return (
    <section className="py-24 bg-background border-y border-border relative overflow-hidden">
      {/* Decorative Grid Background & Ambient Glow */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 text-center sm:text-left gap-6 border-b border-white/[0.06] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] px-3 py-1 rounded-full">
                <ShieldAlert className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                  Community Intelligence
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Recent{" "}
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  Scam Reports
                </span>
              </h2>
            </div>

            <Link href="/reports">
              <div className="flex items-center justify-center gap-2 h-10 px-5 text-xs font-mono font-semibold border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-black rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                <span>View Threat Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReports.length === 0 && (
              <div className="col-span-full border border-white/[0.04] p-12 text-center bg-[#090b11]/40 backdrop-blur-md rounded-2xl relative">
                <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-white/[0.1]" />
                <p className="text-muted-foreground text-sm font-mono">
                  No recent reports found in the feed.
                </p>
              </div>
            )}

            {recentReports.map((report) => {
              const isOsint =
                report.tags?.includes("osint") ||
                report.title.startsWith("OSINT:");
              const dossierId = report.id.substring(0, 8).toUpperCase();

              return (
                <div
                  key={report.id}
                  className={cn(
                    "relative bg-[#090b11]/80 border border-white/[0.04] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ease-out group rounded-2xl hover:border-primary/45 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)] overflow-hidden",
                    isOsint ? "border-primary/20" : "",
                  )}
                >
                  {/* Cyber Corner bracket ticks */}
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />

                  {/* Cyber Grid overlay */}
                  <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none" />

                  <div className="p-6 sm:p-8 flex-1 relative z-10">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      {isOsint ? (
                        <Badge
                          variant="outline"
                          className="rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 border bg-primary/10 text-primary border-primary/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                        >
                          <TerminalSquare className="w-3.5 h-3.5 text-primary animate-pulse" />
                          OSINT Advisory
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 border",
                            report.riskLevel === "high"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : report.riskLevel === "medium"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-secondary/10 text-secondary border-secondary/30",
                          )}
                        >
                          {report.riskLevel === "high" && (
                            <ShieldAlert className="w-3 h-3 mr-1 inline text-red-500 animate-pulse" />
                          )}
                          {report.riskLevel === "high"
                            ? "High Risk"
                            : report.riskLevel === "medium"
                              ? "Medium Risk"
                              : "Low Risk"}
                        </Badge>
                      )}

                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/60">
                        <span className="text-[10px] bg-white/[0.03] px-2 py-0.5 border border-white/[0.05] rounded text-white/50 tracking-wider">
                          DOSSIER_{dossierId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(report.createdAt)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/reports/${report.id}`} className="block mb-4">
                      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="line-clamp-1">
                          {isOsint
                            ? report.title.replace(/^OSINT:\s*/i, "")
                            : report.title}
                        </span>
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed mb-6 border-l-2 border-primary/20 pl-4 font-sans italic">
                      &ldquo;{report.description}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground/80">
                      <div className="flex items-center bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.04]">
                        <MapPin className="h-3 w-3 mr-1.5 text-primary/80" />
                        <span className="truncate max-w-[150px] font-medium text-white/70">
                          {report.location || "Global"}
                        </span>
                      </div>
                      <div className="flex items-center bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.04]">
                        <Flag className="h-3 w-3 mr-1.5 text-primary/80" />
                        <span className="font-medium text-white/70">
                          {report.scamType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between rounded-b-2xl relative z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-mono font-bold text-muted-foreground/80 hover:text-success hover:bg-success/10 transition-colors border border-transparent"
                      onClick={() => handleHelpfulVote(report.id)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-2 text-success/80" />
                      {report.helpfulVotes > 0
                        ? `Verified (${report.helpfulVotes})`
                        : "Verify Report"}
                    </Button>

                    <Link
                      href={`/reports/${report.id}`}
                      className="text-xs font-mono font-bold text-primary hover:text-primary/80 transition-colors flex items-center group/link"
                    >
                      <span>Analyze Threat</span>{" "}
                      <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
