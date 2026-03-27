/**
 * Rules Management API
 * 
 * Endpoints for managing detection rules via REST API
 * Requires admin authentication with valid Firebase ID token
 * 
 * Rate Limits (per admin user, per hour):
 * - GET: 100 requests/hour
 * - POST: 50 requests/hour
 * - PUT: 50 requests/hour
 * - DELETE: 20 requests/hour
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getAllRules,
  getRulesByCategory,
  updateRuleWeight,
  toggleRule,
  getRuleStats,
  createRule,
  deleteRule,
  logRuleChange,
  DetectionRule,
} from '@/lib/rules-management'
import { authenticateAdminRequest } from '@/lib/admin-auth-verify'
import {
  checkAdminReadLimit,
  checkAdminWriteLimit,
  checkAdminDeleteLimit,
  formatRateLimitError,
  adminRateLimitConfig,
} from '@/lib/admin-rate-limit'

/**
 * Verify admin authentication from request headers
 * Returns user ID if authentication succeeds, null otherwise
 */
async function verifyAdminAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization')

  const adminUser = await authenticateAdminRequest(authHeader)
  if (!adminUser) {
    return null
  }

  return adminUser.uid
}

/**
 * GET /api/admin/rules
 * Get all rules, optionally filtered by category
 */
export async function GET(req: NextRequest) {
  const userId = await verifyAdminAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limit for read operations
  const rateLimitCheck = await checkAdminReadLimit(userId)
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      {
        error: formatRateLimitError(rateLimitCheck.resetTime),
        limit: adminRateLimitConfig.read.requestsPerHour,
        remaining: 0,
      },
      { status: 429 }
    )
  }

  const category = req.nextUrl.searchParams.get('category')

  try {
    let rules: DetectionRule[]
    if (category) {
      rules = await getRulesByCategory(category)
    } else {
      rules = await getAllRules()
    }

    // Fetch stats for each rule
    const rulesWithStats = await Promise.all(
      rules.map(async (rule) => ({
        ...rule,
        stats: await getRuleStats(rule.id || ''),
      }))
    )

    return NextResponse.json(rulesWithStats)
  } catch (error) {
    console.error('Failed to fetch rules:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

/**
 * POST /api/admin/rules
 * Create a new detection rule
 */
export async function POST(req: NextRequest) {
  const userId = await verifyAdminAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limit for write operations
  const rateLimitCheck = await checkAdminWriteLimit(userId)
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      {
        error: formatRateLimitError(rateLimitCheck.resetTime),
        limit: adminRateLimitConfig.write.requestsPerHour,
        remaining: 0,
      },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const rule: Omit<DetectionRule, 'id' | 'lastUpdated' | 'detectionCount'> = {
      name: body.name,
      category: body.category,
      description: body.description,
      enabled: body.enabled ?? true,
      weight: body.weight ?? 50,
      confidence: body.confidence ?? 0.8,
      falsePositiveRate: body.falsePositiveRate ?? 0.05,
      pattern: body.pattern,
      createdBy: userId,
    }

    // Validate required fields
    if (!rule.name || !rule.category || !rule.description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, description' },
        { status: 400 }
      )
    }

    const ruleId = await createRule(rule, userId)
    await logRuleChange(ruleId, 'created', userId, rule)

    return NextResponse.json(
      { id: ruleId, ...rule },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create rule:', error)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/rules/[id]
 * Update a detection rule
 */
export async function PUT(req: NextRequest) {
  const userId = await verifyAdminAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limit for write operations
  const rateLimitCheck = await checkAdminWriteLimit(userId)
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      {
        error: formatRateLimitError(rateLimitCheck.resetTime),
        limit: adminRateLimitConfig.write.requestsPerHour,
        remaining: 0,
      },
      { status: 429 }
    )
  }

  try {
    const { searchParams } = req.nextUrl
    const ruleId = searchParams.get('id')
    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 })
    }

    const body = await req.json()

    if (body.weight !== undefined) {
      if (body.weight < 0 || body.weight > 100) {
        return NextResponse.json(
          { error: 'Weight must be between 0 and 100' },
          { status: 400 }
        )
      }
      await updateRuleWeight(ruleId, body.weight, userId)
    }

    if (body.enabled !== undefined) {
      await toggleRule(ruleId, body.enabled, userId)
    }

    await logRuleChange(ruleId, 'updated', userId, body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update rule:', error)
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/rules/[id]
 * Delete a detection rule
 */
export async function DELETE(req: NextRequest) {
  const userId = await verifyAdminAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limit for delete operations (strictest limit)
  const rateLimitCheck = await checkAdminDeleteLimit(userId)
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      {
        error: formatRateLimitError(rateLimitCheck.resetTime),
        limit: adminRateLimitConfig.delete.requestsPerHour,
        remaining: 0,
      },
      { status: 429 }
    )
  }

  try {
    const { searchParams } = req.nextUrl
    const ruleId = searchParams.get('id')
    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 })
    }

    await deleteRule(ruleId)
    await logRuleChange(ruleId, 'deleted', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete rule:', error)
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
