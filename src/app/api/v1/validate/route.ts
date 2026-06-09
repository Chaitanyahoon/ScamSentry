import { NextResponse } from "next/server";
import { analyzeHeuristics } from "@/lib/validator/heuristics";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { analyzeThreatIntel } from "@/lib/validator/threat-intel";
import { analyzeInternalGraph } from "@/lib/validator/internal-graph";

import { generateThreatFingerprint } from "@/lib/fingerprints";
import {
  freeTierLimiter,
  proTierLimiter,
  enterpriseTierLimiter,
} from "@/lib/rate-limit";
import { logScanEvent, ScanEvent } from "@/lib/analytics";
import { dispatchBrandAlert } from "@/lib/webhook-dispatcher";
import { getAdminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";

const localRateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

function checkLocalRateLimit(identifier: string, limit: number): boolean {
  const now = Date.now();
  const clientData = localRateLimitMap.get(identifier);
  const WINDOW_MS = 60 * 1000;
  if (!clientData || now > clientData.resetTime) {
    localRateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return true;
  }
  if (clientData.count >= limit) {
    return false;
  }
  clientData.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Missing 'x-api-key' header. Please obtain an API key from the developer dashboard.",
        },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    // 1. Verify API Key and check limits in Firestore
    let db;
    try {
      db = getAdminDb();
    } catch (firebaseErr) {
      console.error("[VALIDATE] Firebase Admin not initialized:", firebaseErr);
      return NextResponse.json(
        { error: "Internal Server Error. Database connectivity offline." },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    const keysSnap = await db
      .collection("api_keys")
      .where("key", "==", apiKey)
      .limit(1)
      .get();

    if (keysSnap.empty) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid 'x-api-key' header value." },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const keyDoc = keysSnap.docs[0];
    const keyData = keyDoc.data();

    if (keyData.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Unauthorized. This API key has been revoked by the administrator.",
        },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const tier = keyData.tier || "free";
    const planLimit = keyData.planLimit || 1000;
    const usageCount = keyData.usageCount || 0;

    if (usageCount >= planLimit) {
      return NextResponse.json(
        {
          error:
            "Usage quota exceeded. Please upgrade your plan in the developer dashboard.",
        },
        { status: 403, headers: CORS_HEADERS },
      );
    }

    // 2. Perform Rate Limiting based on tier
    const rateLimitIdentifier = `apikey:${apiKey}`;
    let rateLimitPassed = true;

    if (tier === "enterprise") {
      if (enterpriseTierLimiter) {
        const { success } =
          await enterpriseTierLimiter.limit(rateLimitIdentifier);
        rateLimitPassed = success;
      } else {
        rateLimitPassed = checkLocalRateLimit(rateLimitIdentifier, 300);
      }
    } else if (tier === "pro") {
      if (proTierLimiter) {
        const { success } = await proTierLimiter.limit(rateLimitIdentifier);
        rateLimitPassed = success;
      } else {
        rateLimitPassed = checkLocalRateLimit(rateLimitIdentifier, 60);
      }
    } else {
      // free
      if (freeTierLimiter) {
        const { success } = await freeTierLimiter.limit(rateLimitIdentifier);
        rateLimitPassed = success;
      } else {
        rateLimitPassed = checkLocalRateLimit(rateLimitIdentifier, 5);
      }
    }

    if (!rateLimitPassed) {
      const limitVal = tier === "enterprise" ? 300 : tier === "pro" ? 60 : 5;
      return NextResponse.json(
        {
          error: `Rate limit exceeded (${limitVal} req/min) for API key tier '${tier.toUpperCase()}'.`,
        },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // 3. Payload Validation
    const body = await req.json().catch(() => null);
    if (!body || !body.payload || typeof body.payload !== "string") {
      return NextResponse.json(
        { error: 'Invalid request shape. Expected { "payload": "string" }' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const input = body.payload;

    // 4. Engine Execution (Deterministic L1-L4)
    let finalScore = 100;
    let riskLevel: "Secure" | "Suspicious" | "Critical Threat" = "Secure";
    let isBlacklisted = false;
    let forensicDetails: string[] = [];
    let heuristicsScore = 0;
    let heuristicsCount = 0;
    let forensicsScore = 0;
    let threatIntelScore = 0;
    let internalLedgerVerified = false;

    // Attempt to query the FastAPI backend if BACKEND_API_URL or NEXT_PUBLIC_API_URL is configured
    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    let backendUsed = false;

    if (backendUrl) {
      try {
        let targetUrl = input;
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `http://${targetUrl}`;
        }
        console.log(
          `[B2B API] Proxying scan request for: "${targetUrl}" to FastAPI backend: ${backendUrl}`,
        );
        const backendResponse = await fetch(`${backendUrl}/api/v1/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          const L1 = data.layer_results.find(
            (lr: any) => lr.layer === "L1",
          ) || { score_contribution: 0, details: {} };
          const L2 = data.layer_results.find(
            (lr: any) => lr.layer === "L2",
          ) || { score_contribution: 0, details: {} };
          const L3 = data.layer_results.find(
            (lr: any) => lr.layer === "L3",
          ) || { score_contribution: 0, details: {} };
          const L4 = data.layer_results.find(
            (lr: any) => lr.layer === "L4",
          ) || { score_contribution: 0, details: {} };

          finalScore = 100 - data.risk_score;
          if (data.risk_level === "dangerous") riskLevel = "Critical Threat";
          else if (data.risk_level === "suspicious") riskLevel = "Suspicious";
          isBlacklisted = finalScore <= 20;

          const l1Flags = L1.details.triggered_rules || [];
          const l2Flags = L2.details.triggered_checks || [];
          const l3Flags: string[] = [];
          if (L3.details.matches && Array.isArray(L3.details.matches)) {
            L3.details.matches.forEach((m: any) => {
              l3Flags.push(
                `CRITICAL: Google Safe Browsing flagged threat: ${m.threat_type} on ${m.platform}`,
              );
            });
          }
          const l4Flags: string[] = [];
          if (L4.details.match) {
            const m = L4.details.match;
            const verifiedLabel = m.verified ? "Verified" : "Unverified";
            l4Flags.push(
              `CRITICAL: Internal Graph Ledger Match: ${verifiedLabel} ${m.threat_type} (confidence: ${m.confidence}%)`,
            );
          }

          forensicDetails = [...l1Flags, ...l2Flags, ...l3Flags, ...l4Flags];
          heuristicsScore = L1.score_contribution;
          heuristicsCount = l1Flags.length;
          forensicsScore = L2.score_contribution;
          threatIntelScore = L3.score_contribution;
          internalLedgerVerified = !!L4.details.match;
          backendUsed = true;
        } else {
          const errText = await backendResponse.text();
          console.warn(
            `[B2B API] Backend error status ${backendResponse.status}: ${errText}. Falling back to local.`,
          );
        }
      } catch (err) {
        console.error(
          "[B2B API] Backend connection failed. Falling back to local:",
          err,
        );
      }
    }

    if (!backendUsed) {
      // Execute Local Next.js Threat Validation Pipeline
      const L1 = analyzeHeuristics(input);
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = input.match(urlRegex) || [];

      const [L2, L4, L3] = await Promise.all([
        analyzeDomainForensics(input),
        analyzeInternalGraph(input),
        analyzeThreatIntel(urls),
      ]);

      const deterministicRisk = L1.score + L2.score + L3.score + L4.score;
      finalScore = 100 - Math.min(deterministicRisk, 100);

      if (finalScore <= 20) riskLevel = "Critical Threat";
      else if (finalScore <= 60) riskLevel = "Suspicious";

      isBlacklisted = finalScore <= 20;
      forensicDetails = [...L1.flags, ...L2.flags, ...L3.flags];
      heuristicsScore = L1.score;
      heuristicsCount = L1.flags.length;
      forensicsScore = L2.score;
      threatIntelScore = L3.score;
      internalLedgerVerified = L4.score > 0;
    }

    const fingerprint = generateThreatFingerprint(input, forensicDetails, {
      heuristics: heuristicsScore,
      forensics: forensicsScore,
      threatIntel: threatIntelScore,
      internalGraph: internalLedgerVerified ? 100 : 0,
      semantic: 0,
    } as Record<string, number>);

    // 6. Log scan event for analytics
    const scanEvent: ScanEvent = {
      url: input,
      finalScore: finalScore,
      riskLevel: riskLevel,
      triggeredLayers: [
        heuristicsScore > 0 ? "Heuristics" : "",
        forensicsScore > 0 ? "Forensics" : "",
        threatIntelScore > 0 ? "Threat Intel" : "",
        internalLedgerVerified ? "Internal Trust Graph" : "",
      ].filter(Boolean),
      layerScores: {
        heuristics: heuristicsScore,
        forensics: forensicsScore,
        threatIntel: threatIntelScore,
        internalGraph: internalLedgerVerified ? 100 : 0,
        semantic: 0,
      },
      timestamp: new Date(),
      userAgent: req.headers.get("user-agent") || undefined,
      ipHash: req.headers.get("x-forwarded-for") || "internal",
      apiKeyId: keyDoc.id,
    };

    await logScanEvent(scanEvent);

    // 7. Increment key usage in Firestore
    await keyDoc.ref.update({
      usageCount: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 8. B2B Brand Monitoring Trigger (Webhook Dispatch)
    if (finalScore <= 25) {
      const brandMatch = forensicDetails.find(
        (d) => d.includes("mimics '") || d.includes("spoofing major brand '"),
      );
      if (brandMatch) {
        const brandName = brandMatch.match(/'([^']+)'/)?.[1];
        if (brandName) {
          await dispatchBrandAlert(brandName, {
            alertType: "BRAND_MIMICRY",
            severity: finalScore <= 20 ? "CRITICAL" : "HIGH",
            targetBrand: brandName,
            maliciousUrl: input,
            fingerprint: fingerprint.hash,
            detectedAt: new Date().toISOString(),
            forensicSummary: forensicDetails,
          });
        }
      }
    }

    // 9. Return Forensic Intelligence Response
    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
          engineVersion: "v2.5.0-forensic",
          tier,
        },
        data: {
          target: input,
          isBlacklisted,
          trustScore: finalScore,
          severity: riskLevel,
          fingerprint: fingerprint.hash,
          diagnostics: {
            heuristics: {
              triggerCount: heuristicsCount,
              scorePenalty: heuristicsScore,
            },
            dnsForensics: {
              scorePenalty: forensicsScore,
              flags: forensicDetails.filter(
                (f) =>
                  f.startsWith("DNS") ||
                  f.startsWith("SSL") ||
                  f.startsWith("Domain age"),
              ),
            },
            threatIntel: {
              scorePenalty: threatIntelScore,
              flags: forensicDetails.filter(
                (f) =>
                  f.includes("Google Safe Browsing") || f.includes("URLhaus"),
              ),
            },
            internalLedger: { verifiedScamsFound: internalLedgerVerified },
            semanticAI: undefined,
          },
          details: forensicDetails,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error: any) {
    console.error("Forensic Engine Crash:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
