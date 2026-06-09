import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify User Session / ID Token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Missing authorization token." },
        { status: 401 },
      );
    }

    try {
      await getAdminAuth().verifyIdToken(token);
    } catch (authErr: any) {
      return NextResponse.json(
        {
          error: "Unauthorized. Invalid authorization token.",
          details: authErr.message,
        },
        { status: 401 },
      );
    }

    // 2. Parse Body
    const body = await req.json().catch(() => null);
    if (!body || !body.webhookUrl || !body.alertType || !body.targetBrand) {
      return NextResponse.json(
        {
          error: "Missing required fields: webhookUrl, alertType, targetBrand",
        },
        { status: 400 },
      );
    }

    const { webhookUrl, alertType, targetBrand } = body;

    // 3. Construct Simulated Payload
    const payload = {
      alertType,
      severity: "HIGH",
      targetBrand,
      maliciousUrl: `https://${targetBrand}-security-alert-resolve.cc`,
      fingerprint:
        "fc7a8" + Math.random().toString(16).substring(2, 10) + "e921b",
      detectedAt: new Date().toISOString(),
      forensicSummary: [
        `CRITICAL: New domain age registered in suspicious offshore namespace.`,
        `Suspicious: Domain missing active SPF and DMARC protection records.`,
      ],
    };

    const webhookBody = {
      event: "threat.detected",
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // 4. Dispatch simulated webhook from server-side
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    let response;
    try {
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ScamSentry-Forensic-Dispatcher-Simulator/1.0",
        },
        body: JSON.stringify(webhookBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json({
          success: false,
          status: 408,
          statusText: "Request Timeout (8000ms limit exceeded)",
          message: "The server failed to respond within the 8 second timeout.",
        });
      }
      return NextResponse.json({
        success: false,
        status: 502,
        statusText: "Bad Gateway / Connection Error",
        message:
          fetchErr.message ||
          "Failed to resolve or connect to the target host.",
      });
    }

    const responseText = await response.text().catch(() => "");

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.substring(0, 1000), // Truncate response body if it's too long
    });
  } catch (err: any) {
    console.error("Test Webhook Dispatch Server Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 },
    );
  }
}
