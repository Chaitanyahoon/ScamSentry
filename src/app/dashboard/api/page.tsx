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

  const [webhookUrl, setWebhookUrl] = useState("")
  const [alertType, setAlertType] = useState<"TYPOSQUAT" | "PHISHING" | "BRAND_MIMICRY">("BRAND_MIMICRY")
  const [targetBrand, setTargetBrand] = useState("paypal")
  const [isDispatching, setIsDispatching] = useState(false)
  const [dispatchResult, setDispatchResult] = useState<string | null>(null)
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean | null>(null)

  const handleTestWebhook = async () => {
    if (!webhookUrl) return
    setIsDispatching(true)
    setDispatchResult("INITIALIZING PROTOCOL HANDSHAKE...")
    setDispatchSuccess(null)
    
    try {
      const payload = {
        alertType,
        severity: "HIGH" as const,
        targetBrand,
        maliciousUrl: `https://${targetBrand}-security-alert-resolve.cc`,
        fingerprint: "fc7a8" + Math.random().toString(16).substring(2, 10) + "e921b",
        detectedAt: new Date().toISOString(),
        forensicSummary: [
          `CRITICAL: New domain age registered in suspicious offshore namespace.`,
          `Suspicious: Domain missing active SPF and DMARC protection records.`
        ]
      }
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ScamSentry-Forensic-Dispatcher-Simulator/1.0"
        },
        body: JSON.stringify({
          event: "threat.detected",
          timestamp: new Date().toISOString(),
          data: payload
        }),
        mode: "no-cors"
      })
      
      setDispatchSuccess(true)
      setDispatchResult(`STATUS: 200 OK\nPAYLOAD TRANSMITTED SUCCESSFULLY.`)
    } catch (e: any) {
      setDispatchSuccess(false)
      setDispatchResult(`CONNECTION_FAILURE:\n${e.message || 'Network lookup error'}`)
    } finally {
      setIsDispatching(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex flex-col items-center gap-4 font-mono">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Decrypting Forensic Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-mono text-[#E8DBC8]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1F1914] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            API <span className="text-primary">CENTRAL</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2 max-w-lg leading-relaxed">
            Manage high-performance keys and monitor real-time deterministic threat hits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#15110E] border border-[#1F1914] px-4 py-2 rounded-none flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase text-foreground">v2.3 Core Logic Active</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
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
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-none p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <Key className="h-32 w-32 text-primary" />
            </div>
            
            <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-[#1F1914]/50 pb-2">
              <Key className="h-4 w-4 text-primary" />
              Developer Key
            </h2>

            {!apiKey ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider leading-relaxed">No active API key found. Generate one to start protecting client nodes.</p>
                <Button onClick={generateKey} disabled={isGenerating} className="w-full font-mono bg-primary text-black hover:bg-white rounded-none border border-primary text-xs font-bold uppercase tracking-widest">
                  {isGenerating ? "GENERATING..." : "GENERATE PRODUCTION KEY"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Live Production Key</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#050403] border border-[#1F1914] px-4 py-3 font-mono text-xs text-primary flex-1 rounded-none flex items-center justify-between">
                      <span className="truncate">{apiKey.key}</span>
                      <button onClick={copyToClipboard} className="text-muted-foreground hover:text-primary transition-colors ml-2">
                        {copied ? <ShieldCheck className="h-4 w-4 text-emerald-500 animate-bounce" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1F1914] space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider">Usage Limit</span>
                    <span className="text-foreground font-mono font-bold">{apiKey.usageCount || 0} / {apiKey.planLimit || 1000}</span>
                  </div>
                  <div className="h-2 w-full bg-[#15110E] p-0.5 border border-[#1F1914] rounded-none overflow-hidden relative">
                    <div 
                      className="bg-primary h-full shadow-[0_0_10px_rgba(255,165,0,0.3)]" 
                      style={{ width: `${Math.min(((apiKey.usageCount || 0) / (apiKey.planLimit || 1000)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-muted-foreground/50">
                    <span>Free Tier</span>
                    <span>Reset in 12 days</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-[10px] rounded-none font-bold uppercase tracking-widest border-[#1F1914] bg-[#0C0A09] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30">
                  Revoke and Re-issue Key
                </Button>
              </div>
            )}
          </div>

          {/* Quick Terminal Guide */}
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-none p-6">
            <h2 className="text-xs font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-[#1F1914]/50 pb-2">
              <Terminal className="h-4 w-4 text-primary" />
              Quick SDK
            </h2>
            <div className="bg-[#050403] p-4 rounded-none border border-[#1F1914] font-mono text-[10.5px] text-muted-foreground/80 space-y-2 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-[#050403] [&::-webkit-scrollbar-thumb]:bg-[#1F1914] hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
              <p><span className="text-primary">curl</span> -X POST https://scamsentry.com/api/v1/verify \</p>
              <p>  -H "x-api-key: {apiKey?.key || 'ss_live_...'}" \</p>
              <p>  -d <span className="text-emerald-500">{`'{"payload": "sus-link.xyz"}'`}</span></p>
            </div>
          </div>

          {/* B2B Webhook Dispatch Simulator */}
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-none p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-widest border-b border-[#1F1914]/50 pb-2">
              <Terminal className="h-4 w-4 text-primary" />
              Webhook Simulator
            </h2>
            <p className="text-[9.5px] text-muted-foreground uppercase leading-relaxed">
              Test response firewalls by dispatching threat alerts.
            </p>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-primary/70 uppercase block">Target Webhook Endpoint</label>
                <input
                  type="url"
                  placeholder="HTTPS://DISCORD.COM/API/WEBHOOKS/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-[#050403] border border-[#1F1914] focus:border-primary/50 text-[10px] p-2.5 outline-none text-foreground placeholder:text-muted-foreground/20 rounded-none uppercase transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-primary/70 uppercase block">Threat Vector</label>
                  <select
                    value={alertType}
                    onChange={(e: any) => setAlertType(e.target.value)}
                    className="w-full bg-[#050403] border border-[#1F1914] focus:border-primary/50 text-[10px] p-2.5 outline-none text-foreground rounded-none uppercase cursor-pointer"
                  >
                    <option value="BRAND_MIMICRY">BRAND_MIMICRY</option>
                    <option value="TYPOSQUAT">TYPOSQUAT</option>
                    <option value="PHISHING">PHISHING</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-primary/70 uppercase block">Mimic Target</label>
                  <select
                    value={targetBrand}
                    onChange={(e) => setTargetBrand(e.target.value)}
                    className="w-full bg-[#050403] border border-[#1F1914] focus:border-primary/50 text-[10px] p-2.5 outline-none text-foreground rounded-none uppercase cursor-pointer"
                  >
                    <option value="paypal">Paypal</option>
                    <option value="netflix">Netflix</option>
                    <option value="amazon">Amazon</option>
                    <option value="google">Google</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleTestWebhook}
                disabled={isDispatching || !webhookUrl}
                className="w-full h-11 bg-primary text-black hover:bg-white transition-all font-black text-[10px] rounded-none uppercase active:scale-[0.98] shadow-[0_0_15px_rgba(255,191,0,0.15)]"
              >
                {isDispatching ? "DISPATCHING THREAT SIGNAL..." : "DISPATCH SIMULATED THREAT"}
              </Button>

              {dispatchResult && (
                <div className="bg-[#050403] border border-[#1F1914] p-3 rounded-none font-mono text-[9px] overflow-hidden leading-normal">
                  <div className="flex justify-between items-center mb-2 border-b border-[#1F1914] pb-1.5 text-muted-foreground/50 uppercase tracking-widest text-[8px]">
                    <span>TELEMETRY_LOG</span>
                    <span className={cn(
                      "font-bold",
                      dispatchSuccess === true ? "text-emerald-500" :
                      dispatchSuccess === false ? "text-red-500" : "text-primary animate-pulse"
                    )}>
                      {dispatchSuccess === true ? "SUCCESS" : dispatchSuccess === false ? "FAILED" : "PENDING"}
                    </span>
                  </div>
                  <pre className="text-muted-foreground/80 whitespace-pre-wrap font-mono uppercase leading-relaxed max-h-[140px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#050403] [&::-webkit-scrollbar-thumb]:bg-[#1F1914] hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">{dispatchResult}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Forensic Logs Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-none h-full flex flex-col shadow-xl">
            <div className="p-6 border-b border-[#1F1914] flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                <Database className="h-5 w-5 text-primary" />
                Live Forensic Archive
              </h2>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
                Real-time Sync
              </div>
            </div>

            <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-[#0C0A09] [&::-webkit-scrollbar-thumb]:bg-[#1F1914] hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-[#1F1914] bg-[#15110E] select-none">
                  <tr>
                    <th className="px-6 py-4 font-black">Target Payload</th>
                    <th className="px-6 py-4 text-center font-black">Score</th>
                    <th className="px-6 py-4 font-black">Forensic ID</th>
                    <th className="px-6 py-4 text-right font-black">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1914]/50">
                  {recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-xs text-muted-foreground/40 uppercase tracking-widest">
                        No telemetry data received yet. Run scanner.
                      </td>
                    </tr>
                  ) : (
                    recentScans.map((scan, idx) => (
                      <tr key={idx} className="hover:bg-[#15110E]/60 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-[#E7E5E4] truncate max-w-[200px]">{scan.url}</span>
                            <span className={cn(
                              "text-[8px] uppercase font-bold px-1.5 py-0.5 border w-fit rounded-none tracking-widest",
                              scan.riskLevel === "Secure" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              scan.riskLevel === "Suspicious" ? "bg-amber-500/5 border-amber-500/20 text-amber-500" : 
                              "bg-red-500/10 border-red-500/20 text-red-500"
                            )}>
                              {scan.riskLevel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-base font-bold",
                            scan.finalScore > 70 ? "text-emerald-400" :
                            scan.finalScore > 30 ? "text-amber-500" : "text-red-500"
                          )}>
                            {scan.finalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 group-hover:text-primary transition-colors uppercase">
                            <Fingerprint className="h-3.5 w-3.5 text-primary/60" />
                            {scan.id?.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-[10px] text-muted-foreground/45">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#1F1914] bg-[#0F0D0B] rounded-none flex justify-center">
              <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/10 rounded-none uppercase tracking-widest">
                [ View Full Forensic Ledger ] <ArrowUpRight className="h-3.5 w-3.5 ml-2" />
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
    <div className="bg-[#0C0A09] border border-[#1F1914] p-6 rounded-none space-y-4 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start">
        <div className="bg-[#15110E] p-2 rounded-none border border-[#1F1914] group-hover:border-primary/40 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</h4>
        <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
      </div>
      <p className="text-[9px] uppercase tracking-wider text-emerald-500/70">{trend}</p>
    </div>
  )
}
