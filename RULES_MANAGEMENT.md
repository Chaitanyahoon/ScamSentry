# Rule Management System Documentation

## Overview

The Rule Management System allows administrators to dynamically configure and tune detection rules without code changes. This is critical for improving accuracy, reducing false positives, and adapting to new threat patterns.

## Features

### 1. **Rule Enable/Disable Toggle**
- Quickly enable or disable individual detection rules
- Batch enable/disable entire detection categories
- Changes take effect immediately on new scans

### 2. **Weight Adjustment**
- Fine-tune detection contribution (0-100 scale)
- Higher weight = stronger influence on final risk score
- Default weight: 50 (neutral)
- Weights are normalized per layer

### 3. **Performance Metrics**
- **Trigger Rate**: Percentage of scans where rule was triggered
- **Accuracy**: Proportion of true positives vs false positives
- **Detection Count**: Total number of times rule has triggered
- **False Positive Rate**: Percentage of triggered detections that were incorrect

### 4. **Audit Trail**
- Every rule change is logged with:
  - User ID (who made the change)
  - Timestamp
  - Action (created/updated/deleted/enabled/disabled)
  - Previous and new values

### 5. **Layer Management**
- Manage all rules within a detection layer at once
- Batch operations for efficiency
- View layer-level performance metrics

## Rule Categories

### Layer 1: Heuristics
**Pattern-based detection** - Keyword matching, regex patterns, entropy analysis
- **Rules**: Typosquatting, Credential Harvesting, Homoglyphs, DGA, Brand Spoofing
- **Default Weight**: 50 per rule
- **Response Time**: < 100ms
- **Optimal For**: Malware, phishing, credential harvesting attacks

### Layer 2: Forensics  
**Domain analysis** - DNS resolution, RDAP age, IDN detection, fast-flux analysis
- **Rules**: DNS Analysis, RDAP Age Check, IDN Detection, Fast-Flux Detection
- **Default Weight**: 50 per rule
- **Response Time**: 1-5 seconds (DNS network calls)
- **Optimal For**: Domain reputation, infrastructure analysis

### Layer 3: Threat Intel
**External threat feeds** - Google Safe Browsing API, URLhaus, etc.
- **Rules**: Google Safe Browsing, URLhaus Feed, Custom Feeds
- **Default Weight**: 60 per rule (higher confidence in threat intel)
- **Response Time**: 1-2 seconds (API calls)
- **Graceful Fallback**: Fails silently if APIs are unavailable
- **Optimal For**: Known malicious sites, public threat databases

### Layer 4: Internal Graph
**Community database** - Firestore scam reports collection
- **Rules**: Community Reports, Pattern Scoring
- **Default Weight**: 40 per rule (requires user reports)
- **Response Time**: 10-500ms (Firestore query)
- **Optimal For**: Targeted phishing, local threats, community intelligence

## Admin Interface

### Accessing Rules Dashboard

**URL**: `/admin/rules`

**Requirements**:
- Admin authentication
- Firebase session with admin claims

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│ Rule Management Dashboard                   │
│ Configure detection rules and adjust sensitivity
│                         [Refresh] [Reset]   │
└─────────────────────────────────────────────┘

Category Tabs: [Heuristics] [Forensics] [ThreatIntel] [InternalGraph]

┌─────────────────────────────────────────────┐
│ Category Stats                              │
├──────────┬──────────┬──────────┬──────────┤
│Total: 8  │Enabled: 7│Weight: 385│Acc: 87% │
└──────────┴──────────┴──────────┴──────────┘

Rule List:
┌─────────────────────────────────────────────┐
│ ○ Typosquatting [Enabled] [92% confidence]  │
│ Pattern matching for common brand misspellings
│ Weight: [=====•=====] 50/100                │
│ [Details ▼]                                 │
├─────────────────────────────────────────────┤
│ Details expanded:                           │
│ Trigger Rate: ▓▓▓░ 35.2%                   │
│ Accuracy: ▓▓▓▓▓ 94.2% [GREEN]             │
│ Times Triggered: 2,451                     │
│ False Positives: 2.1% [GREEN]              │
│ Last updated: 2024-01-15 14:32:10         │
└─────────────────────────────────────────────┘

Layer Management:
├─ Heuristics (L1) - Pattern matching
│  [Enable All] [Disable All]
├─ Forensics (L2) - DNS, RDAP, domain analysis
│  [Enable All] [Disable All]
├─ Threat Intel (L3) - External APIs
│  [Enable All] [Disable All]
└─ Internal Graph (L4) - Community reports
   [Enable All] [Disable All]
