/**
 * Admin Auth Verification Utilities
 * 
 * Provides server-side token verification and admin claim checking
 * for secure API access control
 */

import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { UserRole } from '@/lib/admin-roles'

export interface VerifiedAdminUser {
  uid: string
  email: string | undefined
  role: UserRole
  isAdmin: boolean
}

/**
 * Verify Firebase ID token and extract user info
 * Returns user details if token is valid, null otherwise
 */
export async function verifyIdToken(token: string): Promise<{ uid: string; email?: string } | null> {
  try {
    const auth = getAdminAuth()
    const decodedToken = await auth.verifyIdToken(token)
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }
  } catch (error) {
    console.error('Failed to verify ID token:', error)
    return null
  }
}

/**
 * Get user role from Firestore
 * Verifies that the user has a record in admin_users collection
 */
export async function getUserRoleFromDb(uid: string): Promise<UserRole | null> {
  try {
    const db = getAdminDb()
    const userDoc = await db.collection('admin_users').doc(uid).get()

    if (!userDoc.exists) {
      return null
    }

    const userData = userDoc.data()
    return (userData?.role as UserRole) || null
  } catch (error) {
    console.error('Failed to get user role from database:', error)
    return null
  }
}

/**
 * Verify admin access
 * 1. Validates the ID token
 * 2. Checks user role is 'admin'
 * 3. Verifies admin account is active
 */
export async function verifyAdminAccess(token: string): Promise<VerifiedAdminUser | null> {
  // Step 1: Verify token
  const userInfo = await verifyIdToken(token)
  if (!userInfo) {
    console.warn('Token verification failed')
    return null
  }

  // Step 2: Get user role from database
  const role = await getUserRoleFromDb(userInfo.uid)
  if (!role) {
    console.warn(`User ${userInfo.uid} not found in admin_users collection`)
    return null
  }

  // Step 3: Check if user is admin
  if (role !== 'admin') {
    console.warn(`User ${userInfo.uid} has role '${role}', not 'admin'`)
    return null
  }

  // Step 4: Check if account is active
  try {
    const db = getAdminDb()
    const userDoc = await db.collection('admin_users').doc(userInfo.uid).get()
    const userData = userDoc.data()

    if (!userData?.isActive) {
      console.warn(`Admin account ${userInfo.uid} is not active`)
      return null
    }
  } catch (error) {
    console.error('Failed to check admin account status:', error)
    return null
  }

  return {
    uid: userInfo.uid,
    email: userInfo.email,
    role,
    isAdmin: true,
  }
}

/**
 * Extract Bearer token from Authorization header
 * Format: "Bearer <token>"
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  return authHeader.slice(7)
}

/**
 * Comprehensive request authentication check
 * Verifies token from Authorization header and checks admin access
 * Returns verified user info or null if authentication fails
 */
export async function authenticateAdminRequest(
  authHeader: string | null
): Promise<VerifiedAdminUser | null> {
  const token = extractBearerToken(authHeader)
  if (!token) {
    return null
  }

  return verifyAdminAccess(token)
}
