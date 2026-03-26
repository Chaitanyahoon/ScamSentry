import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, query, where, orderBy, limit } from 'firebase/firestore';

// Force dynamic execution for API route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Authorization strictly gated to Vercel Cron or specific Admin secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Fetch from URLhaus OSINT API
    // We use the recent API which returns the most recent active threats
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      // If external OSINT provider is blocked / unavailable, skip this run.
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: true,
          processed: 0,
          inserted: 0,
          message: `OSINT feed auth returned ${response.status}, skip run`
        });
      }
      throw new Error(`OSINT feed returned status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.urls || !Array.isArray(data.urls)) {
       throw new Error(`Unexpected OSINT payload structure`);
    }

    // We only take the top 100 recent online threats to prevent blowing up the free-tier DB quota 
    // and staying well within the Firestore 500 document batch limit.
    const recentOnlineThreats = data.urls
       .filter((t: any) => t.url_status === 'online')
       .slice(0, 100);

    if (recentOnlineThreats.length === 0) {
       return NextResponse.json({ success: true, processed: 0, message: "No active threats found" });
    }

    // 3. Prevent Duplicates
    // Fetch recent OSINT reports from our DB to cross-check.
    const q = query(
      collection(db, "scam_reports"),
      where("company", "==", "OSINT Threat Feed"),
      orderBy("created_at", "desc"),
      limit(500)
    );
    const existingSnapshot = await getDocs(q);
    const existingUrls = new Set();
    
    existingSnapshot.forEach(doc => {
       const reportData = doc.data();
       // We store the raw URL in the title or a custom field. We'll extract it from the title.
       // Title format: "OSINT: {url}"
       const title = reportData.title || "";
       if (title.startsWith("OSINT: ")) {
          existingUrls.add(title.replace("OSINT: ", "").trim());
       }
    });

    // 4. Batch Insert New Threats
    const batch = writeBatch(db);
    let insertCount = 0;

    for (const threat of recentOnlineThreats) {
      if (!existingUrls.has(threat.url)) {
        const newDocRef = doc(collection(db, "scam_reports"));
        
        let urlObj;
        let hostname = threat.url;
        try {
           urlObj = new URL(threat.url);
           hostname = urlObj.hostname;
        } catch(e) {}

        const reportData = {
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
          description: `Automatically flagged by OSINT blocklists via URLhaus. \nThreat Type: ${threat.threat} \nTags: ${threat.tags ? threat.tags.join(', ') : 'None'} \nReporter: ${threat.reporter}`,
          tags: ["osint", "automated-feed", threat.threat],
          anonymous: true,
          email: null,
          risk_level: "high",
          created_at: new Date(),
          helpful_votes: 0,
          flag_count: 0,
          views: 0,
          trust_score: 0, // 0 trust means highly dangerous
          status: "approved",
          evidence_urls: [threat.url]
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
      inserted: insertCount
    });

  } catch (error: any) {
    console.error('OSINT Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
