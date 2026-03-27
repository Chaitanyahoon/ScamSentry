/**
 * Admin OSINT Synchronization API
 * 
 * Secure endpoint to trigger manual OSINT ingestion from public feeds.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/admin-auth-verify';
import { checkAdminWriteLimit, checkAdminReadLimit, formatRateLimitError, adminRateLimitConfig } from '@/lib/admin-rate-limit';
import { syncOSINTFeeds, getRecentThreats } from '@/lib/services/osint-sync';

export async function GET(req: NextRequest) {
  // 1. Verify Admin Authentication
  const authHeader = req.headers.get('authorization');
  const adminUser = await authenticateAdminRequest(authHeader);
  
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = adminUser.uid;

  // 2. Check Rate Limit (Read Operation)
  const rateLimitCheck = await checkAdminReadLimit(userId);
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      {
        error: formatRateLimitError(rateLimitCheck.resetTime),
        limit: adminRateLimitConfig.read.requestsPerHour
      },
      { status: 429 }
    );
  }

  try {
    const threats = await getRecentThreats(50);
    return NextResponse.json(threats);
  } catch (error: any) {
    console.error('OSINT Fetch API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch threats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Verify Admin Authentication
  const authHeader = req.headers.get('authorization');
  const adminUser = await authenticateAdminRequest(authHeader);
  
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = adminUser.uid;

  // 2. Check Rate Limit (Write Operation)
  const rateLimitCheck = await checkAdminWriteLimit(userId);
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      {
        error: formatRateLimitError(rateLimitCheck.resetTime),
        limit: adminRateLimitConfig.write.requestsPerHour
      },
      { status: 429 }
    );
  }

  try {
    console.log(`[Admin] OSINT Sync triggered by ${userId}`);
    
    // 3. Execute Synchronization
    const stats = await syncOSINTFeeds();

    return NextResponse.json({
      success: true,
      message: 'OSINT synchronization complete',
      stats
    });
  } catch (error: any) {
    console.error('OSINT Sync API Error:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize OSINT feeds', details: error.message },
      { status: 500 }
    );
  }
}
