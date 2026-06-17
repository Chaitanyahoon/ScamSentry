import urllib.request
import urllib.error
import json

url = "https://scamsentry-backend-j7a8.onrender.com/api/v1/scan"
payload = json.dumps({"url": "http://google.com"}).encode("utf-8")

print(f"Requesting: {url} with payload {payload}")

try:
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=12.0) as response:
        print(f"Success! Status: {response.status}")
        print(response.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    try:
        body = e.read().decode("utf-8")
        print("Response Body:")
        print(body)
    except Exception as read_exc:
        print(f"Could not read body: {read_exc}")
except Exception as e:
    print(f"Error: {e}")
