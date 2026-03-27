# Security & Admin Access Guide

## Overview

ScamSentry includes comprehensive security features for the admin dashboard:

- **Role-Based Access Control (RBAC)** - Enforce admin roles with granular permissions
- **Email Domain Verification** - Restrict admin access to approved email domains
- **Session Management** - Automatic logout after inactivity or session timeout
- **Audit Logging** - Complete audit trail of all admin actions
- **Failed Login Protection** - Account lockout after failed login attempts

---

## 🔐 Admin Login & Access

### Getting Started

1. **Navigate to Admin Portal**: `/admin/login`
2. **Enter Credentials**:
   - Admin Email (Firebase authenticated user)
   - Password
3. **Access Granted**: Redirected to `/admin` dashboard

### Access Requirements

To access the admin dashboard, users must:

1. ✅ Have a **Firebase user account** with email/password auth
2. ✅ Have the **admin role** assigned (see Role Management below)
3. ✅ Have an **active account** (not deactivated)
4. ✅ Provide an email from an **approved domain** (if enabled)

---

## 👥 Role-Based Access Control (RBAC)

### User Roles

| Role | Permissions | Usage |
|------|-------------|-------|
| **admin** | Full access to dashboard, manage rules, approve/reject reports, manage users | System admin, project owner |
| **moderator** | Review and moderate reports and companies | Team leads, content reviewers |
| **user** | View-only access, cannot make changes | Default role for new logins |

### Initial Admin Setup

New users default to the `user` role on first login. An existing admin must promote them:

#### Via Firebase Console:
1. Go to Firebase Console → Firestore → `admin_users` collection
2. Find the new user document
3. Update the `role` field from `"user"` to `"admin"`
4. User gains admin access on next login

#### Programmatic (Client Code):
```typescript
import { promoteUserToAdmin } from '@/lib/admin-roles'

// Only existing admins can promote users
const success = await promoteUserToAdmin(
  targetUserId,      // UID of user to promote
  currentUserUID      // UID of admin making the change
)
```

### Role Verification

Admin page automatically checks user role:

```typescript
const { user, role, isAdmin } = useAuth()

if (!isAdmin) {
  // Show access denied page
  // User is redirected with helpful message
}
```

---

## 🛡️ Session Management

### Session Timeout

Users are automatically logged out after **30 minutes** of total session time (regardless of activity).

### Inactivity Timeout

Users are automatically logged out after **30 minutes** of inactivity (no mouse, keyboard, or touch).

**Tracked Activities:**
- Mouse clicks
- Keyboard input
- Page scrolling
- Touch interactions

### Logout Behavior

User is logged out and redirected to `/admin/login` when:
- Session timeout expires (30 min total)
- Inactivity timeout expires (30 min no activity)
- User clicks logout button
- User manually logs out

---

## 📊 Email Domain Verification

### Enable Domain Restriction

**File**: `lib/admin-config.ts`

```typescript
export const ADMIN_CONFIG = {
  // Enable domain verification
  ENABLE_EMAIL_DOMAIN_CHECK: true,  // Set to true

  // Approved admin email domains
  ALLOWED_ADMIN_DOMAINS: [
    'company.com',
    'admin.company.com',
    'your-domain.com',
  ],
  // ... rest of config
}
```

### Domain Verification Flow

1. User enters email at login
2. System extracts domain (e.g., `company.com` from `admin@company.com`)
3. Domain checked against `ALLOWED_ADMIN_DOMAINS`
4. If domain not in list → Login rejected with "Domain not authorized" error

### Disable Domain Verification

```typescript
// In lib/admin-config.ts
ENABLE_EMAIL_DOMAIN_CHECK: false  // Disables domain checks
```

---

## 🔒 Failed Login Protection

### Account Lockout

After **5 failed login attempts**, the account is temporarily locked for **15 minutes**.

### Configuration

**File**: `lib/admin-config.ts`

```typescript
export const ADMIN_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,           // Lock after 5 failures
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,  // 15 minute lockout
  RESET_FAILED_ATTEMPTS_MS: 60 * 60 * 1000, // Reset counter after 1 hour
}
```

### Unlock Account

Accounts unlock automatically after the lockout period expires. Admins can also reset manually via Firestore:

1. Go to Firebase Console → Firestore → `admin_users` collection
2. Find user document
3. Set `isLockedOut: false` and `failedLoginAttempts: 0`

---

## 📋 Audit Logging

### What Gets Logged

Every admin action is automatically logged:

