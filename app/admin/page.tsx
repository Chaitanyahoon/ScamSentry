"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import AdminDashboardClient from "@/components/admin-dashboard-client"
import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  const { user, loading, role, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return null // Will redirect via useEffect
  }

  // User authenticated but does NOT have admin role
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md border-destructive/50 bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              Your account ({user.email}) does not have administrator privileges.
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Current Role: <span className="text-yellow-600 font-bold uppercase">{role}</span>
            </p>
            <p className="text-sm text-foreground">
              Please contact your system administrator to request admin access.
            </p>
            <div className="pt-2 space-y-2">
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Go Back Home
              </Button>
              <Button 
                onClick={async () => {
                  const { useAuth } = await import('@/contexts/auth-context')
                  // Will be handled by logout button
                  window.location.href = "/admin/login?logout=true"
                }}
                variant="destructive"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated AND is admin
  return <AdminDashboardClient />
}
