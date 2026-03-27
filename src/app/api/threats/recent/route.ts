import { NextResponse } from "next/server";
import { getRecentThreats } from "@/lib/services/osint-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch latest 15 threats for the public ticker
    const threats = await getRecentThreats(15);
    
    return NextResponse.json(threats, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("[API] Recent Threats Error:", error);
    return NextResponse.json({ error: "Failed to fetch threats" }, { status: 500 });
  }
}
