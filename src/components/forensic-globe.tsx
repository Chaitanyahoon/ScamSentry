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
  const globeRef = useRef<any>()

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

  // Generate Arcs for "Attack Vectors"
  // We mock the source location for visual effect if not available
  const arcs = useMemo(() => {
    const attackSources = [
      { lat: 55.7558, lng: 37.6173, name: "Eastern Node" }, // Moscow
      { lat: 39.9042, lng: 116.4074, name: "Asian Hub" }, // Beijing
      { lat: 19.0760, lng: 72.8777, name: "South Asian Vector" }, // Mumbai
      { lat: -23.5505, lng: -46.6333, name: "LatAm Proxy" }, // Sao Paulo
      { lat: 51.5074, lng: -0.1278, name: "Euro Gateway" }, // London
    ]

    return scans.slice(0, 20).map((scan, idx) => {
      const source = attackSources[idx % attackSources.length]
      // Use report location if available, otherwise random US point
      const targetLat = 39.8283 + (Math.random() - 0.5) * 20
      const targetLng = -98.5795 + (Math.random() - 0.5) * 40

      return {
        startLat: source.lat,
        startLng: source.lng,
        endLat: targetLat,
        endLng: targetLng,
        color: scan.riskLevel === "Critical Threat" ? "#FF4D4D" : "#FFBF00",
        name: `Threat Vector: ${scan.url}`
      }
    })
  }, [scans])

  // Points for "Forensic Intel"
  const points = useMemo(() => {
    return reports.filter(r => r.lat && r.lng).map(r => ({
      lat: r.lat,
      lng: r.lng,
      size: r.riskLevel === "high" ? 0.8 : 0.4,
      color: r.riskLevel === "high" ? "#FF4D4D" : "#FFBF00",
      label: r.title
    }))
  }, [reports])

  return (
    <div className="relative h-full w-full bg-[#060504] overflow-hidden rounded-xl border border-[#1F1914]">
      {/* Control Overlay */}
      <div className="absolute top-6 left-6 z-10 space-y-4">
        <div className="bg-[#0C0A09]/80 backdrop-blur-md border border-[#1F1914] p-4 rounded-lg shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/20 p-1.5 rounded border border-primary/30">
              <GlobeIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-foreground">
              Forensic Globe v2.0
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] text-muted-foreground uppercase font-mono">Active Vectors</span>
              <span className="text-[10px] text-primary font-mono font-bold">{arcs.length}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] text-muted-foreground uppercase font-mono">Intel Nodes</span>
              <span className="text-[10px] text-foreground font-mono font-bold">{points.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-[#0C0A09]/60 border-[#1F1914] text-[10px] font-mono uppercase h-8">
            <Maximize2 className="h-3 w-3 mr-2" /> Topography
          </Button>
          <Button variant="outline" size="sm" className="bg-[#0C0A09]/60 border-[#1F1914] text-[10px] font-mono uppercase h-8">
            <Zap className="h-3 w-3 mr-2 text-primary" /> Real-time
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-10 hidden md:block">
        <div className="bg-[#0C0A09]/80 backdrop-blur-md border border-[#1F1914] p-4 rounded-lg shadow-2xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]"></div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Critical Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#FFBF00] shadow-[0_0_8px_#FFBF00]"></div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Suspect Vector</span>
          </div>
        </div>
      </div>

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        arcsData={arcs}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        
        pointsData={points}
        pointColor="color"
        pointRadius="size"
        pointsMerge={true}
        pointAltitude={0}
        
        ringsData={points.filter(p => p.size > 0.5)}
        ringColor={() => "#FF4D4D"}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeat={3}

        hexBinPointsData={points}
        hexBinPointWeight="size"
        hexBinResolution={4}
        hexMargin={0.2}
        hexColor={() => "#1F1914"}
      />
    </div>
  )
}