```

### Interacting with Rules

#### Enable/Disable Rule
1. Click the toggle switch next to a rule
2. Changes apply immediately
3. Change is logged to audit trail

#### Adjust Weight
1. Move slider to set weight (0-100)
2. Weight represents rule's contribution to layer score
3. Enabled rules required for weight adjustment
4. Change logged when slider is released

#### View Details
1. Click "Details" dropdown (▼) on a rule row
2. Displays performance metrics and statistics
3. Shows time of last modification
4. Metrics update every 5 minutes

#### Batch Operations
1. Select "Layer Management" section
2. Click "Enable All" or "Disable All" for a layer
3. Confirms action before applying
4. All changes logged individually

#### Reset to Defaults
1. Click "Reset to Defaults" button in header
2. Requires confirmation
3. All weights → 50, all rules → enabled
4. Cannot be undone without manual restoration

## API Endpoints

### GET /api/admin/rules
Get all rules or filter by category

**Query Parameters**:
- `category` (optional): "heuristics", "forensics", "threatIntel", "internalGraph"

**Response**:
```json
[
  {
    "id": "rule-123",
    "name": "Typosquatting Detection",
    "category": "heuristics",
    "description": "Detects common brand misspellings",
    "enabled": true,
    "weight": 55,
    "confidence": 0.92,
    "falsePositiveRate": 0.021,
    "detectionCount": 2451,
    "lastUpdated": "2024-01-15T14:32:10Z",
    "stats": {
      "ruleId": "rule-123",
      "totalScans": 7000,
      "triggered": 2451,
      "triggerRate": 0.35,
      "falsePositives": 51,
      "accuracy": 0.979
    }
  }
]
```

### POST /api/admin/rules
Create a new detection rule

**Request Body**:
```json
{
  "name": "New Rule Name",
  "category": "heuristics",
  "description": "Rule description",
  "enabled": true,
  "weight": 50,
  "confidence": 0.85,
  "falsePositiveRate": 0.05,
  "pattern": "optional regex pattern"
}
```

**Response** (201):
```json
{
  "id": "rule-new-123",
  "name": "New Rule Name",
  "category": "heuristics",
  "description": "Rule description",
  "enabled": true,
  "weight": 50,
  "confidence": 0.85,
  "falsePositiveRate": 0.05
}
```

### PUT /api/admin/rules?id=rule-123
Update a detection rule

**Query Parameters**:
- `id`: Rule ID to update

**Request Body** (all fields optional):
```json
{
  "weight": 65,
  "enabled": false,
  "confidence": 0.88,
  "falsePositiveRate": 0.03
}
```

**Response** (200):
```json
{ "success": true }
```

### DELETE /api/admin/rules?id=rule-123
Delete a detection rule

**Response** (200):
```json
{ "success": true }
```

## Rule Configuration Examples

### Aggressive Detection (High Sensitivity)
**Goal**: Catch maximum threats, accept higher false positives

```json
{
  "Typosquatting": 80,
  "Credential Harvesting": 85,
  "Homoglyphs": 75,
  "DGA": 70,
  "Forensics": 65,
  "ThreatIntel": 90,
  "InternalGraph": 60
}
```

**Trade-off**: More legitimate URLs flagged as suspicious
**Use Case**: High-security environments, sensitive organizations

### Balanced Detection (Default)
**Goal**: Reasonable accuracy/false-positive ratio

```json
{
  "Typosquatting": 50,
  "Credential Harvesting": 55,
  "Homoglyphs": 45,
  "DGA": 40,
  "Forensics": 50,
  "ThreatIntel": 60,
  "InternalGraph": 40
}
```

**Trade-off**: Moderate detection, acceptable false positives
**Use Case**: General web browsing, most users

### Strict Detection (Low False Positives)
**Goal**: Only flag obvious threats

```json
{
  "Typosquatting": 30,
  "Credential Harvesting": 35,
  "Homoglyphs": 25,
  "DGA": 20,
  "Forensics": 35,
  "ThreatIntel": 50,
  "InternalGraph": 25
}
```

**Trade-off**: Fewer legitimate URLs flagged, but miss subtle attacks
**Use Case**: Low-friction products, public services

## A/B Testing Rules

### Step 1: Create Test Group
1. Create new rule versions with experimental weights
2. Tag with test identifier: `test-group-1`, `test-group-2`
3. Document hypothesis and metrics to track

### Step 2: Route Traffic
Use URL parameter or user segment to route to test group:

```typescript
const weights = userId % 10 < 5 ? controlWeights : treatmentWeights
const score = calculateRiskScore(url, weights)
```

### Step 3: Monitor Metrics
Track per-group:
- Detection accuracy
- False positive rate
- User complaints
- Threat coverage

### Step 4: Analyze Results
- Compare metrics between groups
- Statistical significance test (p-value)
- Decision: adopt, reject, or refine

### Example A/B Test
```
Hypothesis: Increasing DNS layer weight reduces false positives

