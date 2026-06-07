import httpx
import time

BASE_URL = "http://localhost:8000"
ADMIN_KEY = "test-admin-secret-key-12345"

def test_api():
    print("=== Testing ScamSentry Local API Server ===")
    
    # 1. Health check
    print("\n1. GET /health:")
    resp = httpx.get(f"{BASE_URL}/health")
    print(resp.status_code, resp.json())
    assert resp.status_code == 200
    
    # Generate dynamic .com domain to avoid duplicate entries and DNS hangs (typical of .tk)
    timestamp = int(time.time())
    domain = f"free-job-urgent-offer-verify-now-{timestamp}.com"
    
    # 2. Add verified ledger entry
    print(f"\n2. POST /api/v1/admin/ledger (domain={domain}):")
    payload = {
        "domain": domain,
        "threat_type": "phishing",
        "confidence": 95,
        "source": "admin"
    }
    headers = {"X-Admin-Key": ADMIN_KEY}
    resp = httpx.post(f"{BASE_URL}/api/v1/admin/ledger", json=payload, headers=headers)
    print(resp.status_code, resp.json())
    assert resp.status_code == 200
    
    # 3. Submit scan for a URL targeting the ledger domain (with an increased timeout for WHOIS and SSL lookups)
    print("\n3. POST /api/v1/scan:")
    payload = {"url": f"https://sub.{domain}/login.html"}
    resp = httpx.post(f"{BASE_URL}/api/v1/scan", json=payload, timeout=15.0)
    print(resp.status_code, resp.json())
    assert resp.status_code == 200
    
    # 4. Get report summary
    print("\n4. GET /api/v1/report/summary:")
    resp = httpx.get(f"{BASE_URL}/api/v1/report/summary")
    print(resp.status_code, resp.json())
    assert resp.status_code == 200
    summary = resp.json()
    assert summary["total_scans"] >= 1
    
    # 5. Get hotspots report
    print("\n5. GET /api/v1/report/hotspots:")
    resp = httpx.get(f"{BASE_URL}/api/v1/report/hotspots")
    print(resp.status_code, resp.json())
    assert resp.status_code == 200
    hotspots = resp.json()["hotspots"]
    assert len(hotspots) >= 1
    
    # Verify that our newly inserted domain is present in hotspots
    domains = [h["domain"] for h in hotspots]
    assert domain in domains
    
    print("\n=== All Local API Server Tests Passed! ===")

if __name__ == "__main__":
    # Wait for server process to load up
    time.sleep(1)
    test_api()
