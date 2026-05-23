/**
 * ScamSentry Global Incident & Compromise Scraper
 * 
 * Scrapes cybersecurity incident bulletins from leading news portals (BleepingComputer RSS),
 * parses brand names under active exploit, and provisions temporary brand lockdown forensices.
 * 
 * 100% Offline-safe, zero-dependency regular-expression XML parser.
 */

import { getAdminDb } from "../firebase-admin";

const ADVISORY_FEED_URL = "https://www.bleepingcomputer.com/feed/";

const MONITORED_BRANDS = [
  "vercel",
  "github",
  "paypal",
  "paytm",
  "india",
  "amazon",
  "netflix",
  "google",
  "microsoft",
  "apple",
  "facebook"
];

export interface IncidentAlert {
  title: string;
  link: string;
  description: string;
  publishedAt: Date;
  source: string;
  isHighlight: boolean;
}

export async function scrapeCyberIncidents() {
  const stats = {
    processed: 0,
    lockdownsTriggered: 0,
    errors: 0
  };

  try {
    let db;
    try {
      db = getAdminDb();
    } catch (e) {
      console.warn("[INCIDENT_SCRAPER] Graceful skip: Firebase Admin not configured.");
      return stats;
    }

    console.log("[INCIDENT_SCRAPER] Fetching cybersecurity advisory feed...");
    const res = await fetch(ADVISORY_FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (ScamSentry-Advisory-Scraper/2.5)" }
    });

    if (!res.ok) {
      throw new Error(`Feed fetch returned status: ${res.status}`);
    }

    const xmlText = await res.text();
    
    // Parse items using zero-dependency Regex
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const cleanCdata = (str: string) => str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();

    console.log(`[INCIDENT_SCRAPER] Parsing ${itemMatches.length} advisory reports...`);

    const activeLockdownsCol = db.collection("active_brand_lockdowns");
    const incidentsCol = db.collection("global_incidents");

    for (const itemXml of itemMatches.slice(0, 15)) { // Keep to top 15 recent to fit memory/time quotas
      const rawTitle = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
      const rawLink = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
      const rawDesc = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
      const rawPubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";

      const title = cleanCdata(rawTitle);
      const link = cleanCdata(rawLink);
      const description = cleanCdata(rawDesc);
      const publishedAt = rawPubDate ? new Date(rawPubDate) : new Date();

      if (!title || !link) continue;

      const docId = Buffer.from(link).toString("base64").substring(0, 50).replace(/\+/g, "-").replace(/\//g, "_");

      const scanText = `${title} ${description}`.toLowerCase();

      // Determine if this is a major highlighted incident (Critical/Major/Compromise keywords or high-value brands)
      const isHighlight = 
        scanText.includes("critical") || 
        scanText.includes("major") || 
        scanText.includes("zero-day") || 
        scanText.includes("zero day") || 
        scanText.includes("massive") || 
        scanText.includes("hacked") || 
        scanText.includes("compromised") ||
        scanText.includes("vercel") || 
        scanText.includes("github") || 
        scanText.includes("paytm") || 
        scanText.includes("india") || 
        scanText.includes("microsoft");

      // Save to general incidents database
      await incidentsCol.doc(docId).set({
        title,
        link,
        description: description.substring(0, 300) + "...", // Cap size
        publishedAt,
        source: "BleepingComputer",
        isHighlight,
        createdAt: new Date()
      });

      stats.processed++;
      
      for (const brand of MONITORED_BRANDS) {
        // Look for keywords: brand name AND compromise terms
        const hasBrand = scanText.includes(brand);
        const isCompromised = 
          scanText.includes("hack") || 
          scanText.includes("breach") || 
          scanText.includes("phish") || 
          scanText.includes("scam") || 
          scanText.includes("spoof") || 
          scanText.includes("exploit") || 
          scanText.includes("leak") || 
          scanText.includes("compromise");

        if (hasBrand && isCompromised) {
          // Trigger a 7-day brand lockdown
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          
          await activeLockdownsCol.doc(brand).set({
            brandName: brand,
            incidentTitle: title,
            incidentLink: link,
            reportedAt: publishedAt,
            expiresAt,
            isActive: true
          });

          console.log(`[INCIDENT_SCRAPER] 🚨 BRAND LOCKDOWN ACTIVE: '${brand.toUpperCase()}' due to incident: "${title}"`);
          stats.lockdownsTriggered++;
        }
      }
    }

    return stats;
  } catch (error) {
    console.error("[INCIDENT_SCRAPER] Scraping advisor crash:", error);
    stats.errors++;
    return stats;
  }
}

/**
 * Fetch the currently locked down brands from Firestore
 */
export async function getActiveBrandLockdowns(): Promise<string[]> {
  try {
    const db = getAdminDb();
    const now = new Date();
    const snapshot = await db.collection("active_brand_lockdowns")
      .where("expiresAt", ">", now)
      .where("isActive", "==", true)
      .get();

    return snapshot.docs.map(doc => doc.data().brandName) as string[];
  } catch (e) {
    console.error("[INCIDENT_SCRAPER] Failed to query brand lockdowns:", e);
    return [];
  }
}

/**
 * Fetch recent global incidents to display
 */
export async function getRecentIncidents(limit: number = 10): Promise<IncidentAlert[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("global_incidents")
      .orderBy("publishedAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: data.title,
        link: data.link,
        description: data.description,
        publishedAt: data.publishedAt.toDate(),
        source: data.source,
        isHighlight: data.isHighlight || false
      };
    }) as IncidentAlert[];
  } catch (e) {
    console.error("[INCIDENT_SCRAPER] Failed to fetch incidents:", e);
    return [];
  }
}
