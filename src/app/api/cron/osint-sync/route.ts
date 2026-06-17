import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

// Force dynamic execution for API route
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");
    const authHeader = req.headers.get("authorization");

    const isAuthHeaderValid =
      authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isQuerySecretValid = querySecret === process.env.CRON_SECRET;

    if (!isAuthHeaderValid && !isQuerySecretValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    const response = await fetch(
      "https://urlhaus-api.abuse.ch/v1/urls/recent/",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      },
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: true,
          processed: 0,
          inserted: 0,
          message: `OSINT feed auth returned ${response.status}, skip run`,
        });
      }
      throw new Error(`OSINT feed returned status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.urls || !Array.isArray(data.urls)) {
      throw new Error(`Unexpected OSINT payload structure`);
    }

    const recentOnlineThreats = data.urls
      .filter((t: any) => t.url_status === "online")
      .slice(0, 100);

    if (recentOnlineThreats.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No active threats found",
      });
    }

    const adminDb = getAdminDb();

    const existingSnapshot = await adminDb
      .collection("scam_reports")
      .where("company", "==", "OSINT Threat Feed")
      .orderBy("created_at", "desc")
      .limit(500)
      .get();

    const existingUrls = new Set<string>();

    existingSnapshot.forEach((doc) => {
      const reportData = doc.data();
      const title = reportData.title || "";
      if (title.startsWith("OSINT: ")) {
        existingUrls.add(title.replace("OSINT: ", "").trim());
      }
    });

    const batch = adminDb.batch();
    let insertCount = 0;

    for (const threat of recentOnlineThreats) {
      if (!existingUrls.has(threat.url)) {
        const newDocRef = adminDb.collection("scam_reports").doc();

        let hostname = threat.url;
        try {
          new URL(threat.url);
        } catch (e) {}

        const reportData: Record<string, any> = {
          title: `OSINT: ${threat.url}`,
          company: "OSINT Threat Feed",
          scam_type: "Malware / Phishing",
          industry: "Cybersecurity",
          location: "Global",
          city: "Global",
          state: "INT",
          country: "WWW",
          lat: null,
          lng: null,
          description: `Automatically flagged by OSINT blocklists via URLhaus. \nThreat Type: ${threat.threat} \nTags: ${threat.tags ? threat.tags.join(", ") : "None"} \nReporter: ${threat.reporter}`,
          tags: ["osint", "automated-feed", threat.threat],
          anonymous: true,
          email: null,
          risk_level: "high",
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          helpful_votes: 0,
          flag_count: 0,
          views: 0,
          trust_score: 0,
          status: "approved",
          evidence_urls: [threat.url],
        };

        batch.set(newDocRef, reportData);
        insertCount++;
      }
    }

    if (insertCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      processed: recentOnlineThreats.length,
      inserted: insertCount,
    });
  } catch (error: any) {
    console.error("OSINT Cron Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
