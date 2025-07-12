"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase" // Import Supabase client
import { toast } from "sonner"

export interface ScamReport {
  id: string // Supabase UUID will be string
  title: string
  company: string
  scamType: string
  industry: string
  location: string
  city: string
  state: string
  country: string
  lat?: number
  lng?: number
  description: string
  tags: string[]
  anonymous: boolean
  email?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  helpfulVotes: number
  flagCount: number
  views: number
  riskLevel: "low" | "medium" | "high"
  trustScore: number
}

interface ReportsContextType {
  reports: ScamReport[]
  addReport: (
    report: Omit<ScamReport, "id" | "createdAt" | "helpfulVotes" | "flagCount" | "views" | "trustScore" | "status">, // status is now defaulted by DB
  ) => Promise<ScamReport | null> // Changed to return Promise
  approveReport: (id: string) => Promise<void>
  rejectReport: (id: string) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  voteHelpful: (id: string) => Promise<void>
  flagReport: (id: string) => Promise<void>
  incrementViews: (id: string) => Promise<void>
  getReportsByLocation: (lat: number, lng: number, radius?: number) => ScamReport[]
  searchReportsByCity: (cityName: string) => ScamReport[]
  isLoadingReports: boolean // New loading state
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

/* -------------------------------------------------------------------------- */
/*  helpers: snake-case ↔ camel-case                                           */
/* -------------------------------------------------------------------------- */
const dbRowToScamReport = (row: any): ScamReport => ({
  id: row.id,
  title: row.title,
  company: row.company ?? "Unknown Company",
  scamType: row.scam_type,
  industry: row.industry ?? "Other",
  location: row.location ?? "",
  city: row.city ?? "",
  state: row.state ?? "",
  country: row.country ?? "",
  lat: row.lat ?? undefined,
  lng: row.lng ?? undefined,
  description: row.description,
  tags: row.tags ?? [],
  anonymous: row.anonymous ?? true,
  email: row.email ?? undefined,
  status: row.status,
  createdAt: row.created_at,
  helpfulVotes: row.helpful_votes,
  flagCount: row.flag_count,
  views: row.views,
  riskLevel: row.risk_level as "low" | "medium" | "high",
  trustScore: row.trust_score,
})

const scamReportToDbInsert = (
  r: Omit<ScamReport, "id" | "createdAt" | "helpfulVotes" | "flagCount" | "views" | "trustScore" | "status">,
) => ({
  title: r.title,
  company: r.company,
  scam_type: r.scamType,
  industry: r.industry,
  location: r.location,
  city: r.city,
  state: r.state,
  country: r.country,
  lat: r.lat,
  lng: r.lng,
  description: r.description,
  tags: r.tags,
  anonymous: r.anonymous,
  email: r.email,
  risk_level: r.riskLevel,
})

// -----------------------------------------------------------------------------
// Local mock data used when Supabase is unavailable (preview mode)
// -----------------------------------------------------------------------------
const initialReports: ScamReport[] = [
  {
    id: "1",
    title: "Fake Web Development Job - TechCorp Solutions",
    company: "TechCorp Solutions",
    scamType: "Fake Job Offer",
    industry: "Web Development",
    location: "New York, NY, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    description:
      'Company asked for $500 upfront for "training materials" and then disappeared. They had a professional-looking website but no real contact information.',
    tags: ["upfront-payment", "fake-training", "web-development"],
    anonymous: true,
    status: "approved",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    helpfulVotes: 23,
    flagCount: 0,
    views: 156,
    riskLevel: "high",
    trustScore: 92,
  },
  {
    id: "2",
    title: "Unpaid Graphic Design Work - Creative Agency Inc",
    company: "Creative Agency Inc",
    scamType: "Unpaid Work",
    industry: "Graphic Design",
    location: "Los Angeles, CA, USA",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    lat: 34.0522,
    lng: -118.2437,
    description:
      'Completed a full logo design project as "test work" but never received payment despite multiple follow-ups.',
    tags: ["unpaid-work", "test-project", "graphic-design"],
    anonymous: true,
    status: "approved",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    helpfulVotes: 18,
    flagCount: 0,
    views: 89,
    riskLevel: "medium",
    trustScore: 87,
  },
  // … (include the rest of your previous mock reports 3-5 here, unchanged)
]

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<ScamReport[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true) // Initialize loading state

  // Fetch reports from Supabase on mount
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoadingReports(true)

