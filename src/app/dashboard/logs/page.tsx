"use client";

import { useEffect, useState, useRef } from "react";
import {
  Activity,
  Terminal,
  Play,
  Pause,
  Trash2,
  Search,
  ShieldCheck,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  timestamp: string;
  source: "ENGINE" | "SCRAPER" | "VALIDATOR" | "DNS";
  type: "INFO" | "WARN" | "CRITICAL" | "SUCCESS";
  message: string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "1",
    timestamp: "18:12:05",
    source: "ENGINE",
    type: "INFO",
    message:
      "ScamSentry Sentinel core initialized. 4 active layers functional.",
  },
  {
    id: "2",
    timestamp: "18:12:06",
    source: "DNS",
    type: "SUCCESS",
    message:
      "SPF resolver operational. DNS txt records mapped to promise handlers.",
  },
  {
    id: "3",
    timestamp: "18:12:07",
    source: "SCRAPER",
    type: "INFO",
    message:
      "Cron scheduling verified. GitHub Actions hourly sync trigger active.",
  },
  {
    id: "4",
    timestamp: "18:12:10",
    source: "VALIDATOR",
    type: "INFO",
    message: "Checking threat domain blocklists (total hashes loaded: 42,891).",
  },
  {
    id: "5",
    timestamp: "18:12:15",
    source: "DNS",
    type: "SUCCESS",
    message: "SPF PASS: github.com [v=spf1 include:_spf.github.com ~all]",
  },
  {
    id: "6",
    timestamp: "18:12:18",
    source: "DNS",
    type: "SUCCESS",
    message:
      "DMARC PASS: github.com [v=DMARC1; p=reject; pct=100; rua=mailto:d@github.com]",
  },
  {
    id: "7",
    timestamp: "18:12:22",
    source: "SCRAPER",
    type: "SUCCESS",
    message:
      "Daily cyber bulletin ingest complete. Pinned 2 highlighted incidents.",
  },
];

const LOG_MESSAGES = [
  {
    source: "DNS",
    type: "WARN",
    message:
      "SPF MISMATCH: domain vercel-security-alert.net has no active TXT record configuration.",
  },
  {
    source: "VALIDATOR",
    type: "CRITICAL",
    message:
      "🚨 LOCKDOWN DETECTED: mimicked brand 'GITHUB' detected in domain 'github-login-support.xyz'. Applied +35 risk penalty score.",
  },
  {
    source: "ENGINE",
    type: "INFO",
    message:
      "Analyzing inbound request fingerprint telemetry cache. Deduplication index: 98.4%",
  },
  {
    source: "VALIDATOR",
    type: "WARN",
    message:
      "Burner certificate match found for paytm-refund-dossier.in. Elevated risk index (+20).",
  },
  {
    source: "DNS",
    type: "SUCCESS",
    message:
      "DMARC PASS: vercel.com [v=DMARC1; p=reject; rua=mailto:dmarc@vercel.com]",
  },
  {
    source: "SCRAPER",
    type: "INFO",
    message:
      "Fetching BleepingComputer RSS feeds... Parsed 15 new OSINT packets.",
  },
  {
    source: "ENGINE",
    type: "SUCCESS",
    message:
      "Consensus validation matrix synchronized successfully across global nodes.",
  },
  {
    source: "VALIDATOR",
    type: "CRITICAL",
    message:
      "🚨 LOCKDOWN DETECTED: mimicked brand 'VERCEL' detected in domain 'vercel-deployments.top'. Applied +35 risk penalty score.",
  },
] as const;

export default function ForensicLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "ENGINE" | "SCRAPER" | "VALIDATOR" | "DNS"
  >("all");

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling terminal log container
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Simulated log ticker
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const randomMsg =
        LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: randomMsg.source,
        type: randomMsg.type,
        message: randomMsg.message,
      };

      setLogs((prev) => {
        // Keep last 100 entries to prevent performance degradation
        const sliced = prev.length > 100 ? prev.slice(prev.length - 100) : prev;
        return [...sliced, newLog];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Filters calculations
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === "all" || log.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary animate-pulse" />
            Forensic Telemetry Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time scrolling debugger feed capturing DNS forensics, OSINT
            syncs, and brand lockdowns.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground">
          <Server className="h-4 w-4 text-primary" />
          Logs Buffer Status: Online
        </div>
      </div>

      {/* Terminal Settings & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Play/Pause/Clear controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="outline"
            className={cn(
              "text-xs font-semibold h-9 rounded-xl border border-border bg-card transition-all",
              isPlaying
                ? "text-amber-500 hover:text-amber-400 hover:bg-muted/30"
                : "text-emerald-500 hover:text-emerald-400 hover:bg-muted/30",
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-2" />
                Pause Feed
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-2" />
                Resume Feed
              </>
            )}
          </Button>

          <Button
            onClick={() => setLogs([])}
            variant="outline"
            className="text-xs font-semibold h-9 rounded-xl border border-border bg-card text-red-500 hover:text-red-400 hover:bg-muted/30 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Clear Buffer
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 flex-1 sm:max-w-2xl justify-end">
          <select
            value={sourceFilter}
            onChange={(e: any) => setSourceFilter(e.target.value)}
            className="h-9 px-3 bg-background border border-border text-foreground text-xs rounded-xl focus:border-primary/50 outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="ENGINE">ENGINE</option>
            <option value="SCRAPER">SCRAPER</option>
            <option value="VALIDATOR">VALIDATOR</option>
            <option value="DNS">DNS</option>
          </select>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Filter by content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-background border border-border focus:border-primary/50 text-foreground text-xs rounded-xl outline-none placeholder:text-muted-foreground/45 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Retro Scrolling Terminal */}
      <div className="border border-border bg-black rounded-2xl overflow-hidden shadow-sm relative">
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none bg-scanlines z-10 opacity-[0.04]" />

        {/* Terminal Header Bar */}
        <div className="bg-card/40 p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Telemetry Stream
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5",
                  isPlaying ? "animate-pulse" : "opacity-50",
                )}
              ></span>
              Status: {isPlaying ? "SCROLLING" : "HALTED"}
            </div>
            <span className="text-[10px] text-muted-foreground/30">|</span>
            <span className="text-[10px] text-muted-foreground/50">
              Buffer: {filteredLogs.length} logs
            </span>
          </div>
        </div>

        {/* Logs Screen Area */}
        <div className="p-6 h-[480px] overflow-y-auto space-y-3 select-text font-mono text-[11px] leading-relaxed">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/40 space-y-2">
              <ShieldCheck className="h-8 w-8 text-muted-foreground/20" />
              <p className="uppercase tracking-widest text-[9px]">
                No logs in buffer
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 hover:bg-muted/10 p-1 border-l border-transparent hover:border-primary/20 transition-all"
              >
                {/* Time stamp */}
                <span className="text-muted-foreground/40 tabular-nums shrink-0">
                  {log.timestamp}
                </span>

                {/* Source tag */}
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-none border text-[8px] font-bold tracking-widest uppercase shrink-0 w-16 text-center",
                    log.source === "ENGINE"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : log.source === "SCRAPER"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : log.source === "VALIDATOR"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  )}
                >
                  {log.source}
                </span>

                {/* Message Text */}
                <span
                  className={cn(
                    "flex-1 font-medium tracking-tight",
                    log.type === "CRITICAL"
                      ? "text-red-400 font-extrabold"
                      : log.type === "WARN"
                        ? "text-amber-300"
                        : log.type === "SUCCESS"
                          ? "text-emerald-400"
                          : "text-slate-300",
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
