"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/admin/login")
      router.refresh() // Refresh session on client
    }
    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="text-red-500 hover:text-red-600 bg-transparent"
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      Logout
    </Button>
  )
}
