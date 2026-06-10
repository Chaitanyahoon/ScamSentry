import urllib.request
import urllib.error

url = "https://scamsentry-backend-j7a8.onrender.com/health?format=text"
print(f"Requesting: {url}")

try:
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req, timeout=12.0) as response:
        status = response.status
        headers = dict(response.info())
        body = response.read()
        print(f"Status Code: {status}")
        print("Response Headers:")
        for k, v in headers.items():
            print(f"  {k}: {v}")
        print(f"Response Body (bytes): {body}")
        print(f"Response Body (string): '{body.decode('utf-8')}'")
        print(f"Response Size: {len(body)} bytes")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    print(e.read().decode('utf-8')[:300])
except Exception as e:
    print(f"Error: {e}")
