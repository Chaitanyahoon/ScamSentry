# Admin Setup & First Login Guide

## 🚀 Quick Start

### Step 1: Create Firebase User Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `chaitanya-scamsentry`
3. Go to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - **Email**: Your admin email (e.g., `admin@company.com`)
   - **Password**: Strong password (12+ characters)
6. Click **Create User**

### Step 2: First Login

1. Visit: `https://your-domain.com/admin/login`
2. Enter your email and password
3. Click **LOGIN**
4. You'll be logged in as a **user** role (default for first login)

### Step 3: Promote to Admin (Required)

A system admin must promote you to the admin role. This is a **security feature** to prevent unauthorized admin access.

#### Option A: Firestore Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project → **Firestore Database**
3. Go to **admin_users** collection
4. Find your user document (search by email)
5. Click to open
6. Update field: `role: "admin"` (change from `"user"`)
7. **Save**
8. Refresh page or log out and back in
9. You now have admin access! ✅

#### Option B: Programmatic (Developer)

```typescript
import { promoteUserToAdmin } from '@/lib/admin-roles'

// Call this in a privileged context (e.g., server-side script)
const success = await promoteUserToAdmin(
  newUserUID,      // UID of user to promote
  adminUserUID     // UID of existing admin
)

if (success) {
  console.log('User promoted to admin!')
}
```

---

## 🛡️ Security Settings

### Configure Email Domain (Optional)

To restrict access to certain email domains:

**File**: `lib/admin-config.ts`

```typescript
export const ADMIN_CONFIG = {
  // Enable domain verification
  ENABLE_EMAIL_DOMAIN_CHECK: true,

  // Only these email domains can be admins
  ALLOWED_ADMIN_DOMAINS: [
    'company.com',
    'admin.company.com',
  ],
  
  // ... rest of config
}
```

**Example**:
- ✅ `admin@company.com` - Allowed
- ✅ `user@admin.company.com` - Allowed
- ❌ `admin@gmail.com` - Blocked
- ❌ `admin@other-company.com` - Blocked

### Configure Session Timeout (Optional)

**File**: `lib/admin-config.ts`

```typescript
export const ADMIN_CONFIG = {
  // Session timeout (30 minutes default)
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  
  // Inactivity logout (30 minutes no activity)
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,
}
```

---

## 📊 Dashboard Overview

Once you have admin access, you'll see the admin dashboard with tabs:

### 1. **Pending Reports** (Tab)
- Review user-submitted scam reports
- Approve or reject each report
- Reports added to database when approved

### 2. **Flagged Reports** (Tab)
- View reports marked as spam/false by users
- Monitor report quality
- Consider removing low-quality reports

### 3. **Approved Reports** (Tab)
- View all approved scam reports
- Search and filter by company/URL
- View submission metadata

### 4. **Safe Companies** (Tab)
- Manage whitelist of legitimate companies
- Approve/reject company submissions
- Verified companies won't be flagged as scams

### 5. **Rules Management** (Tab) - *If Available*
- Configure detection rules
- Adjust sensitivity per layer (L1-L4)
- View performance metrics

---

## 🔑 Your First Admin Actions

### Action 1: Review Settings
1. Navigate to `/admin`
2. Click through each tab to see data
3. Familiarize yourself with pending items

### Action 2: Approve Your First Report
1. Go to **Pending Reports** tab
2. Click on a report to view details
3. Click **Approve** or **Reject**
4. Report is added to database (if approved)

### Action 3: View Audit Log
Check what actions you've taken:

```typescript
import { getUserAuditLogs } from '@/lib/audit-logger'

const myLogs = await getUserAuditLogs(myUserUID)
console.log('My actions:', myLogs)
```

**View in Firebase Console**:
1. Firestore Database → `audit_logs` collection
2. Filter by your email
3. See all your admin activities

---

## ✅ Verification Checklist

- [ ] Firebase user account created
- [ ] First login successful
- [ ] Promoted to admin role
- [ ] Can access admin dashboard
- [ ] Can see pending reports
- [ ] Can approve/reject items
- [ ] Session timeout works
- [ ] Email domain verified (if enabled)

---

## 🆘 Troubleshooting

### Can't Login

**Error**: "AUTH PAYLOAD REJECTED"

**Check**:
1. ✅ Is your email created in Firebase Authentication?
2. ✅ Is your password correct?
3. ✅ Is your email domain in `ALLOWED_ADMIN_DOMAINS`? (if enabled)

### Access Denied After Login

**Error**: "Your account does not have administrator privileges"

**Check**:
1. ✅ Is your role `"admin"` in `admin_users` collection?
2. ✅ Is your account active (`isActive: true`)?
3. ✅ Did you wait a moment for the auth context to update?

### Session Timeout Too Frequent

**Issue**: Getting logged out after only 30 minutes

**Fix**:
```typescript
// In lib/admin-config.ts - increase timeout
SESSION_TIMEOUT_MS: 60 * 60 * 1000,  // 1 hour instead
```

### Still Have Questions?

See the full [Security Guide](SECURITY_GUIDE.md) for:
- Complete role definitions
- Audit logging details
- Permission system
- Advanced configuration

---

## 🎯 Next Steps

1. ✅ Set up your admin account (see above)
2. ✅ Configure email domain restrictions (optional)
3. ✅ Configure session timeouts (optional)
4. ✅ Review pending reports and companies
5. ✅ Start moderating content!

**Happy moderating!** 🚀
