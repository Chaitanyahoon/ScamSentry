import urllib.request
import json

url = "https://scam-sentry.app/api/v1/verify?domain=google.com"
# Let's check both .app and .vercel.app
endpoints = {
    "Vercel Deployment Proxy": "https://scam-sentry.vercel.app/api/v1/verify?domain=google.com",
    "Render FastAPI Direct Engine": "https://scamsentry-backend-j7a8.onrender.com/api/v1/scan",
}

print("=== Starting ScamSentry Proxy & Backend Verification Check ===")

# Test 1: Direct Backend Engine (needs POST request with URL payload)
print("\n--- Testing Render FastAPI Direct Engine ---")
try:
    post_data = json.dumps({"url": "http://google.com"}).encode("utf-8")
    req = urllib.request.Request(
        endpoints["Render FastAPI Direct Engine"],
        data=post_data,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=12.0) as response:
        print(f"Status Code: {response.status}")
        body = response.read().decode("utf-8")
        data = json.loads(body)
        print(f"Direct Engine Response: Success (Risk Score: {data.get('risk_score')})")
except Exception as e:
    print(f"Direct Engine Error: {e}")

# Test 2: Vercel Proxy (needs x-api-key header)
print("\n--- Testing Vercel Deployment Proxy ---")
try:
    req = urllib.request.Request(
        endpoints["Vercel Deployment Proxy"],
        headers={"x-api-key": "ss_ext_public_v1", "User-Agent": "Mozilla/5.0"},
    )
    with urllib.request.urlopen(req, timeout=12.0) as response:
        print(f"Status Code: {response.status}")
        body = response.read().decode("utf-8")
        data = json.loads(body)
        print(
            f"Proxy Response: Success (Trust Score: {data.get('data', {}).get('trustScore')})"
        )
except Exception as e:
    print(f"Proxy Error: {e}")

print("\n=== Check Complete ===")
