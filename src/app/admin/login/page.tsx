"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function RedirectComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const queryStr = searchParams.toString()
    const destination = queryStr ? `/login?${queryStr}` : "/login"
    router.replace(destination)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#070605] flex items-center justify-center text-muted-foreground font-mono text-xs">
      REDIRECTING_TO_SECURE_GATEWAY...
    </div>
  )
}

export default function DeprecatedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070605] flex items-center justify-center text-muted-foreground font-mono text-xs">
        REDIRECTING_TO_SECURE_GATEWAY...
      </div>
    }>
      <RedirectComponent />
    </Suspense>
  )
}
