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
            <div className="mb-6 inline-flex p-4 border border-success/50 bg-success/10 text-success shadow-[0_0_15px_hsla(var(--success),0.3)]">
              <ShieldCheck className="h-8 w-8 drop-shadow-[0_0_8px_hsla(var(--success),1)]" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-widest text-foreground uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              VERIFIED <span className="text-success drop-shadow-[0_0_10px_hsla(var(--success),0.5)]">NODES</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-mono uppercase tracking-widest">
              WHITELISTED CLIENT INFRASTRUCTURE. SECURE WORKSPACES.
            </p>
          </div>

          <div className="glass-strong mb-10 overflow-hidden shadow-[0_0_20px_hsla(var(--border),0.5)] rounded-none">
            <div className="bg-card/80 border-b border-border p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase font-mono">
                <Terminal className="h-4 w-4 text-success" /> SECURE_LEDGER_QUERY
              </div>
            </div>
            
            <div className="p-6 bg-background/50">
              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-success drop-shadow-[0_0_10px_currentColor]" />
                    <span className="text-success font-mono uppercase tracking-widest animate-pulse">ESTABLISHING_HANDSHAKE...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <div key={company.id} className="glass-card flex flex-col justify-between group overflow-hidden border-t-2 border-t-success/50 hover:border-t-success transition-all duration-300">
                      <div className="p-6 border-b border-border/50 bg-card/40">
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">{company.name}</h2>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 rounded-none border-success bg-success/10 text-success shadow-[0_0_5px_hsla(var(--success),0.3)]">
                            <Star className="h-3 w-3 fill-success" />
                            {company.verified_score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono flex items-center tracking-widest uppercase font-bold">
                          <Building className="h-3 w-3 mr-2 text-success" />
                          {company.industry}
                        </p>
                      </div>
                      
                      <div className="p-6 bg-background/50 space-y-4">
                        <p className="text-sm text-foreground line-clamp-3 leading-relaxed font-mono tracking-wide px-4 border-l-2 border-border">
                          {company.description}
                        </p>
                        
                        {company.tags && (
                          <div className="flex flex-wrap gap-2 text-xs font-mono font-bold tracking-widest uppercase">
                            {company.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="rounded-none bg-card border-border px-2 py-1 text-muted-foreground">
                                #{tag.replace(/\s+/g, '_')}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {company.website && (
                          <div className="pt-4 mt-2 border-t border-border">
                            <Link
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-success hover:text-success/80 text-xs font-bold uppercase tracking-widest flex items-center transition-colors drop-shadow-[0_0_5px_currentColor]"
                            >
                              INITIALIZE_CONNECTION →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {companies.length === 0 && (
                    <div className="col-span-full border border-border p-12 text-center bg-card/50 glass-card">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                      <h3 className="text-lg font-bold font-mono tracking-widest uppercase text-foreground mb-2">WHITELIST_EMPTY</h3>
                      <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">NO_VERIFIED_NODES_FOUND_IN_SYSTEM_LEDGER.</p>
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
