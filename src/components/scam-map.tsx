"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Loader2,
  Filter,
  Layers,
  TrendingUp,
  TerminalSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/contexts/reports-context";
import { geocodeCity, type GeocodingResult } from "@/utils/geocoding";
import { InteractiveMap } from "@/components/interactive-map";
import { ForensicGlobe } from "@/components/forensic-globe";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ScamMap() {
  const { toast } = useToast();
  const { reports, searchReportsByCity } = useReports();
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 39.8283,
    lng: -98.5795,
  });
  const [displayedReports, setDisplayedReports] = useState(
    reports.filter((r) => r.status === "approved"),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult | null>(
    null,
  );
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");

  useEffect(() => {
    if (searchResults) {
      const cityReports = searchReportsByCity(searchResults.city);
      setDisplayedReports(cityReports);
      setMapCenter({ lat: searchResults.lat, lng: searchResults.lng });
    } else {
      const allApproved = reports.filter((r) => r.status === "approved");
      setDisplayedReports(allApproved);

      // Calculate center based on the location with the most complaints
      if (allApproved.length > 0) {
        // Find most frequent location
        const locationCounts = allApproved.reduce(
          (
            acc: Record<string, { count: number; lat: number; lng: number }>,
            report,
          ) => {
            if (report.lat && report.lng) {
              const key = `${report.lat},${report.lng}`;
              if (!acc[key])
                acc[key] = { count: 0, lat: report.lat, lng: report.lng };
              acc[key].count++;
            }
            return acc;
          },
          {},
        );

        let maxCount = 0;
        let bestCenter = { lat: 39.8283, lng: -98.5795 };

        Object.values(locationCounts).forEach((loc) => {
          if (loc.count > maxCount) {
            maxCount = loc.count;
            bestCenter = { lat: loc.lat, lng: loc.lng };
          }
        });

        setMapCenter(bestCenter);
      } else {
        setMapCenter({ lat: 39.8283, lng: -98.5795 });
      }
    }
  }, [searchResults, reports, searchReportsByCity]);

  const handleCitySearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const result = await geocodeCity(searchTerm);
      if (result) {
        setSearchResults(result);
        toast({
          title: "Location Found",
          description: `Focusing map on: ${result.displayName}`,
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find coordinates for that location.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to connect to geocoding service.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const filteredReports = displayedReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRiskFilter
      ? report.riskLevel === selectedRiskFilter
      : true;

    return matchesSearch && matchesRisk;
  });

  const riskLevels = [
    {
      value: "high",
      label: "High Risk",
      classes: "bg-destructive border-destructive text-destructive-foreground",
      count: displayedReports.filter((r) => r.riskLevel === "high").length,
    },
    {
      value: "medium",
      label: "Medium Risk",
      classes: "bg-[#F59E0B] border-[#F59E0B] text-black",
      count: displayedReports.filter((r) => r.riskLevel === "medium").length,
    },
    {
      value: "low",
      label: "Low Risk",
      classes: "bg-[#8C5A1A] border-[#8C5A1A] text-white",
      count: displayedReports.filter((r) => r.riskLevel === "low").length,
    },
  ];

  return (
    <section className="relative min-h-screen bg-background py-16 text-foreground relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/[0.02] rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1300px]">
        <div className="mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-primary/20 bg-[#15110E] text-primary mb-6 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Layers className="h-3.5 w-3.5 animate-pulse" />
              <span>Global Threat Map</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4 uppercase tracking-wider">
              Interactive Heatmap
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto border-l-2 border-primary/50 pl-4 py-1">
              Track reported scams and malicious organizations across geographic
              regions in real-time.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-10 space-y-4">
            {/* Search Bar */}
            <div className="bg-card/25 border border-border p-6 rounded-2xl backdrop-blur-sm shadow-xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/45" />
                  <Input
                    placeholder="Search by city, region, or target..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                    className="pl-11 h-12 bg-background border-border text-foreground text-sm rounded-xl focus-visible:ring-primary/20 placeholder:text-muted-foreground/30"
                  />
                </div>
                <Button
                  onClick={handleCitySearch}
                  disabled={isSearching}
                  className="h-12 px-8 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/10"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                      Searching...
                    </>
                  ) : (
                    "Search Location"
                  )}
                </Button>
              </div>

              {searchResults && (
                <div className="mt-4 flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-xs font-semibold rounded-full uppercase">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 inline-block text-primary" />
                    Showing: {searchResults.city}, {searchResults.state}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchResults(null);
                      setSearchTerm("");
                    }}
                    className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 h-8 rounded-xl text-xs"
                  >
                    Clear Filter
                  </Button>
                </div>
              )}
            </div>

            {/* Risk Level Filters */}
            <div className="flex flex-wrap gap-2 bg-card/20 border border-border p-4 rounded-2xl select-none">
              <button
                onClick={() => setSelectedRiskFilter(null)}
                className={cn(
                  "px-4 py-2 text-xs font-semibold border rounded-full transition-all",
                  selectedRiskFilter === null
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                )}
              >
                All Reports ({displayedReports.length})
              </button>
              {riskLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() =>
                    setSelectedRiskFilter(
                      selectedRiskFilter === level.value ? null : level.value,
                    )
                  }
                  className={cn(
                    "px-4 py-2 text-xs font-semibold border rounded-full transition-all",
                    selectedRiskFilter === level.value
                      ? level.classes
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                  )}
                >
                  {level.label} ({level.count})
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 select-none">
            {/* Total Threats */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-primary/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.55)] group-hover:shadow-[0_0_18px_rgba(249,115,22,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <p className="text-xs font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <MapPin className="h-4 w-4 text-primary animate-pulse" />
                  Total Threats
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight font-mono mb-2">
                  {filteredReports.length.toString().padStart(3, "0")}
                </p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-mono">
                  Geographic Nodes
                </p>
              </div>
            </div>

            {/* Critical Entities */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-destructive/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-destructive/20 group-hover:border-destructive/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-destructive/20 group-hover:border-destructive/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-destructive rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.55)] group-hover:shadow-[0_0_18px_rgba(239,68,68,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <p className="text-xs font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <TrendingUp className="h-4 w-4 text-destructive animate-pulse" />
                  Critical Entities
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-destructive to-red-400 tracking-tight font-mono mb-2">
                  {filteredReports
                    .filter((r) => r.riskLevel === "high")
                    .length.toString()
                    .padStart(3, "0")}
                </p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-mono">
                  Immediate Containment
                </p>
              </div>
            </div>

            {/* Avg Trust Score */}
            <div className="group relative bg-[#090b11]/90 hover:bg-[#0d101b]/95 border border-white/[0.04] hover:border-emerald-500/45 p-6 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] hover:-translate-y-1 overflow-hidden backdrop-blur-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500/20 group-hover:border-emerald-500/55 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500/20 group-hover:border-emerald-500/55 transition-colors duration-300" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.55)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.85)] group-hover:scale-y-[1.08] transition-all duration-500" />
              <div className="relative z-10 flex flex-col justify-between h-full pl-2">
                <p className="text-xs font-bold text-muted-foreground/75 uppercase tracking-widest flex items-center gap-2 mb-3 font-mono">
                  <TerminalSquare className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Avg Trust Score
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight font-mono mb-2">
                  {filteredReports.length > 0
                    ? Math.round(
                        filteredReports.reduce(
                          (sum, r) => sum + r.trustScore,
                          0,
                        ) / filteredReports.length,
                      )
                    : 100}
                  %
                </p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-mono">
                  Consensus Index
                </p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-10 bg-[#0C0A09] border border-border overflow-hidden h-[400px] sm:h-[600px] lg:h-[700px] relative rounded-2xl shadow-xl group">
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
                  currentLocation={
                    searchResults
                      ? { lat: searchResults.lat, lng: searchResults.lng }
                      : null
                  }
                />
              </div>
            )}

            {/* Map Overlay for Info */}
            <div className="absolute bottom-6 left-6 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="bg-[#0C0A09]/95 border border-[#1F1914] p-4 rounded-none">
                <p className="font-mono text-[10px] text-primary uppercase tracking-[0.2em]">
                  Neural Engine v2.6
                </p>
                <p className="text-muted-foreground text-xs mt-1 italic">
                  Mapping global attack vectors using deterministic telemetry...
                </p>
              </div>
            </div>

            {/* View Mode Toggle Controls */}
            <div className="absolute top-6 right-6 z-10 flex gap-1 bg-card/90 backdrop-blur-md border border-border p-1 rounded-xl shadow-lg">
              <button
                onClick={() => setViewMode("2d")}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg border",
                  viewMode === "2d"
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border/85 text-muted-foreground hover:text-foreground",
                )}
              >
                2D Map
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg border",
                  viewMode === "3d"
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border/85 text-muted-foreground hover:text-foreground",
                )}
              >
                3D Globe
              </button>
            </div>
          </div>

          {/* Threat Registry Ledger Table */}
          {filteredReports.length > 0 ? (
            <div className="border border-border bg-card/45 backdrop-blur-md relative overflow-hidden select-text rounded-2xl shadow-xl">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20 pointer-events-none" />

              {/* Table Title Bar */}
              <div className="bg-card/95 p-4 border-b border-border/60 flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                    Threat Registry Ledger
                  </span>
                </div>
                <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest hidden sm:inline">
                  Verification Protocol: Peer Consensus
                </span>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/60 text-muted-foreground select-none uppercase tracking-wider text-[10px] font-semibold">
                      <th className="p-4">Status</th>
                      <th className="p-4">Identifier / Target</th>
                      <th className="p-4">Geographic Node</th>
                      <th className="p-4">Attack Vector</th>
                      <th className="p-4 text-center">Risk</th>
                      <th className="p-4 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-card/40 transition-colors group"
                      >
                        {/* Status */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                report.riskLevel === "high"
                                  ? "bg-red-500 animate-pulse"
                                  : "bg-emerald-500 animate-pulse",
                              )}
                            />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                              {report.status.toUpperCase()}
                            </span>
                          </div>
                        </td>

                        {/* Identifier */}
                        <td className="p-4 align-middle max-w-[280px]">
                          <div className="space-y-1">
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {report.title}
                            </p>
                            <p className="text-[9px] text-muted-foreground/50 uppercase">
                              Target: {report.company}
                            </p>
                          </div>
                        </td>

                        {/* Geographic Node */}
                        <td className="p-4 align-middle text-muted-foreground/80">
                          <div className="flex items-center gap-1.5 uppercase text-[10px]">
                            <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            <span>
                              {report.city || "GLOBAL"}, {report.state || "INT"}
                            </span>
                          </div>
                        </td>

                        {/* Attack Vector */}
                        <td className="p-4 align-middle text-muted-foreground/60 uppercase text-[10px]">
                          {report.scamType}
                        </td>

                        {/* Risk */}
                        <td className="p-4 align-middle text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full text-[8px] font-semibold uppercase tracking-widest px-2.5 py-0.5",
                              report.riskLevel === "high" &&
                                "bg-destructive/10 border-destructive/20 text-destructive",
                              report.riskLevel === "medium" &&
                                "bg-warning/10 border-warning/20 text-warning",
                              report.riskLevel === "low" &&
                                "bg-muted border-border text-muted-foreground",
                            )}
                          >
                            {report.riskLevel}
                          </Badge>
                        </td>

                        {/* Dossier */}
                        <td className="p-4 align-middle text-right">
                          <Button
                            asChild
                            className="h-7 px-3.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <Link href={`/reports/${report.id}`}>Access</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border border-border p-16 text-center bg-card/45 backdrop-blur-md relative overflow-hidden rounded-2xl">
              <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
                No Telemetry Found
              </h3>
              <p className="text-xs text-muted-foreground/75 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The current matrix query yielded zero results. Adjust filtering
                parameters to expand search radius.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRiskFilter(null);
                }}
                className="mt-8 rounded-xl border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold h-10 px-8 transition-all"
              >
                Reset Query Matrix
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
