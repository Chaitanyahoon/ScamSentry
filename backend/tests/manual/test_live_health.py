import httpx

try:
    res = httpx.get("https://scamsentry-backend-j7a8.onrender.com/health", timeout=10.0)
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print("Error:", e)
