"use client"

import { useState } from "react"
import { Shield, ArrowRight, Loader2, Link as LinkIcon, FileText, Globe, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ForensicReport } from "@/components/forensic-report"

export default function ValidatorPage() {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast({ title: "SYS_ERR: EMPTY_PAYLOAD", description: "Provide a valid URL string for evaluation.", variant: "destructive" })
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const res = await fetch('/api/validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setResult(data)
    } catch (error: any) {
      toast({ title: "FORENSIC_KERNEL_PANIC", description: error.message || "Forensic engine failure.", variant: "destructive" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]"></div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-left space-y-6">
          <div className="inline-flex items-center justify-center p-4 border border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_hsla(var(--primary),0.3)]">
            <Terminal className="h-8 w-8 drop-shadow-[0_0_8px_hsla(var(--primary),1)]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest text-foreground uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Zero-Trust<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">URL_AUDITOR</span>
          </h1>
          <p className="text-lg text-muted-foreground font-mono uppercase tracking-wider">
            Execute deterministic malware evaluation modules against suspicious uniform resource locators.
          </p>
        </div>

        {/* Input Area */}
        <div className="glass-strong">
          <div className="bg-card/80 border-b border-border p-4 flex gap-5">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase">
              <LinkIcon className="h-4 w-4 text-primary" /> THREAT_VECTOR
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary ml-auto bg-primary/10 border border-primary/30 px-3 py-1 uppercase tracking-widest shadow-[0_0_10px_hsla(var(--primary),0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live Monitoring
            </div>
          </div>
          <div className="p-6 space-y-4 bg-background/50">
            <label htmlFor="payload" className="text-foreground tracking-widest font-bold text-sm flex items-center gap-2 uppercase">
              <span className="w-2 h-2 bg-primary drop-shadow-[0_0_5px_hsla(var(--primary),1)]"></span>
              TARGET_URL
            </label>
            <Textarea 
              id="payload" 
              placeholder="Inject suspicious URL string (e.g., https://amazon-secure-login.com)..." 
              className="min-h-[150px] bg-card/50 border-border text-foreground tracking-wide font-mono rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50 resize-none text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="p-5 bg-card/80 border-t border-border flex justify-end">
            <Button 
              size="lg" 
              className="cyber-button px-10 py-6"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> EXECUTING_KERNEL...</>
              ) : (
                <>INITIATE_FORENSICS <ArrowRight className="ml-3 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-fade-in">
            <ForensicReport 
              report={result.forensicReport} 
              finalScore={result.finalScore} 
              riskLevel={result.riskLevel} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
