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
    const stats = await scrapeCyberIncidents();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...stats
    });
  } catch (error: any) {
    console.error("[CRON] Incident Scraper Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
