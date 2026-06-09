import httpx


def test():
    urls = ["https://amazon-secure-login.com", "https://google.com"]
    backend_url = "http://localhost:8000"
    for url in urls:
        print(f"\n--- Testing Local Backend: {url} ---")
        try:
            res = httpx.post(
                f"{backend_url}/api/v1/scan", json={"url": url}, timeout=30.0
            )
            print(f"Status: {res.status_code}")
            try:
                print(res.json())
            except Exception:
                print("Raw response:")
                print(res.text)
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    test()
