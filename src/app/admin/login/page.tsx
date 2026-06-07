"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Terminal, AlertTriangle, Lock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ADMIN_CONFIG } from "@/lib/admin-config"
import { recordFailedLoginAttempt, getAdminUser, type AdminUser } from "@/lib/admin-roles"
import { logAuditAction } from "@/lib/audit-logger"
import { isAccountLockedOut } from "@/lib/admin-roles"
import { cn } from "@/lib/utils"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [mode, setMode] = useState<"login" | "register">("login")
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

  const handleLogin = async () => {
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

      const role = adminUser?.role || 'user'
      if (role === 'admin') {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
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
    }
  }

  const handleRegister = async () => {
    try {
      // Validate email domain if enabled
      if (ADMIN_CONFIG.ENABLE_EMAIL_DOMAIN_CHECK && !ADMIN_CONFIG.isEmailDomainAllowed(email)) {
        const domain = ADMIN_CONFIG.getEmailDomain(email)
        throw new Error(`Email domain '${domain}' is not authorized for registration.`)
      }

      // Call Firebase createUserWithEmailAndPassword
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || '',
          action: 'ADMIN_REGISTER',
          resourceType: 'auth',
          resourceId: user.uid,
          details: {
            emailVerified: user.emailVerified,
          },
          status: 'success',
        })
      }

      toast({
        title: "ACCOUNT_CREATED",
        description: "DEVELOPER NODE PROVISIONED. DECRYPTING STORAGE...",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = "UNKNOWN_ERROR_DURING_PROVISIONING"
      let errorTitle = "SYS_ERR: PROVISION_FAILED"

      if (error.code === "auth/email-already-in-use") {
        errorTitle = "SYS_ERR: EMAIL_TAKEN"
        errorMessage = "THIS NETWORK ID IS ALREADY REGISTERED IN THE DATABASE."
      } else if (error.code === "auth/weak-password") {
        errorTitle = "SYS_ERR: WEAK_PASSKEY"
        errorMessage = "PASSKEY STRENGTH UNACCEPTABLE (MUST BE AT LEAST 6 CHARACTERS)."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      const adminUser = await getAdminUser(user.uid)

      if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || '',
          action: 'ADMIN_LOGIN',
          resourceType: 'auth',
          resourceId: user.uid,
          details: {
            method: 'google',
            role: adminUser?.role || 'user',
          },
          status: 'success',
        })
      }

      toast({
        title: "ACCESS_GRANTED",
        description: "ROOT DIRECTORY INITIALIZING...",
      })

      const role = adminUser?.role || 'user'
      if (role === 'admin') {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    } catch (error: any) {
      console.error("Google sign in error:", error)
      toast({
        title: "SYS_ERR: GOOGLE_AUTH_FAILED",
        description: error.message || "Failed to authenticate with Google.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (mode === "login") {
      await handleLogin()
    } else {
      await handleRegister()
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 relative overflow-hidden">
      {/* Decorative Grid Background and Cyber Orbs */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.05]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Main Card with Glassmorphism */}
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-950/45 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-20 pointer-events-none" />
          
          {/* Terminal Title Bar */}
          <div className="bg-slate-950/70 border-b border-white/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-[0.2rem] uppercase font-mono">
                <Terminal className="h-3.5 w-3.5" /> SECURE_GATEWAY_v4.5
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/30" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
              </div>
            </div>
          </div>

          <div className="p-8 bg-transparent">
            {/* Header / Logo Icon */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-5">
                <div className="relative group">
                  <div className="absolute -inset-3 bg-primary/20 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_0_30px_rgba(249,115,22,0.1)] p-2">
                    <img src="/logo-icon.png" alt="ScamSentry Shield" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.5)] animate-pulse" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold tracking-widest uppercase text-foreground mb-2">
                SCAM<span className="text-primary">SENTRY</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-6 bg-white/5" />
                <p className="text-[9px] font-mono tracking-widest text-muted-foreground/60 uppercase">
                  ENTERPRISE IDENTITY CONTROLLER
                </p>
                <div className="h-px w-6 bg-white/5" />
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-white/5 mb-6 font-mono text-[9px] uppercase tracking-wider bg-slate-950/30 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 py-2 rounded-md text-center transition-all relative font-semibold",
                  mode === "login"
                    ? "text-primary bg-primary/10 font-bold shadow-sm"
                    : "text-muted-foreground/40 hover:text-muted-foreground/80"
                )}
              >
                [ LOGIN SESSION ]
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={cn(
                  "flex-1 py-2 rounded-md text-center transition-all relative font-semibold",
                  mode === "register"
                    ? "text-primary bg-primary/10 font-bold shadow-sm"
                    : "text-muted-foreground/40 hover:text-muted-foreground/80"
                )}
              >
                [ DEV REGISTER ]
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1 block">
                  {mode === "login" ? "IDENTITY PROTOCOL (EMAIL)" : "PROVISION NEW NETWORK ID"}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder={mode === "login" ? "admin@scamsentry.io" : "developer@scamsentry.io"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-950/45 border-white/5 focus:border-primary/50 rounded-xl tracking-wide text-xs h-11 pl-10 focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/20 text-foreground transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1 block">
                  {mode === "login" ? "SECURITY PASSKEY" : "NEW SECURITY PASSKEY"}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-950/45 border-white/5 focus:border-primary/50 rounded-xl tracking-wide text-xs h-11 pl-10 focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/20 text-foreground font-mono transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-primary/10 active:scale-[0.98] flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {mode === "login" ? "ESTABLISHING LINK..." : "CREATING CREDENTIALS..."}
                    </div>
                  ) : (
                    mode === "login" ? "INITIALIZE SESSION" : "CREATE DEVELOPER NODE"
                  )}
                </Button>
              </div>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[8px] uppercase font-mono tracking-widest">
                <span className="bg-slate-950 px-2 text-muted-foreground/35">OR DIRECT SERVICE GATEWAY</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:text-foreground hover:border-white/10 text-muted-foreground transition-all font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <svg className="h-4 w-4 mr-1 text-primary group-hover:animate-pulse" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[8.5px] font-mono tracking-wider text-muted-foreground/30 uppercase">
                ENCRYPTION: AES-256-GCM | OSINT PROTOCOLS ACTIVE
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative corner brackets */}
        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t border-l border-white/10 pointer-events-none rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t border-r border-white/10 pointer-events-none rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b border-l border-white/10 pointer-events-none rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b border-r border-white/10 pointer-events-none rounded-br-lg" />

      </div>
    </div>
  )
}
