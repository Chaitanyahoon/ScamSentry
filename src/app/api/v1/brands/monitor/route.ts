import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { brandName, webhookUrl, apiKey } = body

    if (!brandName || !webhookUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Verify API Key (Simulated B2B check)
    if (apiKey !== process.env.SCAM_SENTRY_B2B_KEY) {
      return NextResponse.json({ error: "Unauthorized B2B access" }, { status: 401 })
    }

    // 2. Register Monitoring Hook
    const monitorRef = collection(db, "brand_monitoring")
    
    // Check if already exists for this URL
    const q = query(monitorRef, 
      where("brandName", "==", brandName.toLowerCase()),
      where("webhookUrl", "==", webhookUrl)
    )
    const existing = await getDocs(q)
    
    if (!existing.empty) {
      return NextResponse.json({ message: "Monitoring already active for this endpoint" })
    }

    const docRef = await addDoc(monitorRef, {
      brandName: brandName.toLowerCase(),
      webhookUrl,
      status: "active",
      createdAt: Timestamp.now(),
    })

    return NextResponse.json({
      success: true,
      monitoringId: docRef.id,
      message: `ScamSentry is now monitoring global feeds for spoofing of '${brandName}'`
    })

  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
