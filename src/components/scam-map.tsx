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
    { value: "high", label: "High Risk", classes: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20", count: displayedReports.filter(r => r.riskLevel === "high").length },
    { value: "medium", label: "Medium Risk", classes: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20", count: displayedReports.filter(r => r.riskLevel === "medium").length },
    { value: "low", label: "Low Risk", classes: "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20", count: displayedReports.filter(r => r.riskLevel === "low").length },
  ]

  return (
    <section className="relative min-h-screen bg-background py-16">

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary mb-6 rounded-sm font-semibold text-sm">
              <Layers className="h-4 w-4" />
              <span>Global Threat Map</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Interactive Heatmap
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Track reported scams and malicious organizations across geographic regions in real-time.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-10 space-y-4">
            {/* Search Bar */}
            <div className="bg-card border border-border shadow-sm">
              <div className="bg-card border-b border-border p-4 sm:p-5 flex gap-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                  <TerminalSquare className="h-4 w-4 text-primary" /> Location Search
                </div>
              </div>
              <div className="p-5 sm:p-6 bg-background/50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Enter city or region name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                      className="pl-12 h-12 bg-card border-border text-foreground text-base"
                    />
                  </div>
                  <Button
                    onClick={handleCitySearch}
                    disabled={isSearching}
                    className="h-12 px-8 font-semibold"
                  >
                    {isSearching ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Searching...</> : "Search Location"}
                  </Button>
                </div>

                {searchResults && (
                  <div className="mt-4 flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-medium">
                      <MapPin className="mr-2 h-3.5 w-3.5 inline-block" />
                      Showing: {searchResults.city}, {searchResults.state}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchResults(null)
                        setSearchTerm("")
                      }}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8"
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Level Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-4 bg-card border border-border p-4">
              <Button
                variant={selectedRiskFilter === null ? "default" : "outline"}
                onClick={() => setSelectedRiskFilter(null)}
                className={cn(
                  "h-9 text-sm font-semibold transition-colors",
                  selectedRiskFilter === null 
                    ? "bg-foreground text-background" 
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Filter className="mr-2 h-4 w-4" />
                All Reports ({displayedReports.length})
              </Button>
              {riskLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedRiskFilter === level.value ? "secondary" : "outline"}
                  onClick={() => setSelectedRiskFilter(selectedRiskFilter === level.value ? null : level.value)}
                  className={cn(
                    "h-9 text-sm font-semibold transition-colors border",
                    selectedRiskFilter === level.value 
                      ? level.classes 
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {level.label} ({level.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
            <div className="bg-card border border-border p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Threats</p>
                <p className="text-3xl font-bold text-foreground">
                  {filteredReports.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="bg-card border border-border p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">High Risk Entities</p>
                <p className="text-3xl font-bold text-destructive">
                  {filteredReports.filter(r => r.riskLevel === "high").length}
                </p>
              </div>
              <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
            </div>

            <div className="bg-card border border-border p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Trust Score</p>
                <p className="text-3xl font-bold text-success">
                  {filteredReports.length > 0
                    ? Math.round(filteredReports.reduce((sum, r) => sum + r.trustScore, 0) / filteredReports.length)
                    : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                <TerminalSquare className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-10 bg-[#0C0A09] border border-[#1F1914] shadow-2xl overflow-hidden h-[600px] sm:h-[800px] relative rounded-none group">
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
                <div className="bg-[#0C0A09]/80 backdrop-blur-sm border border-[#1F1914] p-4 rounded-none">
                  <p className="font-mono text-[10px] text-primary uppercase tracking-[0.2em]">Neural Engine v2.6</p>
                  <p className="text-muted-foreground text-xs mt-1 italic">Mapping global attack vectors using deterministic telemetry...</p>
                </div>
             </div>

             {/* View Mode Toggle Controls */}
             <div className="absolute top-6 right-6 z-10 flex gap-1.5 bg-[#0C0A09]/95 backdrop-blur-md border border-[#1F1914] p-1.5 shadow-2xl">
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
            <div className="border border-[#1F1914] p-16 text-center bg-[#15110E] relative overflow-hidden group rounded-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
