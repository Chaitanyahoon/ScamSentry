import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.url || !body.vote) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected { 'url': 'string', 'vote': 'string' }" },
        { status: 400 },
      );
    }

    const { url, vote } = body;

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

    if (backendUrl) {
      try {
        const backendResponse = await fetch(`${backendUrl}/api/v1/scan/vote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, vote }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          return NextResponse.json(data, { status: 200 });
        } else {
          const errText = await backendResponse.text();
          return NextResponse.json(
            { error: `Backend error: ${errText}` },
            { status: backendResponse.status },
          );
        }
      } catch (err: any) {
        console.error("Error proxying vote to backend:", err);
        return NextResponse.json(
          { error: "Failed to connect to backend", details: err.message },
          { status: 502 },
        );
      }
    }

    // Local / Firestore Fallback: mock response
    return NextResponse.json(
      {
        success: true,
        message: "Vote recorded locally (mock database state).",
        domain: url,
        confidence: 10,
        verified: false,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Voting API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
