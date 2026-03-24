"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useReports } from "@/contexts/reports-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Terminal, Share2, ArrowRight } from "lucide-react"
import { ShareableReportCard } from "@/components/shareable-report-card"
import Link from "next/link"

export default function ReportSuccessPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reports } = useReports()
  const [reportUrl, setReportUrl] = useState("")

  const report = reports.find((r) => r.id === id)

  useEffect(() => {
    // Construct the full URL for sharing
    if (typeof window !== "undefined" && report) {
      setReportUrl(`${window.location.origin}/reports/${report.id}`)
    }
  }, [report])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />
        
        <div className="glass-strong border border-destructive/50 w-full max-w-md text-center p-8 z-10 shadow-[0_0_20px_hsla(var(--destructive),0.2)]">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-destructive/10 border border-destructive/50 flex items-center justify-center shadow-[0_0_10px_hsla(var(--destructive),0.3)]">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold font-mono tracking-widest text-destructive mb-3 uppercase">
            SYS_ERR: 404_NOT_FOUND
          </h2>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase leading-relaxed mb-6">
            REQUESTED PAYLOAD EXCEEDS SEARCH BOUNDARIES OR HAS BEEN PURGED FROM SYSTEM MEMORY.
          </p>
          <Button 
            onClick={() => router.push("/report")}
            className="w-full text-xs font-bold tracking-widest uppercase rounded-none border border-primary/50 text-primary bg-transparent hover:bg-primary hover:text-black transition-all"
          >
            INITIATE_NEW_UPLOAD
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-success/10 border-2 border-success flex items-center justify-center shadow-[0_0_20px_hsla(var(--success),0.4)]">
                <CheckCircle className="h-10 w-10 text-success drop-shadow-[0_0_8px_currentColor]" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-widest text-success mb-4 uppercase drop-shadow-[0_0_10px_hsla(var(--success),0.5)]">
              PAYLOAD_ACCEPTED
            </h1>
            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-muted-foreground max-w-2xl mx-auto border-l-2 border-success pl-4 text-left">
              YOUR INTELLIGENCE REPORT HAS BEEN COMPILED AND SECURELY LOGGED.
              PENDING ADMIN VERIFICATION PROTOCOLS.
            </p>
          </div>

          <div className="mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-mono tracking-widest text-foreground uppercase">
                DISTRIBUTE_INTEL
              </h2>
            </div>
            
            <div className="bg-[#050510] border border-border/50 p-4 sm:p-8 rounded-none shadow-[0_0_30px_rgba(0,0,0,0.8)] mx-auto">
              {reportUrl && <ShareableReportCard report={report} reportUrl={reportUrl} />}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            <Button 
              asChild 
              size="lg"
              className="rounded-none border-2 border-transparent bg-primary text-black hover:bg-primary/90 hover:shadow-[0_0_15px_hsla(var(--primary),0.5)] font-bold tracking-widest uppercase text-xs h-14 px-8"
            >
              <Link href="/report">
                FILE_NEW_REPORT <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="rounded-none border-2 border-border bg-card/50 text-foreground hover:bg-background hover:border-primary/50 hover:text-primary transition-all font-bold tracking-widest uppercase text-xs h-14 px-8"
            >
              <Link href="/reports">
                ACCESS_GLOBAL_LEDGER <Terminal className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
