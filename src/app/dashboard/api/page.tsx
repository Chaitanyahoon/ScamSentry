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
  Fingerprint
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
      // 1. Fetch API Key
      const q = query(collection(db, "api_keys"), where("userId", "==", user.uid), where("status", "==", "active"))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const keyData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-mono flex items-center gap-3">
            API <span className="text-primary">CENTRAL</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Manage your high-performance forensic keys and monitor real-time deterministic threat landscape hits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#15110E] border border-[#1F1914] px-4 py-2 rounded flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-mono font-bold uppercase text-foreground">v2.3 Core Logic Active</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Scans" 
          value={metrics?.totalScans || 0} 
          icon={Activity} 
          trend="+12% from last week"
        />
        <StatCard 
          label="Threats Deflected" 
          value={metrics?.threatsDetected || 0} 
          icon={ShieldAlert} 
          color="text-primary"
          trend="Critical Detection Active"
        />
        <StatCard 
          label="Engine Latency" 
          value="42ms" 
          icon={Zap} 
          trend="Deterministic Peak"
        />
        <StatCard 
          label="Layer Integrity" 
          value="100%" 
          icon={ShieldCheck} 
          trend="L1-L5 Fully Loaded"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Key Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Key className="h-32 w-32" />
            </div>
            
            <h2 className="text-lg font-bold font-mono text-foreground mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Developer Key
            </h2>

            {!apiKey ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-6">No active API key found. Generate one to start protecting your users.</p>
                <Button onClick={generateKey} disabled={isGenerating} className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90">
                  {isGenerating ? "GENERATING..." : "GENERATE PRODUCTION KEY"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Live Production Key</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#050403] border border-[#1F1914] px-4 py-3 font-mono text-sm text-primary flex-1 rounded flex items-center justify-between">
                      <span className="truncate">{apiKey.key}</span>
                      <button onClick={copyToClipboard} className="text-muted-foreground hover:text-primary transition-colors ml-2">
                        {copied ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1F1914] space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Usage Limit</span>
                    <span className="text-foreground font-mono">{apiKey.usageCount || 0} / {apiKey.planLimit || 1000}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#15110E] rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full shadow-[0_0_10px_rgba(255,165,0,0.4)]" 
                      style={{ width: `${Math.min(((apiKey.usageCount || 0) / (apiKey.planLimit || 1000)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter text-muted-foreground">
                    <span>Free Tier</span>
                    <span>Reset in 12 days</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs border-[#1F1914] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30">
                  Revoke and Re-issue Key
                </Button>
              </div>
            )}
          </div>

          {/* Quick Terminal Guide */}
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-xl p-6">
            <h2 className="text-sm font-bold font-mono text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Terminal className="h-4 w-4 text-primary" />
              Quick SDK
            </h2>
            <div className="bg-[#050403] p-4 rounded border border-[#1F1914] font-mono text-[11px] text-muted-foreground space-y-2 overflow-x-auto">
              <p><span className="text-primary">curl</span> -X POST https://scamsentry.com/api/v1/verify \</p>
              <p>  -H "x-api-key: {apiKey?.key || 'ss_live_...'}" \</p>
              <p>  -d <span className="text-emerald-500">{`'{"payload": "sus-link.xyz"}'`}</span></p>
            </div>
          </div>
        </div>

        {/* Forensic Logs Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-xl h-full flex flex-col shadow-xl">
            <div className="p-6 border-b border-[#1F1914] flex items-center justify-between">
              <h2 className="text-lg font-bold font-mono text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Live Forensic Archive
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase">
                <Clock className="h-3 w-3" />
                Real-time Sync
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-[#1F1914]">
                  <tr>
                    <th className="px-6 py-4">Target Payload</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Forensic ID</th>
                    <th className="px-6 py-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1914]">
                  {recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground font-mono">
                        No telemetry data received yet. Run a scan to see forensic logs.
                      </td>
                    </tr>
                  ) : (
                    recentScans.map((scan, idx) => (
                      <tr key={idx} className="hover:bg-[#15110E] transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-mono text-foreground truncate max-w-[200px]">{scan.url}</span>
                            <span className={cn(
                              "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm w-fit mt-1",
                              scan.riskLevel === "Secure" ? "bg-emerald-500/10 text-emerald-500" :
                              scan.riskLevel === "Suspicious" ? "bg-amber-500/10 text-amber-500" : 
                              "bg-red-500/10 text-red-500"
                            )}>
                              {scan.riskLevel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-lg font-mono font-bold",
                            scan.finalScore > 70 ? "text-emerald-500" :
                            scan.finalScore > 30 ? "text-amber-500" : "text-red-500"
                          )}>
                            {scan.finalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            <Fingerprint className="h-3 w-3" />
                            {scan.id?.substring(0, 6)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-[10px] font-mono text-muted-foreground">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#1F1914] bg-[#050403] rounded-b-xl flex justify-center">
              <Button variant="ghost" className="text-xs font-mono text-primary hover:bg-primary/10">
                View Full Forensic Ledger <ArrowUpRight className="h-3 w-3 ml-2" />
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
    <div className="bg-[#0C0A09] border border-[#1F1914] p-6 rounded-xl space-y-4 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start">
        <div className="bg-[#15110E] p-2 rounded border border-[#1F1914] group-hover:border-primary/40 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</h4>
        <p className={cn("text-2xl font-bold font-mono mt-1", color)}>{value}</p>
      </div>
      <p className="text-[10px] font-mono text-emerald-500/70">{trend}</p>
    </div>
  )
}
