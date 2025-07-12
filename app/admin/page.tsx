// THIS FILE MUST NOT HAVE "use client" AT THE TOP.
// It is a Server Component responsible for server-side authentication and rendering the client dashboard.

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server" // This import is for server-side only
import AdminDashboardClient from "@/components/admin-dashboard-client" // This is your client-side dashboard component

export default async function AdminPage() {
  // This code runs exclusively on the server during the request lifecycle.
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login page (server-side redirect)
  if (!session) {
    redirect("/admin/login")
  }

  // If a session exists, render the client-side dashboard component.
  // All interactive elements and client-side data fetching will happen within AdminDashboardClient.
  return <AdminDashboardClient />
}
