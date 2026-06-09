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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 sm:py-16 relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-cyber opacity-[0.1]" />

      <div className="w-full max-w-[440px] relative z-10 px-4 sm:px-6">
        {/* Main Card with Clean Modern Design */}
        <div className="group relative bg-card/60 backdrop-blur-md border border-border p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)] overflow-hidden shadow-xl">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background shadow-sm p-2">
                <img
                  src="/logo-icon.png"
                  alt="ScamSentry Shield"
                  className="h-8 w-8 object-contain"
                />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1.5">
              Welcome to <span className="text-primary">ScamSentry</span>
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Secure portal login for verified nodes and administrators.
            </p>
          </div>

          {/* Mode Switcher Tab Bar */}
          <div className="flex bg-muted/40 border border-border mb-6 text-xs rounded-xl p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-2 rounded-lg text-center transition-all font-semibold flex items-center justify-center gap-1.5",
                mode === "login"
                  ? "text-primary-foreground bg-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
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
                "flex-1 py-2 rounded-lg text-center transition-all font-semibold flex items-center justify-center gap-1.5",
                mode === "register"
                  ? "text-primary-foreground bg-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity Input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground mb-1 block"
              >
                {mode === "login" ? "Email Address" : "Register Email Address"}
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                  <User className="h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="developer@scamsentry.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background border-border text-foreground text-sm rounded-xl h-10 pl-10 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                />
              </div>
            </div>

            {/* Passkey Input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground mb-1 block"
              >
                Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                  <Lock className="h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background border-border text-foreground text-sm rounded-xl h-10 pl-10 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 shadow-md shadow-primary/10 active:scale-[0.99] flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Registering..."}
                  </div>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>

          {/* Integrated Auth Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground/60">
                or continue with
              </span>
            </div>
          </div>

          {/* Google SSO Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-10 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all duration-300 font-semibold text-xs flex items-center justify-center gap-2.5 active:scale-[0.99] shadow-sm"
          >
            <svg className="h-4 w-4 mr-1 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
              <KeyRound className="h-3 w-3 text-muted-foreground/45" /> Secure
              identity verification protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
