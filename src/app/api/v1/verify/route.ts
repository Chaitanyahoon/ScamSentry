import { NextResponse } from "next/server";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { analyzeInternalGraph } from "@/lib/validator/internal-graph";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

/**
 * /v1/verify?domain=example.com
 * Specialized endpoint for Domain-Centric Verification.
 * Checks for: Domain age, Registrar reputation, and Internal whitelist.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Missing 'domain' parameter." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const [forensics, internal] = await Promise.all([
      analyzeDomainForensics(domain),
      analyzeInternalGraph(domain)
    ]);

    const isVerified = internal.score === -100; // Whitelist indicator
    const trustScore = isVerified ? 100 : Math.max(0, 100 - forensics.score);

    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
          engineVersion: "v2.2.0-beta",
        },
        data: {
          domain,
          isVerified,
          trustScore,
          forensicSignals: {
            isNewDomain: forensics.flags.includes("DOMAIN_NEW"),
            isSuspiciousRegistrar: forensics.flags.includes("REGISTRAR_SUSPICIOUS"),
            isWhitelisted: isVerified
          }
        }
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
