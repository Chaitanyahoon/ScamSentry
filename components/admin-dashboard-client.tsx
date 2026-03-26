"use client"

import { useEffect } from "react"
import { useState } from "react"
import { Shield, Eye, Check, X, Flag, TrendingUp, AlertTriangle, Trash2, Building, Loader2, Terminal, CheckSquare2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useReports } from "@/contexts/reports-context"
import LogoutButton from "@/components/logout-button"
import { db } from "@/lib/firebase"
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface SafeCompany {
  id: string
  name: string
  industry: string
  description: string
  website: string | null
  verified_score: number
  tags: string[] | null
  created_at: string
  status: "pending" | "approved" | "rejected"
}

export default function AdminDashboardClient() {
  const { toast } = useToast()
  const { reports, approveReport, rejectReport, deleteReport } = useReports()

  const [safeCompanies, setSafeCompanies] = useState<SafeCompany[]>([])
  const [isLoadingSafeCompanies, setIsLoadingSafeCompanies] = useState(true)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  useEffect(() => {
    const fetchSafeCompanies = async () => {
      setIsLoadingSafeCompanies(true)
      try {
        const q = query(collection(db, "safe_companies"), orderBy("created_at", "desc"))
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
            created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : (data.created_at || new Date().toISOString()),
            status: data.status,
          })
        })

        setSafeCompanies(fetchedCompanies)
      } catch (error) {
        console.error("Error fetching safe companies:", error)
        toast({
          title: "SYS_ERR: QUEREY_FAILED",
          description: "UNABLE TO LOAD WHITELIST CANDIDATES.",
          variant: "destructive",
        })
      }
      setIsLoadingSafeCompanies(false)
    }
    fetchSafeCompanies()
  }, [toast])

  const pendingReports = reports.filter((report) => report.status === "pending")
  const flaggedReports = reports.filter((report) => report.flagCount > 0 && report.status === "approved")
  const approvedReports = reports.filter((report) => report.status === "approved")
  const pendingSafeCompanies = safeCompanies.filter((company) => company.status === "pending")

  const handleApprove = async (id: string) => {
    await approveReport(id)
    toast({
      title: "NODE_APPROVED",
      description: "LOG HAS BEEN COMMITTED TO MAIN LEDGER.",
    })
  }

  const handleReject = async (id: string) => {
    await rejectReport(id)
    toast({
      title: "NODE_REJECTED",
      description: "LOG HAS BEEN PURGED. NOT PUBLISHED.",
      variant: "destructive",
    })
  }

  const handleDelete = async (id: string) => {
    await deleteReport(id)
    toast({
      title: "NODE_DELETED",
      description: "PERMANENT DATA WIPE COMPLETE ERASURE.",
      variant: "destructive",
    })
  }

  const handleResolveFlagged = async (id: string) => {
    toast({
      title: "FLAG_CLEARED",
      description: "QUARANTINE LIFTED.",
    })
  }

  const handleApproveSafeCompany = async (id: string, suppressToast = false) => {
    try {
      const companyRef = doc(db, "safe_companies", id)
      await updateDoc(companyRef, { status: "approved" })
      setSafeCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c)))
      if (!suppressToast) {
        toast({ title: "WHITELIST_UPDATED", description: "NODE ADDED TO VERIFIED DB." })
      }
    } catch (error) {
      if (!suppressToast) {
        toast({ title: "SYS_ERR", description: "FAILED TO COMMIT OVERRIDE.", variant: "destructive" })
      }
      throw error
    }
  }

  const handleRejectSafeCompany = async (id: string, suppressToast = false) => {
    try {
      const companyRef = doc(db, "safe_companies", id)
      await updateDoc(companyRef, { status: "rejected" })
      setSafeCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)))
      if (!suppressToast) {
        toast({ title: "WHITELIST_DENIED", description: "NODE REJECTED FROM SYSTEM." })
      }
    } catch (error) {
      if (!suppressToast) {
        toast({ title: "SYS_ERR", description: "FAILED TO REJECT.", variant: "destructive" })
      }
      throw error
    }
  }

   const handleDeleteSafeCompany = async (id: string) => {
     try {
       await deleteDoc(doc(db, "safe_companies", id))
       setSafeCompanies((prev) => prev.filter((c) => c.id !== id))
       toast({ title: "DATA_WIPED", description: "NODE DELETED FROM ALL DATABASES." })
     } catch (error) {
       toast({ title: "SYS_ERR", description: "DELETE OPERATION FAILED.", variant: "destructive" })
     }
   }

   // Bulk action functions for reports
   const handleBulkApproveReports = async () => {
     try {
       await Promise.all(selectedReports.map(id => approveReport(id)))
       setSelectedReports([])
       toast({
         title: "BULK_APPROVED",
         description: `${selectedReports.length} LOGS HAVE BEEN COMMITTED TO MAIN LEDGER.`,
       })
     } catch (error) {
       toast({ title: "SYS_ERR", description: "BULK APPROVE FAILED.", variant: "destructive" })
     }
   }

   const handleBulkRejectReports = async () => {
     try {
       await Promise.all(selectedReports.map(id => rejectReport(id)))
       setSelectedReports([])
       toast({
         title: "BULK_REJECTED",
         description: `${selectedReports.length} LOGS HAVE BEEN PURGED. NOT PUBLISHED.`,
         variant: "destructive",
       })
     } catch (error) {
       toast({ title: "SYS_ERR", description: "BULK REJECT FAILED.", variant: "destructive" })
     }
   }

   // Bulk action functions for companies
   const handleBulkApproveCompanies = async () => {
     try {
       const count = selectedCompanies.length
       await Promise.all(selectedCompanies.map(id => handleApproveSafeCompany(id, true)))
       setSelectedCompanies([])
       toast({ title: "BULK_WHITELISTED", description: `${count} NODES ADDED TO VERIFIED DB.` })
     } catch (error) {
       toast({ title: "SYS_ERR", description: "BULK APPROVE FAILED.", variant: "destructive" })
     }
   }

   const handleBulkRejectCompanies = async () => {
     try {
       const count = selectedCompanies.length
       await Promise.all(selectedCompanies.map(id => handleRejectSafeCompany(id, true)))
       setSelectedCompanies([])
       toast({ title: "BULK_REJECTED", description: `${count} NODES REJECTED FROM SYSTEM.`, variant: "destructive" })
     } catch (error) {
       toast({ title: "SYS_ERR", description: "BULK REJECT FAILED.", variant: "destructive" })
     }
   }

   const stats = [
    {
      name: "QUARANTINED_LOGS",
      value: pendingReports.length,
      icon: Eye,
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/50",
      shadow: "shadow-[0_0_10px_hsla(var(--warning),0.3)]"
    },
    {
      name: "RADAR_FLAGS",
      value: flaggedReports.length,
      icon: Flag,
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/50",
      shadow: "shadow-[0_0_10px_hsla(var(--destructive),0.3)]"
    },
    {
      name: "PENDING_WHITELIST",
      value: pendingSafeCompanies.length,
      icon: Building,
      color: "text-success",
      bgColor: "bg-success/10 border-success/50",
      shadow: "shadow-[0_0_10px_hsla(var(--success),0.3)]"
    },
    {
      name: "TOTAL_SYSTEM_LOGS",
      value: reports.length,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/50",
      shadow: "shadow-[0_0_10px_hsla(var(--primary),0.3)]"
    },
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive/20 text-destructive border-destructive"
      case "medium": return "bg-warning/20 text-warning border-warning"
      case "low": return "bg-secondary/20 text-secondary border-secondary"
      default: return "bg-border text-muted-foreground border-border"
    }
  }

  return (
    <div className="min-h-screen bg-background py-10 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 glass-strong p-6 border-l-4 border-l-primary shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="text-left">
              <div className="flex items-center mb-2">
                <Terminal className="h-6 w-6 text-primary mr-3" />
                <h1 className="text-2xl font-extrabold tracking-widest text-foreground uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
                  SYS_ADMIN <span className="text-primary">OVERWATCH</span>
                </h1>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                ROOT DIRECTORY ACCESS / MANAGE QUARANTINE PROTOCOLS
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {stats.map((stat) => (
              <div key={stat.name} className="glass-card p-6 border border-border/50 rounded-none bg-card/40 transition-transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className={cn("flex h-12 w-12 items-center justify-center border", stat.bgColor, stat.shadow)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div className="ml-4 font-mono">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{stat.name}</p>
                    <p className={cn("text-2xl font-extrabold tracking-widest mt-1", stat.color)}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending-reports" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto w-full justify-start p-1 glass-strong border border-border rounded-none shadow-none bg-black/50">
              <TabsTrigger value="pending-reports" className="font-mono text-xs uppercase tracking-widest rounded-none data-[state=active]:bg-primary data-[state=active]:text-black">
                Q_REPORTS ({pendingReports.length})
              </TabsTrigger>
              <TabsTrigger value="flagged-reports" className="font-mono text-xs uppercase tracking-widest rounded-none data-[state=active]:bg-destructive data-[state=active]:text-white">
                FLAGGED ({flaggedReports.length})
              </TabsTrigger>
              <TabsTrigger value="approved-reports" className="font-mono text-xs uppercase tracking-widest rounded-none data-[state=active]:bg-success data-[state=active]:text-black">
                MAIN_LEDGER ({approvedReports.length})
              </TabsTrigger>
              <TabsTrigger value="pending-companies" className="font-mono text-xs uppercase tracking-widest rounded-none data-[state=active]:bg-secondary data-[state=active]:text-black">
                WHITELIST_Q ({pendingSafeCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-mono text-xs uppercase tracking-widest rounded-none data-[state=active]:bg-background data-[state=active]:text-primary border data-[state=active]:border-primary">
                TELEMETRY
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending-reports" className="mt-6">
              <div className="glass-strong border border-border rounded-none overflow-hidden">
                <div className="bg-card/80 border-b border-border p-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                    <Terminal className="h-4 w-4" /> THREAT_LOGS_AWAITING_REVIEW
                  </h3>
                </div>
                 <div className="p-4">
                   {selectedReports.length > 0 ? (
                     <div className="flex justify-end space-x-3 mb-4">
                       <Button 
                         variant="outline" 
                         onClick={handleBulkApproveReports}
                         className="h-9 px-4 border-success/50 text-success hover:bg-success hover:text-black"
                       >
                         APPROVE SELECTED ({selectedReports.length})
                       </Button>
                       <Button 
                         variant="destructive" 
                         onClick={handleBulkRejectReports}
                         className="h-9 px-4 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                       >
                         REJECT SELECTED ({selectedReports.length})
                       </Button>
                     </div>
                   ) : null}
                 </div>
                 <div className="p-0">
                   {pendingReports.length > 0 ? (
                     <div className="overflow-x-auto">
                      <Table className="font-mono text-xs">
                        <TableHeader className="bg-background/80 hover:bg-background/80">
                          <TableRow className="border-border">
                            <TableHead className="uppercase tracking-widest text-muted-foreground">THREAT_IDENTIFIER</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">VECTOR</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">SEVERITY</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">TIMESTAMP</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                         <TableBody>
                           {pendingReports.map((report) => (
                             <TableRow key={report.id} className="border-border/50 hover:bg-card/50">
                               <TableCell className="flex items-center">
                                 <Checkbox
                                   checked={selectedReports.includes(report.id)}
                                   onCheckedChange={(checked) => {
                                     if (checked) {
                                       setSelectedReports(prev => [...prev, report.id]);
                                     } else {
                                       setSelectedReports(prev => prev.filter(id => id !== report.id));
                                     }
                                   }}
                                   className="h-4 w-4"
                                 />
                               </TableCell>
                               <TableCell className="font-bold text-foreground max-w-[200px] truncate">{report.title}</TableCell>
                               <TableCell>
                                 <Badge variant="outline" className="rounded-none border-border bg-background text-[10px] tracking-widest">{report.scamType}</Badge>
                               </TableCell>
                               <TableCell>
                                 <Badge className={cn("rounded-none border text-[10px] tracking-widest px-2 py-0", getRiskColor(report.riskLevel))}>{report.riskLevel}</Badge>
                               </TableCell>
                               <TableCell className="text-muted-foreground">
                                 {new Date(report.createdAt).toLocaleString()}
                               </TableCell>
                               <TableCell className="text-right">
                                 <div className="flex justify-end space-x-2">
                                   <Button size="icon" variant="outline" onClick={() => handleApprove(report.id)} className="h-8 w-8 rounded-none border-success/50 text-success hover:bg-success hover:text-black">
                                     <Check className="h-4 w-4" />
                                   </Button>
                                   <Button size="icon" variant="outline" onClick={() => handleReject(report.id)} className="h-8 w-8 rounded-none border-warning/50 text-warning hover:bg-warning hover:text-black">
                                     <X className="h-4 w-4" />
                                   </Button>
                                   <Button size="icon" variant="destructive" onClick={() => handleDelete(report.id)} className="h-8 w-8 rounded-none bg-destructive/10 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white">
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-card/30">
                      <Check className="h-10 w-10 text-success mx-auto mb-4 drop-shadow-[0_0_8px_currentColor]" />
                      <h3 className="text-sm font-bold font-mono tracking-widest text-foreground mb-1 uppercase">QUARANTINE_EMPTY</h3>
                      <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">NO UNVERIFIED LOGS FOUND IN SYSTEM.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="flagged-reports" className="mt-6">
              <div className="glass-strong border border-border rounded-none overflow-hidden">
                <div className="bg-card/80 border-b border-border p-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-destructive flex items-center gap-2">
                    <Flag className="h-4 w-4" /> CRITICAL_RADAR_FLAGS
                  </h3>
                </div>
                <div className="p-0">
                  {flaggedReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="font-mono text-xs">
                        <TableHeader className="bg-background/80 hover:bg-background/80">
                          <TableRow className="border-border">
                            <TableHead className="uppercase tracking-widest text-muted-foreground">THREAT_IDENTIFIER</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">FLAG_DENSITY</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">TRUST_SCORE</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flaggedReports.map((report) => (
                            <TableRow key={report.id} className="border-border/50 hover:bg-card/50">
                              <TableCell className="font-bold text-foreground max-w-[200px] truncate">{report.title}</TableCell>
                              <TableCell className="text-destructive font-bold">
                                [{report.flagCount}] FLAGS
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-none border-border bg-background text-[10px] tracking-widest">{report.trustScore}%</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleResolveFlagged(report.id)} className="h-8 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-black uppercase tracking-widest text-[10px] font-bold">
                                    RESOLVE_ALERT
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDelete(report.id)} className="h-8 w-8 rounded-none bg-destructive/10 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-card/30">
                      <Shield className="h-10 w-10 text-primary mx-auto mb-4 drop-shadow-[0_0_8px_currentColor]" />
                      <h3 className="text-sm font-bold font-mono tracking-widest text-foreground mb-1 uppercase">RADAR_CLEAR</h3>
                      <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">ALL SYSTEM LOGS IN GOOD STANDING.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approved-reports" className="mt-6">
              <div className="glass-strong border border-border rounded-none overflow-hidden">
                <div className="bg-card/80 border-b border-border p-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-success flex items-center gap-2">
                    <Terminal className="h-4 w-4" /> MAIN_DATABANK_LOGS
                  </h3>
                </div>
                <div className="p-0">
                  {approvedReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="font-mono text-xs">
                        <TableHeader className="bg-background/80 hover:bg-background/80">
                          <TableRow className="border-border">
                            <TableHead className="uppercase tracking-widest text-muted-foreground">THREAT_IDENTIFIER</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">VECTOR</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">SEVERITY</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">TIMESTAMP</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedReports.map((report) => (
                            <TableRow key={report.id} className="border-border/50 hover:bg-card/50">
                              <TableCell className="font-bold text-foreground max-w-[200px] truncate">{report.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-none border-border bg-background text-[10px] tracking-widest">{report.scamType}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("rounded-none border text-[10px] tracking-widest px-2 py-0", getRiskColor(report.riskLevel))}>{report.riskLevel}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(report.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button size="icon" variant="destructive" onClick={() => handleDelete(report.id)} className="h-8 w-8 rounded-none bg-destructive/10 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-card/30">
                      <Terminal className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-sm font-bold font-mono tracking-widest text-foreground mb-1 uppercase">DATABANK_EMPTY</h3>
                      <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">NO APPROVED REPORTS EXIST IN SYSTEM.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pending-companies" className="mt-6">
              <div className="glass-strong border border-border rounded-none overflow-hidden">
                <div className="bg-card/80 border-b border-border p-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-secondary flex items-center gap-2">
                    <Building className="h-4 w-4" /> WHITELIST_CANDIDATES
                  </h3>
                </div>
                <div className="p-4">
                  {selectedCompanies.length > 0 ? (
                    <div className="flex justify-end space-x-3 mb-4">
                      <Button 
                        variant="outline" 
                        onClick={handleBulkApproveCompanies}
                        className="h-9 px-4 border-success/50 text-success hover:bg-success hover:text-black"
                      >
                        APPROVE SELECTED ({selectedCompanies.length})
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleBulkRejectCompanies}
                        className="h-9 px-4 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                      >
                        REJECT SELECTED ({selectedCompanies.length})
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="p-0">
                  {isLoadingSafeCompanies ? (
                    <div className="flex items-center justify-center py-16 bg-card/30">
                      <Loader2 className="h-8 w-8 animate-spin text-secondary drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  ) : pendingSafeCompanies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="font-mono text-xs">
                        <TableHeader className="bg-background/80 hover:bg-background/80">
                          <TableRow className="border-border">
                            <TableHead className="uppercase tracking-widest text-muted-foreground">SELECT</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">NODE_ID</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">SECTOR</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">VERIFY_SCORE</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">URL</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground">TIMESTAMP</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingSafeCompanies.map((company) => (
                            <TableRow key={company.id} className="border-border/50 hover:bg-card/50">
                              <TableCell className="flex items-center">
                                <Checkbox
                                  checked={selectedCompanies.includes(company.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCompanies(prev => [...prev, company.id]);
                                    } else {
                                      setSelectedCompanies(prev => prev.filter(id => id !== company.id));
                                    }
                                  }}
                                  className="h-4 w-4"
                                />
                              </TableCell>
                              <TableCell className="font-bold text-foreground">{company.name}</TableCell>
                              <TableCell className="text-muted-foreground">{company.industry}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-none border-border bg-background text-[10px] tracking-widest">{company.verified_score}</Badge>
                              </TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold tracking-widest text-[10px]">
                                    EXT_LINK
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-[10px]">NULL</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(company.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button size="icon" variant="outline" onClick={() => handleApproveSafeCompany(company.id)} className="h-8 w-8 rounded-none border-success/50 text-success hover:bg-success hover:text-black">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="outline" onClick={() => handleRejectSafeCompany(company.id)} className="h-8 w-8 rounded-none border-warning/50 text-warning hover:bg-warning hover:text-black">
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteSafeCompany(company.id)} className="h-8 w-8 rounded-none bg-destructive/10 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-card/30">
                      <Check className="h-10 w-10 text-success mx-auto mb-4 drop-shadow-[0_0_8px_currentColor]" />
                      <h3 className="text-sm font-bold font-mono tracking-widest text-foreground mb-1 uppercase">QUARANTINE_EMPTY</h3>
                      <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">NO PENDING WHITELIST NODES DETECTED.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-strong border border-border rounded-none overflow-hidden bg-card/30">
                  <div className="bg-card/80 border-b border-border p-4">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                       <TrendingUp className="h-4 w-4" /> VECTOR_TELEMETRY
                    </h3>
                  </div>
                  <div className="p-6 font-mono text-xs tracking-widest space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">FAKE_JOB_OFFERS</span>
                        <span className="text-destructive font-bold drop-shadow-[0_0_5px_currentColor]">65%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-destructive h-full shadow-[0_0_10px_hsla(var(--destructive),0.5)]" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">UNPAID_LABOR</span>
                        <span className="text-warning font-bold drop-shadow-[0_0_5px_currentColor]">45%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-warning h-full shadow-[0_0_10px_hsla(var(--warning),0.5)]" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">IP_THEFT</span>
                        <span className="text-secondary font-bold drop-shadow-[0_0_5px_currentColor]">30%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-secondary h-full shadow-[0_0_10px_hsla(var(--secondary),0.5)]" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">GHOST_CLIENTS</span>
                        <span className="text-primary font-bold drop-shadow-[0_0_5px_currentColor]">25%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-primary h-full shadow-[0_0_10px_hsla(var(--primary),0.5)]" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-strong border border-border rounded-none overflow-hidden bg-card/30">
                  <div className="bg-card/80 border-b border-border p-4">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4" /> RISK_DISTRIBUTION
                    </h3>
                  </div>
                  <div className="p-6 font-mono text-xs tracking-widest space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">CRITICAL_THREATS</span>
                        <span className="text-destructive font-bold drop-shadow-[0_0_5px_currentColor]">40%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-destructive h-full shadow-[0_0_10px_hsla(var(--destructive),0.5)]" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">ELEVATED_RISK</span>
                        <span className="text-warning font-bold drop-shadow-[0_0_5px_currentColor]">45%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-warning h-full shadow-[0_0_10px_hsla(var(--warning),0.5)]" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-bold">ANOMALIES</span>
                        <span className="text-success font-bold drop-shadow-[0_0_5px_currentColor]">15%</span>
                      </div>
                      <div className="w-full bg-background border border-border/50 h-2">
                        <div className="bg-success h-full shadow-[0_0_10px_hsla(var(--success),0.5)]" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
