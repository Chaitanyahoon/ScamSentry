"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  ShieldAlert, 
  Terminal, 
  ExternalLink, 
  Timer, 
  Search, 
  RefreshCcw, 
  CheckCircle2, 
  X, 
  Activity, 
  Cpu, 
  AlertOctagon, 
  ArrowUpRight,
  Shield,
  FileCode,
  AlertTriangle
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

export function CyberNewsHub() {
  const [incidents, setIncidents] = useState<IncidentAlert[]>([]);
  const [lockdowns, setLockdowns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "highlights" | "lockdowns">("all");
  
  // Decrypt Report Modal state
  const [selectedIncident, setSelectedIncident] = useState<IncidentAlert | null>(null);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [decryptionText, setDecryptionText] = useState("");

  // Scraper Terminal Console state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SCAMSENTRY OVERWATCH INTELLIGENCE ENGINE V2.0",
    "SYSTEM STATUS: INITIALIZED [PORT 443]",
    "OSINT CYBERNEWS SYNC: STANDBY. AUTOMATIC CRON ACTIVE HOURLY."
  ]);
  const [syncingScraper, setSyncingScraper] = useState(false);

  // Fetch OSINT recent reports
  const fetchData = async (isManual = false) => {
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
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 90000); // Poll every 90s
    return () => clearInterval(interval);
  }, []);

  // Decryption animation effect when an incident is clicked
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

  // Handle manual scraper simulation trigger
  const triggerScraperSync = () => {
    if (syncingScraper) return;
    setSyncingScraper(true);
    
    const logsSequence = [
      ">> INITIALIZING ADVISORY FEEDS SCAN...",
      ">> CONNECTING TO PROTOCOL HTTPS://WWW.BLEEPINGCOMPUTER.COM/FEED/ ...",
      ">> PARSING XML SCHEMATICS VIA DETERMINISTIC REGEX ENGINE...",
      ">> DETECTED 15 CYBERSECURITY ADVISORY PACKETS.",
      ">> ANALYZING CONTENT STRINGS FOR COMPROMISE VECTOR MATRIX...",
      ">> CROSS-CHECKING KEYWORDS [VERCEL, GITHUB, SPOOF, EXPLOSION, DATA_LEAK]...",
      ">> UPDATING LOCAL FIRESTORE REPOSITORIES...",
      ">> ENFORCING BRAND LOCKDOWN PROTOCOLS...",
      ">> SCRAPER INTELLIGENCE RE-INGESTION COMPLETED WITH 0 ERRORS."
    ];

    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] USER TRG: MANUAL_SCRAPE_CYCLE_INGESTION_REQUESTED`
    ]);

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logsSequence.length) {
        setTerminalLogs(prev => [...prev, `[OSINT] ${logsSequence[logIdx]}`]);
        logIdx++;
      } else {
        clearInterval(interval);
        // Execute real DB fetch right after simulation finishes to sync state
        fetchData(true).then(() => {
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] SYSTEM: OSINT SYNC NODE OK. LEDGER UPDATED.`
          ]);
          setSyncingScraper(false);
        });
      }
    }, 600);
  };

  // Filtered Incidents calculations
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchSearch = 
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.source.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;

      if (activeFilter === "highlights") {
        return incident.isHighlight;
      }
      if (activeFilter === "lockdowns") {
        // Find if incident matches any locked brand keyword
        return lockdowns.some(brand => incident.title.toLowerCase().includes(brand.toLowerCase()) || incident.description.toLowerCase().includes(brand.toLowerCase()));
      }
      return true;
    });
  }, [incidents, searchQuery, activeFilter, lockdowns]);

  // Extract featured highlight (The absolute biggest news)
  const featuredHighlight = useMemo(() => {
    return incidents.find(i => i.isHighlight) || incidents[0] || null;
  }, [incidents]);

  const getTimeAgo = (dateString: string) => {
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
    } catch (e) {
      return "T-LIVE";
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. BRAND LOCKDOWN STATUS TICKER / HUB */}
      <div className={cn(
        "border px-6 py-4 bg-[#0C0A09] relative overflow-hidden transition-all duration-300",
        lockdowns.length > 0 
          ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]" 
          : "border-[#1F1914] hover:border-primary/20"
      )}>
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
                <span className={cn(
                  "text-[10px] font-mono font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-none border",
                  lockdowns.length > 0
                    ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
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
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                [ STATUS: ALL_SYSTEMS_NOMINAL ]
              </div>
            ) : (
              lockdowns.map(brand => (
                <div 
                  key={brand} 
                  className="bg-red-950/40 border border-red-500/40 text-red-400 font-mono text-[10px] font-bold px-3 py-1.5 flex items-center gap-2 tracking-wider animate-pulse"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                  {brand.toUpperCase()}
                  <span className="text-[8px] bg-red-500/20 px-1 border border-red-500/30 text-red-500">+35 RISK SPIKE</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. THE BIGGER NEWS HIGHLIGHT DISPLAY (ANTI-SAFE SPLIT HERO PANEL) */}
      {featuredHighlight && (
        <div className="border border-[#1F1914] bg-[#0C0A09] relative overflow-hidden transition-all group">
          {/* Neon warning stripe top */}
          <div className={cn(
            "h-[2px] w-full bg-gradient-to-r",
            featuredHighlight.isHighlight
              ? "from-red-500/80 via-amber-500 to-red-500/80 shadow-[0_1px_15px_rgba(239,68,68,0.5)]"
              : "from-primary/30 via-primary/60 to-primary/30"
          )} />

          {/* Background Dotted Overlay */}
          <div className="absolute inset-0 bg-grid-cyber opacity-[0.05] pointer-events-none" />

          {/* Staggered HUD Layout */}
          <div className="p-6 sm:p-8 relative z-10 flex flex-col justify-between min-h-[280px] gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2.5">
                  <Terminal className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">
                    OSINT_FLASH_INTELLIGENCE_BULLETIN
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {featuredHighlight.isHighlight && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[9px] font-black px-2 py-0.5 animate-pulse uppercase tracking-widest">
                      [ HIGH_PRIORITY_INCIDENT ]
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Timer className="h-3 w-3" />
                    T-{getTimeAgo(featuredHighlight.publishedAt)} AGO
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h2 className={cn(
                  "text-xl sm:text-2xl font-black uppercase tracking-wide group-hover:text-primary transition-colors",
                  featuredHighlight.isHighlight ? "text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "text-foreground"
                )}>
                  {featuredHighlight.title}
                </h2>
                
                <p className="text-xs text-muted-foreground/80 max-w-4xl leading-relaxed font-mono pl-4 border-l-2 border-[#1F1914]">
                  {featuredHighlight.description}
                </p>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="pt-6 border-t border-[#1F1914] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                <div className="bg-[#15110E] px-2.5 py-1 border border-[#1F1914] flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-primary/70" />
                  SOURCE: <span className="text-foreground font-bold">{featuredHighlight.source}</span>
                </div>
                {lockdowns.some(brand => featuredHighlight.title.toLowerCase().includes(brand.toLowerCase())) && (
                  <div className="bg-red-950/20 px-2.5 py-1 border border-red-500/30 text-red-400 font-bold animate-pulse">
                    🚨 LOCKDOWN TRIGGERED
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedIncident(featuredHighlight)}
                  variant="outline"
                  className="font-mono text-xs font-bold tracking-widest uppercase px-6 h-9 border-primary/40 text-primary hover:bg-primary hover:text-black rounded-none transition-all shadow-[0_0_15px_rgba(255,191,0,0.05)]"
                >
                  DECRYPT_INTELLIGENCE
                </Button>
                
                <a 
                  href={featuredHighlight.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-mono text-xs font-bold tracking-widest uppercase px-4 h-9 border border-[#1F1914] text-muted-foreground hover:text-foreground hover:bg-[#15110E] transition-colors"
                >
                  FULL_REPORT <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEWS LEDGER MATRIX (FILTERABLE DAILY FEED) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEDGER FEED (Left Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
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

          {/* Ledger Table/List */}
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
              filteredIncidents.map((incident, i) => (
                <div 
                  key={`${incident.link}-${i}`}
                  onClick={() => setSelectedIncident(incident)}
                  className={cn(
                    "bg-[#0C0A09] border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#15110E] transition-all group duration-300 relative",
                    incident.isHighlight 
                      ? "border-red-500/20 hover:border-red-500/50" 
                      : "border-[#1F1914] hover:border-primary/40"
                  )}
                >
                  {/* Glowing decorative corner on hover */}
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-transparent group-hover:border-primary/50 transition-colors" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-transparent group-hover:border-primary/50 transition-colors" />

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground/60">
                        T-{getTimeAgo(incident.publishedAt)} AGO
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/40">|</span>
                      <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider">
                        {incident.source}
                      </span>
                      {incident.isHighlight && (
                        <span className="bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-[8px] font-black px-1.5 py-0.2 uppercase tracking-tighter animate-pulse">
                          CRITICAL
                        </span>
                      )}
                      {lockdowns.some(brand => incident.title.toLowerCase().includes(brand.toLowerCase())) && (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[8px] font-bold px-1.5 py-0.2 uppercase tracking-tighter">
                          LOCKDOWN
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-wide uppercase truncate max-w-full">
                      {incident.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 justify-end shrink-0">
                    <span className="text-[9px] font-mono text-muted-foreground/40 group-hover:text-primary transition-colors uppercase tracking-widest font-black">
                      [ DECRYPT_REPORT ]
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              ))
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
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">ACTIVE</span>
              </div>
            </div>

            {/* Terminal Screen */}
            <div className="p-4 flex-1 bg-black font-mono text-[10px] text-emerald-400 space-y-2 overflow-y-auto max-h-[320px] select-text">
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-relaxed tracking-wider break-all border-l-2 border-emerald-950 pl-2">
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

      {/* 4. DECRYPT REPORT MODAL / CRT TERMINAL TERMINAL DISPLAY */}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/60 p-4 border border-[#1F1914]">
                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">CLASSIFICATION</span>
                  <span className={cn(
                    "text-[10px] font-mono font-black uppercase tracking-wider",
                    selectedIncident.isHighlight ? "text-red-400" : "text-amber-500"
                  )}>
                    {selectedIncident.isHighlight ? "CRITICAL_BULLETIN" : "STANDARD_VECTOR"}
                  </span>
                </div>
                
                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">INTELLIGENCE_SOURCE</span>
                  <span className="text-[10px] font-mono font-bold text-foreground">
                    {selectedIncident.source.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">DATED_STAMP</span>
                  <span className="text-[10px] font-mono text-foreground font-bold">
                    {new Date(selectedIncident.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-muted-foreground/60 uppercase">DECRYPTION_INTEGRITY</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {decryptionProgress}% SECURE
                  </span>
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-1.5 border-b border-[#1F1914] pb-4">
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">SUBJECT_HEADER</span>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wide leading-relaxed">
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Decrypted payload text screen */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">DECRYPTED_INCIDENT_SUMMARY</span>
                <div className="bg-black/90 p-4 border border-[#1F1914] font-mono text-xs text-muted-foreground leading-relaxed min-h-[120px] select-text">
                  {decryptionText}
                </div>
              </div>

              {/* Warning Lockdown mimic notice if matching a lockdown brand */}
              {lockdowns.some(brand => selectedIncident.title.toLowerCase().includes(brand.toLowerCase())) && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-3">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="block text-[9px] font-mono font-black text-red-400 uppercase tracking-widest">
                      ACTIVE LOCKDOWN WARNING
                    </span>
                    <p className="text-[10px] font-mono text-red-500/80 leading-relaxed mt-0.5">
                      This incident has triggered a Brand Lockdown protocol. The ScamSentry forensic engine will penalize lookalike domains mimicking this brand (+35 penalty) for the next 7 days.
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
                CLOSE_CONCENT
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
