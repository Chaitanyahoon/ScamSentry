import urllib.request
import json

url = "http://127.0.0.1:8000/api/v1/scan"
payload = json.dumps({"url": "http://google.com"}).encode('utf-8')

print(f"Requesting local scan: {url}")
try:
    req = urllib.request.Request(
        url,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=5.0) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
