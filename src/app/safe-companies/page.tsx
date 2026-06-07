"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building, CheckCircle, Star, Loader2, ShieldCheck, Terminal } from "lucide-react"
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
      let fetchedFromBackend = false;
      
      try {
        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://scamsentry-backend-j7a8.onrender.com";
        console.log(`[SAFE_COMPANIES] Attempting to fetch brand lockdowns from FastAPI backend: ${backendUrl}`);
        const res = await fetch(`${backendUrl}/api/v1/brand-lockdowns`, {
          next: { revalidate: 30 }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped: SafeCompany[] = data.map((item: any) => ({
              id: item.brand_name,
              name: item.brand_name.toUpperCase(),
              industry: "BRAND LOCKDOWN",
              description: `ACTIVE WARNING: ${item.incident_title}. External lookalike vectors targeting this node are restricted. Active threat monitoring in effect.`,
              website: item.incident_link,
              verified_score: 99,
              tags: ["lockdown", "compromise_alert"]
            }));
            setCompanies(mapped);
            fetchedFromBackend = true;
            console.log(`[SAFE_COMPANIES] Successfully loaded ${mapped.length} brand lockdowns from FastAPI.`);
          }
        }
      } catch (err) {
        console.error("[SAFE_COMPANIES] Failed to fetch brand lockdowns from backend, falling back to Firestore:", err);
      }

      if (!fetchedFromBackend) {
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
              title: "API_RESTRICTED",
              description: "FALLBACK TO LOCAL CACHE. DATABASE KERNEL PANIC.",
              variant: "default",
            })
          }
          setCompanies(mockSafeCompanies)
        }
      }

      setIsLoading(false)
    }

    fetchSafeCompanies()
  }, [])

  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]"></div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="mb-6 inline-flex p-4 border border-success/20 bg-success/10 text-success rounded-2xl">
              <ShieldCheck className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Verified <span className="text-success">Companies</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl">
              A community-curated directory of safe, verified clients and organizations known for transparent contracting and reliable payments.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-lg mb-10 overflow-hidden">
            <div className="bg-card border-b border-border px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building className="h-4.5 w-4.5 text-success" /> Verified Directory Ledger
              </div>
            </div>
            
            <div className="p-6 bg-card/20">
              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-success" />
                    <span className="text-xs text-muted-foreground animate-pulse">Loading whitelisted items...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <div key={company.id} className="flex flex-col justify-between bg-card border border-border hover:border-success/45 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-6 border-b border-border/50 bg-card/40">
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="text-lg font-bold text-foreground capitalize truncate max-w-[75%]">{company.name.toLowerCase()}</h2>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border-success/30 bg-success/10 text-success">
                            <Star className="h-3 w-3 fill-success stroke-none" />
                            {company.verified_score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center font-medium">
                          <Building className="h-3.5 w-3.5 mr-2 text-success/75" />
                          {company.industry}
                        </p>
                      </div>
                      
                      <div className="p-6 bg-background/35 space-y-4 flex-1 flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground/90 leading-relaxed border-l-2 border-border pl-4">
                          {company.description}
                        </p>
                        
                        {company.tags && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {company.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="rounded-full bg-card border-border px-2.5 py-0.5 text-muted-foreground">
                                #{tag.replace(/\s+/g, '-')}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {company.website && (
                          <div className="pt-4 border-t border-border mt-4">
                            <Link
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-success hover:text-success/90 text-xs font-semibold flex items-center transition-colors"
                            >
                              Visit Website →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {companies.length === 0 && (
                    <div className="col-span-full border border-border p-12 text-center bg-card/50 rounded-2xl">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-foreground mb-2">Whitelist Empty</h3>
                      <p className="text-muted-foreground text-sm">No verified organizations found in the database.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
