"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Shield, Key, Code, Copy, CheckCircle2, AlertCircle } from "lucide-react"

export default function ApiDocsPage() {
  const { user, loading } = useAuth()
  const [apiKey, setApiKey] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserKey()
    }
  }, [user])

  const fetchUserKey = async () => {
    if (!user) return
    const q = query(collection(db, "api_keys"), where("userId", "==", user.uid), where("status", "==", "active"))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      setApiKey(snapshot.docs[0].data())
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
      setApiKey(keyData)
    } catch (e) {
      console.error("Error generating key:", e)
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border py-12">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-mono flex items-center gap-3">
              <Code className="h-8 w-8 text-primary" />
              ScamSentry API
            </h1>
            <p className="text-lg text-muted-foreground">
              Integrate our deterministic forensic URL validator directly into your applications, browser extensions, or enterprise firewalls.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Docs Content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl font-bold font-mono mb-4 text-primary">Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The ScamSentry API is a blazing-fast, deterministic validation engine that processes URLs through 4 intensive OSINT layers without relying on slow AI models. It natively catches typosquatting, Domain Generation Algorithms (DGA), burner domains, and directly syncs with global threat feeds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-mono mb-4 text-primary">Endpoint: Verify Core</h2>
            <div className="bg-[#0C0A07] border border-border p-4 rounded-md font-mono text-sm mb-4">
              <span className="text-primary font-bold">POST</span> https://scamsentry.com/api/v1/verify
            </div>
            
            <h3 className="font-semibold text-foreground mb-2 mt-6">Request Headers</h3>
            <div className="bg-[#0C0A07] border border-border p-4 rounded-md font-mono text-sm overflow-x-auto text-muted-foreground mb-6">
              <span className="text-white">Authorization:</span> Bearer ss_live_your_api_key<br />
              <span className="text-white">Content-Type:</span> application/json
            </div>

            <h3 className="font-semibold text-foreground mb-2">Request Body</h3>
            <div className="bg-[#0C0A07] border border-border p-4 rounded-md font-mono text-sm overflow-x-auto text-muted-foreground mb-6">
              {JSON.stringify({ url: "https://secure-login.paypal.com.scam.net" }, null, 2)}
            </div>

            <h3 className="font-semibold text-foreground mb-2">Example Response</h3>
            <div className="bg-[#0C0A07] border border-border p-4 rounded-md font-mono text-xs overflow-x-auto text-muted-foreground">
              <pre>{`{
  "success": true,
  "data": {
    "target_url": "https://secure-login.paypal.com.scam.net",
    "finalScore": 15,
    "riskLevel": "Critical Threat",
    "forensicReport": {
      "layer1_Heuristics": {
        "score": 85,
        "flags": [
          "CRITICAL: Subdomain explicitly spoofing major brand."
        ]
      }
    }
  }
}`}</pre>
            </div>
          </section>
        </div>

        {/* Sidebar: API Dashboard */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-6 sticky top-24">
            <h3 className="text-lg font-bold font-mono text-foreground mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Dashboard
            </h3>

            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-border rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-border rounded"></div>
                  </div>
                </div>
              </div>
            ) : !user ? (
              <div className="text-center">
                <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-6">
                  You must be registered as a developer to generate an API key.
                </p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono" asChild>
                  <a href="/admin/login">Developer Login</a>
                </Button>
              </div>
            ) : apiKey ? (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Your Live API Key</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#0C0A07] border border-border px-3 py-2 font-mono text-sm text-primary flex-1 overflow-hidden text-ellipsis">
                      {apiKey.key?.substring(0, 12)}...
                    </div>
                    <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0 border-border">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Keep this key secret.</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-foreground">Free Tier Quota</label>
                    <span className="text-xs font-mono text-primary">{apiKey.usageCount || 0} / {apiKey.planLimit || 1000}</span>
                  </div>
                  <div className="w-full bg-[#0C0A07] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${Math.min(((apiKey.usageCount || 0) / (apiKey.planLimit || 1000)) * 100, 100)}%` }}
                    />
                  </div>
                  {(apiKey.usageCount || 0) >= (apiKey.planLimit || 1000) && (
                    <p className="text-[10px] text-destructive flex items-center gap-1 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      Quota exceeded.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Generate your free-tier key to start making requests.
                </p>
                <Button 
                  onClick={generateKey} 
                  disabled={isGenerating}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
                >
                  {isGenerating ? "Generating..." : "Generate live key"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
