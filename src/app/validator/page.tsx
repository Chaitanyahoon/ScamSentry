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
    <div className="min-h-screen bg-[#0C0A09] relative overflow-hidden">
      {/* HUD Background Elements */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.15]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,191,0,0.05),transparent_70%)]" />
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="container px-4 py-20 relative z-20 max-w-5xl mx-auto space-y-16">
        
        {/* Header Section - Asymmetric Alignment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#1F1914] pb-12">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-none self-start">
              <TerminalSquare className="h-4 w-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Scanner_Module_v2.4</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-foreground leading-none">
              ZERO_TRUST<br />
              <span className="text-primary">VALIDATOR</span>
            </h1>
            <p className="text-lg text-muted-foreground/60 font-mono tracking-tight max-w-xl">
              Execute deterministic malware evaluation modules against suspicious URL vectors. Direct interface to Forensic Neural Cluster.
            </p>
          </div>
          <div className="hidden md:block text-right space-y-2 opacity-40">
            <p className="text-[9px] font-mono uppercase tracking-widest">Lat: 37.7749 | Lon: -122.4194</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-primary">Status: Operational_Link_Sync</p>
          </div>
        </div>

        {/* Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Input - Fragmented HUD Container */}
          <div className="lg:col-span-12 relative group">
            <div className="absolute -top-3 -left-3 w-10 h-10 border-t-2 border-l-2 border-primary/40 group-focus-within:border-primary transition-colors pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-2 border-r-2 border-primary/40 group-focus-within:border-primary transition-colors pointer-events-none" />
            
            <div className="bg-[#15110E] border border-[#1F1914] shadow-2xl relative overflow-hidden">
              <div className="bg-[#0C0A09] border-b border-[#1F1914] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/70">Terminal_Input_Buffer</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 border border-[#1F1914]" />
                  <div className="w-2 h-2 border border-[#1F1914]" />
                  <div className="w-2 h-2 border border-[#1F1914] bg-primary/20" />
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="relative">
                  <Textarea 
                    id="payload" 
                    placeholder="ENTER SUSPICIOUS URL FOR SCAN..." 
                    className="min-h-[160px] bg-[#0C0A09] border-[#1F1914] font-mono text-lg text-primary placeholder:text-primary/20 resize-none rounded-none focus-visible:ring-1 focus-visible:ring-primary/50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="absolute top-4 right-4 text-[8px] font-mono text-primary/30 uppercase">READY_FOR_VECTOR</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#1F1914]">
                  <div className="flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono uppercase">Memory_Pool</span>
                      <span className="text-[10px] font-mono font-bold">128GB_ALLOC</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono uppercase">Encryption</span>
                      <span className="text-[10px] font-mono font-bold">SHA-256_ACTIVE</span>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-12 py-8 bg-primary hover:bg-primary/90 text-black font-bold font-mono text-xs uppercase tracking-[0.2em] rounded-none group relative overflow-hidden"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isAnalyzing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> EXECUTING_SCAN...</>
                      ) : (
                        <>RUN_FORENSICS <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Stream */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pt-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-16 w-[1px] bg-primary/20" />
            <div className="pt-16">
              <ForensicReport 
                report={result.forensicReport} 
                finalScore={result.finalScore} 
                riskLevel={result.riskLevel} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
