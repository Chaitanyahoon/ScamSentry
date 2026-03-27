# Admin API Rate Limiting

This document explains the rate limiting system for admin API endpoints in ScamSentry.

## Overview

Admin API endpoints have strict rate limiting to prevent abuse of administrative privileges. Rate limits are:
- **Per-user based** on admin UID
- **Tiered by operation type** (read, write, delete, batch)
- **Per-hour** time windows
- **Progressive enforcement** (Upstash Redis in production, in-memory fallback in local dev)

## Rate Limit Tiers

### Read Operations
- **Limit**: 100 requests/hour
- **Operations**: 
  - `GET /api/admin/rules` - View all rules
  - `GET /api/admin/rules?category=X` - View filtered rules
  - `GET /api/admin/analytics` - View analytics data
- **Reset**: 1 hour from first request in window

### Write Operations
- **Limit**: 50 requests/hour
- **Operations**:
  - `POST /api/admin/rules` - Create new rule
  - `PUT /api/admin/rules?id=X` - Update rule (weight, enabled status)
- **Reset**: 1 hour from first request in window

### Delete Operations (Strictest)
- **Limit**: 20 requests/hour
- **Operations**:
  - `DELETE /api/admin/rules?id=X` - Delete rule
- **Reset**: 1 hour from first request in window

### Batch Operations
- **Limit**: 30 requests/hour
- **Operations**:
  - Batch enable/disable rules
  - Bulk rule modifications
- **Reset**: 1 hour from first request in window

## Rate Limiting Behavior

### When Rate Limit is Exceeded

Returns HTTP **429 (Too Many Requests)**:

```json
{
  "error": "Rate limit exceeded. Please try again in 45 minutes.",
  "limit": 100,
  "remaining": 0
}
```

### Error Messages

Helpful error messages include time until reset:
- "Rate limit exceeded. Please try again in 45 minutes."
- "Rate limit exceeded. Please try again in 2 minutes."
- "Rate limit exceeded. Please try again later."

## Implementation Details

### Server-Side Rate Limiting (lib/admin-rate-limit.ts)

```typescript
// Check if read request is within limit
const result = await checkAdminReadLimit(adminUid)
if (!result.success) {
  return NextResponse.json({
    error: formatRateLimitError(result.resetTime),
    limit: 100,
    remaining: 0
  }, { status: 429 })
}
```

### Production vs. Development

**Production (Vercel + Upstash Redis)**:
- Uses Upstash Redis for distributed, cross-server rate limiting
- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables
- State persists across multiple server instances
- Per-user limits enforced globally

**Local Development**:
- Uses in-memory `Map` data structure
- No external dependencies required
- Limits apply to current process only
- Automatically falls back if Redis env vars not set

### Identifier (Admin UID)

Rate limits are tracked by admin user's Firebase UID:
```typescript
// Each admin has separate quota
const result = checkAdminReadLimit('admin-user-123')  // 100 req/hour
const result = checkAdminReadLimit('admin-user-456')  // Another 100 req/hour
```

## API Integration

### Example: Creating a Rule with Rate Limiting

```bash
# First request - success (40/50 remaining)
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Rule",
    "category": "heuristics",
    "description": "Pattern detection"
  }' \
  https://api.scamsentry.com/api/admin/rules

# Response: 201 Created

# After 50 write requests in 1 hour - rate limited
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  https://api.scamsentry.com/api/admin/rules

# Response: 429 Too Many Requests
# {"error": "Rate limit exceeded. Please try again in 45 minutes.", "limit": 50, "remaining": 0}
```

### Example: Checking Read Limits

```bash
# GET requests have higher limit (100/hour)
curl -H "Authorization: Bearer <token>" \
  https://api.scamsentry.com/api/admin/rules

# Response: 200 OK
# [{ rules... }]

# After 100 read requests in 1 hour
curl -H "Authorization: Bearer <token>" \
  https://api.scamsentry.com/api/admin/rules

# Response: 429 Too Many Requests
```

## Configuration

### Environment Variables (Production)

For rate limiting to work in production (Vercel), set these in your environment:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

If not set, rate limiting uses local in-memory fallback.

### Adjusting Limits

To change rate limit values, edit `/lib/admin-rate-limit.ts`:

```typescript
// Increase read limit to 200/hour
export const adminReadLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(200, '1 h'),  // Changed from 100
      prefix: 'scamsentry:admin:read',
    })
  : null
```

Then rebuild and redeploy.

## Monitoring & Debugging

### Check Current Usage

In development, you can inspect the in-memory maps:

```typescript
const localReadLimitMap: Map<string, { count: number; resetTime: number }>
// Size increases as requests are made
// Count resets when resetTime is exceeded
```

### Log Rate Limit Violations

Monitor API logs for HTTP 429 responses:

```bash
# Find rate limit violations
grep "429" /var/log/api.log

# Track by admin user
grep -A2 "admin-user-123" /var/log/api.log
```

