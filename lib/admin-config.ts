/**
 * Admin Security Configuration
 * Configure authentication, authorization, and session settings
 */

export const ADMIN_CONFIG = {
  /**
   * Email domains allowed to create admin accounts
   * Empty array = allow any email
   */
  ALLOWED_ADMIN_DOMAINS: [
    // Add authorized domains here
    // 'company.com',
    // 'admin.company.com',
  ],

  /**
   * Session timeout in milliseconds
   * 30 minutes = 1800000ms
   */
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,

  /**
   * Inactivity timeout in milliseconds
   * Auto-logout after 30 minutes of no interaction
   */
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,

  /**
   * Enable role-based access control
   */
  ENABLE_RBAC: true,

  /**
   * Enable email domain verification on login
   */
  ENABLE_EMAIL_DOMAIN_CHECK: false, // Set to true to enable

  /**
   * Enable audit logging for all admin actions
   */
  ENABLE_AUDIT_LOG: true,

  /**
   * Require email verification before granting admin access
   */
  REQUIRE_EMAIL_VERIFICATION: true,

  /**
   * Maximum failed login attempts before lockout
   */
  MAX_FAILED_ATTEMPTS: 5,

  /**
   * Lockout duration in milliseconds after max failed attempts
   * 15 minutes = 900000ms
   */
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,

  /**
   * Reset failed attempts counter after this duration
   * 1 hour = 3600000ms
   */
  RESET_FAILED_ATTEMPTS_MS: 60 * 60 * 1000,

  // Helper functions
  
  /**
   * Check if email domain is allowed
   */
  isEmailDomainAllowed(email: string): boolean {
    if (!this.ENABLE_EMAIL_DOMAIN_CHECK) return true
    if (this.ALLOWED_ADMIN_DOMAINS.length === 0) return true
    
    const domain = email.split('@')[1]?.toLowerCase()
    return this.ALLOWED_ADMIN_DOMAINS.includes(domain || '')
  },

  /**
   * Get domain from email
   */
  getEmailDomain(email: string): string {
    return email.split('@')[1] || 'unknown'
  },
}
