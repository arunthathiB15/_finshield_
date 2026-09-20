from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha1
from threading import Lock
from time import monotonic
from typing import Any

import yfinance as yf

from backend.app.core.schemas import NewsArticle, NewsResponse
from backend.app.data.loader import ASSET_NAMES


NEWS_SOURCE = "Yahoo Finance public search feed via yfinance"
MARKET_QUERY = "stock market finance"
NEWS_REFRESH_SECONDS = 300
_CACHE: dict[str, tuple[float, datetime, list[NewsArticle], str | None]] = {}
_CACHE_LOCK = Lock()


def _nested_text(value: Any) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()
    if isinstance(value, dict):
        for key in ("displayName", "name", "text", "value"):
            nested = value.get(key)
            if isinstance(nested, str) and nested.strip():
                return nested.strip()
    return None


def _link(value: Any) -> str | None:
    if isinstance(value, str) and value.startswith(("http://", "https://")):
        return value
    if isinstance(value, dict):
        for key in ("url", "href"):
            candidate = value.get(key)
            if isinstance(candidate, str) and candidate.startswith(("http://", "https://")):
                return candidate
    return None


def _thumbnail(value: Any) -> str | None:
    direct = _link(value)
    if direct:
        return direct
    if isinstance(value, dict):
        resolutions = value.get("resolutions")
        if isinstance(resolutions, list):
            for resolution in resolutions:
                candidate = _link(resolution)
                if candidate:
                    return candidate
    return None


def _published_at(value: Any) -> datetime | None:
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value), tz=timezone.utc)
    if isinstance(value, str) and value.strip():
        try:
            parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        except ValueError:
            return None
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed
    return None


def _normalise_article(raw: dict[str, Any], category: str) -> NewsArticle | None:
    content = raw.get("content") if isinstance(raw.get("content"), dict) else {}
    title = _nested_text(content.get("title")) or _nested_text(raw.get("title"))
    publisher = (
        _nested_text(content.get("provider"))
        or _nested_text(raw.get("publisher"))
        or "Yahoo Finance"
    )
    link = (
        _link(content.get("canonicalUrl"))
        or _link(content.get("clickThroughUrl"))
        or _link(raw.get("link"))
    )
    published_at = (
        _published_at(content.get("pubDate"))
        or _published_at(raw.get("providerPublishTime"))
        or _published_at(raw.get("pubDate"))
    )
    if not title or not link or not published_at:
        return None

    article_id = str(raw.get("uuid") or content.get("id") or "")
    if not article_id:
        article_id = sha1(f"{title}|{link}".encode("utf-8")).hexdigest()
    summary = (
        _nested_text(content.get("summary"))
        or _nested_text(content.get("description"))
        or _nested_text(raw.get("summary"))
    )
    return NewsArticle(
        id=article_id,
        title=title,
        publisher=publisher,
        link=link,
        published_at=published_at,
        category=category,
        thumbnail_url=_thumbnail(content.get("thumbnail") or raw.get("thumbnail")),
        summary=summary,
    )


def _fetch_query(query: str, category: str, news_count: int) -> tuple[list[NewsArticle], str | None]:
    try:
        search = yf.Search(
            query,
            max_results=1,
            news_count=news_count,
            timeout=10,
            raise_errors=False,
        )
        articles = [
            article
            for raw in search.news
            if isinstance(raw, dict)
            for article in [_normalise_article(raw, category)]
            if article is not None
        ]
        return articles, None
    except Exception:
        # Provider outages and rate limits should not break the quant dashboard.
        return [], f"{category.capitalize()} news is temporarily unavailable."


def _merge_articles(asset_articles: list[NewsArticle], market_articles: list[NewsArticle], limit: int) -> list[NewsArticle]:
    unique: dict[str, NewsArticle] = {}
    for article in sorted(
        [*asset_articles, *market_articles],
        key=lambda item: item.published_at,
        reverse=True,
    ):
        key = article.link.lower() or article.title.lower()
        previous = unique.get(key)
        if previous is None or (previous.category == "market" and article.category == "asset"):
            unique[key] = article
    return sorted(unique.values(), key=lambda item: item.published_at, reverse=True)[:limit]


def fetch_market_news(symbol: str, limit: int = 12) -> NewsResponse:
    now = monotonic()
    with _CACHE_LOCK:
        cached = _CACHE.get(symbol)
    if cached and now - cached[0] < NEWS_REFRESH_SECONDS:
        fetched_at, articles, warning = cached[1], cached[2], cached[3]
        return NewsResponse(
            symbol=symbol,
            asset_name=ASSET_NAMES[symbol],
            source=NEWS_SOURCE,
            fetched_at=fetched_at,
            refresh_interval_seconds=NEWS_REFRESH_SECONDS,
            items=articles[:limit],
            warning=warning,
        )

    results: dict[str, tuple[list[NewsArticle], str | None]] = {}
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {
            executor.submit(_fetch_query, symbol, "asset", 8): "asset",
            executor.submit(_fetch_query, MARKET_QUERY, "market", 8): "market",
        }
        for future in as_completed(futures):
            results[futures[future]] = future.result()

    asset_articles, asset_warning = results.get("asset", ([], "Asset news is temporarily unavailable."))
    market_articles, market_warning = results.get("market", ([], "Market news is temporarily unavailable."))
    articles = _merge_articles(asset_articles, market_articles, limit)
    warnings = [warning for warning in (asset_warning, market_warning) if warning]
    warning = " ".join(warnings) if warnings else None
    if not articles and warning is None:
        warning = "No current headlines were returned by the news provider."

    fetched_at = datetime.now(timezone.utc)
    with _CACHE_LOCK:
        _CACHE[symbol] = (
            monotonic(),
            fetched_at,
            _merge_articles(asset_articles, market_articles, 20),
            warning,
        )

    return NewsResponse(
        symbol=symbol,
        asset_name=ASSET_NAMES[symbol],
        source=NEWS_SOURCE,
        fetched_at=fetched_at,
        refresh_interval_seconds=NEWS_REFRESH_SECONDS,
        items=articles,
        warning=warning,
    )
