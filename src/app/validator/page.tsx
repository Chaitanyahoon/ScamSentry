"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Fingerprint,
  Globe2,
  Link as LinkIcon,
  Loader2,
  Radar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ForensicReport } from "@/components/forensic-report";

const EXAMPLES = [
  { url: "https://google.com", label: "google.com (Safe)" },
  { url: "http://verify-paypal-login-portal.security-update.xyz/login", label: "paypal-spoof (Malicious)" },
  { url: "https://amazon-rewards-bonus-claims.net/claim", label: "amazon-phish (Malicious)" },
];

export default function ValidatorPage() {
  useEffect(() => {
    document.title = "URL Forensics Console — ScamSentry";
  }, []);

  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const simulateLogs = (callback: () => void) => {
    const logs = [
      "⚡ Initializing ScamSentry Core Engine v2.1.4...",
      "🔍 [Layer 1] Parsing URL syntax and homograph markers...",
      "🔍 [Layer 1] Checking for credential harvesting baits and masked IPs...",
      "🌐 [Layer 2] Resolving domain DNS records & nameservers...",
      "🌐 [Layer 2] Fetching WHOIS registration date & registrar reputations...",
      "🌐 [Layer 2] Verifying SSL/TLS certificates and certificate chains...",
      "📡 [Layer 3] Querying active threat database feeds (URLhaus, PhishTank)...",
      "📡 [Layer 3] Checking community-verified blacklist ledgers...",
      "🧬 [Layer 4] Executing campaign structural correlation...",
      "🧬 [Layer 4] Generating final verdict confidence report...",
    ];

    let current = 0;
    setAnalysisLogs([]);

    const interval = setInterval(() => {
      if (current < logs.length) {
        setAnalysisLogs((prev) => [...prev, logs[current]]);
        current++;
      } else {
        clearInterval(interval);
        callback();
      }
    }, 450);

    return () => clearInterval(interval);
  };

  const handleAnalyze = useCallback(async (targetUrl?: string) => {
    const urlToScan = targetUrl || input;
    if (!urlToScan.trim()) {
      toast({
        title: "Scan Failed",
        description: "Please enter a valid URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (targetUrl) {
      setInput(targetUrl);
    }

    setIsAnalyzing(true);
    setResult(null);
    setAnalysisLogs(["⚡ Commencing forensic scan..."]);

    const executeScan = async () => {
      try {
        const res = await fetch("/api/validator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: urlToScan }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setResult(data);
      } catch (error: any) {
        toast({
          title: "Engine Error",
          description: error.message || "Failed to analyze the URL.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    simulateLogs(executeScan);
  }, [input, toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleAnalyze();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAnalyze]);

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [analysisLogs]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] py-12 text-foreground sm:py-16">
      {/* High-fidelity grid background & dark room styling */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-cyber" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Sleek diagnostics toolbar */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border border-white/5 bg-[#090d16]/60 backdrop-blur-md px-5 py-3 rounded-2xl select-none text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Engine: stable-v2.1
            </span>
            <span className="hidden sm:inline">● Network: Local Node</span>
            <span className="hidden sm:inline">● Mode: Zero-Trust Forensics</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
            System Live
          </div>
        </div>

        {/* Focused Hero section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl font-sans">
            Forensic Link Auditor
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80">
            Inspect URL infrastructure, behavioral heuristic anomalies, and active blacklists using a sandboxed analysis pipeline.
          </p>
        </div>

        {/* Main console shell */}
        <div className="border border-white/10 bg-[#070b14]/90 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header tabs bar representing active audit layers */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.015] px-5 py-4 select-none">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Terminal className="h-4 w-4 text-primary" />
              Diagnostic Console
            </div>
            <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-muted-foreground/60">
              <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> Heuristics</span>
              <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> DNS</span>
              <span className="flex items-center gap-1"><Radar className="h-3 w-3" /> Intel</span>
              <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Graph</span>
            </div>
          </div>

          {/* User Input Payload Box */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2.5">
              <label htmlFor="payload" className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Suspicious Link or Hostname</span>
                <span className="font-mono text-[10px] text-muted-foreground/50 lowercase">ctrl + enter to execute</span>
              </label>
              <div className="relative">
                <Textarea
                  id="payload"
                  placeholder="Paste URL e.g. https://secure-paypal-login-update.com/signin"
                  className="min-h-[120px] w-full resize-none rounded-2xl border-white/10 bg-[#03060f]/60 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground/25 focus-visible:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isAnalyzing}
                />
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2 select-none">
                  {input.trim() && (
                    <span className="text-[10px] font-mono border border-primary/20 bg-primary/5 px-2 py-0.5 rounded text-primary/80">
                      valid input format
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              {/* Preset Examples */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-muted-foreground/50 font-mono">Presets:</span>
                {EXAMPLES.map((example) => (
                  <button
                    key={example.url}
                    onClick={() => handleAnalyze(example.url)}
                    disabled={isAnalyzing}
                    className="px-2.5 py-1 border border-white/5 hover:border-primary/20 bg-white/[0.015] hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-all duration-200 cursor-pointer text-[10px] font-mono"
                  >
                    {example.label}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !input.trim()}
                className="h-11 px-6 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all select-none cursor-pointer shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Auditing URL
                  </>
                ) : (
                  <>
                    Analyze Link <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Interactive audit logger */}
          {isAnalyzing && (
            <div className="border-t border-white/10 bg-black/40 p-5 sm:p-6 font-mono text-xs text-primary/90 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 select-none pb-2 border-b border-white/5">
                <span>ANALYSIS PIPELINE STREAM</span>
                <span className="animate-pulse flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  PROCESSING
                </span>
              </div>
              <div 
                ref={logContainerRef} 
                className="max-h-[160px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2"
              >
                {analysisLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2.5 transition-opacity duration-300">
                    <span className="text-primary/40 shrink-0 select-none">&gt;&gt;</span>
                    <p className="leading-5">{log}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sandbox warning footer */}
          <div className="border-t border-white/10 bg-white/[0.01] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-muted-foreground/60 font-mono select-none">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
              Do not scan credentials, OTPs, or private API keys.
            </span>
            <span>All reports are fully explainable.</span>
          </div>

        </div>

        {/* Empty State Instructions */}
        {!isAnalyzing && !result && (
          <div className="mt-8 border border-white/5 bg-[#070b14]/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Forensics Sandbox Idle
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/80 max-w-xl">
                Paste a suspicious address, click on a preset link, or press <kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded font-mono text-[9px]">Ctrl+Enter</kbd> to initiate the validation engine.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Forensic Report Panel */}
        {!isAnalyzing && result && (
          <div className="mt-8">
            <ForensicReport
              url={input}
              report={result.forensicReport}
              finalScore={result.finalScore}
              riskLevel={result.riskLevel}
            />
          </div>
        )}

      </div>
    </div>
  );
}
