"""Human-friendly formatting: sizes, numbers, tables, and text layout for
CLI output, reports, and notifications."""
from __future__ import annotations
import math
import re
from datetime import datetime, timezone
from typing import Iterable, Sequence

def human_bytes(size: int) -> str:
    """Format a byte count as '1.5 MB' using binary units."""
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{value:.1f} PB"

def comma_number(value: int) -> str:
    """Insert thousands separators into an integer."""
    return f"{value:,}"

def percent(value: float, decimals: int = 1) -> str:
    """Format a ratio in [0, 1] as a percentage string."""
    return f"{value * 100:.{decimals}f}%"

def pluralize(count: int, singular: str, plural: str | None = None) -> str:
    """Pick the singular or plural form for a count."""
    if count == 1:
        return singular
    return plural if plural is not None else singular + "s"

def ordinal(number: int) -> str:
    """Return the ordinal suffix form of a number, e.g. 3 -> '3rd'."""
    if 10 <= number % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(number % 10, "th")
    return f"{number}{suffix}"

def pad_number(value: int, width: int = 3) -> str:
    """Zero-pad a number to a fixed width."""
    return str(value).zfill(width)

def format_currency(amount: float, symbol: str = "$", decimals: int = 2) -> str:
    """Format an amount with thousands separators and a symbol."""
    return f"{symbol}{amount:,.{decimals}f}"

def truncate_lines(text: str, max_lines: int) -> str:
    """Cut a block of text after *max_lines*, adding an ellipsis marker."""
    lines = text.splitlines()
    if len(lines) <= max_lines:
        return text
    return "\n".join(lines[:max_lines]) + "\n…"

def format_table(headers: Sequence[str], rows: Sequence[Sequence[str]]) -> str:
    """Render rows as an aligned, pipe-separated table."""
    widths = [
        max(len(str(header)), *(len(str(row[index])) for row in rows))
        for index, header in enumerate(headers)
    ]

    def line(cells: Sequence[str]) -> str:
        return " | ".join(str(cell).ljust(widths[index]) for index, cell in enumerate(cells))

    body = [line(headers), "-+-".join("-" * width for width in widths)]
    body.extend(line(row) for row in rows)
    return "\n".join(body)

def indent_text(text: str, spaces: int = 4) -> str:
    """Prepend leading whitespace to every line of *text*."""
    prefix = " " * spaces
    return "\n".join(prefix + line for line in text.splitlines())

def format_phone(digits: str, country: str = "US") -> str:
    """Group a digit string into a readable phone number."""
    cleaned = re.sub(r"\D", "", digits)
    if country == "US" and len(cleaned) == 10:
        return f"({cleaned[0:3]}) {cleaned[3:6]}-{cleaned[6:]}"
    return cleaned

def format_hhmmss(seconds: int) -> str:
    """Format seconds as HH:MM:SS."""
    hours, remainder = divmod(max(0, seconds), 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def rate_string(numerator: float, denominator: float, decimals: int = 2) -> str:
    """Format a rate like '3.50/s' or 'n/a' when undefined."""
    if denominator == 0:
        return "n/a"
    return f"{numerator / denominator:.{decimals}f}/s"

def significant_figures(value: float, digits: int = 3) -> str:
    """Format a float to *digits* significant figures."""
    if value == 0:
        return "0"
    return f"{value:.{digits}g}"

def bullet_list(items: Iterable[str], marker: str = "-") -> str:
    """Render an iterable of strings as a bulleted block."""
    return "\n".join(f"{marker} {item}" for item in items)

def percentage_change(before: float, after: float) -> str:
    """Describe a change as a signed percentage with arrow."""
    if before == 0:
        return "n/a"
    change = (after - before) / abs(before) * 100
    return f"{change:+.1f}%"

def timestamp_iso() -> str:
    """Current UTC time formatted for log prefixes."""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")

def compact_list(items: Sequence[str], limit: int = 3) -> str:
    """Summarize a list like 'a, b, and 3 more'."""
    if not items:
        return ""
    if len(items) <= limit:
        return ", ".join(items)
    shown = ", ".join(items[:limit])
    return f"{shown}, and {len(items) - limit} more"
