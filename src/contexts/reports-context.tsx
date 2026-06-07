"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { db } from "@/lib/firebase" // Import Firebase db
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  query,
  orderBy,
  Timestamp,
  onSnapshot
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export interface ScamReport {
  id: string
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
  evidenceUrls?: string[]
}

interface ReportsContextType {
  reports: ScamReport[]
  addReport: (
    report: Omit<ScamReport, "id" | "createdAt" | "helpfulVotes" | "flagCount" | "views" | "trustScore" | "status">,
  ) => Promise<ScamReport | null>
  approveReport: (id: string) => Promise<void>
  rejectReport: (id: string) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  voteHelpful: (id: string) => Promise<void>
  flagReport: (id: string) => Promise<void>
  resolveReportFlags: (id: string) => Promise<void>
  incrementViews: (id: string) => Promise<void>
  getReportsByLocation: (lat: number, lng: number, radius?: number) => ScamReport[]
  searchReportsByCity: (cityName: string) => ScamReport[]
  uploadEvidence: (file: File) => Promise<string>
  isLoadingReports: boolean
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

/* -------------------------------------------------------------------------- */
/*  helpers: snake-case ↔ camel-case                                           */
/* -------------------------------------------------------------------------- */
const GLOBAL_NODES = [
  { lat: 37.7749, lng: -122.4194, city: "San Francisco", country: "US" },
  { lat: 51.5074, lng: -0.1278, city: "London", country: "GB" },
  { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "JP" },
  { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "AU" },
  { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "SG" },
  { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "DE" },
  { lat: 28.6139, lng: 77.2090, city: "New Delhi", country: "IN" },
  { lat: -23.5505, lng: -46.6333, city: "Sao Paulo", country: "BR" },
  { lat: 30.0444, lng: 31.2357, city: "Cairo", country: "EG" },
  { lat: -26.2041, lng: 28.0473, city: "Johannesburg", country: "ZA" },
  { lat: 45.4215, lng: -75.6972, city: "Ottawa", country: "CA" },
  { lat: 35.9078, lng: 127.7669, city: "Seoul", country: "KR" }
];

const getDeterministicCoords = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % GLOBAL_NODES.length;
  return GLOBAL_NODES[idx];
};

export const firestoreDocToScamReport = (docSnap: any): ScamReport => {
  const data = docSnap.data()
  let lat = data.lat;
  let lng = data.lng;
  let city = data.city ?? "";
  let country = data.country ?? "";

  if (lat == null || lng == null) {
    const fallback = getDeterministicCoords(data.title || docSnap.id);
    lat = fallback.lat;
    lng = fallback.lng;
    if (!city || city === "Global") city = fallback.city;
    if (!country || country === "WWW") country = fallback.country;
  }

  return {
    id: docSnap.id,
    title: data.title,
    company: data.company ?? "Unknown Company",
    scamType: data.scam_type,
    industry: data.industry ?? "Other",
    location: data.location || `${city}, ${country}` || "GLOBAL_NODE",
    city,
    state: data.state ?? "INT",
    country,
    lat,
    lng,
    description: data.description,
    tags: data.tags ?? [],
    anonymous: data.anonymous ?? true,
    email: data.email ?? undefined,
    status: data.status,
    createdAt: data.created_at?.toDate ? data.created_at.toDate().toISOString() : (data.created_at || new Date().toISOString()),
    helpfulVotes: data.helpful_votes || 0,
    flagCount: data.flag_count || 0,
    views: data.views || 0,
    riskLevel: data.risk_level as "low" | "medium" | "high",
    trustScore: data.trust_score || 50,
    evidenceUrls: data.evidence_urls || [],
  }
}

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
  lat: r.lat ?? null,
  lng: r.lng ?? null,
  description: r.description,
  tags: r.tags,
  anonymous: r.anonymous,
  email: r.email ?? null,
  risk_level: r.riskLevel,
  created_at: Timestamp.now(),
  helpful_votes: 0,
  flag_count: 0,
  views: 0,
  trust_score: 50,
  status: "approved", // Default to approved for now
  evidence_urls: r.evidenceUrls || [],
})

