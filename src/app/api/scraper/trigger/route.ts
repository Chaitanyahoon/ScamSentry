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
      const remainingSecs = Math.ceil((RATE_LIMIT_MS - (now - lastTriggerTime)) / 1000);
      return NextResponse.json(
        { success: false, error: `Rate limited. Try again in ${remainingSecs}s.` },
        { status: 429 }
      );
    }

    lastTriggerTime = now;

    console.log("[SCRAPER_TRIGGER] Manual scrape requested from UI...");
    const stats = await scrapeCyberIncidents();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...stats
    });
  } catch (error: any) {
    console.error("[SCRAPER_TRIGGER] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
