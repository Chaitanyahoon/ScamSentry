"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "ACCESS_GRANTED",
        description: "ROOT DIRECTORY INITIALIZING...",
      })
      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "UNKNOWN_ERROR_DURING_HANDSHAKE"
      let errorTitle = "SYS_ERR: AUTH_FAILED"

      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorTitle = "SYS_ERR: INVALID_CREDENTIALS"
        errorMessage = "AUTH PAYLOAD REJECTED BY DATABASE FIREWALL."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="glass-strong border-t-2 border-t-primary/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="bg-card/80 border-b border-border p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase font-mono">
              <Terminal className="h-4 w-4 text-primary" /> SECURE_LOGIN_TERMINAL
            </div>
          </div>

          <div className="p-8 bg-background/50">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center border border-primary/50 bg-primary/10 shadow-[0_0_15px_hsla(var(--primary),0.3)]">
                  <Shield className="h-8 w-8 text-primary drop-shadow-[0_0_8px_currentColor]" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold tracking-widest uppercase text-foreground mb-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
                ROOT <span className="text-primary">ACCESS</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                AUTHORIZED PERSONNEL ONLY. ALL ATTEMPTS ARE LOGGED.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 font-mono">
              <div>
                <Label htmlFor="email" className="text-xs font-bold tracking-widest uppercase text-foreground mb-2 block">
                  SYS_ADMIN_EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@system.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-card border-border rounded-none tracking-widest text-xs h-12 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs font-bold tracking-widest uppercase text-foreground mb-2 block">
                  AUTHORIZATION_KEY
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-card border-border rounded-none tracking-widest text-lg h-12 focus-visible:ring-primary focus-visible:border-primary text-primary font-sans"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-none bg-primary text-black hover:bg-primary/80 border border-transparent hover:border-primary hover:shadow-[0_0_15px_hsla(var(--primary),0.5)] transition-all font-bold tracking-widest uppercase text-xs" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    "ESTABLISH_CONNECTION"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
