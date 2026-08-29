"""HTTP request helpers: URL building, header handling, retries, and small
response utilities shared by the API client modules."""
from __future__ import annotations
import base64
import mimetypes
import time
from typing import Any
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse

def build_query_string(params: dict[str, Any]) -> str:
    """Encode a dict of parameters into a URL query string."""
    return urlencode(params, doseq=True)

def parse_url(url: str) -> dict[str, str]:
    """Split a URL into scheme, host, path, query, and fragment parts."""
    parsed = urlparse(url)
    return {
        "scheme": parsed.scheme,
        "host": parsed.hostname or "",
        "port": str(parsed.port) if parsed.port else "",
        "path": parsed.path,
        "query": parsed.query,
        "fragment": parsed.fragment,
    }

def basic_auth_header(username: str, password: str) -> str:
    """Build the Authorization value for HTTP Basic auth."""
    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    return f"Basic {token}"

def bearer_auth_header(token: str) -> str:
    """Build the Authorization value for a bearer token."""
    return f"Bearer {token}"

def safe_url_join(base: str, path: str) -> str:
    """Join a base URL with a possibly absolute path safely."""
    return urljoin(base.rstrip("/") + "/", path.lstrip("/"))

def status_message(code: int) -> str:
    """Return the standard reason phrase for an HTTP status code."""
    phrases = {
        200: "OK",
        201: "Created",
        204: "No Content",
        301: "Moved Permanently",
        304: "Not Modified",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        503: "Service Unavailable",
    }
    return phrases.get(code, "Unknown")

def is_success_status(code: int) -> bool:
    """Return True for any 2xx status code."""
    return 200 <= code < 300

def redact_query_params(url: str, sensitive: set[str]) -> str:
    """Strip sensitive query parameters for logging purposes."""
    parsed = urlparse(url)
    kept = [(key, value) for key, value in parse_qsl(parsed.query) if key not in sensitive]
    query = urlencode(kept)
    return parsed._replace(query=query).geturl()

def parse_http_headers(raw: str) -> dict[str, str]:
    """Parse a raw CRLF-separated header block into a lower-case dict."""
    headers: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        name, _, value = line.partition(":")
        headers[name.strip().lower()] = value.strip()
    return headers

def content_type_for(path: str) -> str:
    """Guess a MIME type from a file extension."""
    guess, _ = mimetypes.guess_type(path)
    return guess or "application/octet-stream"

def cache_max_age(headers: dict[str, str]) -> int | None:
    """Seconds a response may be cached, parsed from Cache-Control."""
    directive = headers.get("cache-control", "")
    for part in directive.split(","):
        key, _, value = part.strip().partition("=")
        if key == "max-age":
            try:
                return int(value)
            except ValueError:
                return None
    return None

def rate_limit_delay(requests_per_second: float) -> float:
    """Minimum seconds to wait between requests at the given rate."""
    if requests_per_second <= 0:
        return 0.0
    return 1.0 / requests_per_second

def hostname_of(url: str) -> str:
    """Return just the hostname portion of a URL."""
    return urlparse(url).hostname or ""

def redirect_target(headers: dict[str, str], base_url: str) -> str | None:
    """Resolve a Location header against the original URL, if present."""
    location = headers.get("location")
    if not location:
        return None
    return urljoin(base_url, location)

def range_header(size: int, chunk: int, chunk_count: int) -> str:
    """Build a Range header for one chunk of a larger download."""
    start = chunk * size
    end = min(start + size - 1, chunk_count * size - 1)
    return f"bytes={start}-{end}"

def user_agent(name: str, version: str) -> str:
    """Compose a recognizable User-Agent string."""
    return f"{name}/{version}"

def retry_with_backoff(attempt: int, base_delay: float = 0.5, factor: float = 2.0) -> float:
    """Seconds to sleep before retry *attempt*, growing exponentially."""
    return base_delay * (factor ** (attempt - 1))

def query_params(url: str) -> dict[str, str]:
    """Return the query string of a URL as a dict of strings."""
    return dict(parse_qsl(urlparse(url).query))