// -----------------------------------------------------------------------------
// Local mock data used when Firebase is unavailable (preview mode)
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
]

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [reports, setReports] = useState<ScamReport[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)

  // Listen to reports from Firebase in real-time
  useEffect(() => {
    setIsLoadingReports(true)
    const q = query(collection(db, "scam_reports"), orderBy("created_at", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReports: ScamReport[] = []
      querySnapshot.forEach((doc) => {
        fetchedReports.push(firestoreDocToScamReport(doc))
      })
      setReports(fetchedReports)
      setIsLoadingReports(false)
    }, (error) => {
      console.error("Error listening to reports from Firebase:", error)
      setReports(initialReports) // Fallback
      setIsLoadingReports(false)
    })

    return () => unsubscribe()
  }, [])

  const addReport = useCallback(
    async (
      reportData: Omit<
        ScamReport,
        "id" | "createdAt" | "helpfulVotes" | "flagCount" | "views" | "trustScore" | "status"
      >,
    ): Promise<ScamReport | null> => {
      try {
        const payload = scamReportToDbInsert(reportData)
        const docRef = await addDoc(collection(db, "scam_reports"), payload)

        // Construct the new report object to update local state immediately
        const newReport: ScamReport = {
          id: docRef.id,
          ...reportData,
          status: "approved",
          createdAt: new Date().toISOString(),
          helpfulVotes: 0,
          flagCount: 0,
          views: 0,
          trustScore: 50,
        }

        setReports((prev) => [newReport, ...prev])
        return newReport
        setReports((prev) => [newReport, ...prev])
        return newReport
      } catch (error) {
        console.error("Error adding report:", error)
        throw error
      }
    },
    [],
  )

  const approveReport = useCallback(async (id: string) => {
    try {
      const reportRef = doc(db, "scam_reports", id)
      await updateDoc(reportRef, { status: "approved" })
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)))
    } catch (error) {
      console.error("Error approving report:", error)
    }
  }, [])

  const rejectReport = useCallback(async (id: string) => {
    try {
      const reportRef = doc(db, "scam_reports", id)
      await updateDoc(reportRef, { status: "rejected" })
      setReports((prev) =>
        prev.map((report) => (report.id === id ? { ...report, status: "rejected" as const } : report)),
      )
    } catch (error) {
      console.error("Error rejecting report:", error)
    }
  }, [])

  const deleteReport = useCallback(async (id: string) => {
    console.log("Attempting to delete report with ID:", id)
    try {
      await deleteDoc(doc(db, "scam_reports", id))
      setReports((prev) => prev.filter((report) => report.id !== id))
      toast({
        title: "Report Deleted",
        description: "The report has been permanently removed.",
      })
    } catch (error: any) {
      console.error("Error deleting report:", error)
      toast({
        title: "Deletion Failed",
        description: `Could not delete report: ${error.message}.`,
        variant: "destructive",
      })
    }
  }, [])

  const voteHelpful = useCallback(async (id: string) => {
    try {
      const reportRef = doc(db, "scam_reports", id)
      await updateDoc(reportRef, {
        helpful_votes: increment(1),
        trust_score: increment(2)
      })

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
    } catch (error) {
      console.error("Error voting helpful:", error)
    }
  }, [])

  const flagReport = useCallback(async (id: string) => {
    try {
      const reportRef = doc(db, "scam_reports", id)
      await updateDoc(reportRef, {
        flag_count: increment(1),
        trust_score: increment(-5)
      })

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
    } catch (error) {
      console.error("Error flagging report:", error)
    }
  }, [])

  const resolveReportFlags = useCallback(async (id: string) => {
    try {
      const reportRef = doc(db, "scam_reports", id)
      await updateDoc(reportRef, { flag_count: 0 })
      setReports((prev) =>
        prev.map((report) => (report.id === id ? { ...report, flagCount: 0 } : report)),
      )
    } catch (error) {
      console.error("Error resolving report flags:", error)
    }
  }, [])

  const incrementViews = useCallback(async (id: string) => {
    try {
      const reportRef = doc(db, "scam_reports", id)
      await updateDoc(reportRef, { views: increment(1) })
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, views: r.views + 1 } : r)))
    } catch (error) {
      console.error("Error incrementing views:", error)
    }
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
    resolveReportFlags,
    incrementViews,
    getReportsByLocation,
    searchReportsByCity,
    uploadEvidence: async (file: File) => {
      try {
        const storageRef = ref(storage, `evidence/${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return downloadURL
      } catch (error) {
        console.error("Error uploading evidence:", error)
        throw error
      }
    },
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
