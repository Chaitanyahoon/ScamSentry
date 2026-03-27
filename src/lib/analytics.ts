import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ScanEvent {
  id?: string;
  url: string;
  finalScore: number;
  riskLevel: "Secure" | "Suspicious" | "Critical Threat";
  triggeredLayers: string[];
  layerScores: {
    heuristics: number;
    forensics: number;
    threatIntel: number;
    internalGraph: number;
  };
  timestamp: Date;
  userAgent?: string;
  ipHash?: string;
  apiKeyId?: string; // Links to api_keys collection
}

export interface AnalyticsMetrics {
  totalScans: number;
  threatsDetected: number;
  falsePositiveEstimate: number;
  averageScore: number;
  layerAccuracy: {
    heuristics: number;
    forensics: number;
    threatIntel: number;
    internalGraph: number;
  };
  topUrlPatterns: Array<{ pattern: string; count: number }>;
  scanTrend: Array<{ date: string; count: number }>;
}

export async function logScanEvent(event: ScanEvent): Promise<void> {
  try {
    await addDoc(collection(db, "scan_events"), {
      ...event,
      timestamp: Timestamp.fromDate(event.timestamp),
    });
  } catch (error) {
    console.error("Failed to log scan event:", error);
  }
}

export async function getRecentScans(apiKeyId?: string, days: number = 7): Promise<ScanEvent[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    let q = query(
      collection(db, "scan_events"),
      where("timestamp", ">=", Timestamp.fromDate(since)),
      orderBy("timestamp", "desc"),
      limit(1000),
    );

    if (apiKeyId) {
      q = query(q, where("apiKeyId", "==", apiKeyId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    } as ScanEvent));
  } catch (error) {
    console.error("Failed to fetch recent scans:", error);
    return [];
  }
}

export async function getAnalyticsMetrics(apiKeyId?: string, days: number = 30): Promise<AnalyticsMetrics> {
  try {
    const scans = await getRecentScans(apiKeyId, days);

    const totalScans = scans.length;
    const threatsDetected = scans.filter(
      (s) => s.riskLevel === "Critical Threat",
    ).length;
    const suspicious = scans.filter(
      (s) => s.riskLevel === "Suspicious",
    ).length;

    const averageScore =
      totalScans > 0 ? scans.reduce((sum, s) => sum + s.finalScore, 0) / totalScans : 0;

    // Layer accuracy: % of scans where layer triggered
    const heuristicsTriggered = scans.filter(
      (s) => s.layerScores.heuristics > 0,
    ).length;
    const forensicsTriggered = scans.filter(
      (s) => s.layerScores.forensics > 0,
    ).length;
    const threatIntelTriggered = scans.filter(
      (s) => s.layerScores.threatIntel > 0,
    ).length;
    const internalGraphTriggered = scans.filter(
      (s) => s.layerScores.internalGraph > 0,
    ).length;
    const semanticTriggered = scans.filter(
      (s) => s.layerScores.semantic > 0,
    ).length;

    // Estimate false positives (Secure scans but reviewed as suspicious)
    const falsePositiveEstimate = scans.filter(
      (s) => s.riskLevel === "Secure" && s.finalScore > 30,
    ).length;

    // Top URL patterns
    const patternMap: Record<string, number> = {};
    scans.forEach((s) => {
      try {
        const urlObj = new URL(s.url);
        const pattern = `${urlObj.hostname.split(".").slice(-2).join(".")}`;
        patternMap[pattern] = (patternMap[pattern] || 0) + 1;
      } catch {
        patternMap["invalid"] = (patternMap["invalid"] || 0) + 1;
      }
    });

    const topUrlPatterns = Object.entries(patternMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));

    // Scan trend by day
    const trendMap: Record<string, number> = {};
    scans.forEach((s) => {
      const date = s.timestamp.toISOString().split("T")[0];
      trendMap[date] = (trendMap[date] || 0) + 1;
    });

    const scanTrend = Object.entries(trendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return {
      totalScans,
      threatsDetected,
      falsePositiveEstimate,
      averageScore,
      layerAccuracy: {
        heuristics: totalScans > 0 ? (heuristicsTriggered / totalScans) * 100 : 0,
        forensics: totalScans > 0 ? (forensicsTriggered / totalScans) * 100 : 0,
        threatIntel: totalScans > 0 ? (threatIntelTriggered / totalScans) * 100 : 0,
        internalGraph:
          totalScans > 0 ? (internalGraphTriggered / totalScans) * 100 : 0,
        semantic: totalScans > 0 ? (semanticTriggered / totalScans) * 100 : 0,
      },
      topUrlPatterns,
      scanTrend,
    };
  } catch (error) {
    console.error("Failed to compute analytics metrics:", error);
    return {
      totalScans: 0,
      threatsDetected: 0,
      falsePositiveEstimate: 0,
      averageScore: 0,
      layerAccuracy: {
        heuristics: 0,
        forensics: 0,
        threatIntel: 0,
        internalGraph: 0,
        semantic: 0,
      },
      topUrlPatterns: [],
      scanTrend: [],
    };
  }
}
