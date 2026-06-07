"""
ScamSentry API — Global Incident & Compromise Scraper Service
"""

from __future__ import annotations

import email.utils
import logging
import re
import uuid
import xml.etree.ElementTree as ET
from datetime import UTC, datetime, timedelta
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

from app.models.incident import BrandLockdown, Incident
from app.models.ledger import LedgerEntry

logger = logging.getLogger(__name__)

ADVISORY_FEEDS = [
    {"url": "https://www.bleepingcomputer.com/feed/", "name": "BleepingComputer"},
    {"url": "https://feeds.feedburner.com/TheHackersNews", "name": "The Hacker News"},
    {"url": "https://krebsonsecurity.com/feed/", "name": "Krebs on Security"},
]

MONITORED_BRANDS = [
    "vercel",
    "github",
    "paypal",
    "paytm",
    "india",
    "amazon",
    "netflix",
    "google",
    "microsoft",
    "apple",
    "facebook",
    "phonepe",
    "sbi",
    "hdfc",
    "uber",
    "tesla",
    "openai",
    "linkedin",
    "twitter",
    "x.com",
    "whatsapp",
    "telegram",
    "discord",
]

HIGHLIGHT_KEYWORDS = [
    "critical",
    "major",
    "zero-day",
    "zero day",
    "massive",
    "hacked",
    "compromised",
    "ransomware",
    "breach",
    "vulnerability",
    "exploit",
    "cve",
    "supply chain",
    "backdoor",
    "data leak",
    "phishing",
    "fraud",
    "vercel",
    "github",
    "paytm",
    "india",
    "microsoft",
]

COMPROMISE_KEYWORDS = [
    "hack",
    "breach",
    "phish",
    "scam",
    "spoof",
    "exploit",
    "leak",
    "compromise",
]


async def generate_reports_from_incidents(db) -> dict:
    """Auto-generate ledger entries from highlighted incidents in the last 24h."""
    reports_generated = 0
    cutoff = datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=24)

    try:
        stmt = select(Incident).where(
            Incident.is_highlight, Incident.created_at >= cutoff
        )
        res = await db.execute(stmt)
        incidents = res.scalars().all()

        for incident in incidents:
            t_url = incident.link
            try:
                parsed = urlparse(t_url if "://" in t_url else f"http://{t_url}")
                domain = (parsed.hostname or "").lower().strip()
                if not domain:
                    continue

                stmt_ledger = select(LedgerEntry).where(LedgerEntry.domain == domain)
                res_ledger = await db.execute(stmt_ledger)
                existing = res_ledger.scalar_one_or_none()

                if existing is None:
                    entry = LedgerEntry(
                        id=uuid.uuid4(),
                        domain=domain,
                        threat_type="malware",
                        confidence=90,
                        source=f"OSINT Incident Scraper ({incident.source})",
                        reported_at=datetime.now(UTC),
                        verified=True,
                    )
                    db.add(entry)
                    reports_generated += 1
            except Exception:
                continue

        if reports_generated > 0:
            await db.commit()

    except Exception as exc:
        logger.error(
            "Failed to generate reports from incidents: %s", exc, exc_info=True
        )

    return {"reports_generated": reports_generated}


async def scrape_cyber_incidents(db) -> dict:
    """Scrape cybersecurity advisory feeds and provision brand lockdowns."""
    stats = {
        "processed": 0,
        "lockdowns_triggered": 0,
        "reports_generated": 0,
        "errors": 0,
    }

    headers = {"User-Agent": "Mozilla/5.0 (ScamSentry-Advisory-Scraper/2.5)"}

    for feed in ADVISORY_FEEDS:
        try:
            logger.info("Fetching advisory feed: %s...", feed["name"])
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(feed["url"], headers=headers)

            if res.status_code != 200:
                logger.warning(
                    "Failed to fetch %s: HTTP %d", feed["name"], res.status_code
                )
                stats["errors"] += 1
                continue

            # Parse XML
            xml_data = res.content
            # Use ElementTree on raw bytes to handle encoding declarations
            root = ET.fromstring(xml_data)

            items = root.findall(".//item")
            logger.info("Parsing %d items from %s...", len(items), feed["name"])

            for item in items[:20]:  # Cap at top 20 items to stay lightweight
                title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                description = (item.findtext("description") or "").strip()
                pub_date_str = (item.findtext("pubDate") or "").strip()

                if not title or not link:
                    continue

                # Clean CDATA markers if present
                title = re.sub(r"<!\[CDATA\[([\s\S]*?)\]\]>", r"\1", title).strip()
                link = re.sub(r"<!\[CDATA\[([\s\S]*?)\]\]>", r"\1", link).strip()
                description = re.sub(
                    r"<!\[CDATA\[([\s\S]*?)\]\]>", r"\1", description
                ).strip()

                # Parse pubDate
                published_at = datetime.now(UTC).replace(tzinfo=None)
                if pub_date_str:
                    try:
                        dt = email.utils.parsedate_to_datetime(pub_date_str)
                        published_at = dt.astimezone(UTC).replace(tzinfo=None)
                    except Exception:
                        pass

                scan_text = f"{title} {description}".lower()
                is_highlight = any(kw in scan_text for kw in HIGHLIGHT_KEYWORDS)

                # Check duplicate by link
                stmt = select(Incident).where(Incident.link == link)
                res_inc = await db.execute(stmt)
                existing_inc = res_inc.scalar_one_or_none()

                if existing_inc is None:
                    incident = Incident(
                        id=uuid.uuid4(),
                        title=title,
                        link=link,
                        description=description[:300] + "..."
                        if len(description) > 300
                        else description,
                        published_at=published_at,
                        source=feed["name"],
                        is_highlight=is_highlight,
                        created_at=datetime.now(UTC).replace(tzinfo=None),
                    )
                    db.add(incident)
                    stats["processed"] += 1
                else:
                    incident = existing_inc

                # Monitored brand audit
                for brand in MONITORED_BRANDS:
                    has_brand = brand in scan_text
                    is_compromised = any(kw in scan_text for kw in COMPROMISE_KEYWORDS)

                    if has_brand and is_compromised:
                        expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(
                            days=7
                        )

                        stmt_lock = select(BrandLockdown).where(
                            BrandLockdown.brand_name == brand
                        )
                        res_lock = await db.execute(stmt_lock)
                        existing_lock = res_lock.scalar_one_or_none()

                        if existing_lock is None:
                            lockdown = BrandLockdown(
                                brand_name=brand,
                                incident_title=title,
                                incident_link=link,
                                reported_at=published_at,
                                expires_at=expires_at,
                                is_active=True,
                            )
                            db.add(lockdown)
                            logger.warning(
                                "🚨 BRAND LOCKDOWN ACTIVE: '%s' due to: %s",
                                brand.upper(),
                                title,
                            )
                            stats["lockdowns_triggered"] += 1
                        else:
                            existing_lock.incident_title = title
                            existing_lock.incident_link = link
                            existing_lock.reported_at = published_at
                            existing_lock.expires_at = expires_at
                            existing_lock.is_active = True

            await db.commit()

        except Exception as exc:
            logger.error("Failed parsing feed %s: %s", feed["name"], exc, exc_info=True)
            stats["errors"] += 1

    reports_stats = await generate_reports_from_incidents(db)
    stats["reports_generated"] = reports_stats["reports_generated"]

    return stats