### Upstash Dashboard

Monitor Redis rate limit data:
1. Go to [Upstash Console](https://console.upstash.com)
2. Select your Redis project
3. Check `scamsentry:admin:read`, `scamsentry:admin:write`, etc. keys
4. View request metrics

## Scenarios & Recommendations

### Scenario 1: Batch Rule Updates

**Task**: Update weights for 30 rules

**Strategy**:
- Batch into PUT requests over 1 hour
- Max 50 PUT requests/hour available
- Spread updates (e.g., 2-3 per minute)
- Avoids rapid 429 responses

```bash
# ✅ Recommended: Spread updates
for i in {1..30}; do
  curl -X PUT \
    -H "Authorization: Bearer <token>" \
    -d "{\"weight\": 55}" \
    https://api.scamsentry.com/api/admin/rules?id=rule-$i
  sleep 2  # Wait 2 seconds between requests
done
```

### Scenario 2: Monitoring Dashboard

**Task**: Real-time analytics dashboard polling

**Strategy**:
- Each dashboard user gets 100 GET requests/hour
- Polling every 30 seconds = 120 requests/hour (EXCEEDS LIMIT!)
- Solution: Poll every 60+ seconds or use WebSockets

```typescript
// ❌ TOO FAST: 30-second polling exceeds limit
setInterval(() => {
  fetch('/api/admin/analytics')
}, 30 * 1000)  // 120 requests/hour

// ✅ BETTER: 60-second polling
setInterval(() => {
  fetch('/api/admin/analytics')
}, 60 * 1000)  // 60 requests/hour

// ✅ BEST: WebSocket subscription (real-time without polling)
ws.addEventListener('message', (event) => {
  const analyticsData = JSON.parse(event.data)
  updateDashboard(analyticsData)
})
```

### Scenario 3: Initial Configuration

**Task**: Create 100 new rules during initial setup

**Strategy**:
- POST limit is 50/hour
- Create 50 in first hour, 50 in second hour
- Or request temporary limit increase

```bash
# Hour 1: Create 50 rules
for i in {1..50}; do
  curl -X POST \
    -H "Authorization: Bearer <token>" \
    -d "{\"name\": \"rule-$i\", ...}" \
    https://api.scamsentry.com/api/admin/rules
done

# Wait 1 hour for quota to reset

# Hour 2: Create remaining 50 rules
for i in {51..100}; do
  curl -X POST \
    -H "Authorization: Bearer <token>" \
    -d "{\"name\": \"rule-$i\", ...}" \
    https://api.scamsentry.com/api/admin/rules
done
```

## Testing

### Unit Tests

Rate limiting has unit test coverage:

```bash
npm test __tests__/lib/admin-rate-limit.test.ts
```

Tests verify:
- ✅ First requests succeed
- ✅ Error message formatting
- ✅ Configuration values correct
- ✅ Local fallback behavior

### Integration Testing

Test rate limiting end-to-end:

```typescript
// Simulate rapid requests
for (let i = 0; i < 55; i++) {
  const response = await fetch('/api/admin/rules', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ /* rule data */ })
  })

  if (i < 50) {
    expect(response.status).toBe(201)  // Success
  } else {
    expect(response.status).toBe(429)  // Rate limited
  }
}
```

## Troubleshooting

### "Rate limit exceeded" on first request

**Possible causes**:
- Previous requests not counted yet
- UID mismatch between auth and rate limiting

**Solution**:
- Check admin UID in auth token matches rate limiter
- In local dev, check in-memory map isn't corrupted

### High rate limit violations in production

**Possible causes**:
- Upstash Redis not configured
- Multiple servers creating duplicate counts
- Aggressive API calls from integrations

**Solutions**:
1. Enable Upstash Redis: Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Increase limits if legitimate use case
3. Document rate limit restrictions for integrations

### Rate limits not resetting

**Possible causes**:
- Local dev: In-memory state persists across restarts
- Upstash: Redis data not expiring

**Solutions**:
- Local dev: Restart server to clear in-memory maps
- Production: Check Upstash key expiration policy

## Security Considerations

✅ **Rate limiting prevents**:
- Brute force attacks on admin operations
- Accidental DOS from misconfigured automation
- Unauthorized mass deletion of rules
- Resource exhaustion from runaway scripts

✅ **Best practices**:
- Enable rate limiting in production (set Upstash env vars)
- Monitor 429 responses for unusual patterns
- Alert on repeated rate limit violations
- Document rate limits for API integrations
- Rotate Upstash credentials regularly

## Related Documentation

- [ADMIN_SETUP.md](ADMIN_SETUP.md) - Admin authentication setup
- [ADMIN_AUTH_SETUP.md](ADMIN_AUTH_SETUP.md) - Firebase token verification
- [SECURITY_GUIDE.md](SECURITY_GUIDE.md) - Security best practices
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Full API reference
