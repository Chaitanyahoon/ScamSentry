import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CheckSquare,
  ShieldOff,
  Cpu,
  Database,
  Fingerprint,
  Globe,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface LayerData {
  score: number;
  flags?: string[];
}

interface ForensicReportProps {
  url?: string;
  report: {
    layer1_Heuristics?: LayerData;
    layer2_Forensics?: LayerData;
    layer3_ThreatIntel?: LayerData;
    layer4_InternalGraph?: LayerData;
  };
  finalScore: number;
  riskLevel: string;
}

export function ForensicReport({ url, report, finalScore, riskLevel }: ForensicReportProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("L1");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (voteType: "safe" | "unsafe") => {
    if (!url) {
      toast({
        title: "Voting Failed",
        description: "No URL found to vote on.",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      const res = await fetch("/api/validator/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, vote: voteType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit vote");

      toast({
        title: voteType === "safe" ? "Verified Safe" : "Flagged Unsafe",
        description: data.message || `Your vote has been successfully registered.`,
      });
      setHasVoted(true);
    } catch (err: any) {
      toast({
        title: "Vote Submission Error",
        description: err.message || "Failed to submit vote.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  // Animate the score counting up on load
  useEffect(() => {
    setAnimatedScore(0);
    if (finalScore === 0) return;

    const duration = 800; // ms
    const increment = Math.max(1, Math.ceil(finalScore / 25));
    const step = duration / (finalScore / increment);

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= finalScore) {
        setAnimatedScore(finalScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, step);

    return () => clearInterval(timer);
  }, [finalScore]);

  // Score categorisation helper
  const isHighRisk = finalScore <= 30;
  const isSuspicious = finalScore > 30 && finalScore <= 70;

  const statusColorClass = isHighRisk
    ? "text-destructive"
    : isSuspicious
      ? "text-warning"
      : "text-success";

  const statusBgClass = isHighRisk
    ? "bg-destructive/5 border-destructive/20"
    : isSuspicious
      ? "bg-warning/5 border-warning/20"
      : "bg-success/5 border-success/20";

  // Generate conversational summaries
  const getVerdictSummary = () => {
    if (isHighRisk) {
      return "CRITICAL THREAT: This URL triggers severe anomalies across multiple security databases. We strongly advise against visiting or interacting with this address.";
    }
    if (isSuspicious) {
      return "WARNING: Suspicious heuristic traits or registrar registrations were flagged. Proceed with caution and check the specific details below before clicking.";
    }
    return "SECURE: No anomalous markers or high-risk heuristics were detected. This address appears to be safe based on current telemetry analysis.";
  };

  // Layers mapping
  const layers = [
    {
      id: "L1",
      title: "Heuristics",
      icon: <Cpu className="h-4 w-4" />,
      data: report.layer1_Heuristics,
    },
    {
      id: "L2",
      title: "DNS Forensics",
      icon: <Globe className="h-4 w-4" />,
      data: report.layer2_Forensics,
    },
    {
      id: "L3",
      title: "Threat Intel",
      icon: <ShieldOff className="h-4 w-4" />,
      data: report.layer3_ThreatIntel,
    },
    {
      id: "L4",
      title: "Graph Ledger",
      icon: <Database className="h-4 w-4" />,
      data: report.layer4_InternalGraph,
    },
  ];

  const currentLayer = layers.find((l) => l.id === activeTab);

  // SVG Radial Gauge Calculation
  // SVG Radial Gauge Calculation
  const radius = 52;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-foreground">
      {/* 1. Verdict Summary Hero Card */}
      <div className="border border-border bg-card/60 backdrop-blur-sm relative overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 rounded-2xl shadow-lg">
        {/* Circular Progress Gauge */}
        <div className="relative shrink-0 flex items-center justify-center select-none">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Trail */}
            <circle
              stroke="rgba(255, 255, 255, 0.05)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Value Arc */}
            <circle
              className="transition-all duration-300 ease-out"
              stroke={
                isHighRisk
                  ? "hsl(var(--destructive))"
                  : isSuspicious
                    ? "hsl(var(--warning))"
                    : "hsl(var(--success))"
              }
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          {/* Central Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black tracking-tight text-foreground">
              {animatedScore}%
            </span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">
              Safety Score
            </span>
          </div>
        </div>

        {/* Diagnostic Verdict Details */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 select-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-xs text-primary font-semibold rounded-full border border-primary/15">
              <Fingerprint className="h-3.5 w-3.5 animate-pulse" />
              <span>Scan Verdict</span>
            </div>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${statusBgClass} ${statusColorClass}`}
            >
              {riskLevel}
            </span>
          </div>

          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {isHighRisk
              ? "Threat Detected"
              : isSuspicious
                ? "Suspicious Activity Flagged"
                : "Verified Safe Link"}
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4 py-0.5">
            {getVerdictSummary()}
          </p>

          {/* Community Review Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3 border-t border-border/40 select-none">
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              Community Review:
            </span>
            <button
              onClick={() => handleVote("safe")}
              disabled={voting || hasVoted}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none
                ${
                  hasVoted
                    ? "bg-muted border-border text-muted-foreground"
                    : "bg-success/10 border-success/30 text-success hover:bg-success/20"
                }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verify Safe
            </button>
            <button
              onClick={() => handleVote("unsafe")}
              disabled={voting || hasVoted}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none
                ${
                  hasVoted
                    ? "bg-muted border-border text-muted-foreground"
                    : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
                }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Flag Unsafe
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Tabbed Detail Sections */}
      <div className="border border-border bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg">
        {/* Navigation Tabs Bar */}
        <div className="bg-muted/30 border-b border-border flex flex-wrap select-none p-1 gap-1">
          {layers.map((layer) => {
            const hasAnomalies = layer.data ? layer.data.score > 0 : false;
            const scoreVal = layer.data ? layer.data.score : 0;
            const tabClass =
              activeTab === layer.id
                ? "bg-card text-primary border border-border shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent";

            return (
              <button
                key={layer.id}
                onClick={() => setActiveTab(layer.id)}
                className={`px-4 py-2.5 text-xs font-semibold tracking-wider flex items-center gap-2 rounded-xl transition-all cursor-pointer ${tabClass}`}
              >
                {layer.icon}
                <span>{layer.title}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 ml-1 rounded-full border ${hasAnomalies ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-success/20 bg-success/10 text-success"}`}
                >
                  {hasAnomalies ? `-${scoreVal} PTS` : "Clean"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content */}
        <div className="p-6 min-h-[220px] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Layer Meta Info Header */}
            <div className="flex justify-between items-center pb-3 border-b border-border select-none">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">
                Telemetry diagnostic signals
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Score Contribution: -{currentLayer?.data ? currentLayer.data.score : 0} PTS
              </span>
            </div>

            {/* List of Flags/Anomalies */}
            <div className="space-y-3">
              {currentLayer && currentLayer.data?.flags && currentLayer.data.flags.length > 0 ? (
                currentLayer.data.flags.map((flag: string, index: number) => {
                  const cleanFlag = flag
                    .replace("⚠️ ", "")
                    .replace("CRITICAL: ", "");
                  const isCritical =
                    flag.includes("CRITICAL") || flag.includes("⚠️");

                  return (
                    <div
                      key={index}
                      className={`flex gap-3 text-sm p-4 border rounded-xl items-start leading-relaxed
                      ${
                        isCritical
                          ? "border-destructive/20 bg-destructive/5 text-destructive font-semibold"
                          : "border-warning/20 bg-warning/5 text-warning/90"
                      }`}
                    >
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-bold block">
                          {isCritical
                            ? "Critical Threat Signal"
                            : "Warning Indicator"}
                        </span>
                        <span className="font-mono text-xs">{cleanFlag}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex gap-3 text-sm text-muted-foreground/80 p-5 border border-border bg-card/20 rounded-xl items-center">
                  <CheckSquare className="h-5 w-5 shrink-0 text-success" />
                  <span>
                    No security anomalies flagged inside this validation layer.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tab Guide Footer */}
          <div className="mt-6 flex justify-end select-none border-t border-border pt-4">
            <button
              onClick={() => {
                const currentIndex = layers.findIndex(
                  (l) => l.id === activeTab,
                );
                const nextIndex = (currentIndex + 1) % layers.length;
                setActiveTab(layers[nextIndex].id);
              }}
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors text-xs font-semibold cursor-pointer text-muted-foreground/75"
            >
              <span>Inspect Next Layer</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
