import { getAdminDb } from "../firebase-admin";

export async function analyzeInternalGraph(inputUrl: string) {
  let score = 0;
  const flags: string[] = [];

  let urlObj;
  try {
    urlObj = new URL(
      inputUrl.startsWith("http") ? inputUrl : `http://${inputUrl}`,
    );
  } catch (e) {
    return { score: 0, flags: [] };
  }

  const domain = urlObj.hostname;

  try {
    const db = getAdminDb();
    const reportsRef = db.collection("scam_reports");
    const snapshot = await reportsRef
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    let matchedEntities = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const reportText =
        `${data.title} ${data.description} ${data.company} ${data.url || ""}`.toLowerCase();

      if (reportText.includes(domain.toLowerCase())) {
        matchedEntities++;
        flags.push(
          `CRITICAL: Domain '${domain}' matches a previously reported scam in the ScamSentry database.`,
        );
      }
    });

    if (matchedEntities > 0) {
      score += 85; // High confidence flag
    } else {
      flags.push(
        "Internal Database: Origin domain has no community scam reports.",
      );
    }
  } catch (error) {
    flags.push(
      "Internal Database: Cross-reference failed due to database connection error.",
    );
  }

  return {
    score: Math.min(score, 100),
    flags,
  };
}
