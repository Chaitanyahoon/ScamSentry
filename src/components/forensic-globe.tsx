"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { useReports } from "@/contexts/reports-context"
import { getRecentScans, ScanEvent } from "@/lib/analytics"
import { Loader2, Zap, ShieldAlert, Globe as GlobeIcon, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamic import for react-globe.gl to avoid SSR issues with Three.js
const Globe = dynamic(() => import("react-globe.gl"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#060504]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Initializing Neural Globe...</p>
    </div>
  )
})

interface Arc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  name: string
}

export function ForensicGlobe() {
  const { reports } = useReports()
  const [scans, setScans] = useState<ScanEvent[]>([])
  const [loading, setLoading] = useState(true)
  const globeRef = useRef<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const recentScans = await getRecentScans(undefined, 7)
        setScans(recentScans)
      } catch (e) {
        console.error("Globe data load error:", e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // ... (rest of the code unchanged, but casting the Globe call)
  
  return (
    <div className="relative h-full w-full bg-[#060504] overflow-hidden rounded-xl border border-[#1F1914]">
      {/* ... controls ... */}
      <div className="absolute top-6 left-6 z-10 space-y-4">
        {/* ... */}
      </div>

      {/* Legend ... */}

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        arcsData={arcs}
        arcColor={"color" as any}
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        
        pointsData={points}
        pointColor={"color" as any}
        pointRadius={"size" as any}
        pointsMerge={true}
        pointAltitude={0}
        
        ringsData={points.filter(p => p.size > 0.5)}
        ringColor={() => "#FF4D4D"}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        {...({ ringRepeat: 3 } as any)}

        hexBinPointsData={points}
        hexBinPointWeight="size"
        hexBinResolution={4}
        hexMargin={0.2}
        hexColor={() => "#1F1914"}
      />
    </div>
  )
}
    </div>
  )
}
