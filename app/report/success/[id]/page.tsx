"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useReports } from "@/contexts/reports-context"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, TerminalSquare, Share2, ArrowRight } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-background py-16">
        <div className="bg-card border border-border w-full max-w-md text-center p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Report Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            The requested report could not be found or has been removed.
          </p>
          <Button 
            onClick={() => router.push("/report")}
            className="w-full"
            variant="outline"
          >
            Submit New Report
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          
          {/* Success Header */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Report Submitted Successfully
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Your report has been securely logged and is pending moderator verification. Thank you for contributing to the community database.
            </p>
          </div>

          {/* Share Section */}
          <div className="mb-12 bg-card border border-border p-6 sm:p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Share this Intel
              </h2>
            </div>
            
            <div className="mx-auto bg-background border border-border p-4 shadow-sm">
              {reportUrl && <ShareableReportCard report={report} reportUrl={reportUrl} />}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild 
              size="lg"
              className="font-semibold px-8"
            >
              <Link href="/report">
                Submit Another Report <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="font-semibold px-8"
            >
              <Link href="/reports">
                 Browse Database <TerminalSquare className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  )
}
