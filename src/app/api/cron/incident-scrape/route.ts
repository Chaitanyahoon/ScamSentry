import { NextResponse } from "next/server";
import { scrapeCyberIncidents } from "@/lib/services/incident-scraper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Authorization check (accept either Bearer token or ?secret= query parameter)
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");
    const authHeader = req.headers.get("authorization");

    const isAuthHeaderValid =
      authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isQuerySecretValid = querySecret === process.env.CRON_SECRET;

    if (!isAuthHeaderValid && !isQuerySecretValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("[CRON] Executing Daily Incident and Compromise Scraper...");

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    let backendStats = {};
    let proxied = false;

    if (backendUrl) {
      try {
        console.log(
          `[CRON] Proxying incident scraping request to FastAPI backend: ${backendUrl}`,
        );
        const response = await fetch(
          `${backendUrl}/api/v1/admin/scrape-incidents?background=false`,
          {
            method: "POST",
            headers: {
              "X-Admin-Key":
                process.env.API_SECRET_KEY || "",
            },
          },
        );

        if (response.ok) {
          backendStats = await response.json();
          proxied = true;
          console.log(
            "[CRON] Backend incident scraper finished successfully. Syncing locally to Firestore...",
          );
        } else {
          const errText = await response.text();
          console.warn(
            `[CRON] Backend incident scraper returned error ${response.status}: ${errText}. Running local sync.`,
          );
        }
      } catch (err) {
        console.error(
          "[CRON] Error connecting to backend for scraping. Running local sync:",
          err,
        );
      }
    }

    console.log(
      "[CRON] Executing Local Daily Incident and Compromise Scraper...",
    );
    const stats = await scrapeCyberIncidents();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      proxied,
      backend: proxied ? backendStats : null,
      ...stats,
    });
  } catch (error: any) {
    console.error("[CRON] Incident Scraper Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
