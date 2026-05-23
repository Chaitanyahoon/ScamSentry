"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { 
  Key, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Zap, 
  Clock,
  ArrowUpRight,
  Fingerprint,
  Database
} from "lucide-react"
import { getAnalyticsMetrics, ScanEvent, getRecentScans } from "@/lib/analytics"
import { cn } from "@/lib/utils"

export default function ApiDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [apiKey, setApiKey] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      if (!user) return
      // 1. Fetch API Key
      const q = query(collection(db, "api_keys"), where("userId", "==", user.uid), where("status", "==", "active"))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        const keyData = { id: snapshot.docs[0].id, ...data } as any
        setApiKey(keyData)
        
        // 2. Fetch Metrics & Scans for this key
        const [m, s] = await Promise.all([
          getAnalyticsMetrics(keyData.key, 30),
          getRecentScans(keyData.key, 7)
        ])
        setMetrics(m)
        setRecentScans(s)
      }
    } catch (e) {
      console.error("Dashboard data fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  const generateKey = async () => {
    if (!user) return
    setIsGenerating(true)
    try {
      const newKey = "ss_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const keyData = {
        userId: user.uid,
        key: newKey,
        status: "active",
        planLimit: 1000,
        usageCount: 0,
        createdAt: serverTimestamp()
      }
      await addDoc(collection(db, "api_keys"), keyData)
      fetchDashboardData()
    } catch (e) {
      console.error("Key generation error:", e)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Decrypting Forensic Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-fade-in stagger-1 relative overflow-hidden">
      {/* Page Header - Command Center Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#1F1914] pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-primary">
            <Terminal className="h-4 w-4" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">NODE_ACCESS_POINT</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground font-mono tracking-tighter uppercase leading-none">
            API_<span className="text-primary text-glow-amber">CENTRAL</span>
          </h1>
          <p className="text-muted-foreground/60 font-mono text-[11px] uppercase tracking-wider max-w-xl border-l border-primary/20 pl-4 mt-4">
            Manage high-performance forensic keys and monitor real-time deterministic threat landscape hits. Secure Protocol v2.3 Active.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#15110E] border border-[#1F1914] px-5 py-3 flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,191,0,0.8)]"></div>
            <span className="text-[10px] font-mono font-bold uppercase text-foreground/80 tracking-widest leading-none">ENGINE_ONLINE_v2.3</span>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="TOTAL_SCANS" 
          value={metrics?.totalScans || 0} 
          icon={Activity} 
          trend="+12%_CONSENSUS_UP"
        />
        <StatCard 
          label="THREATS_DEFLECTED" 
          value={metrics?.threatsDetected || 0} 
          icon={ShieldAlert} 
          color="text-primary"
          trend="DETECTION_PEAK_STABLE"
        />
        <StatCard 
          label="ENGINE_LATENCY" 
          value="42ms" 
          icon={Zap} 
          trend="DETERMINISTIC_LOCK"
        />
        <StatCard 
          label="LAYER_INTEGRITY" 
          value="100%" 
          icon={ShieldCheck} 
          trend="L1-L5_FULLY_LOADED"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: API Key Management - Modular Box */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#15110E] border border-[#1F1914] relative group transition-all duration-500 hover:border-primary/30">
            {/* Corner Decorative Dots */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/20 group-hover:border-primary/50 transition-colors" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/20 group-hover:border-primary/50 transition-colors" />
            
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-[#1F1914] pb-6">
                <h2 className="text-sm font-bold font-mono text-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                  <Key className="h-4 w-4 text-primary" />
                  ACCESS_CREDENTIALS
                </h2>
              </div>

              {!apiKey ? (
                <div className="text-center py-12 space-y-8">
                  <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em] leading-loose">No active API keys found in current directory. Initiate generation protocol to begin integration.</p>
                  <Button onClick={generateKey} disabled={isGenerating} className="w-full h-12 rounded-none font-mono text-[10px] font-bold uppercase tracking-widest bg-primary text-black hover:bg-white transition-all">
                    {isGenerating ? "INITIALIZING..." : "GENERATE_PRODUCTION_KEY"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-mono font-bold text-muted-foreground/40 uppercase tracking-[0.3em] block">PRODUCTION_KEY_LIVE</label>
                    <div className="relative group/key">
                      <div className="bg-[#0C0A09] border border-[#1F1914] p-5 font-mono text-xs text-primary transition-all duration-300 group-hover/key:border-primary/30 flex items-center justify-between">
                        <span className="truncate tracking-wider">{apiKey.key}</span>
                        <button onClick={copyToClipboard} className="text-muted-foreground hover:text-primary transition-colors ml-4 shrink-0">
                          {copied ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Usage Telemetry */}
                  <div className="space-y-6 pt-6 border-t border-[#1F1914]">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">USAGE_LIMIT_QUOTA</span>
                        <div className="text-lg font-mono font-bold text-foreground">
                          {apiKey.usageCount || 0} <span className="text-muted-foreground/30 font-normal">/</span> {apiKey.planLimit || 1000}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-primary/60 uppercase font-bold tracking-[0.2em]">Tier: STANDARD</span>
                    </div>
                    
                    <div className="h-0.5 w-full bg-[#1F1914] overflow-hidden">
                      <div 
                        className="bg-primary h-full shadow-[0_0_10px_rgba(255,191,0,0.8)] transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(((apiKey.usageCount || 0) / (apiKey.planLimit || 1000)) * 100, 100)}%` }}
                      />
                    </div>
                    
                    <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em] text-center">Protocol Reset in T-12 Days: 14:22:01</p>
                  </div>

                  <Button variant="ghost" className="w-full h-10 rounded-none text-[8px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/20 transition-all">
                    REVOKE_AND_VOID_CREDENTIALS
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Terminal Guide - High Fidelity */}
          <div className="bg-[#15110E] border border-[#1F1914] p-8 space-y-6">
            <h2 className="text-[10px] font-bold font-mono text-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
              <Terminal className="h-4 w-4 text-primary/50" />
              INTEGRATION_SNIPPET
            </h2>
            <div className="bg-[#0C0A09] p-5 border border-[#1F1914] font-mono text-[10px] text-muted-foreground/70 space-y-2 overflow-x-auto leading-relaxed">
              <p><span className="text-primary font-bold">curl</span> -X POST https://api.scamsentry.com/v1/verify \</p>
              <p>  -H "auth-token: {apiKey?.key || 'ss_live_...'}" \</p>
              <p>  -d <span className="text-primary/40">{`'{"target": "sus-link.xyz"}'`}</span></p>
            </div>
          </div>
        </div>

        {/* Right Side: Forensic Logs - High Fidelity HUD Table */}
        <div className="lg:col-span-8 h-full">
          <div className="bg-[#15110E] border border-[#1F1914] flex flex-col h-full relative group">
             {/* Corner Decorative Accents */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#1F1914] group-hover:border-primary/20 transition-colors" />
            
            <div className="p-8 border-b border-[#1F1914] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold font-mono text-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                  <Database className="h-4 w-4 text-primary" />
                  LIVE_FORENSIC_LEDGER
                </h2>
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em]">Synchronizing Intelligence Nodes Across 12 Clusters</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-1 bg-primary/5 border border-primary/10 rounded-none">
                <Activity className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest">REAL_TIME_SYNC</span>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto p-2">
              <table className="w-full text-left">
                <thead className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] border-b border-[#1F1914]">
                  <tr>
                    <th className="px-6 py-5">TARGET_PAYLOAD</th>
                    <th className="px-6 py-5 text-center">TRUST_SCORE</th>
                    <th className="px-6 py-5">FORENSIC_NODE_ID</th>
                    <th className="px-6 py-5 text-right">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1914]/30">
                  {recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <ShieldAlert className="h-12 w-12 text-muted-foreground" />
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">No telemetry signatures detected in current partition.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentScans.map((scan, idx) => (
                      <tr key={idx} className="hover:bg-[#0C0A09]/50 transition-all group/row duration-300">
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-mono text-foreground/90 font-bold truncate max-w-[280px] group-hover/row:text-primary transition-colors">{scan.url}</span>
                            <div className={cn(
                              "text-[8px] uppercase font-bold px-2 py-0.5 border w-fit font-mono tracking-widest transition-all",
                              scan.riskLevel === "Secure" ? "border-primary/20 text-primary bg-primary/5" :
                              scan.riskLevel === "Suspicious" ? "border-amber-500/20 text-amber-500 bg-amber-500/5" : 
                              "border-destructive/20 text-destructive bg-destructive/5 shadow-[0_0_10px_rgba(192,41,42,0.1)]"
                            )}>
                              {scan.riskLevel}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className={cn(
                            "text-xl font-mono font-bold tracking-tighter transition-all",
                            scan.finalScore > 70 ? "text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]" :
                            scan.finalScore > 30 ? "text-amber-500" : "text-destructive shadow-[0_0_10px_rgba(192,41,42,0.5)]"
                          )}>
                            {scan.finalScore}<span className="text-[10px] opacity-20 font-normal ml-1">/100</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-mono text-[10px] text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors uppercase tracking-widest">
                          {scan.id?.substring(0, 12)}
                        </td>
                        <td className="px-6 py-6 text-right text-[10px] font-mono text-muted-foreground/40 group-hover:text-muted-foreground/80 transition-colors">
                          {new Date(scan.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-[#1F1914] bg-[#0C0A09] flex justify-center">
              <Button variant="ghost" className="text-[10px] font-mono font-bold text-primary hover:bg-primary/5 uppercase tracking-[0.2em] h-10 rounded-none px-10 transition-all">
                REQUEST_FULL_LEDGER_DUMP <ArrowUpRight className="h-3 w-3 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, trend, color = "text-foreground" }: any) {
  return (
    <div className="bg-[#15110E] border border-[#1F1914] p-8 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-[0.05] group-hover:opacity-[0.15] transition-opacity" />
      
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center border-b border-[#1F1914] pb-4">
          <h4 className="text-[9px] font-mono font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">{label}</h4>
          <Icon className="h-4 w-4 text-primary/30 group-hover:text-primary transition-colors" />
        </div>
        
        <div className="space-y-1">
          <p className={cn("text-4xl font-bold font-mono tracking-tighter", color)}>{value}</p>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 bg-primary/60 rounded-full animate-pulse" />
            <p className="text-[9px] font-mono text-primary/40 uppercase tracking-widest leading-none">{trend}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
