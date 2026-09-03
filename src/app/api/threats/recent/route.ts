import { NextResponse } from "next/server";
import { getRecentThreats } from "@/lib/services/osint-sync";
import {
  getRecentIncidents,
  getActiveBrandLockdowns,
} from "@/lib/services/incident-scraper";

export const dynamic = "force-dynamic";

// ── In-Memory Circuit Breaker ──────────────────────────────────────────
// Prevents pounding a sleeping Render free instance on every page navigation
let lastBackendFailureTime = 0;
const CIRCUIT_BREAKER_COOLDOWN_MS = 45 * 1000; // 45 seconds

// ── Curated Baseline Terminal Fallback Data ────────────────────────────
// Guaranteed rich data so Live Threat Ticker, Cyber News Hub, and Map NEVER show 0 or blank
const STATIC_FALLBACK_INCIDENTS = [
  {
    title: "Critical Zero-Day Exploitation Detected Across Cloud Edge Gateways",
    link: "https://www.bleepingcomputer.com",
    description: "Security advisories indicate active credential harvesting campaigns spoofing multi-factor authentication endpoints.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    source: "BleepingComputer",
    isHighlight: true,
  },
  {
    title: "Sophisticated Banking Trojen Targets Mobile UPI and Payment Applications",
    link: "https://thehackernews.com",
    description: "Security teams report novel SMS-forwarding and overlay mimicry tactics targeting commercial banking clients.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    source: "Hacker News",
    isHighlight: true,
  },
  {
    title: "High-Frequency Brand Impersonation Campaign Targets Tech Vendors",
    link: "https://krebsonsecurity.com",
    description: "Multiple typosquatting domains registered utilizing newly issued automated SSL certificates.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    source: "KrebsOnSecurity",
    isHighlight: false,
  },
  {
    title: "Phishing Ledger Advisory: AI-Generated Voice Mimicry in Wire Fraud",
    link: "https://thehackernews.com",
    description: "Forensic researchers flag synthetic audio payloads delivered via compromised VoIP SIP relays.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    source: "Hacker News",
    isHighlight: false,
  },
  {
    title: "Credential Stuffing Network Infiltrates Distributed Enterprise Accounts",
    link: "https://www.bleepingcomputer.com",
    description: "Over 800,000 compromised tokens detected traversing anonymized proxy networks.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    source: "BleepingComputer",
    isHighlight: false,
  },
];

const STATIC_FALLBACK_LOCKDOWNS = [
  "paypal",
  "paytm",
  "whatsapp",
  "apple",
  "google",
  "microsoft",
  "amazon",
  "telegram",
  "phonepe",
  "sbi",
  "hdfc",
  "vercel",
];

const STATIC_FALLBACK_THREATS = [
  {
    domain: "hxxp://secure-login-account-update.net",
    source: "OSINT Blocklist",
    type: "phish",
    firstSeen: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastSync: new Date().toISOString(),
    status: "active",
  },
  {
    domain: "hxxps://auth-verification-portal-service.com",
    source: "URLhaus Feed",
    type: "malware",
    firstSeen: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    lastSync: new Date().toISOString(),
    status: "active",
  },
  {
    domain: "hxxp://portal-appleid-support-alert.org",
    source: "OpenPhish",
    type: "phish",
    firstSeen: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    lastSync: new Date().toISOString(),
    status: "active",
  },
  {
    domain: "hxxps://walletconnect-sync-validation.io",
    source: "OSINT Feed",
    type: "crypto_drainer",
    firstSeen: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    lastSync: new Date().toISOString(),
    status: "active",
  },
  {
    domain: "hxxp://bank-kyc-mandate-renewal.info",
    source: "Community Ledger",
    type: "smishing",
    firstSeen: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    lastSync: new Date().toISOString(),
    status: "active",
  },
];

export async function GET() {
  try {
    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    let incidents: any[] = [];
    let lockdowns: any[] = [];
    let threats: any[] = [];
    let fetchedFromBackend = false;

    const isCircuitOpen =
      Date.now() - lastBackendFailureTime < CIRCUIT_BREAKER_COOLDOWN_MS;

    if (backendUrl && !isCircuitOpen) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const [incidentsRes, lockdownsRes] = await Promise.all([
          fetch(`${backendUrl}/api/v1/incidents?limit=30`, {
            signal: controller.signal,
            next: { revalidate: 30 },
          }),
          fetch(`${backendUrl}/api/v1/brand-lockdowns`, {
            signal: controller.signal,
            next: { revalidate: 30 },
          }),
        ]);

        clearTimeout(timeoutId);

        if (incidentsRes.ok && lockdownsRes.ok) {
          const rawIncidents = await incidentsRes.json();
          const rawLockdowns = await lockdownsRes.json();

          incidents = rawIncidents.map((i: any) => ({
            title: i.title,
            link: i.link,
            description: i.description || "",
            publishedAt: i.published_at,
            source: i.source,
            isHighlight: i.is_highlight,
          }));

          lockdowns = rawLockdowns.map((l: any) => l.brand_name);
          fetchedFromBackend = true;
        } else {
          lastBackendFailureTime = Date.now();
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastBackendFailureTime = Date.now();
        console.warn(
          `[API:Threats] Backend unavailable (${err.name || "Error"}), serving resilient fallback.`,
        );
      }
    }

    // Attempt Firestore retrieval if backend did not supply data
    if (!fetchedFromBackend) {
      incidents = await getRecentIncidents(30).catch(() => []);
      lockdowns = await getActiveBrandLockdowns().catch(() => []);
    }

    threats = await getRecentThreats(15).catch(() => []);

    // Terminal Fallback Injection: Guarantee populated state
    if (!incidents || incidents.length === 0) {
      incidents = STATIC_FALLBACK_INCIDENTS;
    }
    if (!lockdowns || lockdowns.length === 0) {
      lockdowns = STATIC_FALLBACK_LOCKDOWNS;
    }
    if (!threats || threats.length === 0) {
      threats = STATIC_FALLBACK_THREATS;
    }

    const cacheHeader = fetchedFromBackend
      ? "public, s-maxage=60, stale-while-revalidate=30"
      : "no-store, no-cache, must-revalidate";

    return NextResponse.json(
      {
        threats,
        incidents,
        lockdowns,
        backendStatus: fetchedFromBackend ? "live" : "waking_up",
        isFallback: !fetchedFromBackend,
      },
      {
        headers: {
          "Cache-Control": cacheHeader,
        },
      },
    );
  } catch (error: any) {
    console.error("[API] Recent Threats Error:", error);
    return NextResponse.json(
      {
        threats: STATIC_FALLBACK_THREATS,
        incidents: STATIC_FALLBACK_INCIDENTS,
        lockdowns: STATIC_FALLBACK_LOCKDOWNS,
        backendStatus: "waking_up",
        isFallback: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
