import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'

export type UserRole = 'admin' | 'moderator' | 'user'

export interface AdminUser {
  uid: string
  email: string
  role: UserRole
  displayName?: string
  isActive: boolean
  createdAt: any
  lastLogin?: any
  loginCount: number
  failedLoginAttempts: number
  lastFailedLoginAt?: any
  isLockedOut: boolean
  lockedOutUntil?: any
  permissions: string[]
}

/**
 * Get user role from Firestore
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDocRef = doc(db, 'admin_users', uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const userData = userDoc.data() as AdminUser
      return userData.role
    }

    return null
  } catch (error) {
    console.error('Failed to get user role:', error)
    return null
  }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  const role = await getUserRole(uid)
  return role === 'admin'
}

/**
 * Get full admin user details
 */
export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  try {
    const userDocRef = doc(db, 'admin_users', uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return userDoc.data() as AdminUser
    }

    return null
  } catch (error) {
    console.error('Failed to get admin user:', error)
    return null
  }
}

/**
 * Create or update admin user on first login
 */
export async function createOrUpdateAdminUser(
  uid: string,
  email: string,
  displayName?: string
): Promise<AdminUser> {
  try {
    const userDocRef = doc(db, 'admin_users', uid)
    const existingUser = await getDoc(userDocRef)

    if (existingUser.exists()) {
      // Update last login
      const userData = existingUser.data() as AdminUser
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        loginCount: (userData.loginCount || 0) + 1,
        failedLoginAttempts: 0, // Reset on successful login
        lastFailedLoginAt: null,
        isLockedOut: false,
      })

      return {
        ...userData,
        lastLogin: new Date(),
        loginCount: (userData.loginCount || 0) + 1,
      }
    } else {
      // Create new user (default role: user, not admin)
      // Admins must be promoted by existing admins
      const newUser: AdminUser = {
        uid,
        email,
        role: 'user', // Default to user - admin role must be assigned
        displayName: displayName || email.split('@')[0],
        isActive: true,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        loginCount: 1,
        failedLoginAttempts: 0,
        isLockedOut: false,
        permissions: [],
      }

      await setDoc(userDocRef, newUser)
      return newUser as any
    }
  } catch (error) {
    console.error('Failed to create or update admin user:', error)
    throw error
  }
}

/**
 * Record failed login attempt
 */
export async function recordFailedLoginAttempt(
  uid: string,
  email: string
): Promise<void> {
  try {
    const userDocRef = doc(db, 'admin_users', uid)
    const userDoc = await getDoc(userDocRef)

    let failedAttempts = 1
    if (userDoc.exists()) {
      const userData = userDoc.data() as AdminUser
      failedAttempts = (userData.failedLoginAttempts || 0) + 1
    } else {
      // Create new user record
      await setDoc(userDocRef, {
        uid,
        email,
        role: 'user',
        isActive: true,
        createdAt: serverTimestamp(),
        loginCount: 0,
        failedLoginAttempts: 1,
        lastFailedLoginAt: serverTimestamp(),
        isLockedOut: false,
        permissions: [],
      })
      return
    }

    await updateDoc(userDocRef, {
      failedLoginAttempts: failedAttempts,
      lastFailedLoginAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Failed to record login attempt:', error)
  }
}

/**
 * Promote user to admin role
 * Only existing admins can promote other users
 */
export async function promoteUserToAdmin(uid: string, adminUid: string): Promise<boolean> {
  try {
    // Verify that the requester is an admin
    const adminRole = await getUserRole(adminUid)
    if (adminRole !== 'admin') {
      console.error('Only admins can promote users')
      return false
    }

    const userDocRef = doc(db, 'admin_users', uid)
    await updateDoc(userDocRef, {
      role: 'admin',
    })

    return true
  } catch (error) {
    console.error('Failed to promote user to admin:', error)
    return false
  }
}

/**
 * Demote admin to user role
 */
export async function demoteAdminToUser(uid: string, adminUid: string): Promise<boolean> {
  try {
    // Verify that the requester is an admin
    const adminRole = await getUserRole(adminUid)
    if (adminRole !== 'admin') {
      console.error('Only admins can demote users')
      return false
    }

    // Prevent demoting the last admin
    const admins = await getAdminsByRole('admin')
    if (admins.length <= 1) {
      console.error('Cannot demote the last admin')
      return false
    }

    const userDocRef = doc(db, 'admin_users', uid)
    await updateDoc(userDocRef, {
      role: 'user',
    })

    return true
  } catch (error) {
    console.error('Failed to demote admin:', error)
    return false
  }
}

/**
 * Get all users with specific role
 */
export async function getAdminsByRole(role: UserRole): Promise<AdminUser[]> {
  try {
    const adminUsersCollection = collection(db, 'admin_users')
    const q = query(adminUsersCollection, where('role', '==', role))

    const querySnapshot = await getDocs(q)
    const users: AdminUser[] = []

    querySnapshot.forEach((doc) => {
      users.push(doc.data() as AdminUser)
    })

    return users
  } catch (error) {
    console.error('Failed to get admins by role:', error)
    return []
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUser(uid: string, adminUid: string): Promise<boolean> {
  try {
    // Verify that the requester is an admin
    const adminRole = await getUserRole(adminUid)
    if (adminRole !== 'admin') {
      console.error('Only admins can deactivate users')
      return false
    }

    const userDocRef = doc(db, 'admin_users', uid)
    await updateDoc(userDocRef, {
      isActive: false,
    })

    return true
  } catch (error) {
    console.error('Failed to deactivate user:', error)
    return false
  }
}

/**
 * Check if user account is locked out
 */
export function isAccountLockedOut(user: AdminUser): boolean {
  if (!user.isLockedOut) return false
  if (!user.lockedOutUntil) return true

  const now = new Date().getTime()
  const lockoutTime = typeof user.lockedOutUntil === 'number' 
    ? user.lockedOutUntil 
    : user.lockedOutUntil.toDate?.().getTime() || 0

  return now < lockoutTime
}
