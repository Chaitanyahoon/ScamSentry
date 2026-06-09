import { NextResponse } from "next/server";
import { scrapeCyberIncidents } from "@/lib/services/incident-scraper";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter (1 trigger per 5 minutes)
let lastTriggerTime = 0;
const RATE_LIMIT_MS = 5 * 60 * 1000;

export async function POST() {
  try {
    const now = Date.now();
    if (now - lastTriggerTime < RATE_LIMIT_MS) {
      const remainingSecs = Math.ceil(
        (RATE_LIMIT_MS - (now - lastTriggerTime)) / 1000,
      );
      return NextResponse.json(
        {
          success: false,
          error: `Rate limited. Try again in ${remainingSecs}s.`,
        },
        { status: 429 },
      );
    }

    lastTriggerTime = now;

    console.log("[SCRAPER_TRIGGER] Manual scrape requested from UI...");

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    let backendStats = {};
    let proxied = false;

    if (backendUrl) {
      try {
        console.log(
          `[SCRAPER_TRIGGER] Proxying incident scraping request to FastAPI backend: ${backendUrl}`,
        );
        const response = await fetch(
          `${backendUrl}/api/v1/admin/scrape-incidents?background=false`,
          {
            method: "POST",
            headers: {
              "X-Admin-Key":
                process.env.API_SECRET_KEY || "test-admin-secret-key-12345",
            },
          },
        );

        if (response.ok) {
          backendStats = await response.json();
          proxied = true;
          console.log(
            "[SCRAPER_TRIGGER] Backend scraper finished successfully. Syncing to Firestore locally...",
          );
        } else {
          const errText = await response.text();
          console.warn(
            `[SCRAPER_TRIGGER] Backend scraper returned error ${response.status}: ${errText}. Running local sync.`,
          );
        }
      } catch (err) {
        console.error(
          "[SCRAPER_TRIGGER] Error connecting to backend for scraping. Running local sync:",
          err,
        );
      }
    }

    console.log("[SCRAPER_TRIGGER] Running local daily incident scraper...");
    const stats = await scrapeCyberIncidents();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      proxied,
      backend: proxied ? backendStats : null,
      ...stats,
    });
  } catch (error: any) {
    console.error("[SCRAPER_TRIGGER] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
