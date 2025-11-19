"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, Loader2, Filter, Layers, TrendingUp } from "lucide-react"
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

  // Update displayed reports when search results or reports change
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
          title: "City Found",
          description: `Showing scam reports in ${result.displayName}`,
        })
      } else {
        toast({
          title: "City Not Found",
          description: "Please try a different city name or check spelling",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Unable to search for city. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Filter by risk level
  const filteredReports = displayedReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRisk = selectedRiskFilter ? report.riskLevel === selectedRiskFilter : true

    return matchesSearch && matchesRisk
  })

  const riskLevels = [
    { value: "high", label: "High Risk", color: "from-red-500 to-pink-600", count: displayedReports.filter(r => r.riskLevel === "high").length },
    { value: "medium", label: "Medium Risk", color: "from-yellow-500 to-orange-600", count: displayedReports.filter(r => r.riskLevel === "medium").length },
    { value: "low", label: "Low Risk", color: "from-green-500 to-emerald-600", count: displayedReports.filter(r => r.riskLevel === "low").length },
  ]

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%)]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/20 mb-4">
              <Layers className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Interactive Heatmap</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Live Scam Map
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Explore real scam reports by location and type
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4 animate-slide-up stagger-1">
            {/* Search Bar */}
            <Card className="glass border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search city (e.g., New York, Los Angeles)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                      className="pl-10 h-12 text-base glass border-0 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <Button
                    onClick={handleCitySearch}
                    disabled={isSearching}
                    className="h-12 px-6 gradient-primary text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {searchResults && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge className="glass border-purple-500/30 text-purple-700 dark:text-purple-300">
                      <MapPin className="mr-1 h-3 w-3" />
                      {searchResults.city}, {searchResults.state}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchResults(null)
                        setSearchTerm("")
                      }}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Level Filters */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedRiskFilter === null ? "default" : "outline"}
                onClick={() => setSelectedRiskFilter(null)}
                className={cn(
                  "transition-all",
                  selectedRiskFilter === null && "gradient-primary text-white"
                )}
              >
                <Filter className="mr-2 h-4 w-4" />
                All Reports ({displayedReports.length})
              </Button>
              {riskLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedRiskFilter === level.value ? "default" : "outline"}
                  onClick={() => setSelectedRiskFilter(selectedRiskFilter === level.value ? null : level.value)}
                  className={cn(
                    "transition-all",
                    selectedRiskFilter === level.value && `bg-gradient-to-r ${level.color} text-white border-0`
                  )}
                >
                  {level.label} ({level.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="mb-8 animate-slide-up stagger-2">
            <InteractiveMap
              centerLat={mapCenter.lat}
              centerLng={mapCenter.lng}
              reports={filteredReports}
              currentLocation={null}
            />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up stagger-3">
            <Card className="glass border-gray-200/50 dark:border-gray-700/50 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {filteredReports.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-gray-200/50 dark:border-gray-700/50 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">High Risk</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {filteredReports.filter(r => r.riskLevel === "high").length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-gray-200/50 dark:border-gray-700/50 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Trust Score</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {filteredReports.length > 0
                        ? Math.round(filteredReports.reduce((sum, r) => sum + r.trustScore, 0) / filteredReports.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in stagger-4">
            {filteredReports.map((report, index) => (
              <Card
                key={report.id}
                className={cn(
                  "group glass border-gray-200/50 dark:border-gray-700/50 hover-lift transition-all duration-500",
                  `animate-slide-up stagger-${Math.min(index + 1, 6)}`
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      {report.city}, {report.state}
                    </CardTitle>
                    <Badge
                      className={cn(
                        "text-white border-0",
                        report.riskLevel === "high" && "bg-gradient-to-r from-red-500 to-pink-600",
                        report.riskLevel === "medium" && "bg-gradient-to-r from-yellow-500 to-orange-600",
                        report.riskLevel === "low" && "bg-gradient-to-r from-green-500 to-emerald-600"
                      )}
                    >
                      {report.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Company:</span>
                      <span className="text-sm font-medium truncate ml-2">{report.company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      <Badge variant="outline" className="text-xs">{report.scamType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trust Score:</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{report.trustScore}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{report.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-colors"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card className="glass border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reports in this area</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchResults
                    ? "This area appears to be safe! No scam reports found nearby."
                    : "Search for a city to see local scam reports."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
