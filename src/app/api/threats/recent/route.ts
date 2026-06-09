import { NextResponse } from "next/server";
import { getRecentThreats } from "@/lib/services/osint-sync";
import {
  getRecentIncidents,
  getActiveBrandLockdowns,
} from "@/lib/services/incident-scraper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch latest 15 threats for the public ticker
    const threats = await getRecentThreats(15);

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    let incidents = [];
    let lockdowns = [];
    let fetchedFromBackend = false;

    if (backendUrl) {
      try {
        console.log(
          `[API] Fetching incidents and brand-lockdowns from FastAPI backend: ${backendUrl}`,
        );
        const [incidentsRes, lockdownsRes] = await Promise.all([
          fetch(`${backendUrl}/api/v1/incidents?limit=30`, {
            next: { revalidate: 30 },
          }),
          fetch(`${backendUrl}/api/v1/brand-lockdowns`, {
            next: { revalidate: 30 },
          }),
        ]);

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
          console.log(
            `[API] Successfully fetched ${incidents.length} incidents and ${lockdowns.length} lockdowns from backend.`,
          );
        } else {
          console.warn(
            `[API] Backend returned errors: incidents Status=${incidentsRes.status}, lockdowns Status=${lockdownsRes.status}`,
          );
        }
      } catch (err) {
        console.error(
          "[API] Error fetching threat data from backend, falling back to Firestore:",
          err,
        );
      }
    }

    if (!fetchedFromBackend) {
      // Fetch latest 30 cybersecurity incidents from Firestore
      incidents = await getRecentIncidents(30).catch(() => []);

      // Fetch active brand lockdowns from Firestore
      lockdowns = await getActiveBrandLockdowns().catch(() => []);
    }

    return NextResponse.json(
      { threats, incidents, lockdowns },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("[API] Recent Threats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch threats" },
      { status: 500 },
    );
  }
}
