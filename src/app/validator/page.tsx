"use client";

import { useState } from "react";
import { Shield, ArrowRight, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ForensicReport } from "@/components/forensic-report";

export default function ValidatorPage() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast({
        title: "Analysis Failed",
        description: "Please provide a valid URL to scan.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/validator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (error: any) {
      toast({
        title: "Service Error",
        description: error.message || "Failed to analyze the URL.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-left space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-xl">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Link Safety Checker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Verify the safety of any link before you click. Paste a URL below to
            run heuristic scans, check registrar ages, inspect SSL certificates,
            and check global threat lists.
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-card border border-border shadow-lg rounded-2xl overflow-hidden backdrop-blur-sm bg-card/60">
          <div className="border-b border-border p-4 sm:p-6 flex items-center justify-between bg-card/40">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <LinkIcon className="h-4 w-4" /> Link Scanner
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              System Active
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <label
              htmlFor="payload"
              className="text-sm font-semibold text-foreground"
            >
              Link to scan
            </label>
            <Textarea
              id="payload"
              placeholder="Paste or type link here (e.g., https://secure-account-verification.com)..."
              className="min-h-[140px] bg-background/50 border-border font-mono text-base resize-none rounded-xl focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="p-5 sm:p-6 bg-card/40 border-t border-border flex justify-end">
            <Button
              size="lg"
              className="px-8 font-semibold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/15 transition-all active:scale-[0.98]"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning
                  URL...
                </>
              ) : (
                <>
                  Scan Link <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
