"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, Loader2, Filter, Layers, TrendingUp, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useReports } from "@/contexts/reports-context"
import { geocodeCity, type GeocodingResult } from "@/utils/geocoding"
import { InteractiveMap } from "@/components/interactive-map"
import { cn } from "@/lib/utils"

export function ScamMap() {
  const { toast } = useToast()
  const { reports, searchReportsByCity } = useReports()
  const [searchTerm, setSearchTerm] = useState("")
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 })
  const [displayedReports, setDisplayedReports] = useState(reports.filter((r) => r.status === "approved"))
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GeocodingResult | null>(null)
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string | null>(null)

  useEffect(() => {
    if (searchResults) {
      const cityReports = searchReportsByCity(searchResults.city)
      setDisplayedReports(cityReports)
      setMapCenter({ lat: searchResults.lat, lng: searchResults.lng })
    } else {
      setDisplayedReports(reports.filter((r) => r.status === "approved"))
      setMapCenter({ lat: 39.8283, lng: -98.5795 })
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
          title: "LOCATION_FOUND",
          description: `INITIATING PING SWEEP IN: ${result.displayName}`,
        })
      } else {
        toast({
          title: "SYS_ERR: LOCATION_NULL",
          description: "ATTEMPT FAILED. CHECK CO-ORDINATE SPELLING.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "SYS_ERR: KERNEL_PANIC",
        description: "GEO-API CONNECTION ABORTED.",
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
    { value: "high", label: "CRITICAL_THREATS", classes: "bg-destructive/20 text-destructive border border-destructive shadow-[0_0_5px_hsla(var(--destructive),0.5)]", count: displayedReports.filter(r => r.riskLevel === "high").length },
    { value: "medium", label: "ELEVATED_RISK", classes: "bg-warning/20 text-warning border border-warning shadow-[0_0_5px_hsla(var(--warning),0.5)]", count: displayedReports.filter(r => r.riskLevel === "medium").length },
    { value: "low", label: "ANOMALIES", classes: "bg-secondary/20 text-secondary border border-secondary shadow-[0_0_5px_hsla(var(--secondary),0.5)]", count: displayedReports.filter(r => r.riskLevel === "low").length },
  ]

  return (
    <section className="relative min-h-screen bg-background py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/50 text-primary mb-6 shadow-[0_0_10px_hsla(var(--primary),0.2)]">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">GLOBAL_THREAT_VISUALIZATION</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-widest uppercase sm:text-6xl text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              INTERACTIVE <span className="text-primary drop-shadow-[0_0_10px_hsla(var(--primary),0.5)]">HEATMAP</span>
            </h2>
            <p className="mt-4 text-sm font-mono tracking-widest uppercase text-muted-foreground">
              TRACK ACTIVE MALICIOUS NODES ACROSS GEOGRAPHIC COORDINATES IN REAL TIME.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100 font-mono">
            {/* Search Bar */}
            <div className="glass-strong">
              <div className="bg-card/80 border-b border-border p-4 flex gap-5">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase">
                  <Terminal className="h-4 w-4 text-primary" /> RADAR_TARGETING_MODULE
                </div>
              </div>
              <div className="p-6 bg-background/50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary drop-shadow-[0_0_5px_currentColor]" />
                    <Input
                      placeholder="ENTER NODE CITY/REGION FOR SECTOR SCAN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                      className="pl-12 h-14 bg-card/50 border-border text-foreground tracking-widest rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50 border-2 uppercase"
                    />
                  </div>
                  <Button
                    onClick={handleCitySearch}
                    disabled={isSearching}
                    className="h-14 px-10 cyber-button uppercase tracking-widest font-bold"
                  >
                    {isSearching ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> SCANNING...</> : "INITIATE_SWEEP"}
                  </Button>
                </div>

                {searchResults && (
                  <div className="mt-4 flex items-center gap-3">
                    <Badge className="bg-primary/20 hover:bg-primary/20 text-primary border border-primary px-3 py-1.5 rounded-none font-bold uppercase tracking-widest shadow-[0_0_5px_hsla(var(--primary),0.5)] flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      LOCKED: {searchResults.city}, {searchResults.state}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchResults(null)
                        setSearchTerm("")
                      }}
                      className="h-8 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none border border-transparent hover:border-destructive/30"
                    >
                      ABORT_TARGET
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Level Filters */}
            <div className="flex flex-wrap gap-3 glass-card p-4">
              <Button
                variant={selectedRiskFilter === null ? "default" : "outline"}
                onClick={() => setSelectedRiskFilter(null)}
                className={cn(
                  "h-10 rounded-none border text-xs font-bold uppercase tracking-widest transition-all",
                  selectedRiskFilter === null 
                    ? "border-primary bg-primary text-black drop-shadow-[0_0_5px_hsla(var(--primary),0.5)]" 
                    : "border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Filter className="mr-2 h-4 w-4" />
                SHOW_ALL_PINGS ({displayedReports.length})
              </Button>
              {riskLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedRiskFilter === level.value ? "default" : "outline"}
                  onClick={() => setSelectedRiskFilter(selectedRiskFilter === level.value ? null : level.value)}
                  className={cn(
                    "h-10 rounded-none border text-xs font-bold uppercase tracking-widest transition-all",
                    selectedRiskFilter === level.value 
                      ? level.classes 
                      : "border-border bg-card/50 text-muted-foreground hover:border-border hover:bg-background"
                  )}
                >
                  {level.label} ({level.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <div className="glass-card p-6 border-t-2 border-t-primary/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest font-mono text-muted-foreground">TOTAL_THREATS_DETECTED</p>
                  <p className="text-4xl font-extrabold text-foreground mt-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                    {filteredReports.length}
                  </p>
                </div>
                <div className="h-12 w-12 border border-primary/50 bg-primary/10 flex items-center justify-center shadow-[0_0_10px_hsla(var(--primary),0.3)]">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-t-2 border-t-destructive/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest font-mono text-muted-foreground">CRITICAL_LEVEL_PINGS</p>
                  <p className="text-4xl font-extrabold text-destructive mt-2 drop-shadow-[0_0_8px_hsla(var(--destructive),0.5)]">
                    {filteredReports.filter(r => r.riskLevel === "high").length}
                  </p>
                </div>
                <div className="h-12 w-12 border border-destructive/50 bg-destructive/10 flex items-center justify-center shadow-[0_0_10px_hsla(var(--destructive),0.3)]">
                  <TrendingUp className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-t-2 border-t-success/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest font-mono text-muted-foreground">AVERAGE_VERIFICATION</p>
                  <p className="text-4xl font-extrabold text-success mt-2 drop-shadow-[0_0_8px_hsla(var(--success),0.5)]">
                    {filteredReports.length > 0
                      ? Math.round(filteredReports.reduce((sum, r) => sum + r.trustScore, 0) / filteredReports.length)
                      : 0}%
                  </p>
                </div>
                <div className="h-12 w-12 border border-success/50 bg-success/10 flex items-center justify-center shadow-[0_0_10px_hsla(var(--success),0.3)]">
                  <Terminal className="h-6 w-6 text-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <InteractiveMap
              centerLat={mapCenter.lat}
              centerLng={mapCenter.lng}
              reports={filteredReports}
              currentLocation={null}
            />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <div
                key={report.id}
                className={cn(
                  "glass-card flex flex-col justify-between group overflow-hidden border-t-2 border-t-border hover:border-t-primary transition-all duration-300",
                )}
              >
                <div className="p-6 border-b border-border/50 bg-card/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
                      <MapPin className="h-4 w-4 text-primary" />
                      {report.city}, {report.state}
                    </h3>
                    <Badge
                      className={cn(
                        "rounded-none text-xs font-bold px-2 py-0 border",
                        report.riskLevel === "high" && "bg-destructive/20 text-destructive border-destructive drop-shadow-[0_0_5px_hsla(var(--destructive),0.5)]",
                        report.riskLevel === "medium" && "bg-warning/20 text-warning border-warning drop-shadow-[0_0_5px_hsla(var(--warning),0.5)]",
                        report.riskLevel === "low" && "bg-secondary/20 text-secondary border-secondary drop-shadow-[0_0_5px_hsla(var(--secondary),0.5)]"
                      )}
                    >
                      {report.riskLevel}_RISK
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">NODE_ID:</span>
                      <span className="text-xs font-bold truncate ml-2 text-foreground">{report.company}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">VECTOR:</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-secondary">{report.scamType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">TRUST_SCORE:</span>
                      <span className="text-xs font-bold text-success">{report.trustScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-background/50">
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3 font-mono tracking-wide leading-relaxed border-l-2 border-border pl-3">
                    {report.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-6 h-10 rounded-none bg-transparent border-primary/50 text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-widest transition-all"
                  >
                    DUMP_FULL_LOGS →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="border border-border p-16 text-center bg-card/50 glass-card">
              <div className="inline-flex h-20 w-20 items-center justify-center border border-primary/50 bg-primary/10 mb-6 shadow-[0_0_15px_hsla(var(--primary),0.3)]">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-mono tracking-widest uppercase text-foreground mb-3">SECTOR_CLEAR</h3>
              <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">
                {searchResults
                  ? "NO MALICIOUS ACTIVITY DETECTED IN THIS GRID SECTOR."
                  : "INITIALIZE PROTOCOL BY SEARCHING A GEOGRAPHIC TARGET."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
