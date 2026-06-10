"""
ScamSentry API — Detection Engine Orchestrator

Runs the 4-layer detection pipeline and aggregates results into a
final risk score (0-100) with per-layer breakdowns.

Score weighting:
    L1 (Heuristics)   — max 30
    L2 (DNS/WHOIS)    — max 25
    L3 (Threat Intel)  — max 30
    L4 (Ledger)        — max 15
    Total maximum      — 100
"""

from __future__ import annotations

import asyncio
import logging
import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.l1_heuristics import check_heuristics
from app.services.l2_dns import check_dns
from app.services.l3_threat import check_google_safe_browsing
from app.services.l4_ledger import check_ledger

logger = logging.getLogger(__name__)


def _map_risk_level(score: int) -> str:
    """Map an aggregate 0-100 risk score to a human-readable level."""
    if score <= 30:
        return "safe"
    if score <= 69:
        return "suspicious"
    return "dangerous"


async def _safe_check_dns(url: str) -> dict:
    """Safely run L2 check, catching errors."""
    try:
        return await check_dns(url)
    except Exception as exc:
        logger.warning("L2 check failed: %s", exc)
        return {"score": 0, "passed": True, "details": {"error": str(exc)}}


async def _safe_check_safe_browsing(url: str) -> dict:
    """Safely run L3 check, catching errors."""
    try:
        return await check_google_safe_browsing(url)
    except Exception as exc:
        logger.warning("L3 check failed: %s", exc)
        return {"score": 0, "passed": True, "details": {"error": str(exc)}}


async def _safe_check_ledger(url: str, db: AsyncSession | None) -> dict:
    """Safely run L4 check, catching errors."""
    if db is None:
        return {"score": 0, "passed": True, "details": {"skipped": True}}
    try:
        return await check_ledger(url, db)
    except Exception as exc:
        logger.warning("L4 check failed: %s", exc)
        return {"score": 0, "passed": True, "details": {"error": str(exc)}}


async def run_engine(url: str, db: AsyncSession | None = None) -> dict:
    """
    Execute the full 4-layer scan pipeline on *url*.

    Parameters
    ----------
    url : str
        The target URL to analyse.
    db : AsyncSession | None
        Database session for L4 ledger lookups.  May be ``None`` in tests
        that only exercise L1–L3.

    Returns
    -------
    dict
        {
            "risk_score": int,
            "risk_level": str,
            "layer_results": [ {layer, passed, score_contribution, details}, ... ],
            "processing_time_ms": int,
        }
    """
    start = time.perf_counter()
    layer_results: list[dict] = []
    total_score = 0

    # ── L1 — Heuristics (sync, pure Python) ────────────────────────
    l1 = check_heuristics(url)
    total_score += l1["score"]
    layer_results.append(
        {
            "layer": "L1",
            "passed": l1["passed"],
            "score_contribution": l1["score"],
            "details": l1["details"],
        }
    )

    # Early exit: if L1 already maxed the overall score
    if total_score >= 100:
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return _build_result(total_score, layer_results, elapsed_ms)

    # ── L2, L3, L4 Parallel Execution ──────────────────────────────
    l2_res, l3_res, l4_res = await asyncio.gather(
        _safe_check_dns(url),
        _safe_check_safe_browsing(url),
        _safe_check_ledger(url, db),
    )

    # ── Aggregate Results ──────────────────────────────────────────
    for layer_name, res in [("L2", l2_res), ("L3", l3_res), ("L4", l4_res)]:
        total_score += res["score"]
        layer_results.append(
            {
                "layer": layer_name,
                "passed": res["passed"],
                "score_contribution": res["score"],
                "details": res["details"],
            }
        )

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    return _build_result(total_score, layer_results, elapsed_ms)


def _build_result(
    total_score: int,
    layer_results: list[dict],
    processing_time_ms: int,
) -> dict:
    """Assemble the final result dict with capped score."""
    capped = min(max(total_score, 0), 100)
    return {
        "risk_score": capped,
        "risk_level": _map_risk_level(capped),
        "layer_results": layer_results,
        "processing_time_ms": processing_time_ms,
    }

