import { NextResponse } from "next/server";
import { scrapeCyberIncidents } from "@/lib/services/incident-scraper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Authorization check
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("[CRON] Executing Daily Incident and Compromise Scraper...");

    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      try {
        console.log(`[CRON] Proxying incident scraping request to FastAPI backend: ${backendUrl}`);
        const response = await fetch(`${backendUrl}/api/v1/admin/scrape-incidents`, {
          method: "POST",
          headers: {
            "X-Admin-Key": process.env.API_SECRET_KEY || "test-admin-secret-key-12345",
          },
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            proxied: true,
            ...data
          });
        } else {
          const errText = await response.text();
          console.warn(`[CRON] Backend incident scraper returned error ${response.status}: ${errText}. Falling back to local scraper.`);
        }
      } catch (err) {
        console.error("[CRON] Error connecting to backend for scraping. Falling back to local scraper:", err);
      }
    }

    console.log("[CRON] Executing Local Daily Incident and Compromise Scraper...");
    const stats = await scrapeCyberIncidents();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      proxied: false,
      ...stats
    });
  } catch (error: any) {
    console.error("[CRON] Incident Scraper Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
