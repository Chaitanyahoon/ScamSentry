"use client"

import { useState } from "react"
import { Shield, ArrowRight, Loader2, Link as LinkIcon, FileText, Globe, TerminalSquare } from "lucide-react"
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
      toast({ title: "Analysis Failed", description: "Please provide a valid URL to scan.", variant: "destructive" })
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
      toast({ title: "Service Error", description: error.message || "Failed to analyze the URL.", variant: "destructive" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-left space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-md">
            <TerminalSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Zero-Trust URL Scanner
          </h1>
          <p className="text-lg text-muted-foreground">
            Execute deterministic malware evaluation modules against suspicious web addresses.
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-card border border-border shadow-sm">
          <div className="bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <LinkIcon className="h-4 w-4" /> Threat Vector Scan
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary/80 bg-primary/10 border border-primary/20 px-3 py-1 rounded-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live Monitoring
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-4 bg-background/50">
            <label htmlFor="payload" className="text-sm font-semibold mb-1 block">
              Target URL
            </label>
            <Textarea 
              id="payload" 
              placeholder="Enter suspicious URL (e.g., https://amazon-secure-login.com)..." 
              className="min-h-[140px] bg-card border-border font-mono text-base resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="p-5 sm:p-6 bg-card border-t border-border flex justify-end">
            <Button 
              size="lg" 
              className="px-8 font-semibold"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <>Run Forensics <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
