import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy } from 'firebase/firestore'

export type AuditAction = 
  | 'ADMIN_LOGIN' 
  | 'ADMIN_LOGOUT'
  | 'REPORT_APPROVED'
  | 'REPORT_REJECTED'
  | 'REPORT_DELETED'
  | 'RULE_UPDATED'
  | 'RULE_CREATED'
  | 'RULE_DELETED'
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
  | 'BULK_ACTION'
  | 'SESSION_TIMEOUT'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'

export interface AuditLog {
  id?: string
  userId: string
  userEmail: string
  action: AuditAction
  resourceType: string
  resourceId: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: any
  status: 'success' | 'failure'
  errorMessage?: string
}

/**
 * Log admin actions for compliance and security monitoring
 */
export async function logAuditAction(auditLog: Omit<AuditLog, 'timestamp'>) {
  try {
    const logsCollection = collection(db, 'audit_logs')
    
    const logData = {
      ...auditLog,
      timestamp: serverTimestamp(),
    }

    const docRef = await addDoc(logsCollection, logData)
    console.log('[AUDIT]', auditLog.action, '/', auditLog.resourceId)
    
    return docRef.id
  } catch (error) {
    console.error('Failed to log audit action:', error)
    // Don't throw - audit failures shouldn't break functionality
    return null
  }
}

/**
 * Get recent audit logs for a specific user
 */
export async function getUserAuditLogs(userId: string, limit_count: number = 50) {
  try {
    const logsCollection = collection(db, 'audit_logs')
    const q = query(
      logsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    )

    const querySnapshot = await getDocs(q)
    const logs: AuditLog[] = []

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as AuditLog)
    })

    return logs
  } catch (error) {
    console.error('Failed to fetch user audit logs:', error)
    return []
  }
}

/**
 * Get audit logs for a specific action
 */
export async function getAuditLogsByAction(action: AuditAction, limit_count: number = 50) {
  try {
    const logsCollection = collection(db, 'audit_logs')
    const q = query(
      logsCollection,
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    )

    const querySnapshot = await getDocs(q)
    const logs: AuditLog[] = []

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as AuditLog)
    })

    return logs
  } catch (error) {
    console.error('Failed to fetch audit logs by action:', error)
    return []
  }
}

/**
 * Get all failed authentication attempts (security monitoring)
 */
export async function getFailedAuthAttempts(limit_count: number = 100) {
  try {
    const logsCollection = collection(db, 'audit_logs')
    const q = query(
      logsCollection,
      where('action', '==', 'ADMIN_LOGIN'),
      where('status', '==', 'failure'),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    )

    const querySnapshot = await getDocs(q)
    const logs: AuditLog[] = []

    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as AuditLog)
    })

    return logs
  } catch (error) {
    console.error('Failed to fetch failed auth attempts:', error)
    return []
  }
}
