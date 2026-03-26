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
      // Standard dark mode tiles, with Forensic Amber styling for markers
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
      new maplibregl.Marker({ color: "#F59E0B" }) // Amber primary
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25, className: "custom-popup" }).setHTML(`
            <div class="bg-[#0C0A07] border border-[#F59E0B]/50 p-4 shadow-sm font-sans tracking-tight">
              <h3 class="font-semibold text-[#F59E0B] mb-1 text-sm">Target Location</h3>
              <p class="text-xs text-gray-400">Search Center</p>
            </div>
          `),
        )
        .addTo(map.current)
    }

    reports.forEach((r) => {
      if (r.lat == null || r.lng == null) return

      const riskColor =
        r.riskLevel === "high" ? "#C0292A" : // Crimson
          r.riskLevel === "medium" ? "#F5CE0B" : // Yellow-ish Warning 
            "#737373" // Neutral gray for low

      const el = document.createElement("div")
      el.className = "custom-marker"
      el.style.cssText = `
        width: 16px;
        height: 16px;
        border: 2px solid ${riskColor};
        background: rgba(12, 10, 7, 0.9);
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        transition: all 0.2s ease;
        border-radius: 50%;
      `

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)"
        el.style.background = riskColor
      })

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)"
        el.style.background = "rgba(12, 10, 7, 0.9)"
      })

      const riskBadgeColor =
        r.riskLevel === "high" ? "text-[#C0292A] bg-[#C0292A]/10 border-[#C0292A]/20" :
          r.riskLevel === "medium" ? "text-[#F5CE0B] bg-[#F5CE0B]/10 border-[#F5CE0B]/20" :
            "text-[#737373] bg-[#737373]/10 border-[#737373]/20"

      new maplibregl.Marker(el)
        .setLngLat([r.lng, r.lat])
        .setPopup(
          new maplibregl.Popup({
            offset: 25,
            closeButton: false,
            className: "custom-popup"
          }).setHTML(`
            <div class="bg-[#0C0A07]/95 backdrop-blur-sm border border-gray-800 p-5 shadow-xl min-w-[280px] max-w-[320px] font-sans">
              <div class="flex items-start justify-between mb-4 pb-3 border-b border-gray-800/50">
                <h3 class="text-sm font-semibold text-white flex-1 pr-2 tracking-tight line-clamp-1">${r.title}</h3>
                <span class="px-2 py-0.5 border text-xs font-medium rounded-sm ${riskBadgeColor} shrink-0 capitalize">
                  ${r.riskLevel} Risk
                </span>
              </div>
              
              <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${r.city}, ${r.state}</span>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">Company:</span>
                  <span class="font-medium text-gray-200 truncate max-w-[150px]">${r.company}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">Trust Score:</span>
                  <span class="font-semibold text-green-500">${r.trustScore}%</span>
                </div>
              </div>

              <p class="text-xs text-gray-400 mb-5 line-clamp-2 leading-relaxed border-l-2 border-gray-800 pl-3">${r.description}</p>
              
              <a 
                href="/reports/${r.id}" 
                class="block w-full text-center px-4 py-2 bg-transparent border border-gray-700 hover:border-[#F59E0B] hover:text-[#F59E0B] text-gray-300 transition-colors text-sm font-medium rounded-sm"
              >
                View Full Details →
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
        className="relative bg-[#0C0A07] shadow-sm h-full w-full"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C0A07] z-10 border border-gray-800/50">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mb-4" />
            <p className="text-gray-400 font-medium text-sm">Loading Map Data...</p>
          </div>
        )}
      </div>
    </>
  )
})

export default InteractiveMap
