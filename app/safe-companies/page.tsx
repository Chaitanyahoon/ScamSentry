"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building, CheckCircle, Star, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

interface SafeCompany {
  id: string
  name: string
  industry: string
  description: string
  website?: string | null
  verified_score: number
  tags: string[] | null
}

// --- Local mock data for preview / fallback ---
const mockSafeCompanies: SafeCompany[] = [
  {
    id: "sc1",
    name: "Innovate Digital Solutions",
    industry: "Digital Marketing",
    description: "Highly reputable agency known for clear communication and timely payments.",
    website: "https://www.innovatedigital.com",
    verified_score: 98,
    tags: ["marketing", "transparent", "reliable-payment"],
  },
  {
    id: "sc2",
    name: "CodeCrafters Studio",
    industry: "Web Development",
    description: "Praised by freelancers for organised projects and competitive rates.",
    website: "https://www.codecrafters.dev",
    verified_score: 95,
    tags: ["web-dev", "supportive", "long-term"],
  },
]

export default function SafeCompaniesPage() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<SafeCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSafeCompanies = async () => {
      // If env vars are missing, use mock data immediately
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.info("Firebase config missing – using mock safe companies.")
        setCompanies(mockSafeCompanies)
        setIsLoading(false)
        return
      }

      try {
        const q = query(
          collection(db, "safe_companies"),
          where("status", "==", "approved"),
          orderBy("verified_score", "desc")
        )

        const querySnapshot = await getDocs(q)
        const fetchedCompanies: SafeCompany[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedCompanies.push({
            id: doc.id,
            name: data.name,
            industry: data.industry,
            description: data.description,
            website: data.website,
            verified_score: data.verified_score,
            tags: data.tags,
          })
        })

        setCompanies(fetchedCompanies)
      } catch (error: any) {
        if (error.code === "permission-denied" || error.message?.includes("Missing or insufficient permissions")) {
          console.warn("Firebase permissions missing. Falling back to mock data.")
          toast({
            title: "Live Data Access Restricted",
            description: "Showing preview data. Admin rules need to be updated in Firebase Console.",
            variant: "default",
          })
        } else {
          console.error("Error fetching safe companies:", error)
        }
        // Fallback to mock data on error
        setCompanies(mockSafeCompanies)
      }

      setIsLoading(false)
    }

    fetchSafeCompanies()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Safe Companies List
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Community-curated list of verified legitimate clients and companies.
            </p>
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          )}

          {/* Companies grid */}
          {!isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <Card key={company.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{company.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {company.industry}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1 text-base px-3 py-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {company.verified_score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{company.description}</p>
                      {/* tags may be null */}
                      {company.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {company.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {company.website && (
                        <Link
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Visit Website →
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty state */}
              {companies.length === 0 && (
                <Card className="mt-8">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No safe companies listed yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Be the first to contribute to our list of trusted clients!
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
