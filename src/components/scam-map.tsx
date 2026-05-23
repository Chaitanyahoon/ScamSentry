"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, Loader2, Filter, Layers, TrendingUp, TerminalSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useReports } from "@/contexts/reports-context"
import { geocodeCity, type GeocodingResult } from "@/utils/geocoding"
import { InteractiveMap } from "@/components/interactive-map"
import { ForensicGlobe } from "@/components/forensic-globe"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function ScamMap() {
  const { toast } = useToast()
  const { reports, searchReportsByCity } = useReports()
  const [searchTerm, setSearchTerm] = useState("")
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 })
  const [displayedReports, setDisplayedReports] = useState(reports.filter((r) => r.status === "approved"))
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GeocodingResult | null>(null)
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d")

  useEffect(() => {
    if (searchResults) {
      const cityReports = searchReportsByCity(searchResults.city)
      setDisplayedReports(cityReports)
      setMapCenter({ lat: searchResults.lat, lng: searchResults.lng })
    } else {
      const allApproved = reports.filter((r) => r.status === "approved")
      setDisplayedReports(allApproved)
      
      // Calculate center based on the location with the most complaints
      if (allApproved.length > 0) {
        // Find most frequent location
        const locationCounts = allApproved.reduce((acc: Record<string, {count: number, lat: number, lng: number}>, report) => {
          if (report.lat && report.lng) {
            const key = `${report.lat},${report.lng}`
            if (!acc[key]) acc[key] = { count: 0, lat: report.lat, lng: report.lng }
            acc[key].count++
          }
          return acc
        }, {})
        
        let maxCount = 0
        let bestCenter = { lat: 39.8283, lng: -98.5795 }
        
        Object.values(locationCounts).forEach(loc => {
          if (loc.count > maxCount) {
            maxCount = loc.count
            bestCenter = { lat: loc.lat, lng: loc.lng }
          }
        })
        
        setMapCenter(bestCenter)
      } else {
        setMapCenter({ lat: 39.8283, lng: -98.5795 })
      }
    }
  }, [searchResults, reports, searchReportsByCity])

  const handleCitySearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const result = await geocodeCity(searchTerm)
      if (result) {
        setSearchResults(result)
        toast({
          title: "Location Found",
          description: `Focusing map on: ${result.displayName}`,
        })
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find coordinates for that location.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to connect to geocoding service.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const filteredReports = displayedReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRisk = selectedRiskFilter ? report.riskLevel === selectedRiskFilter : true

    return matchesSearch && matchesRisk
  })

  const riskLevels = [
    { value: "high", label: "High Risk", classes: "bg-destructive border-destructive text-destructive-foreground", count: displayedReports.filter(r => r.riskLevel === "high").length },
    { value: "medium", label: "Medium Risk", classes: "bg-[#F59E0B] border-[#F59E0B] text-black", count: displayedReports.filter(r => r.riskLevel === "medium").length },
    { value: "low", label: "Low Risk", classes: "bg-[#8C5A1A] border-[#8C5A1A] text-white", count: displayedReports.filter(r => r.riskLevel === "low").length },
  ]

  return (
    <section className="relative min-h-screen bg-[#0C0A09] py-16 font-mono text-[#E8DBC8]">

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-primary/20 bg-[#15110E] text-primary mb-6 rounded-none font-mono text-xs tracking-widest uppercase">
              <Layers className="h-3.5 w-3.5 animate-pulse" />
              <span>Global Threat Map</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4 uppercase tracking-wider">
              Interactive Heatmap
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-2xl mx-auto border-l-2 border-primary/50 pl-4 py-1">
              Track reported scams and malicious organizations across geographic regions in real-time.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-10 space-y-4">
            {/* Search Bar */}
            <div className="bg-[#0C0A09] border border-[#1F1914]">
              <div className="bg-[#15110E] border-b border-[#1F1914] p-4 sm:p-5 flex gap-5">
                <div className="flex items-center gap-2 text-xs font-mono font-black text-muted-foreground/60 tracking-wider uppercase">
                  <TerminalSquare className="h-3.5 w-3.5 text-primary" /> LOCATION_QUERY_INPUT
                </div>
              </div>
              <div className="p-5 sm:p-6 bg-[#070605]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Input
                      placeholder="Enter city or region name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                      className="pl-12 h-12 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>
                  <Button
                    onClick={handleCitySearch}
                    disabled={isSearching}
                    className="h-12 px-8 font-mono text-xs font-bold uppercase tracking-widest rounded-none bg-primary text-black hover:bg-white border border-primary transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  >
                    {isSearching ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...</> : "Search Location"}
                  </Button>
                </div>

                {searchResults && (
                  <div className="mt-4 flex items-center gap-3">
                    <Badge className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-[10px] font-mono font-bold tracking-widest rounded-none uppercase">
                      <MapPin className="mr-1.5 h-3 w-3 inline-block" />
                      Showing: {searchResults.city}, {searchResults.state}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchResults(null)
                        setSearchTerm("")
                      }}
                      className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 h-8 rounded-none font-mono text-[9px] uppercase tracking-widest"
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Level Filters */}
            <div className="flex flex-wrap gap-2 bg-[#0C0A09] border border-[#1F1914] p-4 rounded-none select-none">
              <button
                onClick={() => setSelectedRiskFilter(null)}
                className={cn(
                  "px-4 h-9 font-mono text-[9px] font-bold uppercase tracking-widest border transition-all rounded-none",
                  selectedRiskFilter === null
                    ? "bg-primary border-primary text-black"
                    : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-foreground hover:border-[#3E3329]"
                )}
              >
                [ ALL_REPORTS ({displayedReports.length}) ]
              </button>
              {riskLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedRiskFilter(selectedRiskFilter === level.value ? null : level.value)}
                  className={cn(
                    "px-4 h-9 font-mono text-[9px] font-bold uppercase tracking-widest border transition-all rounded-none",
                    selectedRiskFilter === level.value
                      ? level.classes
                      : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-foreground hover:border-[#3E3329]"
                  )}
                >
                  [ {level.label.replace(" ", "_").toUpperCase()} ({level.count}) ]
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 select-none">
            <div className="bg-[#0C0A09] border border-[#1F1914] p-6 flex items-center justify-between rounded-none">
              <div>
                <p className="text-[10px] font-mono font-bold text-muted-foreground/50 mb-1 uppercase tracking-widest">TOTAL THREATS</p>
                <p className="text-3xl font-black text-foreground font-mono">
                  {filteredReports.length}
                </p>
              </div>
              <div className="h-10 w-10 bg-primary/5 border border-primary/20 flex items-center justify-center rounded-none">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="bg-[#0C0A09] border border-[#1F1914] p-6 flex items-center justify-between rounded-none">
              <div>
                <p className="text-[10px] font-mono font-bold text-muted-foreground/50 mb-1 uppercase tracking-widest">HIGH RISK ENTITIES</p>
                <p className="text-3xl font-black text-destructive font-mono">
                  {filteredReports.filter(r => r.riskLevel === "high").length}
                </p>
              </div>
              <div className="h-10 w-10 bg-destructive/5 border border-destructive/20 flex items-center justify-center rounded-none">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
            </div>

            <div className="bg-[#0C0A09] border border-[#1F1914] p-6 flex items-center justify-between rounded-none">
              <div>
                <p className="text-[10px] font-mono font-bold text-muted-foreground/50 mb-1 uppercase tracking-widest">AVG TRUST SCORE</p>
                <p className="text-3xl font-black text-success font-mono">
                  {filteredReports.length > 0
                    ? Math.round(filteredReports.reduce((sum, r) => sum + r.trustScore, 0) / filteredReports.length)
                    : 0}%
                </p>
              </div>
              <div className="h-10 w-10 bg-success/5 border border-success/20 flex items-center justify-center rounded-none">
                <TerminalSquare className="h-5 w-5 text-success" />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-10 bg-[#0C0A09] border border-[#1F1914] overflow-hidden h-[600px] sm:h-[800px] relative rounded-none group">
             {viewMode === "3d" ? (
                <div className="absolute inset-0 z-0">
                   <ForensicGlobe reports={filteredReports} />
                </div>
             ) : (
                <div className="absolute inset-0 z-0">
                   <InteractiveMap
                     centerLat={mapCenter.lat}
                     centerLng={mapCenter.lng}
                     reports={filteredReports}
                     currentLocation={searchResults ? { lat: searchResults.lat, lng: searchResults.lng } : null}
                   />
                </div>
             )}
             
             {/* Map Overlay for Info */}
             <div className="absolute bottom-6 left-6 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-[#0C0A09]/95 border border-[#1F1914] p-4 rounded-none">
                  <p className="font-mono text-[10px] text-primary uppercase tracking-[0.2em]">Neural Engine v2.6</p>
                  <p className="text-muted-foreground text-xs mt-1 italic">Mapping global attack vectors using deterministic telemetry...</p>
                </div>
             </div>

             {/* View Mode Toggle Controls */}
             <div className="absolute top-6 right-6 z-10 flex gap-1.5 bg-[#0C0A09] border border-[#1F1914] p-1.5">
               <button
                 onClick={() => setViewMode("2d")}
                 className={cn(
                   "px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest transition-all rounded-none border",
                   viewMode === "2d"
                     ? "bg-primary border-primary text-black"
                     : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-foreground hover:border-[#3E3329]"
                 )}
               >
                 [ 2D_MAP ]
               </button>
               <button
                 onClick={() => setViewMode("3d")}
                 className={cn(
                   "px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest transition-all rounded-none border",
                   viewMode === "3d"
                     ? "bg-primary border-primary text-black"
                     : "bg-[#070605] border-[#1F1914] text-muted-foreground/60 hover:text-foreground hover:border-[#3E3329]"
                 )}
               >
                 [ 3D_GLOBE ]
               </button>
             </div>
          </div>

          {/* Threat Registry Ledger Table */}
          {filteredReports.length > 0 ? (
            <div className="border border-[#1F1914] bg-[#0C0A09] relative overflow-hidden select-text">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20 pointer-events-none" />

              {/* Table Title Bar */}
              <div className="bg-[#15110E] p-4 border-b border-[#1F1914] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-foreground">
                    [ GLOBAL_THREAT_REGISTRY_LEDGER ]
                  </span>
                </div>
                <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest hidden sm:inline">
                  VERIFICATION_PROTOCOL: PEER_CONSENSUS
                </span>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto w-full">
                <table className="w-full font-mono text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F1914] bg-[#120F0D] text-muted-foreground select-none uppercase tracking-widest text-[9px]">
                      <th className="p-4 font-black">STATUS</th>
                      <th className="p-4 font-black">IDENTIFIER / TARGET</th>
                      <th className="p-4 font-black">GEOGRAPHIC NODE</th>
                      <th className="p-4 font-black">ATTACK VECTOR</th>
                      <th className="p-4 font-black text-center">RISK</th>
                      <th className="p-4 font-black text-right">DOSSIER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1914]/50">
                    {filteredReports.map((report) => (
                      <tr 
                        key={report.id}
                        className="hover:bg-[#12100E]/70 transition-colors group"
                      >
                        {/* Status */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "h-2 w-2 rounded-full",
                              report.riskLevel === "high" ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"
                            )} />
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
                              {report.status.toUpperCase()}
                            </span>
                          </div>
                        </td>

                        {/* Identifier */}
                        <td className="p-4 align-middle max-w-[280px]">
                          <div className="space-y-1">
                            <p className="font-bold text-[#E7E5E4] group-hover:text-primary transition-colors line-clamp-1 uppercase">
                              {report.title}
                            </p>
                            <p className="text-[9px] text-muted-foreground/40 uppercase">
                              TARGET: {report.company}
                            </p>
                          </div>
                        </td>

                        {/* Geographic Node */}
                        <td className="p-4 align-middle text-muted-foreground/80">
                          <div className="flex items-center gap-1.5 uppercase">
                            <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            <span>{report.city || "GLOBAL"}, {report.state || "INT"}</span>
                          </div>
                        </td>

                        {/* Attack Vector */}
                        <td className="p-4 align-middle text-muted-foreground/60 uppercase">
                          {report.scamType}
                        </td>

                        {/* Risk */}
                        <td className="p-4 align-middle text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-none text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5",
                              report.riskLevel === "high" && "bg-red-500/10 border-red-500/30 text-red-400",
                              report.riskLevel === "medium" && "bg-amber-500/5 border-amber-500/20 text-amber-500",
                              report.riskLevel === "low" && "bg-[#1C1917] border-[#292524] text-muted-foreground/70"
                            )}
                          >
                            {report.riskLevel}
                          </Badge>
                        </td>

                        {/* Dossier */}
                        <td className="p-4 align-middle text-right">
                          <Button
                            asChild
                            variant="outline"
                            className="h-7 px-3.5 rounded-none font-mono text-[9px] font-black uppercase tracking-widest border-[#1F1914] bg-primary/5 hover:bg-primary hover:text-black hover:border-primary transition-all"
                          >
                            <Link href={`/reports/${report.id}`}>
                              [ ACCESS ]
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border border-[#1F1914] p-16 text-center bg-[#15110E] relative overflow-hidden rounded-none">
              <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground mb-2">[ ERROR_404: NO_TELEMETRY_FOUND ]</h3>
              <p className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest max-w-md mx-auto">
                The current matrix query yielded zero results. Adjust filtering parameters to expand search radius.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedRiskFilter(null)
                }}
                className="mt-8 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest h-10 px-8 transition-all"
              >
                RESET_QUERY_MATRIX
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
