"use client"

import { useState } from "react"
import { Terminal, Copy, Check, ShieldAlert, Cpu } from "lucide-react"

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const endpointUrl = "https://scamsentry.io/api/v1/validate"
  
  const sampleRequest = `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "payload": "https://amazon-secure-login-update-account.com"
  }'`

  const sampleResponse = `{
  "success": true,
  "meta": {
    "timestamp": "2026-03-24T12:00:00.000Z",
    "engineVersion": "v2.1.0-beta",
    "tier": "enterprise"
  },
  "data": {
    "target": "https://amazon-secure-login-update-account.com",
    "isBlacklisted": true,
    "trustScore": 15,
    "severity": "Critical Threat",
    "diagnostics": {
      "heuristics": {
        "triggerCount": 3,
        "scorePenalty": 15
      },
      "dnsForensics": {
        "scorePenalty": 30
      },
      "threatIntel": {
        "scorePenalty": 0
      },
      "internalLedger": {
        "verifiedScamsFound": false
      },
      "aiSemantics": {
        "generatedProbabilityScore": 40
      }
    }
  }
}`

  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]"></div>
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-left">
          <div className="mb-6 inline-flex px-4 py-1.5 border border-primary/50 bg-primary/10 text-primary uppercase text-xs tracking-widest font-bold shadow-[0_0_15px_hsla(var(--primary),0.3)]">
            <Cpu className="mr-2 h-4 w-4" /> B2B_DEVELOPER_PORTAL
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-widest text-foreground font-mono">
            API <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Documentation</span>
          </h1>
          <p className="mt-4 text-muted-foreground font-mono leading-relaxed max-w-2xl">
            Integrate the ScamSentry 5-Layer Zero-Trust Forensics engine seamlessly into your own applications, Discord bots, or enterprise firewalls.
          </p>
        </div>

        {/* Authentication & Rate Limits View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 border-t-2 border-t-secondary/50">
            <h3 className="text-xl font-bold uppercase tracking-widest text-foreground mb-4">Authentication</h3>
            <p className="text-sm font-mono text-muted-foreground mb-4 leading-relaxed">
              API requests are authenticated via the <code className="bg-background px-2 py-0.5 text-secondary">x-api-key</code> header.
            </p>
            <div className="p-4 bg-background border border-border text-xs font-mono break-all text-secondary">
              x-api-key: sk_live_f6d7...
            </div>
          </div>

          <div className="glass-card p-8 border-t-2 border-t-destructive/50">
            <h3 className="text-xl font-bold uppercase tracking-widest text-foreground mb-4">Rate Limits</h3>
            <ul className="space-y-3 text-sm font-mono text-muted-foreground">
              <li className="flex justify-between items-center border-b border-border pb-2">
                <span>Free Tier (IP Based)</span>
                <span className="text-destructive font-bold drop-shadow-[0_0_5px_currentColor]">5 req / min</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Enterprise Tier</span>
                <span className="text-primary font-bold drop-shadow-[0_0_5px_currentColor]">Unlimited</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Endpoint Definition */}
        <div className="glass-strong">
          <div className="bg-card/80 border-b border-border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-success/20 text-success border border-success/30 px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_hsla(var(--success),0.2)]">POST</span>
              <span className="font-mono text-foreground text-sm tracking-widest">/api/v1/validate</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              Extracts URLs & initiates the Heuristic/DNS/AI stack.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Request Block */}
            <div className="border-r border-border p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Payload Schema</h4>
                <div className="p-4 bg-background border border-border font-mono text-xs text-foreground">
                  <span className="text-primary">type</span> Request = {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-secondary">"payload"</span>: <span className="text-muted-foreground">string</span> <span className="text-muted-foreground/50">// The raw URL or text block to scan</span><br/>
                  {"}"}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary">cURL Example</h4>
                  <button onClick={() => copyToClipboard(sampleRequest)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-4 bg-[#0a0a0f] border border-border font-mono text-[11px] sm:text-xs overflow-x-auto text-primary leading-relaxed rounded-none">
                  <pre>{sampleRequest}</pre>
                </div>
              </div>
            </div>

            {/* Response Block */}
            <div className="p-6 sm:p-8 bg-card/40">
              <h4 className="text-sm font-bold uppercase tracking-widest text-success mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Successful Response (200 OK)
              </h4>
              <div className="p-4 bg-[#0a0a0f] border border-border font-mono text-[11px] sm:text-xs overflow-x-auto text-foreground leading-relaxed">
                <pre>{sampleResponse}</pre>
              </div>

              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-destructive mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Error Responses
                </h4>
                <ul className="space-y-4 text-xs font-mono text-muted-foreground">
                  <li className="flex gap-4">
                    <span className="text-warning font-bold w-12 shrink-0">400</span>
                    <span>Invalid payload. Ensure you're sending a JSON body with a <code className="text-secondary">payload</code> string.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-destructive font-bold w-12 shrink-0">429</span>
                    <span>Rate limit exceeded. Pass a valid API key or wait one minute.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-destructive font-bold w-12 shrink-0">500</span>
                    <span>Internal failure (likely Gemini API or SafeBrowsing backend timeout).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
