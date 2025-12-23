"use client"

import { useEffect } from "react"
import { useState } from "react"
import { Shield, Eye, Check, X, Flag, TrendingUp, AlertTriangle, Trash2, Building, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useReports } from "@/contexts/reports-context"
import LogoutButton from "@/components/logout-button"
import { db } from "@/lib/firebase"
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"

// Define SafeCompany type for client-side use
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

  // Fetch safe companies on component mount
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
          title: "Error",
          description: "Failed to load safe companies.",
          variant: "destructive",
        })
      }
      setIsLoadingSafeCompanies(false)
    }
    fetchSafeCompanies()
  }, [toast])

  const pendingReports = reports.filter((report) => report.status === "pending")
  const flaggedReports = reports.filter((report) => report.flagCount > 0 && report.status === "approved")
  const approvedReports = reports.filter((report) => report.status === "approved") // All approved reports
  const pendingSafeCompanies = safeCompanies.filter((company) => company.status === "pending")

  const handleApprove = async (id: string) => {
    await approveReport(id)
    toast({
      title: "Report Approved",
      description: "The report has been published successfully.",
    })
  }

  const handleReject = async (id: string) => {
    await rejectReport(id)
    toast({
      title: "Report Rejected",
      description: "The report has been rejected and will not be published.",
      variant: "destructive",
    })
  }

  const handleDelete = async (id: string) => {
    await deleteReport(id)
    toast({
      title: "Report Deleted",
      description: "The report has been permanently removed.",
      variant: "destructive",
    })
  }

  const handleResolveFlagged = async (id: string) => {
    // In a real app, you might reset flagCount or change status
    toast({
      title: "Flag Resolved",
      description: "The flagged report has been reviewed and resolved.",
    })
  }

  // Safe Company Actions
  const handleApproveSafeCompany = async (id: string) => {
    try {
      const companyRef = doc(db, "safe_companies", id)
      await updateDoc(companyRef, { status: "approved" })
      setSafeCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c)))
      toast({ title: "Company Approved", description: "The company has been added to the safe list." })
    } catch (error) {
      console.error("Error approving safe company:", error)
      toast({ title: "Error", description: "Failed to approve company.", variant: "destructive" })
    }
  }

  const handleRejectSafeCompany = async (id: string) => {
    try {
      const companyRef = doc(db, "safe_companies", id)
      await updateDoc(companyRef, { status: "rejected" })
      setSafeCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)))
      toast({ title: "Company Rejected", description: "The company has been rejected." })
    } catch (error) {
      console.error("Error rejecting safe company:", error)
      toast({ title: "Error", description: "Failed to reject company.", variant: "destructive" })
    }
  }

  const handleDeleteSafeCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, "safe_companies", id))
      setSafeCompanies((prev) => prev.filter((c) => c.id !== id))
      toast({ title: "Company Deleted", description: "The company has been permanently removed." })
    } catch (error) {
      console.error("Error deleting safe company:", error)
      toast({ title: "Error", description: "Failed to delete company.", variant: "destructive" })
    }
  }

  const stats = [
    {
      name: "Pending Reports",
      value: pendingReports.length,
      icon: Eye,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      name: "Flagged Reports",
      value: flaggedReports.length,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      name: "Pending Safe Companies",
      value: pendingSafeCompanies.length,
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      name: "Total Reports",
      value: reports.length,
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <div className="flex items-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white ml-4">
                  Admin Dashboard
                </h1>
              </div>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Manage reports, moderate content, and monitor platform health
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending-reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
              <TabsTrigger value="pending-reports">Reports ({pendingReports.length})</TabsTrigger>
              <TabsTrigger value="flagged-reports">Flagged ({flaggedReports.length})</TabsTrigger>
              <TabsTrigger value="approved-reports">Approved ({approvedReports.length})</TabsTrigger> {/* New tab */}
              <TabsTrigger value="pending-companies">Companies ({pendingSafeCompanies.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="pending-reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports Awaiting Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.scamType}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getRiskColor(report.riskLevel)}>{report.riskLevel}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(report.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApprove(report.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(report.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(report.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
                      <p className="text-gray-600 dark:text-gray-400">No reports pending review at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flagged-reports">
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {flaggedReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report Title</TableHead>
                            <TableHead>Flag Count</TableHead>
                            <TableHead>Trust Score</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flaggedReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.title}</TableCell>
                              <TableCell>
                                {report.flagCount} user{report.flagCount > 1 ? "s" : ""}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.trustScore}%</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleResolveFlagged(report.id)}>
                                    Resolve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(report.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No flagged reports</h3>
                      <p className="text-gray-600 dark:text-gray-400">All reports are in good standing.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Tab for Approved Reports */}
            <TabsContent value="approved-reports">
              <Card>
                <CardHeader>
                  <CardTitle>Approved Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.scamType}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getRiskColor(report.riskLevel)}>{report.riskLevel}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(report.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(report.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No approved reports</h3>
                      <p className="text-gray-600 dark:text-gray-400">Approved reports will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending-companies">
              <Card>
                <CardHeader>
                  <CardTitle>Safe Companies Awaiting Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSafeCompanies ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : pendingSafeCompanies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingSafeCompanies.map((company) => (
                            <TableRow key={company.id}>
                              <TableCell className="font-medium">{company.name}</TableCell>
                              <TableCell>{company.industry}</TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Link
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(company.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproveSafeCompany(company.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectSafeCompany(company.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteSafeCompany(company.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        No safe companies pending review at the moment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Report Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Fake Job Offers</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Unpaid Work</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">45%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Portfolio Theft</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">30%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ghost Clients</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">25%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Risk Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">High Risk</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">40%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">Medium Risk</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">45%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Low Risk</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">15%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
