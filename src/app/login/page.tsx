"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Terminal,
  AlertTriangle,
  Lock,
  User,
  KeyRound,
  Radio,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_CONFIG } from "@/lib/admin-config";
import { recordFailedLoginAttempt, getAdminUser } from "@/lib/admin-roles";
import { logAuditAction } from "@/lib/audit-logger";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<
    number | null
  >(null);

  // Check if email is locked out
  useEffect(() => {
    if (!lockoutTimeRemaining) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = lockoutTimeRemaining - now;

      if (remaining <= 0) {
        setLockoutTimeRemaining(null);
        clearInterval(interval);
      } else {
        setLockoutTimeRemaining(lockoutTimeRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTimeRemaining]);

  const handleLogin = async () => {
    try {
      // Validate email domain if enabled
      if (
        ADMIN_CONFIG.ENABLE_EMAIL_DOMAIN_CHECK &&
        !ADMIN_CONFIG.isEmailDomainAllowed(email)
      ) {
        const domain = ADMIN_CONFIG.getEmailDomain(email);
        throw new Error(
          `Email domain '${domain}' is not authorized for portal access.`,
        );
      }

      // Attempt Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Check user role
      const adminUser = await getAdminUser(user.uid);

      if (!adminUser) {
        console.log("[AUTH] First login - initializing developer/user profile");
      } else if (!adminUser.isActive) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || "",
          action: "ADMIN_LOGIN",
          resourceType: "auth",
          resourceId: user.uid,
          details: { reason: "Account inactive" },
          status: "failure",
          errorMessage: "Account has been deactivated",
        });

        await auth.signOut();
        throw new Error(
          "Your account has been deactivated. Contact administrator.",
        );
      }

      if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || "",
          action: "ADMIN_LOGIN",
          resourceType: "auth",
          resourceId: user.uid,
          details: {
            emailVerified: user.emailVerified,
            role: adminUser?.role || "user",
          },
          status: "success",
        });
      }

      toast({
        title: "ACCESS_GRANTED",
        description: "SECURITY HANDSHAKE COMPLETED. LOADING CONSOLE...",
      });

      const role = adminUser?.role || "user";
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (error: any) {
      console.error("Login error:", error);

      // Record failed login attempt
      try {
        const isInvalidCredential =
          error.code === "auth/invalid-credential" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password";

        if (isInvalidCredential) {
          await recordFailedLoginAttempt("unknown-" + Date.now(), email);
        }

        if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
          await logAuditAction({
            userId: "unknown",
            userEmail: email,
            action: "ADMIN_LOGIN",
            resourceType: "auth",
            resourceId: email,
            details: { errorCode: error.code },
            status: "failure",
            errorMessage: error.message,
          });
        }
      } catch (auditError) {
        console.error("Failed to log audit action:", auditError);
      }

      let errorMessage = "UNKNOWN_ERROR_DURING_HANDSHAKE";
      let errorTitle = "SYS_ERR: AUTH_FAILED";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorTitle = "SYS_ERR: INVALID_CREDENTIALS";
        errorMessage = "AUTH PAYLOAD REJECTED BY ACCESS CONTROL FIREWALL.";
      } else if (error.message?.includes("not authorized")) {
        errorTitle = "SYS_ERR: DOMAIN_REJECTED";
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRegister = async () => {
    try {
      // Validate email domain if enabled
      if (
        ADMIN_CONFIG.ENABLE_EMAIL_DOMAIN_CHECK &&
        !ADMIN_CONFIG.isEmailDomainAllowed(email)
      ) {
        const domain = ADMIN_CONFIG.getEmailDomain(email);
        throw new Error(
          `Email domain '${domain}' is not authorized for registration.`,
        );
      }

      // Call Firebase createUserWithEmailAndPassword
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || "",
          action: "ADMIN_REGISTER",
          resourceType: "auth",
          resourceId: user.uid,
          details: {
            emailVerified: user.emailVerified,
          },
          status: "success",
        });
      }

      toast({
        title: "ACCOUNT_CREATED",
        description: "DEVELOPER NODE PROVISIONED. ESTABLISHING PROFILE...",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "UNKNOWN_ERROR_DURING_PROVISIONING";
      let errorTitle = "SYS_ERR: PROVISION_FAILED";

      if (error.code === "auth/email-already-in-use") {
        errorTitle = "SYS_ERR: EMAIL_TAKEN";
        errorMessage = "THIS NETWORK ID IS ALREADY REGISTERED.";
      } else if (error.code === "auth/weak-password") {
        errorTitle = "SYS_ERR: WEAK_PASSKEY";
        errorMessage =
          "PASSKEY STRENGTH UNACCEPTABLE (MUST BE AT LEAST 6 CHARACTERS).";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const adminUser = await getAdminUser(user.uid);

      if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
        await logAuditAction({
          userId: user.uid,
          userEmail: user.email || "",
          action: "ADMIN_LOGIN",
          resourceType: "auth",
          resourceId: user.uid,
          details: {
            method: "google",
            role: adminUser?.role || "user",
          },
          status: "success",
        });
      }

      toast({
        title: "ACCESS_GRANTED",
        description: "SECURITY HANDSHAKE COMPLETED. LOADING CONSOLE...",
      });

      const role = adminUser?.role || "user";
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "SYS_ERR: GOOGLE_AUTH_FAILED",
        description: error.message || "Failed to authenticate with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 relative overflow-hidden select-none">
      {/* Laser Scanline Style Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scanline {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `,
        }}
      />

      {/* Futuristic Background Layout */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-cyber opacity-[0.15]" />

      {/* Moving Laser Scanline */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-[0_0_12px_rgba(249,115,22,0.45)] animate-scanline pointer-events-none z-0" />

      {/* Background Neon Orbs */}
      <div className="absolute top-1/6 left-1/4 w-[600px] h-[600px] bg-primary/[0.05] rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-1/6 right-1/4 w-[600px] h-[600px] bg-secondary/[0.05] rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="w-full max-w-[460px] relative z-10 px-4 sm:px-6">
        {/* Main Card with Premium Cyber Glassmorphism */}
        <div className="group relative bg-[#090b11]/90 border border-white/[0.08] hover:border-primary/40 p-8 sm:p-10 rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.1)] overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Sweep gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          {/* Cyber grid pattern inside card */}
          <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none" />

          {/* Floating Sci-fi Corner Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/40 group-hover:border-primary transition-all duration-500" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/40 group-hover:border-primary transition-all duration-500" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/40 group-hover:border-primary transition-all duration-500" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/40 group-hover:border-primary transition-all duration-500" />

          {/* Radial Top Light Glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-500 pointer-events-none" />

          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-5 mb-8 select-none font-mono">
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-[0.2rem] uppercase">
              <Terminal className="h-4 w-4 text-primary animate-pulse" />{" "}
              SECURE_GATEWAY_v4.5
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/20 group-hover:bg-red-500/60 transition-colors" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/60 transition-colors" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/60 transition-colors" />
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center mb-8 select-none">
            <div className="flex items-center justify-center mb-5">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#06080e]/90 shadow-[0_0_25px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_35px_rgba(249,115,22,0.3)] transition-all p-2 duration-500">
                  <img
                    src="/logo-icon.png"
                    alt="ScamSentry Shield"
                    className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-widest uppercase text-white mb-1">
              SCAM
              <span className="text-primary bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                SENTRY
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-5 bg-white/[0.08]" />
              <p className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
                Developer & Admin Gateway
              </p>
              <div className="h-px w-5 bg-white/[0.08]" />
            </div>
          </div>

          {/* Mode Switcher Tab Bar */}
          <div className="flex bg-[#04060a] border border-white/[0.06] mb-8 font-mono text-xs rounded-xl p-1 select-none">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-center transition-all relative font-bold flex items-center justify-center gap-1.5",
                mode === "login"
                  ? "text-black bg-primary font-bold shadow-[0_0_12px_rgba(249,115,22,0.25)] hover:bg-primary/95"
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]",
              )}
            >
              <Radio
                className={cn(
                  "h-3.5 w-3.5",
                  mode === "login" && "animate-pulse",
                )}
              />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-center transition-all relative font-bold flex items-center justify-center gap-1.5",
                mode === "register"
                  ? "text-black bg-primary font-bold shadow-[0_0_12px_rgba(249,115,22,0.25)] hover:bg-primary/95"
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]",
              )}
            >
              <Terminal
                className={cn(
                  "h-3.5 w-3.5",
                  mode === "register" && "animate-pulse",
                )}
              />
              <span>Register</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Input */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/80 mb-1.5 block font-mono flex items-center gap-1.5 select-none"
              >
                <span className="h-1 w-1 bg-primary rounded-full animate-ping" />
                {mode === "login"
                  ? "IDENTITY PROTOCOL (EMAIL)"
                  : "PROVISION NEW EMAIL LINK"}
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                  <User className="h-4 w-4 text-white/40 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder={
                    mode === "login"
                      ? "developer@scamsentry.io"
                      : "new-dev@scamsentry.io"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-black/60 border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl text-xs h-12 pl-12 text-white transition-all duration-300 placeholder:text-white/30 font-mono"
                />
              </div>
            </div>

            {/* Passkey Input */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/80 mb-1.5 block font-mono flex items-center gap-1.5 select-none"
              >
                <span className="h-1 w-1 bg-primary rounded-full animate-ping" />
                {mode === "login" ? "SECURITY PASSKEY" : "NEW SECURITY PASSKEY"}
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-4 w-4 text-white/40 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-black/60 border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl text-xs h-12 pl-12 text-white transition-all duration-300 placeholder:text-white/30 font-mono"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-500 text-black transition-all duration-300 font-extrabold tracking-[0.2em] uppercase text-[10px] shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 border border-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {mode === "login"
                      ? "ESTABLISHING LINK..."
                      : "PROVISIONING..."}
                  </div>
                ) : mode === "login" ? (
                  "INITIALIZE SESSION"
                ) : (
                  "CREATE DEV NODE"
                )}
              </Button>
            </div>
          </form>

          {/* Integrated Auth Divider */}
          <div className="relative my-7 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase font-mono tracking-widest">
              <span className="bg-[#090b11] px-3 text-white/40">
                OR INTEGRATED AUTH PROTOCOL
              </span>
            </div>
          </div>

          {/* Google SSO Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.2] text-white/80 transition-all duration-300 font-bold tracking-[0.1em] text-xs flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-md shadow-black/20"
          >
            <svg
              className="h-4 w-4 mr-1 text-primary shrink-0"
              viewBox="0 0 24 24"
            >
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

          <div className="mt-8 pt-5 border-t border-white/[0.06] text-center select-none font-mono">
            <p className="text-[8.5px] tracking-widest text-white/40 uppercase flex items-center justify-center gap-2">
              <KeyRound className="h-3 w-3 text-white/30" /> AES-256-GCM |
              SECURE CONNECTIONS ONLY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