Control Group:
- Forensics weight: 50
- False positive rate: 12%

Treatment Group:
- Forensics weight: 70
- False positive rate: 8%

Result: Treatment reduced FP by 33% → Adopt treatment
```

## Performance Tuning Guide

### Detecting False Positives
1. Go to `/admin/analytics` dashboard
2. Filter for URLs with "Trust Score: 0-30" (flagged as critical)
3. Manually review sample of flagged URLs
4. If many are legitimate:
   - Decrease rule weight
   - Disable problematic rule
   - Add URL to allowlist

### Improving Detection Accuracy
1. Analyze missed threats from `/admin/analytics`
2. Identify patterns in undetected phishing
3. Create new rule matching pattern
4. Set initial weight: 40 (conservative)
5. Monitor trigger rate and accuracy
6. Adjust weight based on performance

### Optimizing Response Time
1. Current baseline: ~200ms total for 4 layers
2. DNS layer slowest: 1-5 seconds
3. Options to reduce:
   - Disable Forensics layer for non-critical scans
   - Implement DNS caching (TTL: 1 hour)
   - Use async verification for background checks

## Troubleshooting

### Rule Changes Not Taking Effect
**Symptoms**: Modified weights don't change scan results

**Solution**:
1. Clear browser cache (rules cached on page load)
2. Restart the admin interface
3. Verify change was logged in audit trail
4. Check Firestore `rule_configs` collection directly

### High False Positive Rate
**Symptoms**: Many legitimate URLs flagged as suspicious

**Solution**:
1. Reduce weights on triggering rules
2. Disable problematic detection rules
3. Review enabled rules for each layer
4. Run A/B test with lower thresholds

### Low Detection Rate
**Symptoms**: Missing attacks that should be detected

**Solution**:
1. Increase weights on detection rules
2. Enable additional threat intel services
3. Review recent attack patterns
4. Create custom rules for new threat types

### Permission Denied on Rules
**Symptoms**: Can't modify rules in admin interface

**Solution**:
1. Verify admin authentication token
2. Check Firebase custom claims (require `admin: true`)
3. Test API access directly: `curl -H "Bearer $TOKEN" /api/admin/rules`

## Best Practices

✅ **DO**:
- Start with balanced default weights
- Use A/B tests before major changes
- Monitor false positive rate weekly
- Document rule decisions and rationale
- Review audit trail monthly
- Test rule changes on staging first

❌ **DON'T**:
- Drastically change multiple weights at once
- Disable all rules in a layer (defeats the purpose)
- Forget to check statistical significance in A/B tests
- Change rules without audit trail documentation
- Use weight 100 (save for absolutely critical rules)
- Ignore false positive feedback from users

## Integration with Scanner

Rules automatically apply to all new scans:

```typescript
// When scanner initializes
const rules = await getAllRules()

// Heuristics layer uses rule weights
const heuristicScore = calculateHeuristicScore(url, rules.filter(r => r.category === 'heuristics'))

// All 4 layers respect enabled/weight settings
const finalScore = aggregateLayerScores(layerScores, rules)
```

No code changes needed - rules are loaded dynamically on each scan.

## Future Enhancements

- **Scheduled Rules**: Enable/disable rules on schedule (e.g., more strict at night)
- **Geo-based Rules**: Different rule configs per region
- **ML-based Optimization**: Auto-adjust weights based on accuracy metrics
- **Rule Suggestions**: Recommendations based on historical data
- **Comparative Analysis**: Compare performance across rule versions
- **Export/Import**: Backup and restore rule configurations

## Support Resources

- Internal Wiki: Rules Management System
- Slack Channel: #scamsentry-rules
- Issue Tracker: Tag with `rules` component
- Email: admin@scamsentry.dev

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintained By**: Security Team
