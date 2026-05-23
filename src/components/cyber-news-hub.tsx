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
  Lock,
  Unlock,
  CheckCircle2
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
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    if (diffDays === 1) return "YESTERDAY";
    if (diffDays < 7) return `${diffDays}D AGO`;
    return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
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
// ─── CAROUSEL COMPONENT WITH HOVER PAUSE & CORNER NOTCHES ─────────
// ═══════════════════════════════════════════════════════════════════
function NewsCarousel({
  items,
  onSelect,
}: {
  items: IncidentAlert[];
  onSelect: (item: IncidentAlert) => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isHovered) return; // Pause advance when hovering
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % items.length);
    }, 5000);
  }, [items.length, isHovered]);

  useEffect(() => {
    if (items.length === 0) return;
    resetAutoAdvance();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, resetAutoAdvance]);

  const goTo = (index: number) => {
    setActiveSlide(index);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-full bg-[#0C0A09] overflow-hidden transition-all duration-500 rounded-none",
        isHighlight
          ? "border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.08)]"
          : "border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.03)]"
      )}
    >
      {/* Corner Notches */}
      <div className="absolute top-1.5 left-1.5 text-[7px] font-mono text-muted-foreground/30 select-none pointer-events-none">[+]</div>
      <div className="absolute top-1.5 right-1.5 text-[7px] font-mono text-muted-foreground/30 select-none pointer-events-none">[+]</div>
      <div className="absolute bottom-1.5 left-1.5 text-[7px] font-mono text-muted-foreground/30 select-none pointer-events-none">[+]</div>
      <div className="absolute bottom-1.5 right-1.5 text-[7px] font-mono text-muted-foreground/30 select-none pointer-events-none">[+]</div>

      {/* TOP ACCENT LINE */}
      <div
        className={cn(
          "h-[2px] w-full shadow-lg transition-all duration-300",
          isHighlight
            ? "bg-gradient-to-r from-red-600/80 via-red-500 to-red-600/80"
            : "bg-gradient-to-r from-amber-600/80 via-amber-500 to-amber-600/80"
        )}
      />

      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#15110E] border-b border-[#1F1914]">
        <div className="flex items-center gap-2">
          <Zap className={cn("h-3.5 w-3.5 animate-pulse", isHighlight ? "text-red-400" : "text-amber-400")} />
          <span className={cn(
            "text-[9px] font-mono font-black uppercase tracking-[0.25em]",
            isHighlight ? "text-red-400" : "text-amber-400"
          )}>
            {isHighlight ? "CRITICAL_THREAT_BULLETIN_FEED" : "OSINT_INTELLIGENCE_STREAM"}
          </span>
          {isHovered && (
            <span className="text-[7px] font-mono text-emerald-400 px-1 py-0.2 border border-emerald-500/20 bg-emerald-500/5 uppercase tracking-widest animate-pulse ml-2">
              [PAUSED]
            </span>
          )}
        </div>
        <span className="text-[8px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          BULLETIN {activeSlide + 1} / {items.length}
        </span>
      </div>

      {/* SLIDES CONTAINER */}
      <div className="relative h-[150px] sm:h-[130px] bg-[radial-gradient(#1f1914_1px,transparent_1px)] [background-size:16px_16px] bg-opacity-20">
        {items.map((item, idx) => (
          <div
            key={`carousel-${idx}`}
            onClick={() => onSelect(item)}
            className={cn(
              "absolute inset-0 p-6 flex flex-col justify-center cursor-pointer transition-all duration-500 ease-in-out",
              idx === activeSlide
                ? "opacity-100 translate-x-0"
                : idx < activeSlide
                  ? "opacity-0 -translate-x-full pointer-events-none"
                  : "opacity-0 translate-x-full pointer-events-none"
            )}
          >
            {/* META ROW */}
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest",
                  item.isHighlight
                    ? "bg-red-500/15 border-red-500/40 text-red-400 animate-pulse"
                    : "bg-amber-500/10 border-amber-500/35 text-amber-400"
                )}
              >
                {item.isHighlight ? "CRITICAL" : "ELEVATED"}
              </Badge>
              <span className="text-[9px] font-mono font-bold text-[#E7E5E4] uppercase tracking-wider bg-stone-900 border border-[#1F1914] px-1.5 py-0.5">
                {item.source}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="h-3 w-3" />
                {formatTimeAgo(item.publishedAt)}
              </span>
            </div>

            {/* TITLE */}
            <h3 className="text-sm sm:text-base font-black text-foreground uppercase tracking-wide leading-snug line-clamp-2 hover:text-primary transition-colors pr-8">
              {item.title}
            </h3>
          </div>
        ))}

        {/* PREV / NEXT ARROWS */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-7 w-7 flex items-center justify-center bg-[#15110E]/95 border border-[#1F1914] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all rounded-none"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-7 w-7 flex items-center justify-center bg-[#15110E]/95 border border-[#1F1914] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all rounded-none"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* DOT INDICATORS */}
      <div className="flex items-center justify-center gap-2 pb-3.5 bg-[#0C0A09]">
        {items.map((_, idx) => (
          <button
            key={`dot-${idx}`}
            onClick={() => goTo(idx)}
            className={cn(
              "h-1.5 transition-all duration-300 rounded-none",
              idx === activeSlide
                ? isHighlight ? "w-6 bg-red-500" : "w-6 bg-amber-500"
                : "w-1.5 bg-[#1F1914] hover:bg-[#3E3329]"
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

  return (
    <div className="space-y-6">
      {/* ═══ 1. NEWS CAROUSEL (TOP) ═══════════════════════════════════ */}
      {!loading && carouselItems.length > 0 && (
        <NewsCarousel items={carouselItems} onSelect={setSelectedIncident} />
      )}

      {/* ═══ 2. BRAND SECURITY OVERWATCH MONITOR (MATRIX STATUS) ══════ */}
      <div className="border border-[#1F1914] bg-[#0C0A09] relative overflow-hidden p-5 transition-all">
        {/* HUD Corner Accents */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#3E3329]" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#3E3329]" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#3E3329]" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#3E3329]" />

        <div className="flex flex-col xl:flex-row gap-5 items-stretch">
          {/* Status Panel Title */}
          <div className="xl:w-1/4 border border-[#1F1914] bg-[#15110E] p-4 flex flex-col justify-between select-none shrink-0 relative">
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", lockdowns.length > 0 ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse")} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Shield className={cn("h-3.5 w-3.5", lockdowns.length > 0 ? "text-red-500" : "text-emerald-400")} />
                <span className="text-[9px] font-mono font-black text-muted-foreground/60 tracking-wider uppercase">
                  MONITOR_SECTOR
                </span>
              </div>
              <h3 className="text-xs font-mono font-black uppercase text-foreground mt-2 tracking-widest leading-relaxed">
                BRAND_SECURITY_SHIELDS
              </h3>
            </div>
            
            <div className="mt-4 border-t border-[#1F1914] pt-2">
              {lockdowns.length > 0 ? (
                <div className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3 text-red-500 shrink-0" />
                  [ STATE: HAZARD_LOCKDOWN ]
                </div>
              ) : (
                <div className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  [ STATE: nominal_secure ]
                </div>
              )}
            </div>
          </div>

          {/* Brands Shield Grid Matrix */}
          <div className="flex-1">
            <div className="text-[8px] font-mono text-muted-foreground/40 mb-2 uppercase tracking-widest flex justify-between">
              <span>[ MATRIX NODE DIAGNOSTICS: 20 SENSORS ACTIVE ]</span>
              {lockdowns.length > 0 && <span className="text-red-500 animate-pulse">[ WARNING: {lockdowns.length} SHIELDS COMPROMISED ]</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 select-none">
              {MONITORED_BRANDS.map((brand) => {
                const isLocked = lockdowns.some(l => l.toLowerCase() === brand.toLowerCase());
                const triggerTitle = isLocked ? getLockdownTriggerTitle(brand) : null;
                
                return (
                  <div
                    key={brand}
                    className={cn(
                      "p-2.5 border font-mono text-[9px] flex flex-col justify-between tracking-widest transition-all duration-300 relative",
                      isLocked
                        ? "bg-red-950/20 border-red-500/40 text-red-400 animate-pulse"
                        : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-emerald-400 hover:border-emerald-500/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold truncate">{brand.toUpperCase()}</span>
                      <span className={cn(
                        "text-[7px] px-1 py-0.2 shrink-0 border uppercase font-bold",
                        isLocked 
                          ? "bg-red-500/10 border-red-500/30 text-red-500" 
                          : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/80"
                      )}>
                        {isLocked ? "LOCKED" : "OK"}
                      </span>
                    </div>

                    {isLocked && triggerTitle && (
                      <p className="text-[7px] text-red-500/50 leading-tight line-clamp-1 mt-1 border-t border-red-950/40 pt-1 uppercase">
                        ↳ {triggerTitle}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. NEWS LEDGER + TERMINAL GRID ═══════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEDGER FEED (Left 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          
          {/* TACTICAL CONTROL BAR */}
          <div className="border border-[#1F1914] bg-[#0C0A09] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Filters Toggles */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setActiveFilter("all"); setShowAll(false); }}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all rounded-none border",
                  activeFilter === "all"
                    ? "bg-primary border-primary text-black"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-foreground hover:border-[#3E3329]"
                )}
              >
                [ ALL_BULLETINS ]
              </button>
              <button
                onClick={() => { setActiveFilter("highlights"); setShowAll(false); }}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all rounded-none border",
                  activeFilter === "highlights"
                    ? "bg-red-500 border-red-600 text-white"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-red-400 hover:border-red-500/30"
                )}
              >
                [ CRITICAL_HIGHLIGHTS ]
              </button>
              <button
                onClick={() => { setActiveFilter("lockdowns"); setShowAll(false); }}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all rounded-none border",
                  activeFilter === "lockdowns"
                    ? "bg-amber-500 border-amber-600 text-black"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-amber-400 hover:border-amber-500/35"
                )}
              >
                [ LOCKDOWN_TRIGGERS ]
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="SEARCH INTEL DOSSIER..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowAll(false); }}
                className="w-full h-9 pl-9 pr-4 bg-[#070605] border border-[#1F1914] focus:border-primary/40 text-foreground font-mono text-[10px] rounded-none outline-none tracking-widest placeholder:text-muted-foreground/30 transition-all uppercase"
              />
            </div>
          </div>

          {/* LEDGER HEADER META */}
          {!loading && (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono font-black text-primary uppercase tracking-[0.2em] bg-primary/5 border border-primary/20 px-3 py-1">
                  [ {filteredIncidents.length} CYBER INTELLIGENCE RECORDS INGESTED ]
                </span>
                {refreshing && (
                  <RefreshCcw className="h-3 w-3 text-primary animate-spin" />
                )}
              </div>
              <span className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-widest hidden sm:inline">
                ACTIVE_NODE: OSINT_LEDGER_A
              </span>
            </div>
          )}

          {/* LEDGER LIST (DOSSIER STYLE CARDS) */}
          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="py-24 text-center border border-[#1F1914] bg-[#0C0A09]">
                <RefreshCcw className="h-6 w-6 text-primary animate-spin mx-auto mb-3" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  DECRYPTING MULTI-FEED INTEL STREAM...
                </p>
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-[#1F1914] bg-[#0C0A09]/20">
                <AlertTriangle className="h-6 w-6 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  [ ALERT: NULL_MATCHING_INTEL_FOR_SECTOR_CRITERIA ]
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {visibleIncidents.map((incident, i) => {
                  const isLockedBrand = lockdowns.some(
                    (brand) => incident.title.toLowerCase().includes(brand.toLowerCase())
                  );
                  return (
                    <div
                      key={`${incident.link}-${i}`}
                      onClick={() => setSelectedIncident(incident)}
                      className={cn(
                        "bg-[#0C0A09] border p-5 flex flex-col gap-4.5 cursor-pointer transition-all duration-300 relative group rounded-none select-text",
                        incident.isHighlight
                          ? "border-red-500/20 hover:border-red-500/55 hover:bg-[#130d0d] shadow-[inset_0_0_20px_rgba(239,68,68,0.01)]"
                          : "border-[#1F1914] hover:border-amber-500/35 hover:bg-[#12100E]"
                      )}
                    >
                      {/* Left indicator bar */}
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300",
                          incident.isHighlight
                            ? "bg-red-600/70 group-hover:bg-red-500"
                            : "bg-[#1E1A17] group-hover:bg-amber-500/80"
                        )}
                      />

                      {/* Asymmetric Corner Details */}
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#3E3329]/40 group-hover:border-primary/30 transition-colors" />
                      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#3E3329]/40 group-hover:border-primary/30 transition-colors" />

                      {/* Header Line - Bracketed Metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-[8.5px] font-mono tracking-widest pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground/40 font-bold">
                            [ ADVISORY #{String(i + 1).padStart(2, "0")} ]
                          </span>
                          <span className="text-primary font-black uppercase">
                            [ NODE: {incident.source.toUpperCase()} ]
                          </span>
                          {incident.isHighlight && (
                            <span className="text-red-400 font-black animate-pulse">
                              [ CLASSIFICATION: CRITICAL ]
                            </span>
                          )}
                          {isLockedBrand && (
                            <span className="text-amber-400 font-bold">
                              [ THREAT: LOCKDOWN_ACTIVE ]
                            </span>
                          )}
                        </div>

                        <span className="text-muted-foreground/60 font-bold flex items-center gap-1 shrink-0">
                          <Timer className="h-2.5 w-2.5" />
                          {formatTimeAgo(incident.publishedAt)}
                        </span>
                      </div>

                      {/* Title & Body */}
                      <div className="pl-2 space-y-2">
                        <h4 className="text-sm font-bold text-[#E7E5E4] group-hover:text-primary transition-colors tracking-wide uppercase leading-relaxed">
                          {incident.title}
                        </h4>
                        <p className="text-[11px] font-mono text-muted-foreground/50 leading-relaxed line-clamp-2 max-w-3xl">
                          {incident.description}
                        </p>
                      </div>

                      {/* Card Footer Tickers */}
                      <div className="flex items-center justify-between border-t border-[#1F1914]/50 pt-3 pl-2">
                        <div className="flex items-center gap-3 text-[8px] font-mono text-muted-foreground/30 tracking-widest">
                          <span>SECTOR_LOG: T-{formatCompactTime(incident.publishedAt)}</span>
                          <span>INTEGRITY_INDEX: 100% SECURE</span>
                        </div>

                        <div className="flex items-center gap-2 text-[9px] font-mono font-black text-muted-foreground/50 group-hover:text-primary transition-colors uppercase tracking-widest">
                          <span>[ ACCESS REPORT ]</span>
                          <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-muted-foreground/40 group-hover:text-primary" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* SHOW MORE / SHOW LESS TOGGLE */}
                {hasMoreItems && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-3.5 bg-[#0C0A09] border border-[#1F1914] hover:border-primary/30 text-[9px] font-mono font-black text-muted-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 rounded-none"
                  >
                    {showAll ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-primary" />
                        [ MINIMIZE LEDGER DATABASE — SHOW {INITIAL_SHOW_COUNT} ITEMS ]
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        [ EXPAND LEDGER DATABASE — SHOW {filteredIncidents.length - INITIAL_SHOW_COUNT} MORE BULLETIN RECORDS ]
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SCRAPER DIAGNOSTICS CONSOLE WIDGET (Right Column) */}
        <div className="lg:col-span-1 flex flex-col h-full min-h-[450px]">
          <div className="border border-[#1F1914] bg-[#0C0A09] overflow-hidden flex flex-col justify-between h-full relative">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#3E3329]/40" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#3E3329]/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#3E3329]/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#3E3329]/40" />

            {/* Terminal Header */}
            <div className="bg-[#15110E] p-3.5 border-b border-[#1F1914] flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">
                  DIAGNOSTIC_OSINT_NODE
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase font-black">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Terminal Screen with CRT Scanline overlay effect */}
            <div className="relative flex-1 bg-[#070605] overflow-hidden p-4 flex flex-col">
              {/* Scanline subtle gradient overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10" />

              <div
                ref={terminalRef}
                className="flex-1 font-mono text-[10px] text-emerald-500 space-y-2.5 overflow-y-auto max-h-[340px] select-text"
              >
                {terminalLogs.map((log, i) => (
                  <div
                    key={i}
                    className={cn(
                      "leading-relaxed tracking-wider break-all border-l-2 pl-2.5",
                      log.includes("ERROR")
                        ? "border-red-500/70 text-red-400"
                        : log.includes("SUCCESS") || log.includes("OK")
                          ? "border-emerald-500/60 text-emerald-400 font-bold"
                          : "border-[#1F1914] text-emerald-500/80"
                    )}
                  >
                    {log}
                  </div>
                ))}
                {syncingScraper && (
                  <div className="text-emerald-400 animate-pulse flex items-center gap-2">
                    <span className="animate-spin">⚙</span>
                    <span>PIPELINE DYNAMIC SCANNING...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Action Trigger */}
            <div className="p-3.5 bg-[#15110E] border-t border-[#1F1914]">
              <Button
                onClick={triggerScraperSync}
                disabled={syncingScraper}
                className={cn(
                  "w-full font-mono text-[10px] font-black tracking-[0.15em] uppercase h-10 rounded-none border transition-all duration-300 relative overflow-hidden",
                  syncingScraper
                    ? "bg-[#0C0A09] border-[#1F1914] text-muted-foreground/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-amber-500/30 text-amber-500 hover:border-amber-500/80 hover:text-[#0C0A09] hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                )}
              >
                {syncingScraper ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                    INGESTING_OSINT_DATAFEEDS...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    RUN_AUTOMATIC_SCRAPER_SCAN
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 4. DECRYPT REPORT MODAL ══════════════════════════════════ */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl border border-primary/50 bg-[#0C0A09] text-foreground rounded-none shadow-[0_0_50px_rgba(255,191,0,0.15)] overflow-hidden relative">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-primary/40" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-primary/40" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-primary/40" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-primary/40" />

            {/* Header banner */}
            <div className="bg-[#15110E] border-b border-[#1F1914] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.25em]">
                  SECURE_OSINT_REPORT_DECRYPTOR_V2.0
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-primary transition-colors p-1 border border-transparent hover:border-[#1F1914] bg-[#070605]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Main console content */}
            <div className="p-6 space-y-5 bg-[#070605]/50">
              {/* Metadata Cluster */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070605] p-4 border border-[#1F1914]">
                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    CLASSIFICATION
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-mono font-black uppercase tracking-wider",
                      selectedIncident.isHighlight ? "text-red-400 animate-pulse" : "text-amber-500"
                    )}
                  >
                    {selectedIncident.isHighlight ? "CRITICAL_BULLETIN" : "STANDARD_VECTOR"}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    INTELLIGENCE_SOURCE
                  </span>
                  <span className="text-[9px] font-mono font-bold text-foreground">
                    {selectedIncident.source.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    DATED_STAMP
                  </span>
                  <span className="text-[9px] font-mono text-foreground font-bold">
                    {new Date(selectedIncident.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">
                    DECRYPTION_INTEGRITY
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    {decryptionProgress}% SECURE
                  </span>
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-1.5 border-b border-[#1F1914] pb-4">
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">
                  SUBJECT_HEADER
                </span>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide leading-relaxed">
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Decrypted payload text screen */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">
                  DECRYPTED_INCIDENT_SUMMARY
                </span>
                <div className="bg-[#070605] p-4 border border-[#1F1914] font-mono text-xs text-muted-foreground/80 leading-relaxed min-h-[120px] select-text">
                  {decryptionText}
                </div>
              </div>

              {/* Warning Lockdown notice if matching a lockdown brand */}
              {lockdowns.some((brand) =>
                selectedIncident.title.toLowerCase().includes(brand.toLowerCase())
              ) && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-3">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
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
                className="font-mono text-[10px] font-bold tracking-widest uppercase px-4 h-9 border-[#1F1914] text-muted-foreground hover:text-foreground rounded-none bg-[#070605]"
              >
                [ CLOSE_CONSOLE ]
              </Button>

              <a
                href={selectedIncident.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase px-5 h-9 bg-primary text-black hover:bg-primary/90 rounded-none transition-colors border border-primary/20"
              >
                [ ACCESS_RSS_ORIGINAL ] <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
