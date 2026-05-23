"use client"

import { Stats } from "@/components/stats"
import { RecentReports } from "@/components/recent-reports"
import { CyberNewsHub } from "@/components/cyber-news-hub"
import { Terminal } from "lucide-react"

export function HomeClientContent() {
  return (
    <>
      <Stats />
      
      {/* OSINT Incident Hub Section */}
      <section className="py-20 bg-[#070605] relative overflow-hidden">
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-12 gap-3 pb-6 border-b border-[#1F1914]">
              <div className="inline-flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.25em]">
                  GLOBAL_OSINT_OVERWATCH
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-wider uppercase">
                CYBER INTEL & <span className="text-primary">OSINT INCIDENTS</span>
              </h2>
              <p className="text-xs text-muted-foreground font-mono max-w-xl leading-relaxed uppercase tracking-wider">
                Real-time security bulletin ledger. Dynamic highlights and automated brand lockdowns synchronized daily.
              </p>
            </div>

            {/* Hub Component */}
            <CyberNewsHub />
          </div>
        </div>
      </section>

      <RecentReports />
    </>
  )
}

