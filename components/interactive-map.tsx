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
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [centerLng, centerLat],
        zoom: 4,
        attributionControl: false,
      })

      // Add navigation controls
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

    // Remove all existing markers
    document.querySelectorAll(".maplibregl-marker").forEach((m) => m.remove())

    // Current-location marker (blue)
    if (currentLocation) {
      new maplibregl.Marker({ color: "#6366f1" })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25, className: "custom-popup" }).setHTML(`
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl min-w-[200px]">
              <h3 class="font-bold text-purple-600 dark:text-purple-400 mb-1">Your Location</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">Nearby scam reports</p>
            </div>
          `),
        )
        .addTo(map.current)
    }

    // Scam-report markers with pulse animation
    reports.forEach((r) => {
      if (r.lat == null || r.lng == null) return

      const riskColor =
        r.riskLevel === "high" ? "#EF4444" :
          r.riskLevel === "medium" ? "#F59E0B" :
            "#10B981"

      const el = document.createElement("div")
      el.className = "custom-marker"
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        background: ${riskColor};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 ${riskColor};
        transition: all 0.3s ease;
        animation: ${r.riskLevel === "high" ? "pulse-marker 2s infinite" : "none"};
      `

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.3)"
        el.style.boxShadow = `0 6px 20px rgba(0,0,0,0.4), 0 0 20px ${riskColor}`
      })

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)"
        el.style.boxShadow = `0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 ${riskColor}`
      })

      const riskBadgeClass =
        r.riskLevel === "high" ? "bg-gradient-to-r from-red-500 to-pink-600" :
          r.riskLevel === "medium" ? "bg-gradient-to-r from-yellow-500 to-orange-600" :
            "bg-gradient-to-r from-green-500 to-emerald-600"

      new maplibregl.Marker(el)
        .setLngLat([r.lng, r.lat])
        .setPopup(
          new maplibregl.Popup({
            offset: 25,
            closeButton: false,
            className: "custom-popup"
          }).setHTML(`
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl min-w-[280px] max-w-[320px]">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-base font-bold text-gray-900 dark:text-white flex-1 pr-2">${r.title}</h3>
                <span class="px-2 py-1 rounded-full text-white text-xs font-semibold ${riskBadgeClass} whitespace-nowrap">
                  ${r.riskLevel.toUpperCase()}
                </span>
              </div>
              
              <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${r.city}, ${r.state}</span>
              </div>

              <div class="space-y-2 mb-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Company:</span>
                  <span class="font-medium text-gray-900 dark:text-white">${r.company}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Trust Score:</span>
                  <span class="font-semibold text-green-600 dark:text-green-400">${r.trustScore}%</span>
                </div>
              </div>

              <p class="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">${r.description}</p>
              
              <a 
                href="/reports/${r.id}" 
                class="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
              >
                View Full Report
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
      {/* Add custom styles for markers */}
      <style jsx global>{`
        @keyframes pulse-marker {
          0% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(239, 68, 68, 0);
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

        .custom-popup .maplibregl-popup-content {
          border-radius: 0.75rem;
        }
      `}</style>

      <div
        ref={mapContainer}
        className="relative rounded-2xl overflow-hidden glass border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
        style={{ width: "100%", height: 600 }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center glass z-10">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading interactive map...</p>
          </div>
        )}

        {mapLoaded && reports.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 z-10 glass">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">No scam reports found</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This area appears to be safe! Try searching another location.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
})

export default InteractiveMap
