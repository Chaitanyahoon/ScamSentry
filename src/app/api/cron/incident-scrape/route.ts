import { NextResponse } from "next/server";
import { scrapeCyberIncidents } from "@/lib/services/incident-scraper";
import { isFirebaseAdminAvailable } from "@/lib/firebase-admin";

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

    console.log("[CRON] Executing Incident Scraper...");

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

    if (backendUrl) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const response = await fetch(
          `${backendUrl}/api/v1/admin/scrape-incidents?background=true`,
          {
            method: "POST",
            headers: {
              "X-Admin-Key": process.env.API_SECRET_KEY || "",
            },
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const backendStats = await response.json();
          return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            proxied: true,
            backend: backendStats,
            message: "Incident scraping triggered asynchronously on backend.",
          });
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(
          `[CRON] Backend unavailable (${err.name || "Error"}), evaluating local execution.`,
        );
      }
    }

    if (!isFirebaseAdminAvailable()) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Firebase Admin is not configured. Local cron skipped safely.",
      });
    }

    console.log("[CRON] Executing Local Incident Scraper...");
    const stats = await scrapeCyberIncidents();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      proxied: false,
      backend: null,
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
