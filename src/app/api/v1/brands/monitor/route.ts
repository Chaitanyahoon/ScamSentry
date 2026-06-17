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

    try {
      const parsedUrl = new URL(webhookUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Invalid webhook protocol (HTTP/HTTPS only)" },
          { status: 400 },
        );
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname === "0.0.0.0" ||
        hostname === "169.254.169.254"
      ) {
        return NextResponse.json(
          { error: "SSRF prevention: Invalid webhook URL" },
          { status: 400 },
        );
      }

      const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const match = hostname.match(ipv4Pattern);
      if (match) {
        const [, p1, p2] = match.map(Number);
        if (
          p1 === 10 ||
          (p1 === 172 && p2 >= 16 && p2 <= 31) ||
          (p1 === 192 && p2 === 168) ||
          (p1 === 169 && p2 === 254)
        ) {
          return NextResponse.json(
            { error: "SSRF prevention: Private IPv4 ranges are blocked" },
            { status: 400 },
          );
        }
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid webhook URL format" },
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
