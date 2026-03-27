import { db } from "./firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export interface WebhookPayload {
  alertType: "TYPOSQUAT" | "PHISHING" | "BRAND_MIMICRY"
  severity: "HIGH" | "CRITICAL"
  targetBrand: string
  maliciousUrl: string
  fingerprint: string
  detectedAt: string
  forensicSummary: string[]
}

export async function dispatchBrandAlert(brandName: string, payload: WebhookPayload) {
  try {
    // 1. Find all subscribers for this brand
    const brandsRef = collection(db, "brand_monitoring")
    const q = query(brandsRef, where("brandName", "==", brandName.toLowerCase()))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return

    const subscribers = snapshot.docs.map(doc => doc.data())

    // 2. Dispatch to each webhook
    const dispatchPromises = subscribers.map(async (sub) => {
      if (!sub.webhookUrl) return

      try {
        const response = await fetch(sub.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ScamSentry-Forensic-Dispatcher/1.0",
            "X-ScamSentry-Signature": payload.fingerprint // For B2B verification
          },
          body: JSON.stringify({
            event: "threat.detected",
            timestamp: new Date().toISOString(),
            data: payload
          }),
        })

        if (!response.ok) {
          console.error(`Webhook dispatch failed for ${sub.webhookUrl}: ${response.statusText}`)
        }
      } catch (e) {
        console.error(`Webhook network error for ${sub.webhookUrl}:`, e)
      }
    })

    await Promise.all(dispatchPromises)
  } catch (error) {
    console.error("Critical error in Brand Alert Dispatcher:", error)
  }
}
