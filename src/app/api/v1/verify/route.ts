import { NextResponse } from "next/server";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { analyzeInternalGraph } from "@/lib/validator/internal-graph";
import {
  freeTierLimiter,
  proTierLimiter,
  enterpriseTierLimiter,
} from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { logScanEvent, ScanEvent } from "@/lib/analytics";

const localRateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

/**
 * /v1/verify?domain=example.com
 * Specialized endpoint for Domain-Centric Verification.
 * Checks for: Domain age, Registrar reputation, and Internal whitelist.
 * Requires a valid active API key in the 'x-api-key' header.
 */
export async function GET(req: Request) {
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
      console.error("[VERIFY] Firebase Admin not initialized:", firebaseErr);
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

    // 3. Extract domain parameter
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Missing 'domain' parameter." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // 4. Perform Domain Verification
    let isVerified = false;
    let trustScore = 100;
    let isNewDomain = false;
    let isSuspiciousRegistrar = false;
    let forensicsScore = 0;

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    let backendUsed = false;

    if (backendUrl) {
      try {
        let targetUrl = domain;
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `http://${targetUrl}`;
        }
        console.log(
          `[B2B verify] Proxying domain check for: "${targetUrl}" to FastAPI backend: ${backendUrl}`,
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
          const L2 = data.layer_results.find(
            (lr: any) => lr.layer === "L2",
          ) || { score_contribution: 0, details: {} };
          const L4 = data.layer_results.find(
            (lr: any) => lr.layer === "L4",
          ) || { score_contribution: 0, details: {} };

          // Whitelist check
          isVerified = !!(
            L4.details.match &&
            L4.details.match.verified &&
            L4.details.match.threat_type === "whitelist"
          );
          trustScore = isVerified
            ? 100
            : Math.max(0, 100 - L2.score_contribution);

          const l2Flags = L2.details.triggered_checks || [];
          isNewDomain = l2Flags.some(
            (f: string) => f.includes("Domain age") && f.includes("days"),
          );
          isSuspiciousRegistrar = l2Flags.some((f: string) =>
            f.includes("low-reputation registrar"),
          );
          forensicsScore = L2.score_contribution;
          backendUsed = true;
        } else {
          const errText = await backendResponse.text();
          console.warn(
            `[B2B verify] Backend error status ${backendResponse.status}: ${errText}. Falling back to local.`,
          );
        }
      } catch (err) {
        console.error(
          "[B2B verify] Backend connection failed. Falling back to local:",
          err,
        );
      }
    }

    if (!backendUsed) {
      const [forensics, internal] = await Promise.all([
        analyzeDomainForensics(domain),
        analyzeInternalGraph(domain),
      ]);

      isVerified = internal.score === -100;
      trustScore = isVerified ? 100 : Math.max(0, 100 - forensics.score);
      isNewDomain = forensics.flags.includes("DOMAIN_NEW");
      isSuspiciousRegistrar = forensics.flags.includes("REGISTRAR_SUSPICIOUS");
      forensicsScore = forensics.score;
    }

    // 5. Log scan event for analytics
    const riskLevel =
      trustScore <= 20
        ? "Critical Threat"
        : trustScore <= 60
          ? "Suspicious"
          : "Secure";
    const scanEvent: ScanEvent = {
      url: domain,
      finalScore: trustScore,
      riskLevel: riskLevel,
      triggeredLayers: [
        forensicsScore > 0 ? "Forensics" : "",
        isVerified ? "Internal Trust Graph" : "",
      ].filter(Boolean),
      layerScores: {
        heuristics: 0,
        forensics: forensicsScore,
        threatIntel: 0,
        internalGraph: isVerified ? 100 : 0,
        semantic: 0,
      },
      timestamp: new Date(),
      userAgent: req.headers.get("user-agent") || undefined,
      ipHash: req.headers.get("x-forwarded-for") || "internal",
      apiKeyId: keyDoc.id,
    };

    await logScanEvent(scanEvent);

    // 6. Increment key usage in Firestore
    await keyDoc.ref.update({
      usageCount: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
          engineVersion: "v2.5.0-forensic",
          tier,
        },
        data: {
          domain,
          isVerified,
          trustScore,
          forensicSignals: {
            isNewDomain,
            isSuspiciousRegistrar,
            isWhitelisted: isVerified,
          },
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error: any) {
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
