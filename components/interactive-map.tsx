"use client"

import { memo, useRef, useEffect, useState } from "react"
import type { ScamReport } from "@/contexts/reports-context"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { AlertTriangle } from "lucide-react"
import { Loader2 } from "@/components/ui/loader"

interface InteractiveMapProps {
  centerLat: number
  centerLng: number
  reports?: ScamReport[]
  currentLocation?: { lat: number; lng: number } | null
}

/* -------------------------------------------------------------------------- */
/*  InteractiveMap component                                                  */
/* -------------------------------------------------------------------------- */
export const InteractiveMap = memo(function InteractiveMap({
  centerLat,
  centerLng,
  reports = [],
  currentLocation,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  /* --------------------------- INITIALISE MAP -------------------------------- */
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json", // Open-source street style
        center: [centerLng, centerLat],
        zoom: 4,
        attributionControl: false,
      })

      map.current.on("load", () => setMapLoaded(true))
    } catch (err) {
      // Silently fail & keep placeholder if WebGL is unavailable
      console.error("Map initialisation failed:", err)
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [centerLat, centerLng])

  /* ------------------------- KEEP CENTER IN SYNC ----------------------------- */
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({ center: [centerLng, centerLat], essential: true, zoom: 8 })
    }
  }, [centerLat, centerLng, mapLoaded])

  /* ----------------------------- DRAW MARKERS -------------------------------- */
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Remove all existing markers (MapLibre stores them as custom layers, so iterate DOM)
    document.querySelectorAll(".maplibregl-marker").forEach((m) => m.remove())

    // Current-location marker (blue)
    if (currentLocation) {
      new maplibregl.Marker({ color: "#3B82F6" })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<h3 class="font-semibold">Your location</h3><p class="text-sm text-gray-500">Nearby scam reports</p>`,
          ),
        )
        .addTo(map.current)
    }

    // Scam-report markers
    reports.forEach((r) => {
      if (r.lat == null || r.lng == null) return

      const riskColorClass =
        r.riskLevel === "high" ? "bg-red-500" : r.riskLevel === "medium" ? "bg-yellow-500" : "bg-green-500"

      const el = document.createElement("div")
      el.style.cssText = `
        width:16px;height:16px;border-radius:50%;border:2px solid white;
        background:${r.riskLevel === "high" ? "#EF4444" : r.riskLevel === "medium" ? "#FACC15" : "#22C55E"};cursor:pointer;
      `

      new maplibregl.Marker(el)
        .setLngLat([r.lng, r.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `
            <div class="p-2 text-gray-900 dark:text-gray-100">
              <h3 class="text-base font-bold mb-1">${r.title}</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-map-pin mr-1"><path d="M12 12.2A4 4 0 1 0 12 4a4 4 0 0 0 0 8.2Z"/><path d="M20 12c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0Z"/></svg>
                ${r.city}, ${r.state}
              </p>
              <div class="flex items-center gap-2 text-xs mb-2">
                <span class="px-2 py-0.5 rounded-full text-white ${riskColorClass}">
                  ${r.riskLevel} Risk
                </span>
                <span class="text-gray-700 dark:text-gray-300">Trust: ${r.trustScore}%</span>
              </div>
              <p class="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">${r.description}</p>
              <a href="/reports/${r.id}" class="text-blue-600 hover:underline text-xs mt-2 block">View Details</a>
            </div>
            `,
          ),
        )
        .addTo(map.current)
    })
  }, [reports, currentLocation, mapLoaded])

  /* ------------------------------- RENDER ------------------------------------ */
  return (
    <div
      ref={mapContainer}
      className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow"
      style={{ width: "100%", height: 500 }} // Increased height and removed max-width/margin
    >
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 z-10">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          Loading map…
        </div>
      )}

      {mapLoaded && reports.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 text-center space-y-2 z-10 bg-white/80 dark:bg-gray-900/80">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <p className="font-medium">No scam reports found in this area.</p>
          <p className="text-sm">Try another city or add a new report.</p>
        </div>
      )}
    </div>
  )
})

export default InteractiveMap