| Action | Details |
|--------|---------|
| `ADMIN_LOGIN` | Successful login with user email and role |
| `ADMIN_LOGOUT` | User logout |
| `SESSION_TIMEOUT` | Session or inactivity timeout |
| `REPORT_APPROVED` | Report approval with report ID |
| `REPORT_REJECTED` | Report rejection |
| `REPORT_DELETED` | Report deletion |
| `RULE_UPDATED` | Rule weight/config changes |
| `UNAUTHORIZED_ACCESS_ATTEMPT` | Non-admin access attempts |

### View Audit Logs

Audit logs stored in Firestore collection: `audit_logs`

```typescript
import { getUserAuditLogs, getAuditLogsByAction } from '@/lib/audit-logger'

// Get all actions by a specific user
const userLogs = await getUserAuditLogs(userId, limit = 50)

// Get all actions of a specific type
const loginLogs = await getAuditLogsByAction('ADMIN_LOGIN', limit = 50)

// Security: Get all failed login attempts (for monitoring)
const failedLogins = await getFailedAuthAttempts(limit = 100)
```

### Audit Log Structure

```typescript
{
  userId: string              // Firebase UID
  userEmail: string           // Email address
  action: AuditAction         // Type of action
  resourceType: string        // 'auth', 'report', 'rule', etc.
  resourceId: string          // ID of resource affected
  details: Record<string,any> // Contextual details
  timestamp: Timestamp        // Server timestamp
  status: 'success' | 'failure'
  errorMessage?: string       // If action failed
}
```

---

## ⚙️ Configuration

### Admin Configuration File

**Location**: `lib/admin-config.ts`

```typescript
export const ADMIN_CONFIG = {
  // Email & domains
  ALLOWED_ADMIN_DOMAINS: [],        // Empty = any domain
  ENABLE_EMAIL_DOMAIN_CHECK: false,  // Enable/disable domain verification

  // Session timeouts (milliseconds)
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,      // 30 minutes
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,   // 30 minutes
  
  // Failed login protection
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,     // 15 minutes
  RESET_FAILED_ATTEMPTS_MS: 60 * 60 * 1000, // 1 hour

  // Feature flags
  ENABLE_RBAC: true,                    // Enable role-based access
  ENABLE_AUDIT_LOG: true,               // Enable audit logging
  REQUIRE_EMAIL_VERIFICATION: true,     // Require verified emails
}
```

### Environment Variables

Add to `.env.local`:

```bash
# Firebase config (already in use)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

---

## 🚨 Troubleshooting

### "Access Denied" Message

**Problem**: User sees "Your account does not have administrator privileges"

**Solutions**:
1. Check user role in Firestore `admin_users` collection - should be `"admin"`
2. User may be assigned to `"user"` or `"moderator"` role instead
3. Ask existing admin to promote user to admin role

### Account Locked After Failed Logins

**Problem**: "Account temporarily locked" message

**Solutions**:
1. Wait 15 minutes for automatic unlock
2. Or manually unlock in Firestore:
   - Set `isLockedOut: false`
   - Set `failedLoginAttempts: 0`

### Domain Not Authorized

**Problem**: "Email domain 'example.com' is not authorized"

**Solutions**:
1. Check if domain verification is enabled: `ENABLE_EMAIL_DOMAIN_CHECK`
2. Add your domain to `ALLOWED_ADMIN_DOMAINS` in `lib/admin-config.ts`
3. Or disable domain check if not needed

### Session Keeps Timing Out

**Problem**: User gets logged out after 30 minutes of use

**Status**: ✅ Working as intended - improves security by limiting session duration

**To increase timeout**:
```typescript
// lib/admin-config.ts
SESSION_TIMEOUT_MS: 60 * 60 * 1000  // 1 hour instead of 30 min
```

---

## 📊 Security Dashboard (Future)

Planned enhancements:
- Admin panel to view and manage user accounts
- Audit log viewer with filtering
- Session management dashboard
- Failed login monitoring alerts
- Two-factor authentication (2FA)
- IP-based access restrictions

---

## 📚 Related Documentation

- [Rules Management Guide](RULES_MANAGEMENT.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Firebase Setup](README.md#firebase-configuration)

---

## Security Best Practices

1. ✅ **Use Strong Passwords** - Enforce 12+ character passwords
2. ✅ **Enable Email Verification** - Require verified emails before admin access
3. ✅ **Restrict by Domain** - Use `ALLOWED_ADMIN_DOMAINS` to limit access
4. ✅ **Monitor Audit Logs** - Regularly review `audit_logs` collection
5. ✅ **Enable Inactivity Timeout** - Auto-logout prevents unauthorized access
6. ✅ **Minimize Admin Accounts** - Only grant admin role when necessary
7. ✅ **Rotate Access** - Periodically review and update admin user list

---

## Contact & Support

For security issues or questions, please reach out to the development team.
