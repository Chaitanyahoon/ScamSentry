"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  ShieldAlert,
  Terminal,
  ExternalLink,
  Timer,
  Search,
  RefreshCcw,
  X,
  Activity,
  Cpu,
  AlertOctagon,
  ArrowUpRight,
  Shield,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IncidentAlert {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  source: string;
  isHighlight: boolean;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-");
}

const MONITORED_BRANDS = [
  "vercel",
  "github",
  "paypal",
  "paytm",
  "amazon",
  "google",
  "microsoft",
  "apple",
  "facebook",
  "phonepe",
  "sbi",
  "hdfc",
  "uber",
  "tesla",
  "openai",
  "linkedin",
  "twitter",
  "whatsapp",
  "telegram",
  "discord"
];

function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Live";
  }
}

function formatCompactTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}M`;
    if (diffHours < 24) return `${diffHours}H`;
    return `${diffDays}D`;
  } catch {
    return "?";
  }
}

export function CyberNewsHub() {
  const [incidents, setIncidents] = useState<IncidentAlert[]>([]);
  const [lockdowns, setLockdowns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "highlights" | "lockdowns">("all");
  const [showAll, setShowAll] = useState(false);
  
  // Hero Selected Index
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [isTickerHovered, setIsTickerHovered] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Decrypt Modal state
  const [selectedIncident, setSelectedIncident] = useState<IncidentAlert | null>(null);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [decryptionText, setDecryptionText] = useState("");

  // Scraper Terminal Console state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SCAMSENTRY OVERWATCH INTELLIGENCE ENGINE V2.0",
    "SYSTEM STATUS: ACTIVE [PORT 443]",
    "OSINT CYBERNEWS SYNC: STANDBY. AUTOMATIC CRON ACTIVE HOURLY.",
  ]);
  const [syncingScraper, setSyncingScraper] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // ─── FETCH OSINT DATA ────────────────────────────────────────────
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/threats/recent");
      if (res.ok) {
        const data = await res.json();
        const decoded = (data.incidents || []).map((i: any) => ({
          ...i,
          title: decodeHtmlEntities(i.title),
          description: decodeHtmlEntities(i.description)
        }));
        setIncidents(decoded);
        setLockdowns(data.lockdowns || []);
      }
    } catch (e) {
      console.error("[NEWS_HUB] Failed to fetch cybersecurity news", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 90000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ─── HERO CAROUSEL AUTO-ADVANCE ──────────────────────────────────
  const heroItems = useMemo(() => {
    if (incidents.length === 0) return [];
    const highlights = incidents.filter((i) => i.isHighlight);
    if (highlights.length >= 5) return highlights.slice(0, 5);
    const remaining = incidents
      .filter((i) => !i.isHighlight)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return [...highlights, ...remaining].slice(0, 5);
  }, [incidents]);

  const advanceHero = useCallback(() => {
    if (heroItems.length === 0) return;
    setActiveHeroIndex((prev) => (prev + 1) % heroItems.length);
  }, [heroItems.length]);

  useEffect(() => {
    if (heroItems.length === 0 || isCarouselHovered) {
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
      return;
    }
    autoAdvanceTimerRef.current = setInterval(advanceHero, 6000);
    return () => {
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    };
  }, [heroItems.length, isCarouselHovered, advanceHero]);

  // ─── DECRYPTION SPEED DECREASED TO BE ULTRA SNAPPY ────────────────
  useEffect(() => {
    if (!selectedIncident) {
      setDecryptionProgress(0);
      setDecryptionText("");
      return;
    }

    setDecryptionProgress(0);
    setDecryptionText("");

    const fullText = selectedIncident.description || "";
    // Reveal text in chunks very quickly to prevent lag
    let currentLen = 0;
    const stepSize = Math.max(5, Math.floor(fullText.length / 10)); // Complete in ~10 ticks
    
    const timer = setInterval(() => {
      currentLen += stepSize;
      if (currentLen >= fullText.length) {
        setDecryptionText(fullText);
        setDecryptionProgress(100);
        clearInterval(timer);
      } else {
        setDecryptionText(fullText.substring(0, currentLen) + "_");
        setDecryptionProgress(Math.floor((currentLen / fullText.length) * 100));
      }
    }, 30); // snappiest reveal animation

    return () => clearInterval(timer);
  }, [selectedIncident]);

  // ─── SCRAPER TRIGGER ─────────────────────────────────────────────
  const triggerScraperSync = () => {
    if (syncingScraper) return;
    setSyncingScraper(true);

    const logsSequence = [
      ">> INITIALIZING OSINT INGESTION PIPELINE...",
      ">> SCRAPING FEEDS: BLEEPINGCOMPUTER / HACKER_NEWS / KREBS...",
      ">> COMPARING BRAND KEYWORDS...",
      ">> SYNCING METADATA SCHEMA ARCHIVES...",
      ">> INGESTION CYCLE COMPLETED SUCCESSFULLY."
    ];

    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] COMMAND EXECUTION: SCRAPE_CYCLE_INGESTION`,
    ]);

    const scraperPromise = fetch("/api/scraper/trigger", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .catch((err) => {
        setTerminalLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ERROR: INGESTION FAILED — ${err.message}`,
        ]);
        return null;
      });

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logsSequence.length) {
        const logMsg = logsSequence[logIdx];
        if (logMsg) {
          setTerminalLogs((prev) => [...prev, `[OSINT] ${logMsg}`]);
        }
        logIdx++;
      } else {
        clearInterval(interval);
        scraperPromise.then((data) => {
          if (data && data.success) {
            fetchData(true).then(() => {
              const processedCount = data.processed ?? data.processed_count ?? "0";
              const lockdownsCount = data.lockdownsTriggered ?? data.lockdowns_triggered ?? "0";
              setTerminalLogs((prev) => [
                ...prev,
                `[OSINT] SCRAPE SUCCESS. TOTAL INGESTED: ${processedCount}`,
                `[OSINT] LOCKDOWNS CREATED: ${lockdownsCount}`,
                `[${new Date().toLocaleTimeString()}] SYSTEM READY.`
              ]);
              setSyncingScraper(false);
            });
          } else {
            setSyncingScraper(false);
          }
        });
      }
    }, 400);
  };

  // ─── FILTERED INCIDENTS ──────────────────────────────────────────
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchSearch =
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.source.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeFilter === "highlights") {
        return incident.isHighlight;
      }
      if (activeFilter === "lockdowns") {
        return lockdowns.some(
          (brand) =>
            incident.title.toLowerCase().includes(brand.toLowerCase()) ||
            incident.description.toLowerCase().includes(brand.toLowerCase())
        );
      }
      return true;
    });
  }, [incidents, searchQuery, activeFilter, lockdowns]);

  const INITIAL_SHOW_COUNT = 8;
  const visibleIncidents = useMemo(() => {
    if (showAll) return filteredIncidents.slice(0, 30);
    return filteredIncidents.slice(0, INITIAL_SHOW_COUNT);
  }, [filteredIncidents, showAll]);

  const hasMoreItems = filteredIncidents.length > INITIAL_SHOW_COUNT;

  // Active hero detailed readouts
  const activeHeroItem = heroItems[activeHeroIndex];

  return (
    <div className="space-y-6">
      
      {/* ─── 1. HORIZONTAL BRAND STATUS TICKER MARQUEE ───────────────── */}
      <div 
        className="w-full glass-card py-3 overflow-hidden flex items-center relative select-none rounded-2xl"
        onMouseEnter={() => setIsTickerHovered(true)}
        onMouseLeave={() => setIsTickerHovered(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 bg-[#070605]/95 z-10 px-4 border-r border-border flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase shrink-0 backdrop-blur-sm">
          <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Brand Safeguards:</span>
        </div>
        
        {/* Ticker Content */}
        <div 
          className="flex gap-8 px-4 whitespace-nowrap animate-[marquee_50s_linear_infinite] pl-[150px]"
          style={{ animationPlayState: isTickerHovered ? 'paused' : 'running' }}
        >
          {MONITORED_BRANDS.map((brand) => {
            const isLocked = lockdowns.some(l => l.toLowerCase() === brand.toLowerCase());
            return (
              <div 
                key={brand}
                className="inline-flex items-center gap-2 text-xs"
              >
                <span className="text-foreground/80 font-medium capitalize">{brand}</span>
                <span className={cn(
                  "px-2.5 py-0.5 text-[10px] font-semibold border rounded-full",
                  isLocked 
                    ? "bg-destructive/15 border-destructive/25 text-destructive" 
                    : "bg-success/15 border-success/25 text-success"
                )}>
                  {isLocked ? "Threat Alert" : "Protected"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 2. TACTICAL RADAR EVENTS LOGS & INSPECTOR PANEL ──────────── */}
      {!loading && heroItems.length > 0 && (
        <div 
          className="grid grid-cols-1 lg:grid-cols-3 glass-card rounded-2xl overflow-hidden"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          {/* LEFT PANE: EVENTS RADAR (40% width) */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
            <div className="bg-card p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-foreground tracking-wide">
                Active Advisory Radar
              </span>
              <span className="text-[10px] text-muted-foreground/60 uppercase font-medium">
                Live Feed
              </span>
            </div>

            <div className="divide-y divide-border/30 overflow-y-auto max-h-[300px] flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
              {heroItems.map((item, idx) => {
                const isActive = idx === activeHeroIndex;
                return (
                  <div
                    key={`radar-${idx}`}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors relative flex flex-col gap-2 border-b border-border/40 last:border-b-0",
                      isActive 
                        ? "bg-card/75 text-foreground" 
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-card/30"
                    )}
                  >
                    {/* Active highlight side line */}
                    {isActive && (
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        item.isHighlight ? "bg-destructive" : "bg-primary"
                      )} />
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className={cn(
                        "font-semibold uppercase tracking-wider text-[10px]",
                        isActive ? "text-primary" : "text-muted-foreground/50"
                      )}>
                        {item.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">T-{formatCompactTime(item.publishedAt)}</span>
                    </div>
                    
                    <p className="text-xs font-medium leading-normal line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE: DOSSIER INSPECTOR SCREEN (60% width) */}
          <div className="lg:col-span-2 bg-card/20 p-6 flex flex-col justify-between min-h-[300px]">
            {activeHeroItem ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header labels */}
                  <div className="flex flex-wrap gap-2.5 items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "rounded-full text-[10px] font-semibold px-2.5 py-0.5 border",
                        activeHeroItem.isHighlight 
                          ? "bg-destructive/15 border-destructive/25 text-destructive"
                          : "bg-primary/10 border-primary/20 text-primary"
                      )}>
                        {activeHeroItem.isHighlight ? "Critical Threat" : "Standard Vector"}
                      </Badge>
                      <span className="text-xs text-muted-foreground/60">
                        Source: {activeHeroItem.source}
                      </span>
                    </div>
                    
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimeAgo(activeHeroItem.publishedAt)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-3 mt-4 select-text">
                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {activeHeroItem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-4 py-1">
                      {activeHeroItem.description}
                    </p>
                  </div>
                </div>

                {/* Dossier footer metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 mt-6">
                  <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                    ID: {Buffer.from(activeHeroItem.link).toString("hex").substring(0, 16).toUpperCase()}
                  </div>
                  
                  <Button
                    onClick={() => setSelectedIncident(activeHeroItem)}
                    className="text-xs font-semibold px-4.5 h-9 rounded-xl border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 text-xs py-10">
                Select an advisory to inspect
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. OPERATIONS DIRECTORY LEDGER & TERMINAL SPLIT ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch select-none">
        
        {/* LEFT COLUMN: DIRECTORY LEDGER FEED (2 cols) */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
            {/* Console headers */}
            <div className="bg-card/45 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Threat Advisories
                </span>
              </div>

              {/* Filter tags keys */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setActiveFilter("all"); setShowAll(false); }}
                  className={cn(
                    "px-3.5 py-1 text-xs font-semibold border rounded-full transition-all",
                    activeFilter === "all"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => { setActiveFilter("highlights"); setShowAll(false); }}
                  className={cn(
                    "px-3.5 py-1 text-xs font-semibold border rounded-full transition-all",
                    activeFilter === "highlights"
                      ? "bg-destructive border-destructive text-destructive-foreground"
                      : "bg-background border-border text-muted-foreground hover:text-destructive hover:border-destructive/40"
                  )}
                >
                  Critical
                </button>
                <button
                  onClick={() => { setActiveFilter("lockdowns"); setShowAll(false); }}
                  className={cn(
                    "px-3.5 py-1 text-xs font-semibold border rounded-full transition-all",
                    activeFilter === "lockdowns"
                      ? "bg-warning border-warning text-warning-foreground"
                      : "bg-background border-border text-muted-foreground hover:text-warning hover:border-warning/40"
                  )}
                >
                  Safeguards
                </button>
              </div>
            </div>

            {/* Directory Search console */}
            <div className="relative border-b border-border">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/45" />
              <input
                type="text"
                placeholder="Search target domain or feed source..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowAll(false); }}
                className="w-full h-10 pl-10 pr-4 bg-background/25 focus:border-primary/20 text-foreground text-xs placeholder:text-muted-foreground/40 rounded-none outline-none transition-colors border-0"
              />
            </div>

            {/* Table Ledger Directory */}
            <div className="bg-card/10 overflow-hidden select-text flex-1">
              {loading ? (
                <div className="py-16 text-center">
                  <RefreshCcw className="h-5 w-5 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Ingesting data feeds...</p>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-xs text-muted-foreground/60">No advisories logged for query</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 bg-card/60 text-muted-foreground select-none uppercase tracking-wider text-[10px] font-semibold">
                        <th className="p-3">Status</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Advisory details</th>
                        <th className="p-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {visibleIncidents.map((incident, idx) => (
                        <tr 
                          key={`${incident.link}-${idx}`}
                          onClick={() => setSelectedIncident(incident)}
                          className="hover:bg-card/40 transition-colors group cursor-pointer"
                        >
                          <td className="p-3">
                            <span className={cn(
                              "px-2 py-0.5 text-[9px] font-bold border rounded-full uppercase tracking-wider",
                              incident.isHighlight 
                                ? "bg-destructive/10 border-destructive/20 text-destructive" 
                                : "bg-muted border-border text-muted-foreground"
                            )}>
                              {incident.isHighlight ? "Alert" : "Info"}
                            </span>
                          </td>
                          <td className="p-3 text-primary font-semibold capitalize">{incident.source}</td>
                          <td className="p-3 text-foreground/80 font-medium group-hover:text-primary transition-colors max-w-[220px] sm:max-w-[340px] truncate">
                            {incident.title}
                          </td>
                          <td className="p-3 text-right text-muted-foreground font-mono">
                            {formatCompactTime(incident.publishedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Show More toggle button */}
            {hasMoreItems && !loading && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-3 bg-card/40 border-t border-border text-xs font-semibold text-muted-foreground/85 hover:text-primary hover:bg-card/65 transition-all outline-none"
              >
                {showAll ? "Collapse Database View" : `Expand Database — Show ${filteredIncidents.length - INITIAL_SHOW_COUNT} More Records`}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CORE MONITOR TERMINAL CONSOLE (1 col) */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          
          <div className="glass-card p-4 rounded-2xl flex flex-col justify-between select-none relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  System Diagnostics
                </span>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engine Core</span>
                  <span className="text-foreground font-semibold font-mono">v2.1.4-stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database Sync</span>
                  <span className="text-success font-semibold uppercase">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feed Providers</span>
                  <div className="text-right text-[11px] text-muted-foreground font-medium space-y-0.5">
                    <p>✓ BleepingComputer</p>
                    <p>✓ Hacker News</p>
                    <p>✓ Krebs on Security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Log Console Output terminal */}
          <div className="glass-card flex flex-col justify-between overflow-hidden rounded-2xl min-h-[220px] flex-1">
            <div className="bg-card/40 px-4 py-3 border-b border-border flex items-center justify-between select-none">
              <span className="text-xs font-bold text-foreground">
                Sync Logs
              </span>
              <span className="text-[10px] text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded font-bold">
                Live Feed
              </span>
            </div>

            <div
              ref={terminalRef}
              className="p-4 flex-1 bg-black/20 font-mono text-[11px] text-success/90 space-y-2 overflow-y-auto max-h-[160px] select-text"
            >
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-relaxed tracking-wider break-all pl-2.5 border-l border-border/40",
                    log.includes("ERROR")
                      ? "border-destructive text-destructive font-semibold"
                      : log.includes("SUCCESS") || log.includes("OK")
                        ? "border-success text-success font-semibold"
                        : "text-success/80"
                  )}
                >
                  {log}
                </div>
              ))}
              {syncingScraper && (
                <div className="text-success animate-pulse flex items-center gap-1.5 font-sans text-xs">
                  <span>⚙</span>
                  <span>Updating threat intelligence databases...</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-card/40 border-t border-border">
              <Button
                onClick={triggerScraperSync}
                disabled={syncingScraper}
                className={cn(
                  "w-full text-xs font-semibold h-10 rounded-xl border transition-all duration-300",
                  syncingScraper
                    ? "bg-background border-border text-muted-foreground/30 cursor-not-allowed"
                    : "bg-background border-border text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                )}
              >
                {syncingScraper ? "Syncing feeds..." : "Run Feed Scraper"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. DECRYPT ADVISORY MODAL TERMINAL ──────────────────────── */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl border border-border bg-card text-foreground rounded-2xl overflow-hidden relative shadow-2xl">
            
            {/* Header */}
            <div className="bg-card border-b border-border px-5 py-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  Threat Advisory Details
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 border border-border bg-background/50 rounded-xl"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-5 bg-card/10">
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-background/50 p-4 border border-border rounded-xl select-none text-xs">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Severity</span>
                  <span className={cn(
                    "font-bold",
                    selectedIncident.isHighlight ? "text-destructive" : "text-warning"
                  )}>
                    {selectedIncident.isHighlight ? "Critical" : "Standard"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Feed Source</span>
                  <span className="font-bold text-foreground capitalize">{selectedIncident.source}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Published</span>
                  <span className="font-bold text-foreground">
                    {new Date(selectedIncident.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Integrity</span>
                  <span className="font-bold text-success">{decryptionProgress}% Secure</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5 border-b border-border pb-4">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block select-none">Subject</span>
                <h3 className="text-sm font-bold text-foreground leading-relaxed">
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Description Details */}
              <div className="space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block select-none">Advisory Payload</span>
                <div className="bg-background/80 p-4 border border-border rounded-xl text-sm text-muted-foreground/90 leading-relaxed min-h-[100px] max-h-[220px] overflow-y-auto select-text whitespace-pre-wrap">
                  {decryptionText}
                </div>
              </div>

              {/* Active lockdown warning panel */}
              {lockdowns.some((brand) =>
                selectedIncident.title.toLowerCase().includes(brand.toLowerCase())
              ) && (
                <div className="bg-destructive/5 border border-destructive/25 p-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-destructive uppercase tracking-wide">
                      Brand Safeguard Triggered
                    </span>
                    <p className="text-xs text-destructive/80 leading-relaxed mt-1">
                      This advisory matches an actively monitored brand. Lookalike domains mimicking this brand are automatically subject to immediate reputation penalty in our scanning engines.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-4 select-none">
              <Button
                onClick={() => setSelectedIncident(null)}
                variant="outline"
                className="text-xs font-semibold px-4.5 h-9 border-border text-muted-foreground hover:text-foreground rounded-xl bg-background"
              >
                Close
              </Button>

              <a
                href={selectedIncident.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4.5 h-9 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl transition-all"
              >
                Visit Source <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
