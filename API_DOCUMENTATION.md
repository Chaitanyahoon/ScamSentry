# ScamSentry API Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Base URL:** `https://scam-sentry.vercel.app`

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Rate Limiting](#rate-limiting)
- [Threat Levels](#threat-levels-classification)
- [Error Codes](#error-codes)
- [Examples](#examples)
- [SDK Integration](#sdk-integration-examples)

---

## Overview

ScamSentry provides a deterministic 4-layer URL threat detection system that identifies phishing, typosquatting, malicious redirects, and domain spoofing without relying on AI models.

### 4-Layer Validation Pipeline

1. **Layer 1: Heuristics** - Pattern matching (60+ rules)
   - Typosquatting detection
   - Homoglyph attacks
   - Suspicious keywords
   - Entropy analysis for DGA detection

2. **Layer 2: Forensics** - Domain infrastructure analysis
   - DNS resolution
   - RDAP age verification
   - IDN detection
   - Fast-flux network detection

3. **Layer 3: Threat Intel** - External threat databases (optional)
   - Google Safe Browsing API
   - Graceful fallback if unavailable

4. **Layer 4: Internal Graph** - Community database
   - Cross-reference community scam reports
   - Real-time threat updates

### Scoring System

- **Final Score:** 0-100 (higher = more dangerous)
- **Trust Score:** 100 - Final Score (higher = safer)
- **Risk Classification:**
  - `71-100` → **Secure** (Safe to visit)
  - `31-70` → **Suspicious** (Use caution)
  - `0-30` → **Critical Threat** (High risk)

---

## Authentication

### Public Endpoint (No Auth Required)
- `POST /api/validator` - UI scanner endpoint
- No authentication required
- Rate limited: 5 requests/minute (public)

### B2B Endpoints (API Key Required)
- `POST /api/v1/validate` - Production API
- `POST /api/v1/verify` - Verified integration endpoint
- **Header:** `x-api-key: sk_prod_xxxxxxxxxxxxx`
- Rate limited by subscription tier

---

## Endpoints

### 1. POST /api/validator
**Public URL Scanner (No Authentication)**

**Description:** Scan individual URLs without authentication. Perfect for browser extensions and web applications.

**Request:**
```bash
curl -X POST https://scam-sentry.vercel.app/api/validator \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

**Request Body:**
```json
{
  "url": "https://suspicious-site.xyz"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "finalScore": 65,
  "riskLevel": "Suspicious",
  "forensicReport": {
    "layer1_Heuristics": {
      "score": 35,
      "flags": [
        "typosquatting: paypa1 vs paypal",
        "suspicious-tld: .xyz",
        "credential-harvesting: password in path"
      ]
    },
    "layer2_Forensics": {
      "score": 20,
      "flags": ["young-domain: 3 days old", "no-https"]
    },
    "layer3_ThreatIntel": {
      "score": 10,
      "flags": ["google-safe-browsing-warning"]
    },
    "layer4_InternalGraph": {
      "score": 0,
      "flags": []
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid URL format"
}
```

**Response (429 Rate Limited):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

### 2. POST /api/v1/validate
**B2B Production API (API Key Required)**

**Description:** Enterprise validation endpoint with higher rate limits and detailed diagnostics.

**Request:**
```bash
curl -X POST https://scam-sentry.vercel.app/api/v1/validate \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_prod_xxxxxxxxxxxxx" \
  -d '{"payload":"https://example.com"}'
```

**Request Body:**
```json
{
  "payload": "https://example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "meta": {
    "timestamp": "2026-03-27T10:30:00Z",
    "version": "1.0.0"
  },
  "data": {
    "target": "https://example.com",
    "isBlacklisted": false,
    "trustScore": 92,
    "severity": "low",
    "diagnostics": {
      "layers": {
        "heuristics": {
          "triggered": false,
          "score": 5,
          "details": ["standard-brand", "https-enabled"]
        },
        "forensics": {
          "triggered": false,
          "score": 3,
          "details": ["established-domain", "valid-dns"]
        },
        "threatIntel": {
          "triggered": false,
          "score": 0,
          "details": []
        },
        "internalGraph": {
          "triggered": false,
          "score": 0,
          "details": []
        }
      }
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid or missing API key"
}
```

**Response Headers (429 Rate Limited):**
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1711500600
```

---

### 3. POST /api/v1/verify
**Authenticated Verification (For Verified Partners)**

**Description:** Secure endpoint for verified integrations with webhook support.

**Request:**
```bash
curl -X POST https://scam-sentry.vercel.app/api/v1/verify \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_prod_xxxxxxxxxxxxx" \
  -d '{"url":"https://example.com","webhookUrl":"https://your-server.com/webhook"}'
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "webhookUrl": "https://your-webhook-endpoint.com/results"
}
```

**Response (200 OK - Async):**
```json
{
  "success": true,
  "jobId": "verify_123abc456def",
  "verification": {
    "isVerified": true,
    "threatLevel": "safe",
    "confidence": 0.98
  }
}
```

**Webhook Payload (When Ready):**
```json
{
  "jobId": "verify_123abc456def",
  "timestamp": "2026-03-27T10:30:05Z",
  "result": {
    "url": "https://example.com",
    "threatLevel": "safe",
    "confidence": 0.98,
    "diagnostics": {
      "layers": [...]
    }
  }
}
```

---

## Rate Limiting

### Tier System

| Tier | Requests/Min | Daily Limit | Cost | Features |
|------|-------------|-----------|------|----------|
| **Free** | 5 | 100 | Free | Basic scanning, UI access |
| **Pro** | 60 | 10,000 | $99/mo | Higher limits, priority support |
| **Enterprise** | 300 | 500,000 | Custom | Webhooks, dedicated support |

### Rate Limit Headers

Every response includes rate limiting information in headers:

```
X-RateLimit-Limit: 60           # Max requests per minute
X-RateLimit-Remaining: 45       # Requests available before reset
X-RateLimit-Reset: 1711500600   # Unix timestamp when limit resets
```

### Handling Rate Limits

When you hit the rate limit, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**HTTP Status:** 429

**Action:** Wait for `retryAfter` seconds before retrying.

---

## Threat Levels Classification

### Secure (Trust Score: 71-100)

```json
{
  "riskLevel": "Secure",
  "finalScore": 15,
  "description": "Safe to visit"
}
```

**Examples:**
- Major established brands (Google, Apple, Microsoft)
- HTTPS-enabled legitimate sites
- Passing all 4 layers

---

### Suspicious (Trust Score: 31-70)

```json
{
  "riskLevel": "Suspicious",
  "finalScore": 50,
  "description": "Use caution"
}
```

**Examples:**
- Legitimate site with minor red flags
- New domains with good infrastructure
- Sites matching some suspicious patterns

---

### Critical Threat (Trust Score: 0-30)

```json
{
  "riskLevel": "Critical Threat",
  "finalScore": 85,
  "description": "High risk detected"
}
```

**Examples:**
- Confirmed phishing sites
- Multiple layer matches
- Detected in threat databases

---

## Error Codes

### 400 Bad Request
```json
{
  "error": "Invalid URL format",
  "code": "INVALID_URL"
}
```

### 401 Unauthorized
```json
{
  "error": "API key is missing or invalid",
  "code": "UNAUTHORIZED"
}
```

### 429 Rate Limited
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### 500 Internal Server Error
```json
{
  "error": "An internal server error occurred",
  "code": "INTERNAL_ERROR"
}
```

### 503 Service Unavailable
```json
{
  "error": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

---

## Examples

### Example 1: JavaScript/Node.js
```javascript
const axios = require('axios');

async function scanURL(url) {
  try {
    const response = await axios.post(
      'https://scam-sentry.vercel.app/api/v1/validate',
      { payload: url },
      {
        headers: {
          'x-api-key': 'sk_prod_xxxxxxxxxxxxx',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Trust Score: ${response.data.data.trustScore}`);
    console.log(`Severity: ${response.data.data.severity}`);
    return response.data;
  } catch (error) {
    console.error('Scan failed:', error.response?.data);
  }
}

scanURL('https://example.com');
```

### Example 2: Python
```python
import requests

def scan_url(url, api_key):
    headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json'
    }
    
    payload = {'payload': url}
    
    response = requests.post(
        'https://scam-sentry.vercel.app/api/v1/validate',
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"Trust Score: {data['data']['trustScore']}")
        return data
    else:
        print(f"Error: {response.status_code}")
        print(response.json())

scan_url('https://example.com', 'sk_prod_xxxxxxxxxxxxx')
```

### Example 3: cURL
```bash
# Public endpoint (no auth)
curl -X POST https://scam-sentry.vercel.app/api/validator \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# B2B endpoint (with API key)
curl -X POST https://scam-sentry.vercel.app/api/v1/validate \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_prod_xxxxxxxxxxxxx" \
  -d '{"payload":"https://example.com"}'
```

### Example 4: Batch Processing
```python
import requests
import csv

def batch_scan(csv_file, api_key):
    results = []
    
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            url = row['url']
            
            response = requests.post(
                'https://scam-sentry.vercel.app/api/v1/validate',
                json={'payload': url},
                headers={'x-api-key': api_key}
            )
            
            if response.status_code == 200:
                data = response.json()['data']
                results.append({
                    'url': url,
                    'trustScore': data['trustScore'],
                    'severity': data['severity']
                })
    
    return results
```

---

## SDK Integration Examples

### Browser Extension Integration
```javascript
// manifest.json
{
  "permissions": ["activeTab", "fetch"],
  "host_permissions": ["*://scam-sentry.vercel.app/*"]
}

// content-script.js
async function checkCurrentPage() {
  const url = window.location.href;
  const response = await fetch('https://scam-sentry.vercel.app/api/validator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const { riskLevel, finalScore } = await response.json();
  displayWarning(riskLevel, finalScore);
}
```

### Webhook Integration
```javascript
// Handle async verification results
app.post('/scamsentry-webhook', (req, res) => {
  const { jobId, result } = req.body;
  
  if (result.threatLevel === 'dangerous') {
    // Block or alert user
    blockURL(result.url);
  }
  
  res.json({ received: true });
});
```

---

## Support & Resources

- **Status Page:** [status.scam-sentry.vercel.app](https://status.scam-sentry.vercel.app)
- **GitHub:** [github.com/Chaitanyahoon/ScamSentry](https://github.com/Chaitanyahoon/ScamSentry)
- **Issues:** [github.com/Chaitanyahoon/ScamSentry/issues](https://github.com/Chaitanyahoon/ScamSentry/issues)
- **Email:** support@scam-sentry.dev

---

**Last Updated:** 2026-03-27  
**API Version:** 1.0.0
