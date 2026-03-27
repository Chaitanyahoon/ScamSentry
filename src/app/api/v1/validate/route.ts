import { NextResponse } from "next/server";
import { analyzeHeuristics } from "@/lib/validator/heuristics";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { analyzeThreatIntel } from "@/lib/validator/threat-intel";
import { analyzeInternalGraph } from "@/lib/validator/internal-graph";
import { analyzeSemanticIntent } from "@/lib/validator/semantic";
import { generateThreatFingerprint } from "@/lib/fingerprints";
import { freeTierLimiter, enterpriseLimiter } from "@/lib/rate-limit";
import { logScanEvent, ScanEvent } from "@/lib/analytics";
import { dispatchBrandAlert } from "@/lib/webhook-dispatcher";

// In-memory fallback for local dev (when Upstash env vars not set)
const localRateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();
const LOCAL_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const isEnterprise = apiKey === process.env.SCAM_SENTRY_B2B_KEY;
    const identifier = isEnterprise
      ? `enterprise:${apiKey}`
      : req.headers.get("x-forwarded-for") || "anonymous";

    // -- Rate Limiting --
    if (isEnterprise && enterpriseLimiter) {
      const { success } = await enterpriseLimiter.limit(identifier);
      if (!success) {
        return NextResponse.json(
          { error: "Enterprise rate limit exceeded (300 req/min)." },
          { status: 429, headers: CORS_HEADERS }
        );
      }
    } else if (!isEnterprise) {
      if (freeTierLimiter) {
        const { success } = await freeTierLimiter.limit(identifier);
        if (!success) {
          return NextResponse.json(
            {
              error:
                "Rate limit exceeded (5 req/min). Pass a valid 'x-api-key' for higher limits.",
            },
            { status: 429, headers: CORS_HEADERS }
          );
        }
      } else {
        const now = Date.now();
        const clientData = localRateLimitMap.get(identifier);
        if (!clientData || now > clientData.resetTime) {
          localRateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + WINDOW_MS,
          });
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
    if (!body || !body.payload || typeof body.payload !== "string") {
      return NextResponse.json(
        { error: 'Invalid request shape. Expected { "payload": "string" }' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const input = body.payload;

    // 4. Engine Execution (Deterministic L1-L4)
    const L1 = analyzeHeuristics(input);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];

    const [L2, L4, L3] = await Promise.all([
      analyzeDomainForensics(input),
      analyzeInternalGraph(input),
      analyzeThreatIntel(urls),
    ]);

    // 5. Intelligence Layer 5 (Semantic - Conditional)
    let L5 = { score: 0, flags: [] as string[], explanation: "" };
    const deterministicRisk = L1.score + L2.score + L3.score + L4.score;
    
    // Only trigger AI for edge cases (Suspicious zone)
    if (deterministicRisk > 20 && deterministicRisk < 70 && process.env.GEMINI_API_KEY) {
      L5 = await analyzeSemanticIntent(input);
    }

    // 6. Scoring Algorithm
    const combinedRisk = Math.min(deterministicRisk + L5.score, 100);
    const finalScore = 100 - combinedRisk;

    let riskLevel: "Secure" | "Suspicious" | "Critical Threat" = "Secure";
    if (finalScore <= 20) riskLevel = "Critical Threat";
    else if (finalScore <= 60) riskLevel = "Suspicious";

    const isBlacklisted = finalScore <= 20;

    // 7. Forensic Fingerprinting
    const forensicDetails = [...L1.flags, ...L2.flags, ...L3.flags, ...L5.flags];
    const fingerprint = generateThreatFingerprint(input, forensicDetails, {
      heuristics: L1.score,
      forensics: L2.score,
      threatIntel: L3.score,
      internalGraph: L4.score,
      semantic: L5.score
    } as Record<string, number>);

    // 8. Log scan event for analytics
    const scanEvent: ScanEvent = {
      url: input,
      finalScore: finalScore,
      riskLevel: riskLevel,
      triggeredLayers: [
        L1.score > 0 ? "Heuristics" : "",
        L2.score > 0 ? "Forensics" : "",
        L3.score > 0 ? "Threat Intel" : "",
        L4.score > 0 ? "Internal Trust Graph" : "",
        L5.score > 0 ? "Semantic AI" : "",
      ].filter(Boolean),
      layerScores: {
        heuristics: L1.score,
        forensics: L2.score,
        threatIntel: L3.score,
        internalGraph: L4.score,
        semantic: L5.score,
      },
      timestamp: new Date(),
      userAgent: req.headers.get("user-agent") || undefined,
      ipHash: req.headers.get("x-forwarded-for") || "internal",
      apiKeyId: apiKey || undefined,
    };

    await logScanEvent(scanEvent);

    // 9. B2B Brand Monitoring Trigger (Webhook Dispatch)
    if (finalScore <= 25) { // Notify on suspicious/critical (matches brand spoof triggers)
      const brandMatch = forensicDetails.find(d => d.includes("mimics '") || d.includes("spoofing major brand '"))
      if (brandMatch) {
         const brandName = brandMatch.match(/'([^']+)'/)?.[1]
         if (brandName) {
            await dispatchBrandAlert(brandName, {
              alertType: "BRAND_MIMICRY",
              severity: finalScore <= 20 ? "CRITICAL" : "HIGH",
              targetBrand: brandName,
              maliciousUrl: input,
              fingerprint: fingerprint.hash,
              detectedAt: new Date().toISOString(),
              forensicSummary: forensicDetails
            })
         }
      }
    }

    // 10. Return Forensic Intelligence Response
    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
          engineVersion: "v2.5.0-forensic",
          tier: isEnterprise ? "enterprise" : "free",
        },
        data: {
          target: input,
          isBlacklisted,
          trustScore: finalScore,
          severity: riskLevel,
          fingerprint: fingerprint.hash,
          diagnostics: {
            heuristics: { triggerCount: L1.flags.length, scorePenalty: L1.score },
            dnsForensics: { scorePenalty: L2.score, flags: L2.flags },
            threatIntel: { scorePenalty: L3.score, flags: L3.flags },
            internalLedger: { verifiedScamsFound: L4.score > 0 },
            semanticAI: L5.score > 0 ? {
              scorePenalty: L5.score,
              flags: L5.flags,
              assessment: L5.explanation
            } : undefined
          },
          details: forensicDetails
        },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("Forensic Engine Crash:", error);
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
    headers: CORS_HEADERS,
  });
}
