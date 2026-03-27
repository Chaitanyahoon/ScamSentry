"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Terminal, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ADMIN_CONFIG } from "@/lib/admin-config"
import { recordFailedLoginAttempt, getAdminUser, type AdminUser } from "@/lib/admin-roles"
import { logAuditAction } from "@/lib/audit-logger"
import { isAccountLockedOut } from "@/lib/admin-roles"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<number | null>(null)

  // Check if email is locked out
  useEffect(() => {
    if (!lockoutTimeRemaining) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = lockoutTimeRemaining - now

      if (remaining <= 0) {
        setLockoutTimeRemaining(null)
        clearInterval(interval)
      } else {
        setLockoutTimeRemaining(lockoutTimeRemaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutTimeRemaining])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate email domain if enabled
      if (ADMIN_CONFIG.ENABLE_EMAIL_DOMAIN_CHECK && !ADMIN_CONFIG.isEmailDomainAllowed(email)) {
        const domain = ADMIN_CONFIG.getEmailDomain(email)
        throw new Error(`Email domain '${domain}' is not authorized for admin access.`)
      }

      // Attempt Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if user has admin role assigned
      const adminUser = await getAdminUser(user.uid)

      if (!adminUser) {
        // Create admin user record on first login
        console.log('[AUTH] First login - initializing admin user record')
      } else if (!adminUser.isActive) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || '',
          action: 'ADMIN_LOGIN',
          resourceType: 'auth',
          resourceId: user.uid,
          details: { reason: 'Account inactive' },
          status: 'failure',
          errorMessage: 'Account has been deactivated',
        })

        await auth.signOut()
        throw new Error('Your account has been deactivated. Contact administrator.')
      }

      if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || '',
          action: 'ADMIN_LOGIN',
          resourceType: 'auth',
          resourceId: user.uid,
          details: {
            emailVerified: user.emailVerified,
            role: adminUser?.role,
          },
          status: 'success',
        })
      }

      toast({
        title: "ACCESS_GRANTED",
        description: "ROOT DIRECTORY INITIALIZING...",
      })

      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)

      // Record failed login attempt
      try {
        // Extract UID if available from error (for existing users)
        const isInvalidCredential = 
          error.code === "auth/invalid-credential" || 
          error.code === "auth/user-not-found" || 
          error.code === "auth/wrong-password"

        if (isInvalidCredential) {
          // Try to get the user UID to record failed attempt
          try {
            // We can create a temporary user to get the UID, but we won't actually create them
            // Instead, we'll just log the attempt with email
            await recordFailedLoginAttempt('unknown-' + Date.now(), email)
          } catch (e) {
            console.error('Failed to record login attempt:', e)
          }
        }

        if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
          await logAuditAction({
            userId: 'unknown',
            userEmail: email,
            action: 'ADMIN_LOGIN',
            resourceType: 'auth',
            resourceId: email,
            details: { errorCode: error.code },
            status: 'failure',
            errorMessage: error.message,
          })
        }
      } catch (auditError) {
        console.error('Failed to log audit action:', auditError)
      }

      let errorMessage = "UNKNOWN_ERROR_DURING_HANDSHAKE"
      let errorTitle = "SYS_ERR: AUTH_FAILED"

      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorTitle = "SYS_ERR: INVALID_CREDENTIALS"
        errorMessage = "AUTH PAYLOAD REJECTED BY DATABASE FIREWALL."
      } else if (error.message?.includes("not authorized")) {
        errorTitle = "SYS_ERR: DOMAIN_REJECTED"
        errorMessage = error.message
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
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] py-12 relative overflow-hidden">
      {/* Decorative Scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,191,0,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-primary/20 shadow-[0_0_15px_rgba(255,191,0,0.5)]" />

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="bg-[#15110E] border border-[#1F1914] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-20" />
          
          <div className="bg-[#0C0A09] border-b border-[#1F1914] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-[0.2rem] uppercase font-mono">
                <Terminal className="h-3 w-3" /> AUTH_TERMINAL_V4.2
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/20" />
                <div className="w-2 h-2 bg-primary/10" />
                <div className="w-2 h-2 bg-primary/5" />
              </div>
            </div>
          </div>

          <div className="p-10 bg-transparent">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative flex h-20 w-20 items-center justify-center border-2 border-primary/20 bg-[#0C0A09] shadow-[0_0_30px_rgba(255,191,0,0.1)]">
                    <Shield className="h-10 w-10 text-primary drop-shadow-[0_0_12px_rgba(255,191,0,0.6)]" />
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-primary" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-[0.4rem] uppercase text-foreground mb-3 flex items-center justify-center gap-3">
                SECURE <span className="text-primary italic">VAULT</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px w-8 bg-primary/20" />
                <p className="text-[9px] font-mono tracking-[0.25rem] text-muted-foreground/60 uppercase">
                  ROOT_CLEARANCE_REQUIRED
                </p>
                <div className="h-px w-8 bg-primary/20" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-8 font-mono">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-bold tracking-[0.2rem] uppercase text-primary/70 mb-2 block">
                  NETWORK_ID::AUTH
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Terminal className="h-3 w-3 text-primary/30 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ADMIN@SCAMSENTRY.IO"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#0C0A09] border-[#1F1914] focus:border-primary/50 rounded-none tracking-[0.15rem] text-[10px] h-14 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/20 uppercase transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-[10px] font-bold tracking-[0.2rem] uppercase text-primary/70 mb-2 block">
                  PASSKEY::CRYPT
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <AlertTriangle className="h-3 w-3 text-primary/30 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#0C0A09] border-[#1F1914] focus:border-primary/50 rounded-none tracking-widest text-xl h-14 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-primary font-sans placeholder:text-muted-foreground/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-none bg-primary text-black hover:bg-white transition-all font-black tracking-[0.3rem] uppercase text-[11px] shadow-[0_0_20px_rgba(255,191,0,0.1)] active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      DECRYPTING_SIGNAL...
                    </div>
                  ) : (
                    "INITIALIZE_SESSION"
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 pt-8 border-t border-[#1F1914] text-center">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground/40 uppercase">
                ENCRYPTION_LAYER: AES-256-GCM | IP_LOGGING: ACTIVE
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative corner brackets for the login card area */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-primary/40 pointer-events-none" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t border-r border-primary/40 pointer-events-none" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b border-l border-primary/40 pointer-events-none" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-primary/40 pointer-events-none" />

      </div>
    </div>
  )
}
