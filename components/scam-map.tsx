"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, Loader2 } from "lucide-react" // Removed Filter, Navigation
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Removed Select components
import { useToast } from "@/hooks/use-toast"
import { useReports } from "@/contexts/reports-context"
import { geocodeCity, type GeocodingResult } from "@/utils/geocoding"
import { InteractiveMap } from "@/components/interactive-map"

export function ScamMap() {
  const { toast } = useToast()
  const { reports, searchReportsByCity } = useReports() // Removed getReportsByLocation
  // Removed selectedFilter state
  const [searchTerm, setSearchTerm] = useState("")
  // Removed currentLocation state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 }) // Center of USA
  const [displayedReports, setDisplayedReports] = useState(reports.filter((r) => r.status === "approved"))
  // Removed isLoadingLocation state
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GeocodingResult | null>(null)

  // Update displayed reports when search results or reports change
  useEffect(() => {
    if (searchResults) {
      const cityReports = searchReportsByCity(searchResults.city)
      setDisplayedReports(cityReports)
      setMapCenter({ lat: searchResults.lat, lng: searchResults.lng }) // Center map on search result
    } else {
      // Default to showing all approved reports if no specific location is set
      setDisplayedReports(reports.filter((r) => r.status === "approved"))
      setMapCenter({ lat: 39.8283, lng: -98.5795 }) // Default center (USA)
    }
  }, [searchResults, reports, searchReportsByCity])

  // Removed handleGetCurrentLocation function

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

  // Simplified filteredReports logic
  const filteredReports = displayedReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.scamType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Live Scam Map
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Explore real scam reports by location and type
            </p>
          </div>

          <div className="mb-8 space-y-4">
            {/* Location Controls - "Use My Location" button removed */}
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search city (e.g., New York, Los Angeles)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleCitySearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {/* Filters - "Filter by type" dropdown removed */}
            <div className="flex flex-col sm:flex-row gap-4">
              {searchResults && (
                <Badge variant="outline" className="w-fit">
                  <Search className="mr-1 h-3 w-3" />
                  {searchResults.city}, {searchResults.state}
                </Badge>
              )}
            </div>
          </div>

          {/* Interactive Map Component */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <InteractiveMap
                centerLat={mapCenter.lat}
                centerLng={mapCenter.lng}
                reports={filteredReports}
                currentLocation={null} // Always pass null as currentLocation is removed
              />
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {report.city}, {report.state}
                    </CardTitle>
                    <Badge
                      variant={
                        report.riskLevel === "high"
                          ? "destructive"
                          : report.riskLevel === "medium"
                            ? "default"
                            : "secondary"
                      }
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
                      <Badge variant="outline">{report.scamType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trust Score:</span>
                      <span className="text-sm font-medium text-green-600">{report.trustScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Helpful Votes:</span>
                      <span className="text-sm font-medium">{report.helpfulVotes}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{report.description}</p>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
