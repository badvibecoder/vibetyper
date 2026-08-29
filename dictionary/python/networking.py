"""Networking primitives: URL parsing, header building, a tiny rate limiter,
and socket helpers that small services and tools rely on."""

from __future__ import annotations

import socket
import time
import urllib.parse
from typing import Iterable, Optional


def parse_url(url: str) -> dict[str, str]:
    """Split a URL into scheme, host, port, path, and query components."""
    parsed = urllib.parse.urlparse(url)
    return {
        "scheme": parsed.scheme,
        "host": parsed.hostname or "",
        "port": str(parsed.port or ""),
        "path": parsed.path or "/",
        "query": parsed.query,
    }


def build_url(
    scheme: str,
    host: str,
    port: Optional[int] = None,
    path: str = "/",
    query: Optional[dict[str, str]] = None,
) -> str:
    """Compose a URL from its parts, encoding the query string."""
    netloc = host if port is None else f"{host}:{port}"
    query_string = urllib.parse.urlencode(query) if query else ""
    return urllib.parse.urlunparse((scheme, netloc, path, "", query_string, ""))


def query_params(url: str) -> dict[str, list[str]]:
    """Return the query string of a URL as a dict of lists."""
    return urllib.parse.parse_qs(urllib.parse.urlparse(url).query)


def user_agent(name: str, version: str) -> str:
    """Build a conventional User-Agent header string."""
    return f"{name}/{version}"


def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """Return True when a TCP connection to *host*:*port* succeeds."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def resolve_host(hostname: str) -> list[str]:
    """Resolve a hostname to a list of IPv4 addresses."""
    try:
        info = socket.getaddrinfo(hostname, None, socket.AF_INET)
        return sorted({entry[4][0] for entry in info})
    except OSError:
        return []


class RateLimiter:
    """A fixed-window rate limiter keyed by arbitrary identifiers."""

    def __init__(self, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, list[float]] = {}

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        hits = self._hits.setdefault(key, [])
        hits[:] = [t for t in hits if now - t < self.window]
        if len(hits) >= self.limit:
            return False
        hits.append(now)
        return True

    def reset(self, key: str) -> None:
        self._hits.pop(key, None)


def read_http_status_line(raw: str) -> tuple[str, int, str]:
    """Parse an HTTP status line like 'HTTP/1.1 200 OK'."""
    version, status, *reason = raw.strip().split(" ", 2)
    return version, int(status), reason[0] if reason else ""


def encode_basic_auth(username: str, password: str) -> str:
    """Build a Basic auth header value for the given credentials."""
    import base64

    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    return f"Basic {token}"


def is_private_ip(ip: str) -> bool:
    """Return True for RFC1918 and loopback addresses."""
    return ip.startswith(("10.", "192.168.", "127.", "172.16."))


def split_host_port(value: str, default_port: int = 80) -> tuple[str, int]:
    """Split a 'host:port' string, applying a default port."""
    host, _, port = value.rpartition(":")
    if port.isdigit():
        return host, int(port)
    return value, default_port
