"use client"

import { memo, useRef, useEffect, useState } from "react"
import type { ScamReport } from "@/contexts/reports-context"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { AlertTriangle, Loader2 } from "lucide-react"

interface InteractiveMapProps {
  centerLat: number
  centerLng: number
  reports?: ScamReport[]
  currentLocation?: { lat: number; lng: number } | null
}

export const InteractiveMap = memo(function InteractiveMap({
  centerLat,
  centerLng,
  reports = [],
  currentLocation,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  /* --------------------------- INITIALIZE MAP -------------------------------- */
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      // For a "Cyber Dark" aesthetic, we could use a darker map style if available,
      // but 'demotiles' is standard. We will heavily style the popups/markers.
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [centerLng, centerLat],
        zoom: 4,
        attributionControl: false,
      })

      map.current.addControl(new maplibregl.NavigationControl(), "top-right")

      map.current.on("load", () => setMapLoaded(true))
    } catch (err) {
      console.error("Map initialization failed:", err)
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [centerLat, centerLng])

  /* ------------------------- KEEP CENTER IN SYNC ----------------------------- */
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [centerLng, centerLat],
        essential: true,
        zoom: 8,
        duration: 1500
      })
    }
  }, [centerLat, centerLng, mapLoaded])

  /* ----------------------------- DRAW MARKERS -------------------------------- */
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    document.querySelectorAll(".maplibregl-marker").forEach((m) => m.remove())

    if (currentLocation) {
      new maplibregl.Marker({ color: "#00FFFF" }) // Cyan primary
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25, className: "custom-popup" }).setHTML(`
            <div class="bg-[#050510] border border-[#00FFFF]/50 p-4 shadow-[0_0_15px_rgba(0,255,255,0.2)] font-mono uppercase tracking-widest">
              <h3 class="font-bold text-[#00FFFF] mb-1 text-xs">SYS: CURRENT_LOCATION</h3>
              <p class="text-[10px] text-gray-500">RADAR ORG_POINT</p>
            </div>
          `),
        )
        .addTo(map.current)
    }

    reports.forEach((r) => {
      if (r.lat == null || r.lng == null) return

      const riskColor =
        r.riskLevel === "high" ? "#EF4444" : // Destructive
          r.riskLevel === "medium" ? "#F5CE0B" : // Warning 
            "#00FFFF" // Primary

      const el = document.createElement("div")
      el.className = "custom-marker"
      el.style.cssText = `
        width: 16px;
        height: 16px;
        border: 2px solid ${riskColor};
        background: rgba(0,0,0,0.8);
        cursor: pointer;
        box-shadow: 0 0 10px ${riskColor};
        transition: all 0.3s ease;
        animation: ${r.riskLevel === "high" ? "pulse-marker 2s infinite" : "none"};
      `

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.5)"
        el.style.background = riskColor
      })

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)"
        el.style.background = "rgba(0,0,0,0.8)"
      })

      const riskBadgeColor =
        r.riskLevel === "high" ? "text-[#EF4444] border-[#EF4444]" :
          r.riskLevel === "medium" ? "text-[#F5CE0B] border-[#F5CE0B]" :
            "text-[#00FFFF] border-[#00FFFF]"

      new maplibregl.Marker(el)
        .setLngLat([r.lng, r.lat])
        .setPopup(
          new maplibregl.Popup({
            offset: 25,
            closeButton: false,
            className: "custom-popup"
          }).setHTML(`
            <div class="bg-[#050510]/95 backdrop-blur-md border border-gray-800 p-5 shadow-[0_0_20px_rgba(0,0,0,0.8)] min-w-[280px] max-w-[320px] font-mono uppercase">
              <div class="flex items-start justify-between mb-4 border-b border-gray-800 pb-3">
                <h3 class="text-xs font-bold text-white flex-1 pr-2 tracking-widest line-clamp-1">${r.title}</h3>
                <span class="px-2 py-0.5 border text-[10px] font-bold ${riskBadgeColor} bg-black shrink-0 tracking-widest">
                  ${r.riskLevel}_RISK
                </span>
              </div>
              
              <div class="flex items-center gap-2 text-[10px] text-gray-500 tracking-widest font-bold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00FFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${r.city}, ${r.state}</span>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-[10px] tracking-widest">
                  <span class="text-gray-600">NODE_ID:</span>
                  <span class="font-bold text-gray-300 truncate max-w-[150px]">${r.company}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] tracking-widest">
                  <span class="text-gray-600">TRUST_SCORE:</span>
                  <span class="font-bold text-[#22c55e]">${r.trustScore}%</span>
                </div>
              </div>

              <p class="text-[10px] text-gray-400 mb-5 line-clamp-2 tracking-wide border-l border-gray-700 pl-2">${r.description}</p>
              
              <a 
                href="/reports/${r.id}" 
                class="block w-full text-center px-4 py-2 border border-[#00FFFF]/50 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-all text-xs font-bold tracking-widest"
              >
                DUMP_LOGS ->
              </a>
            </div>
          `),
        )
        .addTo(map.current!)
    })
  }, [reports, currentLocation, mapLoaded])

  /* ------------------------------- RENDER ------------------------------------ */
  return (
    <>
      <style jsx global>{`
        @keyframes pulse-marker {
          0% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.8), 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          70% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.8), 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.8), 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        .maplibregl-popup-content {
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .maplibregl-popup-tip {
          display: none;
        }

        /* Adjusting the leaflet tiles to look dark by default using CSS filters */
        .maplibregl-canvas {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}</style>

      <div
        ref={mapContainer}
        className="relative border-2 border-border/50 bg-[#050510] shadow-[0_0_30px_rgba(0,255,255,0.05)]"
        style={{ width: "100%", height: 600 }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050510] z-10 border border-[#00FFFF]/20">
            <Loader2 className="h-10 w-10 animate-spin text-[#00FFFF] mb-4 drop-shadow-[0_0_10px_currentColor]" />
            <p class="text-[#00FFFF] font-mono uppercase tracking-widest text-xs animate-pulse">ESTABLISHING_RADAR_LINK...</p>
          </div>
        )}
      </div>
    </>
  )
})

export default InteractiveMap