      // If env vars aren’t present we already know we’re in “local fallback” mode
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.info("Supabase disabled in preview – using local mock data.")
        setReports(initialReports)
        setIsLoadingReports(false)
        return
      }

      const { data, error } = await supabase.from("scam_reports").select("*").order("created_at", { ascending: false })

      if (error) {
        // Table missing (error code 42P01) ➜ fall back to mock data
        if (error.code === "42P01" || /does not exist/i.test(error.message)) {
          console.warn('Supabase table "scam_reports" not found. Using local mock data for this preview build.')
          setReports(initialReports)
        } else {
          console.error("Error fetching reports:", error)
        }
      } else {
        setReports((data as any[]).map(dbRowToScamReport))
      }

      setIsLoadingReports(false)
    }

    fetchReports()
  }, [])

  const addReport = useCallback(
    async (
      reportData: Omit<
        ScamReport,
        "id" | "createdAt" | "helpfulVotes" | "flagCount" | "views" | "trustScore" | "status"
      >,
    ): Promise<ScamReport | null> => {
      const payload = {
        ...scamReportToDbInsert(reportData),
        helpful_votes: 0,
        flag_count: 0,
        views: 0,
        trust_score: 50,
        status: "approved",
      }

      const { data, error } = await supabase.from("scam_reports").insert([payload]).select().single()

      if (error) {
        console.error("Error adding report:", error)
        return null
      }

      const newReport = dbRowToScamReport(data)
      setReports((prev) => [newReport, ...prev])
      return newReport
    },
    [],
  )

  const approveReport = useCallback(async (id: string) => {
    const { error } = await supabase.from("scam_reports").update({ status: "approved" }).eq("id", id)

    if (error) {
      console.error("Error approving report:", error)
    } else {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)))
    }
  }, [])

  const rejectReport = useCallback(async (id: string) => {
    const { error } = await supabase.from("scam_reports").update({ status: "rejected" }).eq("id", id)

    if (error) {
      console.error("Error rejecting report:", error)
    } else {
      setReports((prev) =>
        prev.map((report) => (report.id === id ? { ...report, status: "rejected" as const } : report)),
      )
    }
  }, [])

  const deleteReport = useCallback(async (id: string) => {
    console.log("Attempting to delete report with ID:", id) // Add this line
    const { error } = await supabase.from("scam_reports").delete().eq("id", id)

    if (error) {
      console.error("Error deleting report:", error)
      // Add a toast notification for the error
      toast({
        title: "Deletion Failed",
        description: `Could not delete report: ${error.message}. Please check Supabase logs.`,
        variant: "destructive",
      })
    } else {
      setReports((prev) => prev.filter((report) => report.id !== id))
      // Add a toast notification for success (optional, but good for consistency)
      toast({
        title: "Report Deleted",
        description: "The report has been permanently removed.",
      })
    }
  }, [])

  const voteHelpful = useCallback(async (id: string) => {
    // Increment helpful_votes and trust_score directly in DB
    const { error } = await supabase.rpc("increment_helpful_votes", { report_id: id })

    if (error) {
      console.error("Error voting helpful:", error)
    } else {
      setReports((prev) =>
        prev.map((report) =>
          report.id === id
            ? {
                ...report,
                helpfulVotes: report.helpfulVotes + 1,
                trustScore: Math.min(100, report.trustScore + 2),
              }
            : report,
        ),
      )
    }
  }, [])

  const flagReport = useCallback(async (id: string) => {
    // Increment flag_count and decrement trust_score directly in DB
    const { error } = await supabase.rpc("increment_flag_count", { report_id: id })

    if (error) {
      console.error("Error flagging report:", error)
    } else {
      setReports((prev) =>
        prev.map((report) =>
          report.id === id
            ? {
                ...report,
                flagCount: report.flagCount + 1,
                trustScore: Math.max(0, report.trustScore - 5),
              }
            : report,
        ),
      )
    }
  }, [])

  const incrementViews = useCallback(async (id: string) => {
    // 1. Try to call the stored procedure (preferred – atomic & safe)
    const { error: rpcError } = await supabase.rpc("increment_views", { report_id: id })

    // 2. If the RPC is missing (code 42883) fall back to a normal update
    if (rpcError) {
      if (rpcError.code === "42883" || /function.*increment_views/i.test(rpcError.message)) {
        // Fallback: increment directly
        const { error: updateError } = await supabase
          .from("scam_reports")
          .update({ views: supabase.literal("views + 1") })
          .eq("id", id)

        if (updateError) {
          console.error("Fallback update (views) failed:", updateError)
        }
      } else {
        console.error("Error incrementing views:", rpcError)
      }
    }

    // Update local state so the UI reflects the change immediately
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, views: r.views + 1 } : r)))
  }, [])

  // Helper function for distance calculation (remains client-side)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in kilometers
    return d
  }

  const getReportsByLocation = useCallback(
    (lat: number, lng: number, radius = 50) => {
      return reports.filter((report) => {
        if (!report.lat || !report.lng) return false
        const distance = calculateDistance(lat, lng, report.lat, report.lng)
        return distance <= radius && report.status === "approved"
      })
    },
    [reports],
  )

  const searchReportsByCity = useCallback(
    (cityName: string) => {
      return reports.filter(
        (report) => report.city.toLowerCase().includes(cityName.toLowerCase()) && report.status === "approved",
      )
    },
    [reports],
  )

  const value: ReportsContextType = {
    reports,
    addReport,
    approveReport,
    rejectReport,
    deleteReport,
    voteHelpful,
    flagReport,
    incrementViews,
    getReportsByLocation,
    searchReportsByCity,
    isLoadingReports,
  }

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
