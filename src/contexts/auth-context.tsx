"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getUserRole, getAdminUser, createOrUpdateAdminUser, type UserRole } from "@/lib/admin-roles"
import { ADMIN_CONFIG } from "@/lib/admin-config"
import { logAuditAction } from "@/lib/audit-logger"

interface AuthContextType {
    user: User | null
    loading: boolean
    role: UserRole | null
    isAdmin: boolean
    signOut: () => Promise<void>
    lastActivityTime: number
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: null,
    isAdmin: false,
    signOut: async () => { },
    lastActivityTime: Date.now(),
})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<UserRole | null>(null)
    const [lastActivityTime, setLastActivityTime] = useState(Date.now())
    const router = useRouter()
    const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Handle user authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firefbaseUser) => {
            setUser(firefbaseUser)
            
            if (firefbaseUser) {
                try {
                    // Create or update admin user record
                    await createOrUpdateAdminUser(
                        firefbaseUser.uid,
                        firefbaseUser.email || '',
                        firefbaseUser.displayName || undefined
                    )

                    // Get user role
                    const userRole = await getUserRole(firefbaseUser.uid)
                    setRole(userRole)

                    // Log successful login
                    if (ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
                        await logAuditAction({
                            userId: firefbaseUser.uid,
                            userEmail: firefbaseUser.email || '',
                            action: 'ADMIN_LOGIN',
                            resourceType: 'auth',
                            resourceId: firefbaseUser.uid,
                            details: {
                                role: userRole,
                                emailVerified: firefbaseUser.emailVerified,
                            },
                            status: 'success',
                        })
                    }

                    // Reset activity timer
                    resetActivityTimer()
                } catch (error) {
                    console.error('Error setting up user:', error)
                    setRole(null)
                }
            } else {
                setRole(null)
                // Clear timers on logout
                if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
                if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Set up session timeout
    useEffect(() => {
        if (user) {
            sessionTimeoutRef.current = setTimeout(() => {
                handleSessionTimeout()
            }, ADMIN_CONFIG.SESSION_TIMEOUT_MS)

            return () => {
                if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
            }
        }
    }, [user])

    // Set up inactivity timeout and activity tracking
    useEffect(() => {
        if (!user) return

        const trackActivity = () => {
            setLastActivityTime(Date.now())
            resetActivityTimer()
        }

        // Track user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
        events.forEach((event) => {
            document.addEventListener(event, trackActivity, { passive: true })
        })

        resetActivityTimer()

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, trackActivity)
            })
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)
        }
    }, [user])

    const resetActivityTimer = () => {
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current)
        }

        inactivityTimeoutRef.current = setTimeout(() => {
            handleInactivityTimeout()
        }, ADMIN_CONFIG.INACTIVITY_TIMEOUT_MS)
    }

    const handleSessionTimeout = async () => {
        console.warn('[AUTH] Session timeout - logging out user')
        if (user && ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
            await logAuditAction({
                userId: user.uid,
                userEmail: user.email || '',
                action: 'SESSION_TIMEOUT',
                resourceType: 'auth',
                resourceId: user.uid,
                details: { reason: 'Session expired' },
                status: 'success',
            })
        }
        await signOut()
    }

    const handleInactivityTimeout = async () => {
        console.warn('[AUTH] Inactivity timeout - logging out user')
        if (user && ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
            await logAuditAction({
                userId: user.uid,
                userEmail: user.email || '',
                action: 'SESSION_TIMEOUT',
                resourceType: 'auth',
                resourceId: user.uid,
                details: { reason: 'Inactivity timeout' },
                status: 'success',
            })
        }
        await signOut()
    }

    const signOut = async () => {
        try {
            if (user && ADMIN_CONFIG.ENABLE_AUDIT_LOG) {
                await logAuditAction({
                    userId: user.uid,
                    userEmail: user.email || '',
                    action: 'ADMIN_LOGOUT',
                    resourceType: 'auth',
                    resourceId: user.uid,
                    details: {},
                    status: 'success',
                })
            }

            await firebaseSignOut(auth)
            setRole(null)
            
            // Clear timers
            if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current)

            router.push("/admin/login")
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            role,
            isAdmin: role === 'admin',
            signOut,
            lastActivityTime,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
