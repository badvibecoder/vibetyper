"""Backend request handling and validation — the shape of a typical REST API
service: schema checks, pagination, error mapping, and serialization."""

from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Any, Mapping, Optional


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_email(value: str) -> bool:
    """Return True when *value* looks like a plausible email address."""
    return bool(EMAIL_RE.match(value.strip()))


def normalize_email(value: str) -> str:
    """Lower-case and strip an email address, raising on invalid input."""
    email = value.strip().lower()
    if not validate_email(email):
        raise ValueError(f"invalid email address: {value!r}")
    return email


def hash_token(secret: str, salt: str = "vibetyper") -> str:
    """Return a hex digest for a secret, used for reference tokens."""
    return hashlib.sha256(f"{salt}:{secret}".encode("utf-8")).hexdigest()


def paginate(
    items: list[Any],
    page: int,
    page_size: int,
) -> dict[str, Any]:
    """Slice a list into a page plus pagination metadata."""
    page = max(1, page)
    page_size = max(1, min(page_size, 100))
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "items": items[start:end],
        "page": page,
        "page_size": page_size,
        "total": len(items),
        "has_more": end < len(items),
    }


def parse_int(value: Any, default: Optional[int] = None) -> Optional[int]:
    """Coerce a query parameter to an integer, or fall back to default."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()


def to_camel_case(value: str) -> str:
    """Convert snake_case identifiers to camelCase."""
    head, *tail = value.split("_")
    return head + "".join(word.capitalize() for word in tail)


def to_snake_case(value: str) -> str:
    """Convert camelCase identifiers to snake_case."""
    result = re.sub(r"(?<!^)(?=[A-Z])", "_", value)
    return result.lower()


def pick(data: Mapping[str, Any], *fields: str) -> dict[str, Any]:
    """Return a new dict containing only the requested *fields*."""
    return {field: data[field] for field in fields if field in data}


def omit(data: Mapping[str, Any], *fields: str) -> dict[str, Any]:
    """Return a new dict without the given *fields*."""
    excluded = set(fields)
    return {key: value for key, value in data.items() if key not in excluded}


def validate_required(
    data: Mapping[str, Any],
    *fields: str,
) -> list[str]:
    """Return the list of required fields missing from *data*."""
    return [field for field in fields if field not in data or data[field] is None]


def build_error(code: str, message: str) -> dict[str, str]:
    """Build a consistent JSON error envelope."""
    return {"error": {"code": code, "message": message}}


def slugify(value: str) -> str:
    """Turn arbitrary text into a URL-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "untitled"


def truncate(value: str, limit: int = 80) -> str:
    """Truncate a string to *limit* characters with an ellipsis."""
    if len(value) <= limit:
        return value
    return value[: max(0, limit - 3)] + "..."
