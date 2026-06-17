"""Tests for app.utils.domain."""

from app.utils.domain import extract_domain


def test_extract_domain_full_url() -> None:
    assert extract_domain("https://www.example.com/path?q=1") == "www.example.com"


def test_extract_domain_no_scheme() -> None:
    assert extract_domain("example.com/path") == "example.com"


def test_extract_domain_with_port() -> None:
    assert extract_domain("http://localhost:8080/test") == "localhost"


def test_extract_domain_ip_address() -> None:
    assert extract_domain("http://192.168.1.1/admin") == "192.168.1.1"


def test_extract_domain_empty_string() -> None:
    assert extract_domain("") == ""


def test_extract_domain_invalid_string() -> None:
    assert extract_domain("not-a-url") == "not-a-url"


def test_extract_domain_subdomain() -> None:
    assert (
        extract_domain("https://sub.domain.example.com/page")
        == "sub.domain.example.com"
    )


def test_extract_domain_uppercase() -> None:
    assert extract_domain("HTTPS://EXAMPLE.COM") == "example.com"
