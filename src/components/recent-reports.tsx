import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  ThumbsUp,
  Flag,
  TerminalSquare,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReports } from "@/contexts/reports-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function RecentReports() {
  const { reports, voteHelpful } = useReports();
  const { toast } = useToast();
  const [votedReports, setVotedReports] = useState<Set<string>>(new Set());

  // Get the 4 most recent approved reports
  const recentReports = reports
    .filter((report) => report.status === "approved")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const handleHelpfulVote = (reportId: string) => {
    if (!votedReports.has(reportId)) {
      voteHelpful(reportId);
      setVotedReports((prev: Set<string>) => new Set(prev).add(reportId));
      toast({
        title: "Vote Recorded",
        description: "Thank you for verifying this report.",
      });
    }
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
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.03]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 text-center sm:text-left gap-6 border-b border-border pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Community Feed
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Recent <span className="text-primary">Scam Reports</span>
              </h2>
            </div>
            <Link href="/reports">
              <Button
                variant="outline"
                className="text-xs font-semibold tracking-wide px-6 h-10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all"
              >
                View Threat Directory <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReports.length === 0 && (
              <div className="col-span-full border border-border p-12 text-center bg-card/40 rounded-2xl">
                <p className="text-muted-foreground text-sm">
                  No recent reports found in the feed.
                </p>
              </div>
            )}

            {recentReports.map((report) => {
              const isOsint =
                report.tags?.includes("osint") ||
                report.title.startsWith("OSINT:");
              return (
                <div
                  key={report.id}
                  className={cn(
                    "glass-card flex flex-col justify-between transition-all duration-300 ease-out group relative rounded-2xl hover:-translate-y-1",
                    isOsint
                      ? "border-primary/20 hover:border-primary/40 hover:shadow-primary/10"
                      : "hover:border-primary/25 hover:shadow-primary/5",
                  )}
                >
                  <div className="p-6 sm:p-8 flex-1">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      {isOsint ? (
                        <Badge
                          variant="outline"
                          className="rounded-full text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 border cursor-default bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(249,115,22,0.15)] flex items-center gap-1.5"
                        >
                          <TerminalSquare className="w-3.5 h-3.5 text-primary animate-pulse" />
                          OSINT Advisory
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 border cursor-default",
                            report.riskLevel === "high"
                              ? "bg-red-500/10 text-red-500 border-red-500/30"
                              : report.riskLevel === "medium"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-secondary/10 text-secondary border-secondary/30",
                          )}
                        >
                          {report.riskLevel === "high" && (
                            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 inline text-red-500" />
                          )}
                          {report.riskLevel === "high"
                            ? "High Risk"
                            : report.riskLevel === "medium"
                              ? "Medium Risk"
                              : "Low Risk"}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5 tracking-wider">
                        <Clock className="h-3.5 w-3.5" />
                        {getTimeAgo(report.createdAt)} ago
                      </span>
                    </div>

                    <Link href={`/reports/${report.id}`} className="block mb-4">
                      <h3 className="text-lg font-bold text-foreground line-clamp-2 tracking-tight group-hover:text-primary transition-colors">
                        {isOsint
                          ? report.title.replace(/^OSINT:\s*/i, "")
                          : report.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed mb-6 border-l-2 border-primary/20 pl-4">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center bg-muted/40 px-3 py-1 rounded-full border border-border">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="truncate max-w-[150px] font-medium">
                          {report.location || "Global"}
                        </span>
                      </div>
                      <div className="flex items-center bg-muted/40 px-3 py-1 rounded-full border border-border">
                        <Flag className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="font-medium">{report.scamType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-border bg-card/20 flex items-center justify-between rounded-b-2xl">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 rounded-xl text-xs font-bold transition-colors border border-transparent",
                        votedReports.has(report.id)
                          ? "text-success bg-success/10 hover:text-success"
                          : "text-muted-foreground hover:text-success hover:bg-success/15",
                      )}
                      onClick={() => handleHelpfulVote(report.id)}
                      disabled={votedReports.has(report.id)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-2" />
                      {votedReports.has(report.id)
                        ? `Verified (${report.helpfulVotes})`
                        : report.helpfulVotes > 0
                          ? `Verify (${report.helpfulVotes})`
                          : "Verify Report"}
                    </Button>

                    <Link
                      href={`/reports/${report.id}`}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center group/link"
                    >
                      Read Report{" "}
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
