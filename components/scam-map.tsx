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

          {/* Map */}
          <div className="mb-10 bg-card border border-border shadow-sm overflow-hidden h-[500px] sm:h-[600px]">
            <InteractiveMap
              centerLat={mapCenter.lat}
              centerLng={mapCenter.lng}
              reports={filteredReports}
              currentLocation={null}
            />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-card flex flex-col justify-between border border-border shadow-sm hover:border-primary/50 transition-colors"
              >
                <div className="p-6 border-b border-border bg-card">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <h3 className="font-semibold text-foreground text-base clamp-1">
                      {report.title}
                    </h3>
                    <Badge
                      className={cn(
                        "rounded-sm text-xs font-semibold shrink-0 cursor-default",
                        report.riskLevel === "high" && "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
                        report.riskLevel === "medium" && "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
                        report.riskLevel === "low" && "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10"
                      )}
                    >
                      {report.riskLevel}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium text-foreground truncate ml-4">{report.company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground truncate ml-4 flex items-center">
                         <MapPin className="h-3 w-3 mr-1" />
                         {report.city}, {report.state}
                      </span>
                    </div>
                     <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-medium">{report.scamType}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-background/50 flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6 flex-1">
                    {report.description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full font-semibold"
                  >
                    <Link href={`/reports/${report.id}`}>
                      View Full Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="border border-border p-12 text-center bg-card shadow-sm mt-8">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-muted rounded-full mb-6">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No Reports Found</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {searchResults
                  ? `There are no active threat reports logged for ${searchResults.city}.`
                  : "Search for a city or region to view active threat reports in that area."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
