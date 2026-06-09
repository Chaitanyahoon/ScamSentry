import httpx


def test():
    urls = [
        "https://amazon-secure-login.com",
        "https://google.com",
        "careers-apple@gmail.com",
        "careers-apple-recruit.com",
    ]
    for url in urls:
        print(f"\n--- Testing: {url} ---")
        try:
            res = httpx.post(
                "http://localhost:3000/api/validator", json={"input": url}, timeout=10.0
            )
            print(f"Status: {res.status_code}")
            print(res.json())
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    test()
