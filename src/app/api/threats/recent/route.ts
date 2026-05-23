import { NextResponse } from "next/server";
import { getRecentThreats } from "@/lib/services/osint-sync";
import { getRecentIncidents, getActiveBrandLockdowns } from "@/lib/services/incident-scraper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch latest 15 threats for the public ticker
    const threats = await getRecentThreats(15);
    
    // Fetch latest 30 cybersecurity incidents
    const incidents = await getRecentIncidents(30).catch(() => []);
    
    // Fetch active brand lockdowns
    const lockdowns = await getActiveBrandLockdowns().catch(() => []);
    
    return NextResponse.json({ threats, incidents, lockdowns }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("[API] Recent Threats Error:", error);
    return NextResponse.json({ error: "Failed to fetch threats" }, { status: 500 });
  }
}

