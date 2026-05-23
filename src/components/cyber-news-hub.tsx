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
        setTerminalLogs((prev) => [...prev, `[OSINT] ${logsSequence[logIdx]}`]);
        logIdx++;
      } else {
        clearInterval(interval);
        scraperPromise.then((data) => {
          if (data && data.success) {
            fetchData(true).then(() => {
              setTerminalLogs((prev) => [
                ...prev,
                `[OSINT] SCRAPE SUCCESS. TOTAL INGESTED: ${data.processed}`,
                `[OSINT] LOCKDOWNS CREATED: ${data.lockdownsTriggered}`,
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
        className="w-full bg-[#070605] border border-[#1F1914] py-2.5 overflow-hidden flex items-center relative select-none rounded-none"
        onMouseEnter={() => setIsTickerHovered(true)}
        onMouseLeave={() => setIsTickerHovered(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 bg-[#070605] z-10 px-4 border-r border-[#1F1914] flex items-center gap-1.5 font-mono text-[9px] font-black text-muted-foreground/60 uppercase shrink-0">
          <Activity className="h-3 w-3 text-primary shrink-0" />
          <span>BRAND_SHIELDS:</span>
        </div>
        
        {/* Ticker Content */}
        <div 
          className="flex gap-8 px-4 whitespace-nowrap animate-[marquee_50s_linear_infinite] pl-[130px]"
          style={{ animationPlayState: isTickerHovered ? 'paused' : 'running' }}
        >
          {MONITORED_BRANDS.map((brand) => {
            const isLocked = lockdowns.some(l => l.toLowerCase() === brand.toLowerCase());
            return (
              <div 
                key={brand}
                className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider"
              >
                <span className="text-[#888888] font-semibold">{brand}</span>
                <span className={cn(
                  "px-1 py-0.2 text-[8px] font-bold border rounded-none",
                  isLocked 
                    ? "bg-red-500/10 border-red-500/30 text-red-500" 
                    : "bg-emerald-500/5 border-emerald-500/15 text-emerald-500/80"
                )}>
                  {isLocked ? "LOCKDOWN" : "OK"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 2. TACTICAL RADAR EVENTS LOGS & INSPECTOR PANEL ──────────── */}
      {!loading && heroItems.length > 0 && (
        <div 
          className="grid grid-cols-1 lg:grid-cols-3 border border-[#1F1914] bg-[#0C0A09] rounded-none overflow-hidden"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          {/* LEFT PANE: EVENTS RADAR (40% width) */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[#1F1914] flex flex-col justify-between">
            <div className="bg-[#15110E] p-4 border-b border-[#1F1914] flex items-center justify-between">
              <span className="font-mono text-[9px] font-black text-primary uppercase tracking-widest">
                [ 01. ACTIVE_OSINT_RADAR ]
              </span>
              <span className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest">
                STREAM_A
              </span>
            </div>

            <div className="divide-y divide-[#1F1914]/50 overflow-y-auto max-h-[300px] flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#0C0A09] [&::-webkit-scrollbar-thumb]:bg-[#1F1914] hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
              {heroItems.map((item, idx) => {
                const isActive = idx === activeHeroIndex;
                return (
                  <div
                    key={`radar-${idx}`}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={cn(
                      "p-4 cursor-pointer font-mono transition-colors relative flex flex-col gap-1.5",
                      isActive 
                        ? "bg-[#15110E] text-foreground" 
                        : "text-muted-foreground/50 hover:text-foreground hover:bg-[#15110E]/40"
                    )}
                  >
                    {/* Active highlight side line */}
                    {isActive && (
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        item.isHighlight ? "bg-red-500" : "bg-amber-500"
                      )} />
                    )}

                    <div className="flex items-center justify-between text-[8px] tracking-wider">
                      <span className={cn(
                        "font-bold uppercase",
                        isActive ? "text-primary" : "text-muted-foreground/40"
                      )}>
                        {item.source}
                      </span>
                      <span>T-{formatCompactTime(item.publishedAt)}</span>
                    </div>
                    
                    <p className="text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2">
                      {isActive ? ">>> " : ""}{item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE: DOSSIER INSPECTOR SCREEN (60% width) */}
          <div className="lg:col-span-2 bg-[#070605]/50 p-6 flex flex-col justify-between min-h-[300px]">
            {activeHeroItem ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header labels */}
                  <div className="flex flex-wrap gap-2.5 items-center justify-between border-b border-[#1F1914] pb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "rounded-none font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border",
                        activeHeroItem.isHighlight 
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : "bg-amber-500/5 border-amber-500/20 text-amber-500"
                      )}>
                        {activeHeroItem.isHighlight ? "CRITICAL_THREAT" : "STANDARD_VECTOR"}
                      </Badge>
                      <span className="font-mono text-[8px] text-muted-foreground/40 uppercase">
                        DECRYPTED: {activeHeroItem.source}
                      </span>
                    </div>
                    
                    <span className="font-mono text-[9px] text-muted-foreground/60 uppercase">
                      PUBLISHED: {formatTimeAgo(activeHeroItem.publishedAt)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 mt-4 select-text">
                    <h3 className="font-mono text-xs font-black uppercase tracking-wide text-white leading-relaxed">
                      {activeHeroItem.title}
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground/60 leading-relaxed border-l border-[#1F1914] pl-3 py-1">
                      {activeHeroItem.description}
                    </p>
                  </div>
                </div>

                {/* Dossier footer metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1F1914] pt-4 mt-6">
                  <div className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest">
                    ID: {Buffer.from(activeHeroItem.link).toString("hex").substring(0, 16).toUpperCase()}
                  </div>
                  
                  <Button
                    onClick={() => setSelectedIncident(activeHeroItem)}
                    className="font-mono text-[9px] font-black uppercase tracking-widest rounded-none h-8 px-4 border border-[#1F1914] bg-[#0C0A09] hover:bg-primary hover:text-black hover:border-primary transition-all text-muted-foreground hover:text-[#070605]"
                  >
                    [ ACCESS_SECURE_PAYLOAD ]
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 font-mono text-[10px] uppercase">
                [ NO_DOSSIER_SELECTED ]
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. OPERATIONS DIRECTORY LEDGER & TERMINAL SPLIT ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch select-none">
        
        {/* LEFT COLUMN: DIRECTORY LEDGER FEED (2 cols) */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          
          {/* Console headers */}
          <div className="border border-[#1F1914] bg-[#15110E] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#E7E5E4]">
                [ SYSTEM_THREAT_LEDGER ]
              </span>
            </div>

            {/* Filter tags keys */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => { setActiveFilter("all"); setShowAll(false); }}
                className={cn(
                  "px-2.5 py-1 text-[8.5px] font-mono font-bold uppercase tracking-widest border transition-all rounded-none",
                  activeFilter === "all"
                    ? "bg-primary border-primary text-black"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-foreground hover:border-[#3E3329]"
                )}
              >
                [ ALL ]
              </button>
              <button
                onClick={() => { setActiveFilter("highlights"); setShowAll(false); }}
                className={cn(
                  "px-2.5 py-1 text-[8.5px] font-mono font-bold uppercase tracking-widest border transition-all rounded-none",
                  activeFilter === "highlights"
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-red-400"
                )}
              >
                [ HIGH ]
              </button>
              <button
                onClick={() => { setActiveFilter("lockdowns"); setShowAll(false); }}
                className={cn(
                  "px-2.5 py-1 text-[8.5px] font-mono font-bold uppercase tracking-widest border transition-all rounded-none",
                  activeFilter === "lockdowns"
                    ? "bg-amber-500 border-amber-500 text-black"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-amber-400"
                )}
              >
                [ COMPROMISE ]
              </button>
            </div>
          </div>

          {/* Directory Search console */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/30" />
            <input
              type="text"
              placeholder="QUERY TARGET DOMAIN OR FEED SYSTEM..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowAll(false); }}
              className="w-full h-9 pl-9 pr-4 bg-[#0C0A09] border border-[#1F1914] focus:border-primary/20 text-foreground font-mono text-[9px] uppercase tracking-widest placeholder:text-muted-foreground/20 rounded-none outline-none transition-colors"
            />
          </div>

          {/* Table Ledger Directory */}
          <div className="border border-[#1F1914] bg-[#0C0A09] overflow-hidden select-text">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCcw className="h-5 w-5 text-primary animate-spin mx-auto mb-2" />
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">INGESTING DATA FEEDS...</p>
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">[ NO ADVISORIES LOGGED FOR QUERY ]</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left font-mono text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F1914] bg-[#15110E] text-muted-foreground/50 select-none uppercase tracking-widest text-[8px]">
                      <th className="p-3 font-bold">STATUS</th>
                      <th className="p-3 font-bold">SOURCE</th>
                      <th className="p-3 font-bold">ADVISORY VECTOR VECTOR</th>
                      <th className="p-3 font-bold text-right">AGE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1914]/40">
                    {visibleIncidents.map((incident, idx) => (
                      <tr 
                        key={`${incident.link}-${idx}`}
                        onClick={() => setSelectedIncident(incident)}
                        className="hover:bg-[#15110E]/60 transition-colors group cursor-pointer"
                      >
                        <td className="p-3">
                          <span className={cn(
                            "px-1.5 py-0.5 text-[7.5px] font-bold border rounded-none uppercase tracking-wider",
                            incident.isHighlight 
                              ? "bg-red-500/10 border-red-500/30 text-red-500" 
                              : "bg-[#070605] border-[#1F1914] text-muted-foreground/40"
                          )}>
                            {incident.isHighlight ? "ALERT" : "NOMINAL"}
                          </span>
                        </td>
                        <td className="p-3 text-primary uppercase font-bold">{incident.source}</td>
                        <td className="p-3 text-foreground/80 font-bold group-hover:text-primary transition-colors max-w-[220px] sm:max-w-[340px] truncate">
                          {incident.title}
                        </td>
                        <td className="p-3 text-right text-muted-foreground/45 shrink-0 uppercase tracking-wider">
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
              className="w-full py-2.5 bg-[#0C0A09] border border-[#1F1914] text-[9.5px] font-mono font-bold text-muted-foreground/60 hover:text-primary hover:border-primary/20 uppercase tracking-widest rounded-none transition-all"
            >
              {showAll ? "[ COLLAPSE LIST DATABASE ]" : `[ EXPAND LEDGER DATABASE — SHOW ${filteredIncidents.length - INITIAL_SHOW_COUNT} MORE BULLETIN RECORDS ]`}
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: CORE MONITOR TERMINAL CONSOLE (1 col) */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          
          <div className="border border-[#1F1914] bg-[#0C0A09] p-4 flex flex-col justify-between select-none relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1F1914]">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase">
                  SYSTEM DIAGNOSTICS NODE
                </span>
              </div>
              
              <div className="space-y-3 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/40">ENGINE_CORE</span>
                  <span className="text-foreground/80 font-bold">V2.1.4-STABLE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/40">FIRESTORE_DB</span>
                  <span className="text-emerald-500 font-bold uppercase">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/40">FEED_NODES</span>
                  <div className="text-right text-[8.5px] text-muted-foreground/60 space-y-0.5">
                    <p>✓ BLEEPINGCOMPUTER</p>
                    <p>✓ HACKER NEWS</p>
                    <p>✓ KREBS ON SECURITY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Log Console Output terminal */}
          <div className="flex flex-col justify-between border border-[#1F1914] bg-[#070605] overflow-hidden min-h-[220px] flex-1">
            <div className="bg-[#15110E] p-3 border-b border-[#1F1914] flex items-center justify-between select-none">
              <span className="font-mono text-[9px] font-bold text-foreground uppercase tracking-widest">
                INGESTION_SHELL_CON
              </span>
              <span className="font-mono text-[8px] text-emerald-400 bg-stone-900 border border-[#1F1914] px-1.5 py-0.5 uppercase tracking-wider font-bold">
                SYS_LOGS
              </span>
            </div>

            <div
              ref={terminalRef}
              className="p-3.5 flex-1 bg-[#070605] font-mono text-[9.5px] text-emerald-500 space-y-2 overflow-y-auto max-h-[160px] select-text [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#070605] [&::-webkit-scrollbar-thumb]:bg-[#1F1914] hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/40"
            >
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-relaxed tracking-wider break-all pl-2.5 border-l border-[#1F1914]",
                    log.includes("ERROR")
                      ? "border-red-500 text-red-500"
                      : log.includes("SUCCESS") || log.includes("OK")
                        ? "border-emerald-500 text-emerald-400 font-bold"
                        : "text-emerald-500/80"
                  )}
                >
                  {log}
                </div>
              ))}
              {syncingScraper && (
                <div className="text-emerald-400 animate-pulse flex items-center gap-1.5">
                  <span>⚙</span>
                  <span>PIPELINE DYNAMIC SCANNING...</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#15110E] border-t border-[#1F1914]">
              <Button
                onClick={triggerScraperSync}
                disabled={syncingScraper}
                className={cn(
                  "w-full font-mono text-[9.5px] font-black tracking-widest uppercase h-9 rounded-none border transition-all duration-300",
                  syncingScraper
                    ? "bg-[#0C0A09] border-[#1F1914] text-muted-foreground/30 cursor-not-allowed"
                    : "bg-[#0C0A09] border-[#1F1914] text-amber-500 hover:bg-amber-500 hover:text-black hover:border-amber-500"
                )}
              >
                {syncingScraper ? "INGESTING_OSINT..." : "[ RUN_AUTOMATIC_SCRAPER_SCAN ]"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. DECRYPT ADVISORY MODAL TERMINAL ──────────────────────── */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl border border-[#1F1914] bg-[#0C0A09] text-foreground rounded-none overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-[#15110E] border-b border-[#1F1914] px-5 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-mono font-black text-primary uppercase tracking-widest">
                  OSINT_REPORT_DECRYPTOR_V2.0
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-primary transition-colors p-1 border border-[#1F1914] bg-[#070605]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-5 bg-[#070605]">
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0C0A09] p-3 border border-[#1F1914] select-none font-mono text-[8.5px]">
                <div>
                  <span className="block text-muted-foreground/40 uppercase">CLASSIFICATION</span>
                  <span className={cn(
                    "font-bold uppercase",
                    selectedIncident.isHighlight ? "text-red-400" : "text-amber-500"
                  )}>
                    {selectedIncident.isHighlight ? "CRITICAL_ALERT" : "STANDARD_VECTOR"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/40 uppercase">FEED SOURCE</span>
                  <span className="font-bold text-foreground uppercase">{selectedIncident.source}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/40 uppercase">DATED_STAMP</span>
                  <span className="font-bold text-foreground">
                    {new Date(selectedIncident.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/40 uppercase">INTEGRITY</span>
                  <span className="font-bold text-emerald-400">{decryptionProgress}% SECURE</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5 border-b border-[#1F1914] pb-3">
                <span className="text-[8px] font-mono text-muted-foreground/45 uppercase block select-none">SUBJECT</span>
                <h3 className="text-xs font-mono font-black text-foreground uppercase tracking-wide leading-relaxed">
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Typewriter details */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono text-muted-foreground/45 uppercase block select-none">DECRYPTED DATA</span>
                <div className="bg-[#0C0A09] p-4 border border-[#1F1914] font-mono text-[10.5px] text-muted-foreground/80 leading-relaxed min-h-[100px] max-h-[220px] overflow-y-auto select-text whitespace-pre-wrap [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#0C0A09] [&::-webkit-scrollbar-thumb]:bg-[#1F1914] hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
                  {decryptionText}
                </div>
              </div>

              {/* Active lockdown warning panel */}
              {lockdowns.some((brand) =>
                selectedIncident.title.toLowerCase().includes(brand.toLowerCase())
              ) && (
                <div className="bg-red-500/5 border border-red-500/20 p-3.5 flex items-start gap-3">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[8.5px] font-mono font-black text-red-500 uppercase tracking-widest">
                      ACTIVE LOCKDOWN PROTOCOL INITIATED
                    </span>
                    <p className="text-[9.5px] font-mono text-red-500/70 leading-relaxed mt-0.5">
                      This incident matches an active monitored brand. Lookalike domains mimicking this brand are automatically subject to immediate reputation penalty in our scanning engines.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#15110E] border-t border-[#1F1914] px-6 py-4 flex items-center justify-between gap-4 select-none">
              <Button
                onClick={() => setSelectedIncident(null)}
                variant="outline"
                className="font-mono text-[9px] font-bold tracking-widest uppercase px-4 h-8 border-[#1F1914] text-muted-foreground hover:text-foreground rounded-none bg-[#0C0A09]"
              >
                [ CLOSE ]
              </Button>

              <a
                href={selectedIncident.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 font-mono text-[9px] font-black tracking-widest uppercase px-4 h-8 bg-[#0C0A09] text-primary hover:bg-primary hover:text-black border border-[#1F1914] hover:border-primary rounded-none transition-all"
              >
                [ ACCESS_SOURCE ] <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
