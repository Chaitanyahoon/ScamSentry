import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandName, webhookUrl, apiKey } = body;

    if (!brandName || !webhookUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (apiKey !== process.env.SCAM_SENTRY_B2B_KEY) {
      return NextResponse.json(
        { error: "Unauthorized B2B access" },
        { status: 401 },
      );
    }

    const adminDb = getAdminDb();
    const monitorRef = adminDb.collection("brand_monitoring");

    const existing = await monitorRef
      .where("brandName", "==", brandName.toLowerCase())
      .where("webhookUrl", "==", webhookUrl)
      .get();

    if (!existing.empty) {
      return NextResponse.json({
        message: "Monitoring already active for this endpoint",
      });
    }

    const docRef = await monitorRef.add({
      brandName: brandName.toLowerCase(),
      webhookUrl,
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      monitoringId: docRef.id,
      message: `ScamSentry is now monitoring global feeds for spoofing of '${brandName}'`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
