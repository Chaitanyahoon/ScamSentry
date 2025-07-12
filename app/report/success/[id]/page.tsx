"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useReports } from "@/contexts/reports-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { ShareableReportCard } from "@/components/shareable-report-card"
import Link from "next/link"

export default function ReportSuccessPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reports } = useReports()
  const [reportUrl, setReportUrl] = useState("")

  const report = reports.find((r) => r.id === id)

  useEffect(() => {
    // Construct the full URL for sharing
    if (typeof window !== "undefined" && report) {
      setReportUrl(`${window.location.origin}/reports/${report.id}`)
    }
  }, [report])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              Report Not Found
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">The report you are looking for could not be found.</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/report")}>Submit a New Report</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Report Submitted!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Thank you for helping protect the freelancer community. Your report is now under review.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Share This Report</h2>
          {reportUrl && <ShareableReportCard report={report} reportUrl={reportUrl} />}

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/report">Submit Another Report</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/reports">Browse All Reports</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
