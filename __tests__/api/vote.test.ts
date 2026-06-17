jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
  },
}));

import { POST } from "@/app/api/validator/vote/route";
import { NextResponse } from "next/server";

describe("POST /api/validator/vote", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BACKEND_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("should return 400 if url or vote is missing", async () => {
    const req = {
      json: async () => ({}),
    } as unknown as Request;

    const res: any = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid request payload");
  });

  it("should return mock success if backend URL is not configured", async () => {
    const req = {
      json: async () => ({ url: "https://test-site.xyz", vote: "unsafe" }),
    } as unknown as Request;

    const res: any = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("Vote recorded locally");
  });
});
