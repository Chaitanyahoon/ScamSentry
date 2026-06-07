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
  Database,
  CheckCircle2,
  Trash2,
  X,
  Crown,
  IndianRupee,
  QrCode,
  Sparkles
} from "lucide-react"
import { getAnalyticsMetrics, ScanEvent, getRecentScans } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const PLANS = {
  free: { name: 'Free', price: 0, limit: 1000, rateLimit: '5 req/min', features: ['1,000 scans/month', '5 requests/minute', 'Community support'] },
  pro: { name: 'Pro', price: 199, limit: 50000, rateLimit: '60 req/min', features: ['50,000 scans/month', '60 requests/minute', 'Priority webhook alerts', 'Email support'] },
  enterprise: { name: 'Enterprise', price: 999, limit: 500000, rateLimit: '300 req/min', features: ['500,000 scans/month', '300 requests/minute', 'Custom webhook configs', 'Dedicated support', 'SLA guarantee'] }
}
const UPI_ID = 'chaitanyapatil700-1@oksbi'
const UPI_NAME = 'ScamSentry'

export default function ApiDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
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

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise' | null>(null)
  const [utrNumber, setUtrNumber] = useState('')
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  const getUpiQrUrl = (amount: number, planName: string) => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${amount}&cu=INR&tn=${encodeURIComponent(planName + ' Plan Upgrade - ScamSentry')}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`
  }

  const submitPaymentRequest = async () => {
    if (!user || !selectedPlan || !utrNumber.trim() || !apiKey) return
    setIsSubmittingPayment(true)
    try {
      const plan = PLANS[selectedPlan]
      await addDoc(collection(db, 'payment_requests'), {
        userId: user.uid,
        email: user.email || '',
        apiKeyId: apiKey.id,
        currentTier: apiKey.tier || 'free',
        requestedTier: selectedPlan,
        amount: plan.price,
        utrNumber: utrNumber.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      })
      toast({
        title: 'Upgrade Request Submitted',
        description: 'Your payment is being verified. Your plan will be upgraded within 24 hours.',
      })
      setShowUpgradeModal(false)
      setUtrNumber('')
      setSelectedPlan(null)
    } catch (e) {
      console.error('Payment request error:', e)
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your upgrade request. Please try again.',
      })
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const handleTestWebhook = async () => {
    if (!webhookUrl || !user) return
    setIsDispatching(true)
    setDispatchResult("Initializing secure server connection...")
    setDispatchSuccess(null)
    
    try {
      const idToken = await user.getIdToken()
      
      const response = await fetch("/api/dashboard/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          webhookUrl,
          alertType,
          targetBrand
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setDispatchSuccess(true)
        setDispatchResult(`STATUS: ${data.status} ${data.statusText || 'OK'}\n\nServer Response:\n${data.responseText || 'No response body'}`)
        toast({
          title: "Test Webhook Dispatched",
          description: "The simulated threat payload was sent successfully.",
        })
      } else {
        setDispatchSuccess(false)
        setDispatchResult(`DISPATCH_FAILURE (HTTP ${data.status || response.status}):\n${data.message || data.error || 'Server connection failed'}`)
        toast({
          variant: "destructive",
          title: "Webhook Dispatch Failed",
          description: data.message || data.error || "Failed to reach the webhook endpoint.",
        })
      }
    } catch (e: any) {
      setDispatchSuccess(false)
      setDispatchResult(`SIMULATOR_ERROR:\n${e.message || 'Failed to dispatch'}`)
      toast({
        variant: "destructive",
        title: "Webhook Dispatch Failed",
        description: e.message || "Failed to communicate with proxy dispatch engine.",
      })
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
          getAnalyticsMetrics(keyData.id, 30),
          getRecentScans(keyData.id, 7)
        ])
        setMetrics(m)
        setRecentScans(s)
      } else {
        setApiKey(null)
        setMetrics(null)
        setRecentScans([])
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
      // Check if key already exists
      const q = query(collection(db, "api_keys"), where("userId", "==", user.uid), where("status", "==", "active"))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        toast({
          title: "Key Already Exists",
          description: "An active API key already exists for your account. Please rotate it if needed.",
          variant: "destructive"
        })
        await fetchDashboardData()
        return
      }

      const newKey = "ss_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const keyData = {
        userId: user.uid,
        email: user.email || "",
        key: newKey,
        status: "active",
        tier: "free",
        planLimit: 1000,
        usageCount: 0,
        createdAt: serverTimestamp()
      }
      await addDoc(collection(db, "api_keys"), keyData)
      toast({
        title: "API Key Generated",
        description: "Your live production API key is ready to protect nodes.",
      })
      await fetchDashboardData()
    } catch (e) {
      console.error("Key generation error:", e)
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating your API key.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRevokeAndReissue = async () => {
    if (!user || !apiKey) return
    
    const confirmed = window.confirm(
      "CRITICAL ACTION: Are you sure you want to revoke this API key? All applications using it will immediately fail with a 401 Unauthorized status. A new active key will be generated in its place."
    )
    
    if (!confirmed) return
    setIsGenerating(true)
    
    try {
      // 1. Revoke the current key
      const keyDocRef = doc(db, "api_keys", apiKey.id)
      await updateDoc(keyDocRef, {
        status: "revoked",
        revokedAt: serverTimestamp()
      })
      
      // 2. Generate a new key under the same tier and quota limits
      const newKey = "ss_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const keyData = {
        userId: user.uid,
        email: user.email || "",
        key: newKey,
        status: "active",
        tier: apiKey.tier || "free",
        planLimit: apiKey.planLimit || 1000,
        usageCount: apiKey.usageCount || 0,
        createdAt: serverTimestamp()
      }
      
      await addDoc(collection(db, "api_keys"), keyData)
      
      toast({
        title: "API Key Rotated",
        description: "Your old key was revoked and a new active key has been generated.",
      })
      
      setApiKey(null)
      await fetchDashboardData()
    } catch (e) {
      console.error("Revoke & reissue error:", e)
      toast({
        variant: "destructive",
        title: "Rotation Failed",
        description: "Failed to rotate your developer API key.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key)
      setCopied(true)
      toast({
        title: "Copied to Clipboard",
        description: "API key copied successfully.",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentTier = (apiKey?.tier || 'free') as keyof typeof PLANS
  const tierOrder = ['free', 'pro', 'enterprise'] as const

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium tracking-wide">Retrieving Developer Credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 font-sans text-foreground">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Developer <span className="gradient-text">API Central</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-xl leading-relaxed">
            Manage high-performance keys, configure plan quotas, and monitor real-time threat-detection hits on client applications.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-card border border-border px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-xs font-semibold text-foreground tracking-wide">Threat Firewall Active</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Total Scans" 
          value={metrics?.totalScans || 0} 
          icon={Activity} 
          trend="Real-time scan counter"
        />
        <StatCard 
          label="Threats Deflected" 
          value={metrics?.threatsDetected || 0} 
          icon={ShieldAlert} 
          color="text-primary"
          trend="Blocked malicious signals"
        />
        <StatCard 
          label="Engine Latency" 
          value="42ms" 
          icon={Zap} 
          trend="Average response delay"
        />
        <StatCard 
          label="Layer Integrity" 
          value="100%" 
          icon={ShieldCheck} 
          trend="All forensic modules active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Key Management & Webhooks */}
        <div className="lg:col-span-1 space-y-6">
          {/* Key Management Card */}
          <div className="glass-card rounded-xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Key className="h-24 w-24 text-primary" />
            </div>
            
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 pb-2 border-b border-border/50">
              <Key className="h-5 w-5 text-primary" />
              API Key Management
            </h2>

            {!apiKey ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  No active developer API key found. Generate one to initiate integration and start scanning endpoints.
                </p>
                <Button onClick={generateKey} disabled={isGenerating} className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-lg py-2.5 text-sm font-semibold transition-all">
                  {isGenerating ? "Generating..." : "Generate Production Key"}
                </Button>
              </div>
            ) : (
              <div className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground tracking-wide">Live Production Key</label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                      {apiKey.tier || "free"} Tier
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-background/80 border border-border px-3.5 py-2.5 font-mono text-xs text-primary flex-1 rounded-lg flex items-center justify-between select-all overflow-hidden">
                      <span className="truncate mr-2">{apiKey.key}</span>
                      <button onClick={copyToClipboard} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                        {copied ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> : <Copy className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">Monthly Quota Usage</span>
                    <span className="text-foreground font-bold">{apiKey.usageCount || 0} / {apiKey.planLimit || 1000}</span>
                  </div>
                  <div className="h-2 w-full bg-muted border border-border rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(((apiKey.usageCount || 0) / (apiKey.planLimit || 1000)) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right">
                    Limit resets monthly. Upgrade tier to increase limit.
                  </p>
                </div>

                <Button 
                  onClick={handleRevokeAndReissue}
                  disabled={isGenerating}
                  variant="outline" 
                  className="w-full text-xs font-semibold rounded-lg py-2 border-destructive/30 bg-background text-destructive hover:bg-destructive/10 hover:border-destructive transition-all"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isGenerating && "animate-spin")} />
                  Revoke & Re-issue Key
                </Button>
              </div>
            )}
          </div>

          {/* Plans & Billing Card */}
          <div className="glass-card rounded-xl p-6 shadow-lg">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 pb-2 border-b border-border/50">
              <Zap className="h-5 w-5 text-primary" />
              Plans & Billing
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                {currentTier} Tier
              </span>
            </h2>

            <div className="space-y-3">
              {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
                const isCurrent = currentTier === key
                const currentIdx = tierOrder.indexOf(currentTier)
                const planIdx = tierOrder.indexOf(key)
                const isUpgrade = planIdx > currentIdx
                const isDowngrade = planIdx < currentIdx

                return (
                  <div
                    key={key}
                    className={cn(
                      "glass-card rounded-xl p-4 space-y-3 transition-all border",
                      isCurrent
                        ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb,99,102,241),0.1)]"
                        : "border-border hover:border-border/80"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {key === 'enterprise' ? (
                          <Crown className="h-4 w-4 text-amber-400" />
                        ) : key === 'pro' ? (
                          <Sparkles className="h-4 w-4 text-primary" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-bold text-foreground">{plan.name}</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground">
                        {plan.price === 0 ? (
                          '₹0'
                        ) : (
                          <>₹{plan.price}<span className="text-[10px] font-medium text-muted-foreground">/mo</span></>
                        )}
                      </span>
                    </div>

                    <ul className="space-y-1.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-primary/70 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div>
                      {isCurrent ? (
                        <div className="w-full text-center text-[11px] font-bold py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          Current Plan
                        </div>
                      ) : isUpgrade ? (
                        <div className="space-y-1.5">
                          <Button
                            disabled={!apiKey}
                            onClick={() => {
                              setSelectedPlan(key as 'pro' | 'enterprise')
                              setShowUpgradeModal(true)
                            }}
                            className="w-full h-8 text-[11px] font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all"
                          >
                            <Zap className="h-3 w-3 mr-1.5" />
                            Upgrade
                          </Button>
                          {!apiKey && (
                            <p className="text-[9px] text-muted-foreground text-center">
                              Generate an API key above to unlock upgrades.
                            </p>
                          )}
                        </div>
                      ) : isDowngrade ? (
                        <div className="w-full text-center text-[11px] font-medium py-1.5 rounded-lg text-muted-foreground">
                          Contact Support
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Terminal Guide */}
          <div className="glass-card rounded-xl p-6 shadow-md">
            <h2 className="text-base font-bold text-foreground mb-3.5 flex items-center gap-2 pb-2 border-b border-border/50">
              <Terminal className="h-5 w-5 text-primary" />
              API Quickstart
            </h2>
            <div className="bg-background/90 p-4 rounded-lg border border-border font-mono text-xs text-muted-foreground/90 space-y-2 overflow-x-auto">
              <p className="text-foreground"><span className="text-primary font-semibold">curl</span> -X POST https://scamsentry.com/api/v1/verify \</p>
              <p className="pl-4">-H &quot;x-api-key: {apiKey?.key || 'ss_live_...'}&quot; \</p>
              <p className="pl-4">-d <span className="text-emerald-400">{`'{"payload": "sus-link.xyz"}'`}</span></p>
            </div>
          </div>

          {/* B2B Webhook Dispatch Simulator */}
          <div className="glass-card rounded-xl p-6 space-y-4 shadow-md">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
              <Activity className="h-5 w-5 text-primary" />
              Webhook Simulator
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify your application firewalls by dispatching threat alerts.
            </p>
            
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">Webhook Endpoint URL</label>
                <input
                  type="url"
                  placeholder="https://your-app.com/api/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/35 rounded-lg transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">Threat Vector</label>
                  <select
                    value={alertType}
                    onChange={(e: any) => setAlertType(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary/50 text-xs p-3 outline-none text-foreground rounded-lg cursor-pointer"
                  >
                    <option value="BRAND_MIMICRY">Brand Mimicry</option>
                    <option value="TYPOSQUAT">Typosquatting</option>
                    <option value="PHISHING">Phishing Link</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">Mimic Target</label>
                  <select
                    value={targetBrand}
                    onChange={(e) => setTargetBrand(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary/50 text-xs p-3 outline-none text-foreground rounded-lg cursor-pointer animate-none"
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
                className="w-full h-10 bg-primary text-primary-foreground hover:opacity-95 transition-all font-semibold text-xs rounded-lg active:scale-[0.98] shadow-sm"
              >
                {isDispatching ? "Dispatching Signal..." : "Dispatch Simulated Threat"}
              </Button>

              {dispatchResult && (
                <div className="bg-background/95 border border-border p-3.5 rounded-lg font-mono text-[11px] overflow-hidden leading-normal">
                  <div className="flex justify-between items-center mb-2 border-b border-border/50 pb-2 text-[10px] text-muted-foreground font-semibold">
                    <span>TELEMETRY_LOG</span>
                    <span className={cn(
                      "font-bold px-1.5 py-0.5 rounded",
                      dispatchSuccess === true ? "text-emerald-400 bg-emerald-500/10" :
                      dispatchSuccess === false ? "text-red-400 bg-red-500/10" : "text-primary animate-pulse"
                    )}>
                      {dispatchSuccess === true ? "SUCCESS" : dispatchSuccess === false ? "FAILED" : "PENDING"}
                    </span>
                  </div>
                  <pre className="text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto">{dispatchResult}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Forensic Logs Table */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl h-full flex flex-col shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border/80 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Live Forensic Scan Archive
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <Clock className="h-4 w-4 text-primary animate-pulse" />
                Real-time Sync
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 select-none">
                    <th className="px-6 py-3.5 font-bold text-muted-foreground text-xs tracking-wider">Target Payload</th>
                    <th className="px-6 py-3.5 text-center font-bold text-muted-foreground text-xs tracking-wider">Score</th>
                    <th className="px-6 py-3.5 font-bold text-muted-foreground text-xs tracking-wider">Scan Fingerprint</th>
                    <th className="px-6 py-3.5 text-right font-bold text-muted-foreground text-xs tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        No telemetry logs available. Secure your endpoints with API scan queries.
                      </td>
                    </tr>
                  ) : (
                    recentScans.map((scan, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-semibold text-foreground truncate max-w-[240px]">{scan.url}</span>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 border w-fit rounded-full tracking-wide",
                              scan.riskLevel === "Secure" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              scan.riskLevel === "Suspicious" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : 
                              "bg-red-500/10 border-red-500/20 text-red-500"
                            )}>
                              {scan.riskLevel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-base font-extrabold",
                            scan.finalScore > 70 ? "text-emerald-400" :
                            scan.finalScore > 30 ? "text-amber-500" : "text-red-500"
                          )}>
                            {scan.finalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            <Fingerprint className="h-4 w-4 text-primary/70" />
                            <span className="font-mono">{scan.id?.substring(0, 8) || "f8d83921"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground/80 font-medium">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex justify-center">
              <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5 rounded-lg py-1.5 px-4 flex items-center gap-2 transition-all">
                View Full Forensic Ledger <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => { setShowUpgradeModal(false); setSelectedPlan(null); setUtrNumber('') }}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => { setShowUpgradeModal(false); setSelectedPlan(null); setUtrNumber('') }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-3">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">
                Upgrade to {PLANS[selectedPlan].name}
              </h3>
              <p className="text-2xl font-extrabold text-primary mt-1">
                ₹{PLANS[selectedPlan].price}<span className="text-sm font-medium text-muted-foreground">/month</span>
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="bg-white p-3 rounded-xl shadow-md">
                <img
                  src={getUpiQrUrl(PLANS[selectedPlan].price, PLANS[selectedPlan].name)}
                  alt={`UPI QR Code for ${PLANS[selectedPlan].name} Plan`}
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              </div>

              <div className="text-center space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground">Scan with any UPI app to pay</p>
                <div className="flex items-center gap-2 bg-background/80 border border-border px-3 py-2 rounded-lg">
                  <IndianRupee className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-mono font-bold text-foreground select-all">{UPI_ID}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(UPI_ID)
                      toast({ title: 'Copied', description: 'UPI ID copied to clipboard.' })
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* UTR Input */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">UTR / Transaction Reference Number</label>
                <input
                  type="text"
                  placeholder="Enter 12-digit UTR number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary/50 text-sm p-3 outline-none text-foreground placeholder:text-muted-foreground/35 rounded-lg transition-all"
                />
              </div>

              <Button
                onClick={submitPaymentRequest}
                disabled={isSubmittingPayment || !utrNumber.trim()}
                className="w-full h-11 bg-primary text-primary-foreground hover:opacity-90 font-bold text-sm rounded-lg transition-all"
              >
                {isSubmittingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Submit Payment Proof
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Your plan will be upgraded within 24 hours after payment verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, trend, color = "text-foreground" }: any) {
  return (
    <div className="glass-card p-6 rounded-xl space-y-4 transition-all group shadow-md">
      <div className="flex justify-between items-start">
        <div className="bg-background/50 p-2.5 rounded-lg border border-border group-hover:border-primary/40 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide">{label}</h4>
        <p className={cn("text-2xl font-bold mt-1 tracking-tight", color)}>{value}</p>
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">{trend}</p>
    </div>
  )
}
