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
    <div className="min-h-screen bg-[#0C0A09] py-10 relative overflow-hidden">
      {/* Decorative Scanlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 shadow-[0_0_20px_rgba(255,191,0,0.5)] z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-[#15110E] border border-[#1F1914] p-8 relative overflow-hidden h-32">
            {/* HUD Accent Corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)]" />
            
            <div className="text-left relative z-10">
              <div className="flex items-center mb-2">
                <Terminal className="h-5 w-5 text-primary mr-3" />
                <h1 className="text-3xl font-extrabold tracking-[0.4rem] text-foreground uppercase drop-shadow-[0_0_15px_rgba(255,191,0,0.2)]">
                  SYS_ADMIN <span className="text-primary italic">OVERWATCH</span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.2rem] text-muted-foreground border-l-2 border-primary/40 pl-3">
                  ROOT_DIR_ACCESS // QUARANTINE_PROTOCOL_V4.2
                </p>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-mono tracking-widest px-1 py-0 rounded-none">SECURE</Badge>
              </div>
            </div>
            <div className="relative z-10">
              <LogoutButton />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-[#15110E] border border-[#1F1914] p-6 relative group overflow-hidden transition-all duration-300 hover:border-primary/30">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-4">{stat.name}</span>
                  <div className="flex items-end justify-between">
                    <div className={cn("text-3xl font-mono font-bold tracking-tighter", stat.color)}>{stat.value}</div>
                    <stat.icon className={cn("h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`h-1 flex-1 ${i <= 4 ? (stat.color === 'text-primary' ? 'bg-primary/20' : stat.color.replace('text-', 'bg-') + '/20') : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending-reports" className="space-y-6">
            <TabsList className="bg-[#15110E] border border-[#1F1914] rounded-none p-1 h-auto flex-wrap sm:flex-nowrap">
              <TabsTrigger value="pending-reports" className="rounded-none px-6 py-2 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
                Q_REPORTS ({pendingReports.length})
              </TabsTrigger>
              <TabsTrigger value="flagged-reports" className="rounded-none px-6 py-2 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all">
                FLAGGED ({flaggedReports.length})
              </TabsTrigger>
              <TabsTrigger value="approved-reports" className="rounded-none px-6 py-2 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-[#15110E] data-[state=active]:border-primary/50 data-[state=active]:text-primary border border-transparent transition-all">
                MAIN_LEDGER ({approvedReports.length})
              </TabsTrigger>
              <TabsTrigger value="pending-companies" className="rounded-none px-6 py-2 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-cyan-500 data-[state=active]:text-black transition-all">
                WHITELIST_Q ({pendingSafeCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-none px-6 py-2 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/30 transition-all">
                TELEMETRY
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending-reports" className="mt-6">
              <div className="bg-[#15110E] border border-[#1F1914] shadow-2xl relative overflow-hidden">
                <div className="bg-[#0C0A09] border-b border-[#1F1914] px-6 py-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold font-mono uppercase tracking-[0.2rem] text-primary flex items-center gap-2">
                    <Terminal className="h-3 w-3" /> THREAT_LOGS_AWAITING_REVIEW
                  </h3>
                  <Badge className="bg-primary/5 text-primary border-primary/20 text-[8px] font-mono rounded-none">LVL_4_CLEARANCE</Badge>
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
                      <Table className="font-mono text-[10px] tracking-tight">
                        <TableHeader className="bg-[#0C0A09]">
                          <TableRow className="border-[#1F1914] hover:bg-transparent">
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">THREAT_IDENTIFIER</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">VECTOR</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">SEVERITY</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">TIMESTAMP</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReports.map((report) => (
                            <TableRow key={report.id} className="border-[#1F1914] hover:bg-white/5">
                              <TableCell>
                                <Checkbox
                                  checked={selectedReports.includes(report.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedReports(prev => [...prev, report.id]);
                                    } else {
                                      setSelectedReports(prev => prev.filter(id => id !== report.id));
                                    }
                                  }}
                                  className="h-3 w-3 border-[#1F1914] data-[state=checked]:bg-primary data-[state=checked]:text-black"
                                />
                              </TableCell>
                              <TableCell className="font-bold text-foreground max-w-[200px] truncate uppercase tracking-widest">{report.title}</TableCell>
                              <TableCell>
                                <Badge className="rounded-none bg-[#0C0A09] border-[#1F1914] text-[9px] font-mono text-primary py-0">
                                  {report.scamType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("rounded-none border text-[9px] tracking-widest px-2 py-0 font-mono", getRiskColor(report.riskLevel))}>
                                  {report.riskLevel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground/50 tabular-nums">
                                {new Date(report.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button size="icon" variant="outline" onClick={() => handleApprove(report.id)} className="h-7 w-7 rounded-none border-green-500/30 text-green-500 hover:bg-green-500/20">
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="outline" onClick={() => handleReject(report.id)} className="h-7 w-7 rounded-none border-amber-500/30 text-amber-500 hover:bg-amber-500/20">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDelete(report.id)} className="h-7 w-7 rounded-none bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>

                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-[#0C0A09]/50 border-t border-[#1F1914]">
                      <Check className="h-10 w-10 text-green-500/20 mx-auto mb-6" />
                      <h3 className="text-[10px] font-bold font-mono tracking-[0.3rem] text-foreground mb-2 uppercase opacity-50">QUARANTINE_EMPTY</h3>
                      <p className="text-[9px] font-mono tracking-widest text-muted-foreground/30 uppercase">NO_UNVERIFIED_LOGS_DETECTED</p>
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
                      <Table className="font-mono text-[10px] tracking-tight">
                        <TableHeader className="bg-[#0C0A09]">
                          <TableRow className="border-[#1F1914] hover:bg-transparent">
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">THREAT_IDENTIFIER</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">FLAG_DENSITY</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">TRUST_SCORE</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flaggedReports.map((report) => (
                            <TableRow key={report.id} className="border-[#1F1914] hover:bg-red-500/5">
                              <TableCell className="font-bold text-foreground max-w-[200px] truncate uppercase tracking-widest">{report.title}</TableCell>
                              <TableCell className="text-red-500 font-bold tabular-nums">
                                [{report.flagCount}] FLAGS_DETECTED
                              </TableCell>
                              <TableCell>
                                <Badge className="rounded-none bg-[#0C0A09] border-[#1F1914] text-[9px] font-mono text-primary py-0">
                                  {report.trustScore}%_CONFIDENCE
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleResolveFlagged(report.id)} className="h-7 rounded-none border-primary/30 text-primary hover:bg-primary/20 uppercase tracking-widest text-[9px] font-bold px-4">
                                    RESOLVE_ALERT
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDelete(report.id)} className="h-7 w-7 rounded-none bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-[#0C0A09]/50 border-t border-[#1F1914]">
                      <Shield className="h-10 w-10 text-primary/20 mx-auto mb-6" />
                      <h3 className="text-[10px] font-bold font-mono tracking-[0.3rem] text-foreground mb-2 uppercase opacity-50">RADAR_CLEAR</h3>
                      <p className="text-[9px] font-mono tracking-widest text-muted-foreground/30 uppercase">NO_ACTIVE_THREATS_DETECTED</p>
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
                      <Table className="font-mono text-[10px] tracking-tight">
                        <TableHeader className="bg-[#0C0A09]">
                          <TableRow className="border-[#1F1914] hover:bg-transparent">
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">THREAT_IDENTIFIER</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">VECTOR</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">SEVERITY</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">TIMESTAMP</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedReports.map((report) => (
                            <TableRow key={report.id} className="border-[#1F1914] hover:bg-white/5">
                              <TableCell className="font-bold text-foreground max-w-[200px] truncate uppercase tracking-widest">{report.title}</TableCell>
                              <TableCell>
                                <Badge className="rounded-none bg-[#0C0A09] border-[#1F1914] text-[9px] font-mono text-primary py-0">
                                  {report.scamType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("rounded-none border text-[9px] tracking-widest px-2 py-0 font-mono", getRiskColor(report.riskLevel))}>
                                  {report.riskLevel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground/50 tabular-nums">
                                {new Date(report.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button size="icon" variant="destructive" onClick={() => handleDelete(report.id)} className="h-7 w-7 rounded-none bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-[#0C0A09]/50 border-t border-[#1F1914]">
                      <Terminal className="h-10 w-10 text-muted-foreground/20 mx-auto mb-6" />
                      <h3 className="text-[10px] font-bold font-mono tracking-[0.3rem] text-foreground mb-2 uppercase opacity-50">DATABANK_EMPTY</h3>
                      <p className="text-[9px] font-mono tracking-widest text-muted-foreground/30 uppercase">NO_APPROVED_REPORTS_IN_CORE_STORAGE</p>
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
                      <Table className="font-mono text-[10px] tracking-tight">
                        <TableHeader className="bg-[#0C0A09]">
                          <TableRow className="border-[#1F1914] hover:bg-transparent">
                            <TableHead className="w-10">SEL</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">NODE_ID</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">SECTOR</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">VERIFY_SCORE</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">URL</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold">TIMESTAMP</TableHead>
                            <TableHead className="uppercase tracking-widest text-muted-foreground text-[9px] font-bold text-right">ADMIN_AUTH</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingSafeCompanies.map((company) => (
                            <TableRow key={company.id} className="border-[#1F1914] hover:bg-cyan-500/5">
                              <TableCell>
                                <Checkbox
                                  checked={selectedCompanies.includes(company.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCompanies(prev => [...prev, company.id]);
                                    } else {
                                      setSelectedCompanies(prev => prev.filter(id => id !== company.id));
                                    }
                                  }}
                                  className="h-3 w-3 border-[#1F1914] data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                                />
                              </TableCell>
                              <TableCell className="font-bold text-foreground uppercase tracking-widest">{company.name}</TableCell>
                              <TableCell className="text-muted-foreground/70 uppercase tracking-widest text-[9px]">{company.industry}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 bg-[#0C0A09] h-1 border border-[#1F1914]">
                                    <div className="bg-cyan-500 h-full" style={{ width: `${company.verified_score}%` }} />
                                  </div>
                                  <span className="font-mono text-[9px] text-cyan-500">{company.verified_score}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold tracking-widest text-[9px]">
                                    EXT_LINK::VIEW
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground/30 text-[9px]">NULL_PTR</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground/50 tabular-nums">
                                {new Date(company.created_at).toISOString().replace('T', ' ').split('.')[0]}
                                </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <button onClick={() => handleApproveSafeCompany(company.id)} className="p-1.5 border border-green-500/30 text-green-500 hover:bg-green-500/20 transition-all font-mono text-[8px] uppercase tracking-widest">OK</button>
                                  <button onClick={() => handleRejectSafeCompany(company.id)} className="p-1.5 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 transition-all font-mono text-[8px] uppercase tracking-widest">HLT</button>
                                  <button onClick={() => handleDeleteSafeCompany(company.id)} className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all font-mono text-[8px] uppercase tracking-widest">DEL</button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-[#0C0A09]/50 border-t border-[#1F1914]">
                      <Check className="h-10 w-10 text-cyan-500/20 mx-auto mb-6" />
                      <h3 className="text-[10px] font-bold font-mono tracking-[0.3rem] text-foreground mb-2 uppercase opacity-50">WHITELIST_EMPTY</h3>
                      <p className="text-[9px] font-mono tracking-widest text-muted-foreground/30 uppercase">NO_PENDING_TRUST_NODES_IN_BUFFER</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#15110E] border border-[#1F1914] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-20 group-hover:opacity-100 transition-opacity" />
                  <div className="bg-[#0C0A09] border-b border-[#1F1914] p-4 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                       <TrendingUp className="h-3 w-3" /> VECTOR_TELEMETRY
                    </h3>
                    <span className="text-[8px] font-mono text-muted-foreground/50">REFRESH_RATE: 200MS</span>
                  </div>
                  <div className="p-8 font-mono text-[10px] tracking-[0.15rem] space-y-8">
                    {[
                      { label: "FAKE_JOB_OFFERS", value: 65, color: "bg-red-500" },
                      { label: "UNPAID_LABOR", value: 45, color: "bg-amber-500" },
                      { label: "IP_THEFT", value: 30, color: "bg-cyan-500" },
                      { label: "GHOST_CLIENTS", value: 25, color: "bg-primary" }
                    ].map((vector) => (
                      <div key={vector.label} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">{vector.label}</span>
                          <span className="text-primary font-bold">{vector.value}%</span>
                        </div>
                        <div className="w-full bg-[#0C0A09] border border-[#1F1914] h-1.5 relative overflow-hidden">
                          <div 
                            className={`${vector.color} h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,191,0,0.3)]`} 
                            style={{ width: `${vector.value}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#15110E] border border-[#1F1914] relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 [clip-path:polygon(0_0,0_100%,100%_100%)] opacity-20 group-hover:opacity-100 transition-opacity" />
                  <div className="bg-[#0C0A09] border-b border-[#1F1914] p-4 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                       <AlertTriangle className="h-3 w-3" /> RISK_DISTRIBUTION
                    </h3>
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[8px] font-mono rounded-none">CRITICAL_LOAD</Badge>
                  </div>
                  <div className="p-8 font-mono text-[10px] tracking-[0.15rem] space-y-8">
                    {[
                      { label: "CRITICAL_THREATS", value: 40, color: "bg-red-600" },
                      { label: "ELEVATED_RISK", value: 45, color: "bg-amber-500" },
                      { label: "ANOMALIES", value: 15, color: "bg-green-500" }
                    ].map((risk) => (
                      <div key={risk.label} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">{risk.label}</span>
                          <span className="text-primary font-bold">{risk.value}%</span>
                        </div>
                        <div className="w-full bg-[#0C0A09] border border-[#1F1914] h-1.5 relative overflow-hidden">
                          <div 
                            className={`${risk.color} h-full transition-all duration-1000 ease-out`} 
                            style={{ width: `${risk.value}%` }} 
                          />
                        </div>
                      </div>
                    ))}
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
