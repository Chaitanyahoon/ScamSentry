"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { useReports } from "@/contexts/reports-context"
import { getRecentScans, ScanEvent } from "@/lib/analytics"
import { Loader2, Zap, Globe as GlobeIcon, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { MapPin } from "lucide-react"
import Link from "next/link"

// Dynamic import for react-globe.gl to avoid SSR issues with Three.js
const Globe = dynamic(() => import("react-globe.gl"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#060504]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Initializing Neural Globe...</p>
    </div>
  )
})

export function ForensicGlobe() {
  const { reports } = useReports()
  const [scans, setScans] = useState<ScanEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIntel, setSelectedIntel] = useState<any>(null)
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

  // Generate Arcs for "Attack Vectors"
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
      ...r, // Include all report data for the click handler
      lat: r.lat,
      lng: r.lng,
      size: r.riskLevel === "high" ? 0.8 : 0.4,
      color: r.riskLevel === "high" ? "#FF4D4D" : "#FFBF00",
      label: r.title
    }))
  }, [reports])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#060504]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Booting Forensic Environment...</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-[#060504] overflow-hidden rounded-xl border border-[#1F1914]">
      {/* Control Overlay */}
      <div className="absolute top-6 left-6 z-10 space-y-4">
        <div className="bg-[#0C0A09]/90 backdrop-blur-md border border-[#1F1914] p-5 rounded-lg shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/20 p-2 rounded border border-primary/30">
              <GlobeIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-mono font-bold text-xs uppercase tracking-[0.2em] text-foreground">
              Forensic Globe v2.6
            </h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-12">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Active Vectors</span>
              <span className="text-[10px] text-primary font-mono font-bold">{arcs.length}</span>
            </div>
            <div className="flex items-center justify-between gap-12">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Intel Nodes</span>
              <span className="text-[10px] text-foreground font-mono font-bold">{points.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-[#0C0A09]/80 backdrop-blur-sm border border-[#1F1914] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
             <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
             Live Telemetry
          </div>
        </div>
      </div>

      {/* Detail Overlay Card */}
      {selectedIntel && (
        <div className="absolute right-6 top-6 z-20 w-72 bg-[#120F0D]/95 backdrop-blur-xl border border-primary/30 p-5 rounded-lg shadow-[0_0_50px_rgba(255,191,0,0.15)] animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/10 px-2 py-0.5 border border-primary/20 rounded text-[9px] font-mono text-primary uppercase tracking-tighter">
                {selectedIntel.riskLevel} Risk Entity
              </div>
              <button 
                onClick={() => setSelectedIntel(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close details"
              >
                <Maximize2 className="h-3 w-3 rotate-45" />
              </button>
           </div>
           
           <h4 className="font-bold text-sm text-foreground mb-1">{selectedIntel.title}</h4>
           <div className="flex items-center text-[10px] text-muted-foreground mb-4">
              <MapPin className="h-2.5 w-2.5 mr-1 text-primary/60" />
              {selectedIntel.city}, {selectedIntel.state}
           </div>
           
           <div className="space-y-3 mb-5 text-[11px]">
              <div className="flex justify-between border-b border-[#1F1914] pb-1.5">
                <span className="text-muted-foreground">Company:</span>
                <span className="text-foreground font-medium">{selectedIntel.company}</span>
              </div>
              <div className="flex justify-between border-b border-[#1F1914] pb-1.5">
                <span className="text-muted-foreground">Vector:</span>
                <span className="text-foreground font-medium">{selectedIntel.scamType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trust Score:</span>
                <span className="text-primary font-bold">{selectedIntel.trustScore}%</span>
              </div>
           </div>
           
           <p className="text-[10px] text-muted-foreground line-clamp-3 italic mb-4 border-l-2 border-primary/30 pl-3">
              "{selectedIntel.description}"
           </p>

           <Button size="sm" variant="outline" className="w-full text-[10px] h-8 font-mono tracking-widest uppercase bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary" asChild>
              <Link href={`/reports/${selectedIntel.id}`}>
                Access Full Dossier <Zap className="ml-1.5 h-3 w-3 fill-primary" />
              </Link>
           </Button>
        </div>
      )}

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
        pointsMerge={false}
        pointAltitude={0.01}
        onPointClick={(point: any) => setSelectedIntel(point)}
        
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
