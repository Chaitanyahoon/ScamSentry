# Firebase Admin Authentication Setup

This document explains how to configure Firebase Admin SDK authentication for admin API endpoints.

## Overview

The admin API endpoints require:
1. A valid Firebase ID token in the `Authorization: Bearer <token>` header
2. User account with `admin` role in Firestore `admin_users` collection
3. Active admin account status

## Setup Steps

### Step 1: Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `chaitanya-scamsentry`
3. Click the gear icon → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file securely

### Step 2: Configure Environment Variable

Add the service account JSON to your `.env.local` file:

```bash
# .env.local

# Firebase service account (entire JSON as a string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'

# Or on Windows (PowerShell):
$env:FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'
```

⚠️ **SECURITY WARNING**: Never commit `.env.local` to version control. Add it to `.gitignore`.

### Step 3: Obtain Admin ID Token

Admin ID tokens can be obtained in two ways:

#### Option A: From Firebase Console (Testing)
1. Go to Firebase Console → Authentication → Users
2. Find your admin user
3. Click "..." menu → **Copy UID**
4. Use Firebase Admin SDK CLI to generate a custom token (see Option B)

#### Option B: From Client-Side Authentication
After logging in as admin user, get the ID token:

```typescript
import { auth } from '@/lib/firebase'

const user = auth.currentUser
const token = await user?.getIdToken()
```

Then pass this token in API requests:

```typescript
const response = await fetch('/api/admin/rules', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

### Step 4: Verify Setup

Test the API endpoint:

```bash
curl -H "Authorization: Bearer <YOUR_ID_TOKEN>" \
  https://your-domain.com/api/admin/rules
```

Expected responses:
- ✅ **200 OK**: Authentication successful, returns rules
- ❌ **401 Unauthorized**: Invalid/missing token or insufficient permissions

## API Endpoints

All admin API endpoints require the `Authorization: Bearer <token>` header.

### GET /api/admin/rules
Get all rules or filter by category

```bash
curl -H "Authorization: Bearer <token>" \
  "https://your-domain.com/api/admin/rules?category=heuristics"
```

### POST /api/admin/rules
Create a new detection rule

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Rule",
    "category": "heuristics",
    "description": "Rule description",
    "enabled": true,
    "weight": 50
  }' \
  https://your-domain.com/api/admin/rules
```

### PUT /api/admin/rules?id=<rule-id>
Update a rule

```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 75}' \
  'https://your-domain.com/api/admin/rules?id=rule-123'
```

### DELETE /api/admin/rules?id=<rule-id>
Delete a rule

```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  'https://your-domain.com/api/admin/rules?id=rule-123'
```

## Troubleshooting

### ❌ "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set"

**Solution**: Ensure `.env.local` file contains the `FIREBASE_SERVICE_ACCOUNT_KEY` variable.

```bash
# Verify in development:
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID"
```

### ❌ "Token verification failed"

**Possible causes**:
- Token is expired (max 1 hour)
- Token was signed with wrong key
- Token format is incorrect

**Solution**: Generate a fresh token and ensure it's in the correct format: `Bearer eyJhbGc...`

### ❌ "User not found in admin_users collection"

**Possible causes**:
- User hasn't logged in yet (admin_users record not created)
- User UID doesn't match

**Solution**: Ensure user has logged into `/admin/login` at least once, creating their admin_users document. Then promote to admin role.

### ❌ "Admin account is not active"

**Possible causes**:
- Admin account was deactivated by another admin
- Account lockout due to failed login attempts

**Solution**: Ask another admin to reactivate the account via Firebase Console or API.

## Security Best Practices

1. ✅ Never expose `FIREBASE_SERVICE_ACCOUNT_KEY` in client-side code
2. ✅ Keep service account key in secure vaults (avoid committing to Git)
3. ✅ Rotate service account keys regularly
4. ✅ Use short-lived ID tokens (1 hour default)
5. ✅ Implement rate limiting on admin endpoints
6. ✅ Log all admin API requests for audit trail
7. ✅ Use HTTPS only in production
8. ✅ Implement API key rotation strategy

## Advanced Configuration

### Custom Claims (Future Enhancement)

Firebase custom claims can add additional security layers:

```typescript
// Set custom claims (requires Admin SDK)
await admin.auth().setCustomUserClaims(uid, { admin: true })

// Verify in token
const decodedToken = await admin.auth().verifyIdToken(token)
if (decodedToken.admin) {
  // User has admin claim
}
```

### Rate Limiting

All admin API endpoints should have rate limiting configured:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
})
```

See [SECURITY_GUIDE.md](../SECURITY_GUIDE.md) for more details.
