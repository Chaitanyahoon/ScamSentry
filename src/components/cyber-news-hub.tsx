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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Eye,
  EyeOff,
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

// ─── RELATIVE DATE FORMATTER ───────────────────────────────────────
function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "JUST NOW";
    if (diffMins < 60) return `${diffMins} MINUTE${diffMins !== 1 ? "S" : ""} AGO`;
    if (diffHours < 24) return `${diffHours} HOUR${diffHours !== 1 ? "S" : ""} AGO`;
    if (diffDays === 1) return "YESTERDAY";
    if (diffDays < 7) return `${diffDays} DAYS AGO`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} WEEK${Math.floor(diffDays / 7) !== 1 ? "S" : ""} AGO`;
    return `${Math.floor(diffDays / 30)} MONTH${Math.floor(diffDays / 30) !== 1 ? "S" : ""} AGO`;
  } catch {
    return "T-LIVE";
  }
}

// ─── COMPACT TIME TAG ──────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════
// ─── CAROUSEL COMPONENT ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function NewsCarousel({
  items,
  onSelect,
}: {
  items: IncidentAlert[];
  onSelect: (item: IncidentAlert) => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % items.length);
    }, 5000);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    resetAutoAdvance();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, resetAutoAdvance]);

  const goTo = (index: number) => {
    setActiveSlide(index);
    resetAutoAdvance();
  };

  const goPrev = () => {
    goTo((activeSlide - 1 + items.length) % items.length);
  };

  const goNext = () => {
    goTo((activeSlide + 1) % items.length);
  };

  if (items.length === 0) return null;

  const activeItem = items[activeSlide];
  const isHighlight = activeItem?.isHighlight;

  return (
    <div
      className={cn(
        "relative w-full bg-[#0C0A09] overflow-hidden transition-all duration-300",
        isHighlight
          ? "border border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.1)]"
          : "border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
      )}
    >
      {/* TOP ACCENT LINE */}
      <div
        className={cn(
          "h-[2px] w-full shadow-lg transition-all duration-300",
          isHighlight
            ? "bg-gradient-to-r from-red-500/80 via-red-600 to-red-500/80 shadow-[0_1px_12px_rgba(239,68,68,0.4)]"
            : "bg-gradient-to-r from-amber-500/80 via-amber-600 to-amber-500/80 shadow-[0_1px_12px_rgba(245,158,11,0.3)]"
        )}
      />

      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#15110E] border-b border-[#1F1914]">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-red-400 animate-pulse" />
          <span className="text-[9px] font-mono font-black text-red-400 uppercase tracking-[0.25em]">
            CRITICAL_INTELLIGENCE_FEED
          </span>
        </div>
        <span className="text-[8px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          {activeSlide + 1} / {items.length}
        </span>
      </div>

      {/* SLIDES CONTAINER */}
      <div className="relative h-[160px] sm:h-[140px]">
        {items.map((item, idx) => (
          <div
            key={`carousel-${idx}`}
            onClick={() => onSelect(item)}
            className={cn(
              "absolute inset-0 p-5 sm:p-6 flex flex-col justify-center cursor-pointer transition-all duration-500 ease-in-out",
              idx === activeSlide
                ? "opacity-100 translate-x-0"
                : idx < activeSlide
                  ? "opacity-0 -translate-x-full pointer-events-none"
                  : "opacity-0 translate-x-full pointer-events-none"
            )}
          >
            {/* META ROW */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <Badge
                variant="outline"
                className="bg-red-500/15 border-red-500/40 text-red-400 font-mono text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest animate-pulse"
              >
                CRITICAL
              </Badge>
              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">
                {item.source}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1">
                <Timer className="h-2.5 w-2.5" />
                {formatTimeAgo(item.publishedAt)}
              </span>
            </div>

            {/* TITLE */}
            <h3 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wide leading-tight line-clamp-2 hover:text-primary transition-colors">
              {item.title}
            </h3>
          </div>
        ))}

        {/* PREV / NEXT ARROWS */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-[#15110E]/90 border border-[#1F1914] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-[#15110E]/90 border border-[#1F1914] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* DOT INDICATORS */}
      <div className="flex items-center justify-center gap-2 pb-3">
        {items.map((_, idx) => (
          <button
            key={`dot-${idx}`}
            onClick={() => goTo(idx)}
            className={cn(
              "h-1.5 transition-all duration-300",
              idx === activeSlide
                ? "w-6 bg-red-500"
                : "w-1.5 bg-[#1F1914] hover:bg-muted-foreground/40"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export function CyberNewsHub() {
  const [incidents, setIncidents] = useState<IncidentAlert[]>([]);
  const [lockdowns, setLockdowns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "highlights" | "lockdowns">("all");
  const [showAll, setShowAll] = useState(false);

  // Decrypt Report Modal state
  const [selectedIncident, setSelectedIncident] = useState<IncidentAlert | null>(null);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [decryptionText, setDecryptionText] = useState("");

  // Scraper Terminal Console state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SCAMSENTRY OVERWATCH INTELLIGENCE ENGINE V2.0",
    "SYSTEM STATUS: INITIALIZED [PORT 443]",
    "OSINT CYBERNEWS SYNC: STANDBY. AUTOMATIC CRON ACTIVE HOURLY.",
  ]);
  const [syncingScraper, setSyncingScraper] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom on new logs
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
        setIncidents(data.incidents || []);
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

  // ─── DECRYPTION ANIMATION ────────────────────────────────────────
  useEffect(() => {
    if (!selectedIncident) {
      setDecryptionProgress(0);
      setDecryptionText("");
      return;
    }

    setDecryptionProgress(0);
    setDecryptionText("");

    let currentLen = 0;
    const fullText = selectedIncident.description || "";
    const intervalTime = Math.max(5, Math.min(25, 400 / (fullText.length || 1)));

    const timer = setInterval(() => {
      currentLen += 3;
      if (currentLen >= fullText.length) {
        setDecryptionText(fullText);
        setDecryptionProgress(100);
        clearInterval(timer);
      } else {
        setDecryptionText(fullText.substring(0, currentLen) + "_");
        setDecryptionProgress(Math.floor((currentLen / fullText.length) * 100));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [selectedIncident]);

  // ─── SCRAPER TRIGGER (REAL API + SIMULATION LOGS) ────────────────
  const triggerScraperSync = () => {
    if (syncingScraper) return;
    setSyncingScraper(true);

    const logsSequence = [
      ">> INITIALIZING MULTI-FEED OSINT SCANNER...",
      ">> CONNECTING TO RSS: BLEEPINGCOMPUTER [HTTPS://WWW.BLEEPINGCOMPUTER.COM/FEED/]...",
      ">> CONNECTING TO RSS: THE HACKER NEWS [HTTPS://FEEDS.FEEDBURNER.COM/THEHACKERSNEWS]...",
      ">> CONNECTING TO RSS: KREBS ON SECURITY [HTTPS://KREBSONSECURITY.COM/FEED/]...",
      ">> INGESTING ADVANCED THREAT INTELLIGENCE PACKETS...",
      ">> RUNNING SEMANTIC CONTENT ANALYSIS MATRIX...",
      ">> UPDATING CLOUD FIRESTORE LEDGER REPOSITORIES...",
      ">> AUTO-GENERATING COMMUNITY SCAM ALERTS...",
      ">> INGESTION CYCLE COMPLETE."
    ];

    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] USER TRG: MANUAL_SCRAPE_CYCLE_INGESTION_REQUESTED`,
    ]);

    // Fire real API request in the background
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
          `[${new Date().toLocaleTimeString()}] !! ERROR: SCRAPER_TRIGGER_FAILED — ${err.message}`,
        ]);
        return null;
      });

    // Show simulation logs in parallel
    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logsSequence.length) {
        setTerminalLogs((prev) => [...prev, `[OSINT] ${logsSequence[logIdx]}`]);
        logIdx++;
      } else {
        clearInterval(interval);
        // Wait for the real API call to finish, then refresh data
        scraperPromise.then((data) => {
          if (data && data.success) {
            fetchData(true).then(() => {
              setTerminalLogs((prev) => [
                ...prev,
                `[OSINT] >> SCRAPER STATUS: SUCCESS`,
                `[OSINT] >> INCIDENTS INGESTED: ${data.processed}`,
                `[OSINT] >> BRAND LOCKDOWNS TRIGGERED: ${data.lockdownsTriggered}`,
                `[OSINT] >> COMMUNITY REPORTS GENERATED: ${data.reportsGenerated || 0}`,
                `[OSINT] >> ENCOUNTERED ERRORS: ${data.errors || 0}`,
                `[${new Date().toLocaleTimeString()}] SYSTEM: OSINT SYNC OK. LEDGER REFRESHED.`
              ]);
              setSyncingScraper(false);
            });
          } else {
            // API failed — already logged the error above
            setSyncingScraper(false);
          }
        });
      }
    }, 600);
  };

  // ─── CAROUSEL ITEMS (top 5 highlights/critical) ─────────────────
  const carouselItems = useMemo(() => {
    const highlights = incidents.filter((i) => i.isHighlight);
    if (highlights.length >= 5) return highlights.slice(0, 5);
    // fill remaining from non-highlights sorted by date
    const remaining = incidents
      .filter((i) => !i.isHighlight)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return [...highlights, ...remaining].slice(0, 5);
  }, [incidents]);

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

  // ─── VISIBLE INCIDENTS (show more / less) ────────────────────────
  const INITIAL_SHOW_COUNT = 10;
  const visibleIncidents = useMemo(() => {
    if (showAll) return filteredIncidents.slice(0, 30);
    return filteredIncidents.slice(0, INITIAL_SHOW_COUNT);
  }, [filteredIncidents, showAll]);

  const hasMoreItems = filteredIncidents.length > INITIAL_SHOW_COUNT;

  // ─── FIND INCIDENT TITLE THAT TRIGGERED A LOCKDOWN ──────────────
  const getLockdownTriggerTitle = (brand: string): string | null => {
    const match = incidents.find(
      (i) =>
        i.title.toLowerCase().includes(brand.toLowerCase()) ||
        i.description.toLowerCase().includes(brand.toLowerCase())
    );
    return match ? match.title : null;
  };

  // ═══════════════════════════════════════════════════════════════════
  // ─── RENDER ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ═══ 1. NEWS CAROUSEL (TOP) ═══════════════════════════════════ */}
      {!loading && carouselItems.length > 0 && (
        <NewsCarousel items={carouselItems} onSelect={setSelectedIncident} />
      )}

      {/* ═══ 2. BRAND LOCKDOWN STATUS TICKER ══════════════════════════ */}
      <div
        className={cn(
          "border px-6 py-4 bg-[#0C0A09] relative overflow-hidden transition-all duration-300",
          lockdowns.length > 0
            ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            : "border-[#1F1914] hover:border-primary/20"
        )}
      >
        {/* HUD Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-muted-foreground/20" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-muted-foreground/20" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-muted-foreground/20" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-muted-foreground/20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {lockdowns.length > 0 ? (
              <div className="h-10 w-10 flex items-center justify-center bg-red-500/10 border border-red-500/40 text-red-500 animate-pulse rounded-none">
                <AlertOctagon className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-none">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-none border",
                    lockdowns.length > 0
                      ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  )}
                >
                  {lockdowns.length > 0 ? "BRAND LOCKDOWN ACTIVE" : "BRAND SECURITY COHESION"}
                </span>
              </div>
              <h3 className="text-sm font-mono font-bold text-foreground mt-1 uppercase tracking-wide">
                {lockdowns.length > 0
                  ? `AUTOMATED OSINT PENALTY TRIGGERED FOR [${lockdowns.length}] DOMAIN MATRIX MIMICS`
                  : "ALL MONITORED BRANDS REPORT SECURE STATUS"}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {lockdowns.length === 0 ? (
              <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                [ STATUS: ALL_SYSTEMS_NOMINAL ]
              </div>
            ) : (
              lockdowns.map((brand) => {
                const triggerTitle = getLockdownTriggerTitle(brand);
                return (
                  <div
                    key={brand}
                    className="bg-red-950/40 border border-red-500/40 text-red-400 font-mono text-[10px] font-bold px-3 py-1.5 flex flex-col gap-1 tracking-wider animate-pulse max-w-[280px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span className="font-black">{brand.toUpperCase()}</span>
                      <span className="text-[8px] bg-red-500/20 px-1 border border-red-500/30 text-red-500">
                        +35 RISK SPIKE
                      </span>
                    </div>
                    {triggerTitle && (
                      <span className="text-[8px] text-red-500/70 leading-tight truncate pl-3.5">
                        ↳ {triggerTitle.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ═══ 3. NEWS LEDGER + TERMINAL GRID ═══════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEDGER FEED (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#1F1914] pb-4">
            {/* Filters Toggles */}
            <div className="flex flex-wrap gap-1.5 bg-[#0C0A09] p-1 border border-[#1F1914] rounded-none">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-all",
                  activeFilter === "all"
                    ? "bg-primary text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                )}
              >
                ALL_SYSTEMS
              </button>
              <button
                onClick={() => setActiveFilter("highlights")}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-all",
                  activeFilter === "highlights"
                    ? "bg-red-500 text-white font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                )}
              >
                CRITICAL_HIGHLIGHTS
              </button>
              <button
                onClick={() => setActiveFilter("lockdowns")}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-all",
                  activeFilter === "lockdowns"
                    ? "bg-amber-500 text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#15110E]"
                )}
              >
                ACTIVE_LOCKDOWNS
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="SEARCH INTELLIGENCE DOSSIER..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-[#0C0A09] border border-[#1F1914] focus:border-primary/50 text-foreground font-mono text-xs rounded-none outline-none tracking-widest placeholder:text-muted-foreground/30 transition-all uppercase"
              />
            </div>
          </div>

          {/* COUNT BADGE */}
          {!loading && (
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono font-black text-primary/80 uppercase tracking-[0.2em] bg-primary/5 border border-primary/20 px-3 py-1">
                [ {filteredIncidents.length} INTELLIGENCE REPORTS LOADED ]
              </span>
              {refreshing && (
                <RefreshCcw className="h-3 w-3 text-primary animate-spin" />
              )}
            </div>
          )}

          {/* LEDGER LIST */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-16 text-center border border-[#1F1914] bg-[#0C0A09]">
                <RefreshCcw className="h-6 w-6 text-primary animate-spin mx-auto mb-3" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  DECRYPTING LIVE OSINT DATA FEED...
                </p>
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[#1F1914] bg-[#0C0A09]/20">
                <AlertTriangle className="h-6 w-6 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  [ SYSERR: NO_INTELLIGENCE_MATCHING_FILTER ]
                </p>
              </div>
            ) : (
              <>
                {visibleIncidents.map((incident, i) => (
                  <div
                    key={`${incident.link}-${i}`}
                    onClick={() => setSelectedIncident(incident)}
                    className={cn(
                      "bg-[#0C0A09] border p-5 flex flex-col gap-3 cursor-pointer hover:bg-[#15110E] transition-all group duration-300 relative",
                      incident.isHighlight
                        ? "border-red-500/20 hover:border-red-500/50 shadow-[inset_0_0_30px_rgba(239,68,68,0.02)]"
                        : "border-[#1F1914] hover:border-primary/40"
                    )}
                  >
                    {/* LEFT ACCENT BAR */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-[2px] transition-all",
                        incident.isHighlight
                          ? "bg-red-500/60 group-hover:bg-red-500"
                          : "bg-[#1F1914] group-hover:bg-primary/60"
                      )}
                    />

                    {/* HUD CORNERS */}
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-transparent group-hover:border-primary/50 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-transparent group-hover:border-primary/50 transition-colors" />

                    {/* META ROW */}
                    <div className="flex flex-wrap items-center gap-2 pl-2">
                      <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                        <Timer className="h-2.5 w-2.5" />
                        {formatTimeAgo(incident.publishedAt)}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/40">|</span>
                      <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider">
                        {incident.source}
                      </span>
                      {incident.isHighlight && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/15 border-red-500/30 text-red-400 font-mono text-[8px] font-black px-1.5 py-0 rounded-none uppercase tracking-widest animate-pulse"
                        >
                          CRITICAL
                        </Badge>
                      )}
                      {lockdowns.some(
                        (brand) =>
                          incident.title.toLowerCase().includes(brand.toLowerCase())
                      ) && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 border-amber-500/20 text-amber-500 font-mono text-[8px] font-bold px-1.5 py-0 rounded-none uppercase tracking-widest"
                        >
                          LOCKDOWN
                        </Badge>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="pl-2 space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-wide uppercase leading-snug">
                        {incident.title}
                      </h4>
                      <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed line-clamp-2 max-w-3xl">
                        {incident.description}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between pl-2">
                      <span className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-widest">
                        T-{formatCompactTime(incident.publishedAt)}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] font-mono text-muted-foreground/40 group-hover:text-primary transition-colors uppercase tracking-widest font-black">
                          [ DECRYPT_REPORT ]
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* SHOW MORE / SHOW LESS TOGGLE */}
                {hasMoreItems && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-3 bg-[#0C0A09] border border-[#1F1914] hover:border-primary/40 text-[10px] font-mono font-bold text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                  >
                    {showAll ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        SHOW_LESS — COLLAPSE TO {INITIAL_SHOW_COUNT}
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        SHOW_MORE — {filteredIncidents.length - INITIAL_SHOW_COUNT} HIDDEN REPORTS
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* SCRAPER TERMINAL CONSOLE WIDGET (Right Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-[#1F1914] bg-[#0C0A09] overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
            {/* Terminal Header */}
            <div className="bg-[#15110E] p-3 border-b border-[#1F1914] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">
                  SCRAPER_DIAGNOSTICS_NODE
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Terminal Screen */}
            <div
              ref={terminalRef}
              className="p-4 flex-1 bg-[#070605] font-mono text-[10px] text-emerald-400 space-y-2 overflow-y-auto max-h-[320px] select-text"
            >
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-relaxed tracking-wider break-all border-l-2 pl-2",
                    log.includes("ERROR")
                      ? "border-red-500/60 text-red-400"
                      : "border-emerald-950"
                  )}
                >
                  {log}
                </div>
              ))}
              {syncingScraper && (
                <div className="text-emerald-500 animate-pulse flex items-center gap-2">
                  <span className="animate-spin">⌛</span>
                  <span>EXECUTING DYNAMIC XML INGESTION ROUTE...</span>
                </div>
              )}
            </div>

            {/* Terminal Action */}
            <div className="p-3 bg-[#15110E] border-t border-[#1F1914]">
              <Button
                onClick={triggerScraperSync}
                disabled={syncingScraper}
                className={cn(
                  "w-full font-mono text-xs font-bold tracking-widest uppercase h-10 rounded-none border transition-all",
                  syncingScraper
                    ? "bg-muted/10 border-muted-foreground/20 text-muted-foreground"
                    : "bg-primary border-primary/20 text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(255,191,0,0.15)]"
                )}
              >
                {syncingScraper ? (
                  <>
                    <RefreshCcw className="mr-2 h-3.5 w-3.5 animate-spin" />
                    RUNNING_SYNC_CYCLE...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                    RUN_AUTOMATIC_SCRAPER_SCAN
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 4. DECRYPT REPORT MODAL ══════════════════════════════════ */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl border border-primary/60 bg-[#0C0A09] text-foreground rounded-none shadow-[0_0_50px_rgba(255,191,0,0.2)] overflow-hidden">
            {/* Header banner */}
            <div className="bg-primary/10 border-b border-primary/40 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.25em]">
                  SECURE_OSINT_REPORT_DECRYPTOR_V2.0
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Main console content */}
            <div className="p-6 space-y-6">
              {/* Metadata Cluster */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070605] p-4 border border-[#1F1914]">
                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    CLASSIFICATION
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-black uppercase tracking-wider",
                      selectedIncident.isHighlight ? "text-red-400" : "text-amber-500"
                    )}
                  >
                    {selectedIncident.isHighlight ? "CRITICAL_BULLETIN" : "STANDARD_VECTOR"}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    INTELLIGENCE_SOURCE
                  </span>
                  <span className="text-[10px] font-mono font-bold text-foreground">
                    {selectedIncident.source.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    DATED_STAMP
                  </span>
                  <span className="text-[10px] font-mono text-foreground font-bold">
                    {new Date(selectedIncident.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    DECRYPTION_INTEGRITY
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {decryptionProgress}% SECURE
                  </span>
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-1.5 border-b border-[#1F1914] pb-4">
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">
                  SUBJECT_HEADER
                </span>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wide leading-relaxed">
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Decrypted payload text screen */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">
                  DECRYPTED_INCIDENT_SUMMARY
                </span>
                <div className="bg-[#070605] p-4 border border-[#1F1914] font-mono text-xs text-muted-foreground leading-relaxed min-h-[120px] select-text">
                  {decryptionText}
                </div>
              </div>

              {/* Warning Lockdown notice if matching a lockdown brand */}
              {lockdowns.some((brand) =>
                selectedIncident.title.toLowerCase().includes(brand.toLowerCase())
              ) && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-3">
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="block text-[9px] font-mono font-black text-red-400 uppercase tracking-widest">
                      ACTIVE LOCKDOWN WARNING
                    </span>
                    <p className="text-[10px] font-mono text-red-500/80 leading-relaxed mt-0.5">
                      This incident has triggered a Brand Lockdown protocol. The ScamSentry
                      forensic engine will penalize lookalike domains mimicking this brand (+35
                      penalty) for the next 7 days.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer options */}
            <div className="bg-[#15110E] border-t border-[#1F1914] px-6 py-4 flex items-center justify-between gap-4">
              <Button
                onClick={() => setSelectedIncident(null)}
                variant="outline"
                className="font-mono text-[10px] font-bold tracking-widest uppercase px-4 h-9 border-[#1F1914] text-muted-foreground hover:text-foreground rounded-none"
              >
                CLOSE_CONSOLE
              </Button>

              <a
                href={selectedIncident.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase px-5 h-9 bg-primary text-black hover:bg-primary/90 rounded-none transition-colors"
              >
                ACCESS_RSS_ORIGINAL <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
