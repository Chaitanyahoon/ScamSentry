import { NextResponse } from 'next/server';
import { analyzeHeuristics } from '@/lib/validator/heuristics';
import { analyzeDomainForensics } from '@/lib/validator/forensics';
import { analyzeThreatIntel } from '@/lib/validator/threat-intel';
import { analyzeInternalGraph } from '@/lib/validator/internal-graph';
import { analyzeAIContent } from '@/lib/validator/ai-semantics';
import { freeTierLimiter, enterpriseLimiter } from '@/lib/rate-limit';

// In-memory fallback for local dev (when Upstash env vars not set)
const localRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LOCAL_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const isEnterprise = apiKey === process.env.SCAM_SENTRY_B2B_KEY;
    const identifier = isEnterprise
      ? `enterprise:${apiKey}`
      : (req.headers.get('x-forwarded-for') || 'anonymous');

    // -- Rate Limiting: Upstash (production) or in-memory (local dev) --
    if (isEnterprise && enterpriseLimiter) {
      const { success } = await enterpriseLimiter.limit(identifier);
      if (!success) {
        return NextResponse.json(
          { error: 'Enterprise rate limit exceeded (300 req/min).' },
          { status: 429, headers: CORS_HEADERS }
        );
      }
    } else if (!isEnterprise) {
      if (freeTierLimiter) {
        const { success } = await freeTierLimiter.limit(identifier);
        if (!success) {
          return NextResponse.json(
            { error: "Rate limit exceeded (5 req/min). Pass a valid 'x-api-key' for higher limits." },
            { status: 429, headers: CORS_HEADERS }
          );
        }
      } else {
        // Local dev fallback
        const now = Date.now();
        const clientData = localRateLimitMap.get(identifier);
        if (!clientData || now > clientData.resetTime) {
          localRateLimitMap.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
        } else {
          if (clientData.count >= LOCAL_LIMIT) {
            return NextResponse.json(
              { error: "Rate limit exceeded. (Local dev: 5 req/min)" },
              { status: 429, headers: CORS_HEADERS }
            );
          }
          clientData.count++;
        }
      }
    }

    // 3. Payload Validation
    const body = await req.json().catch(() => null);
    if (!body || !body.payload || typeof body.payload !== 'string') {
      return NextResponse.json(
        { error: "Invalid request shape. Expected { \"payload\": \"string\" }" }, 
        { status: 400, headers: CORS_HEADERS }
      );
    }
    
    const input = body.payload;

    // 4. Engine Execution (Pre-AI)
    const L1 = analyzeHeuristics(input);
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];
    
    const [L2, L4, L3] = await Promise.all([
      analyzeDomainForensics(input),
      analyzeInternalGraph(input),
      analyzeThreatIntel(urls)
    ]);

    // 5. Scoring Algorithm & AI Short-circuit
    const preliminaryRisk = L1.score + L2.score + L3.score + L4.score;
    let L5 = { score: 0, flags: ["System Bypassed: Threat already verified deterministically."], aiActive: false };
    
    // Only invoke Gemini API if the site hasn't already crossed the Critical Threat threshold
    if (preliminaryRisk < 80) {
      try {
        L5 = await analyzeAIContent(input);
      } catch (e) {}
    }

    const combinedRisk = preliminaryRisk + L5.score;
    const rawRiskScore = Math.min(combinedRisk, 100);
    const finalScore = 100 - rawRiskScore; 
    
    let riskLevel = "Secure";
    if (finalScore <= 20) riskLevel = "Critical Threat";
    else if (finalScore <= 60) riskLevel = "Suspicious";

    const isBlacklisted = finalScore <= 20;

    // 6. Return standard B2B developer response
    return NextResponse.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        engineVersion: "v2.1.0-beta",
        tier: apiKey === process.env.SCAM_SENTRY_B2B_KEY ? "enterprise" : "free",
        optimizations: { geminiBypassed: preliminaryRisk >= 80 }
      },
      data: {
        target: input,
        isBlacklisted,
        trustScore: finalScore,
        severity: riskLevel,
        diagnostics: {
          heuristics: { triggerCount: L1.flags.length, scorePenalty: L1.score },
          dnsForensics: { scorePenalty: L2.score },
          threatIntel: { scorePenalty: L3.score },
          internalLedger: { verifiedScamsFound: L4.score > 0 },
          aiSemantics: { generatedProbabilityScore: L5.score }
        }
      }
    }, { status: 200, headers: CORS_HEADERS });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

// Support preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
