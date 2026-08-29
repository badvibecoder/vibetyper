"""Robust parsing helpers: numbers, sizes, durations, CSV rows, and small
structured formats that appear all over the codebase."""
from __future__ import annotations
import re
from datetime import date, datetime, timedelta
from typing import Any

def parse_int_safe(value: Any, default: int = 0) -> int:
    """Parse an integer, falling back to *default* on any failure."""
    try:
        return int(str(value).strip().replace(",", ""))
    except (TypeError, ValueError):
        return default

def parse_float_safe(value: Any, default: float = 0.0) -> float:
    """Parse a float, tolerating currency symbols and units."""
    try:
        cleaned = re.sub(r"[^0-9.eE+-]", "", str(value))
        return float(cleaned)
    except (TypeError, ValueError):
        return default

def split_quoted(text: str, delimiter: str = ",") -> list[str]:
    """Split on a delimiter while respecting double-quoted fields."""
    fields: list[str] = []
    current: list[str] = []
    in_quotes = False
    for char in text:
        if char == '"':
            in_quotes = not in_quotes
            current.append(char)
        elif char == delimiter and not in_quotes:
            fields.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    fields.append("".join(current).strip())
    return fields

def parse_duration(text: str) -> int:
    """Parse '2h 30m 15s' style text into a total number of seconds."""
    pattern = re.compile(r"(\d+)\s*(d|h|m|s)", re.IGNORECASE)
    multipliers = {"d": 86400, "h": 3600, "m": 60, "s": 1}
    total = 0
    for amount, unit in pattern.findall(text):
        total += int(amount) * multipliers[unit.lower()]
    return total

def parse_size(text: str) -> int:
    """Parse '12.5 MB' into a byte count (binary units)."""
    match = re.fullmatch(r"\s*([0-9.]+)\s*([KMGTP]?i?B)?\s*", text, re.IGNORECASE)
    if not match:
        raise ValueError(f"cannot parse size: {text!r}")
    amount = float(match.group(1))
    unit = (match.group(2) or "B").upper().replace("I", "")
    return int(amount * 1024 ** ["B", "KB", "MB", "GB", "TB", "PB"].index(unit))

def parse_bool(value: Any) -> bool:
    """Interpret common truthy/falsy strings as booleans."""
    if isinstance(value, bool):
        return value
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "yes", "on", "y", "enabled"}:
        return True
    if normalized in {"0", "false", "no", "off", "n", "disabled"}:
        return False
    raise ValueError(f"cannot parse boolean: {value!r}")

def parse_version(value: str) -> tuple[int, int, int]:
    """Split a dotted version string into major, minor, patch."""
    parts = value.strip().lstrip("v").split(".")
    numbers = [int(part) for part in parts[:3] if part.isdigit()]
    while len(numbers) < 3:
        numbers.append(0)
    return numbers[0], numbers[1], numbers[2]

def parse_interval(value: str) -> tuple[date, date]:
    """Parse '2024-01-01/2024-02-01' into an inclusive date pair."""
    start_text, _, end_text = value.partition("/")
    return date.fromisoformat(start_text.strip()), date.fromisoformat(end_text.strip())

def parse_csv_row(line: str) -> list[str]:
    """Parse one CSV row, unquoting and unescaping quoted fields."""
    fields = split_quoted(line)
    return [
        field.replace('""', '"').strip('"') if field.startswith('"') else field
        for field in fields
    ]

def parse_hex_color(value: str) -> tuple[int, int, int]:
    """Convert '#rrggbb' (or '#rgb') into an (r, g, b) tuple."""
    text = value.strip().lstrip("#")
    if len(text) == 3:
        text = "".join(char * 2 for char in text)
    if len(text) != 6:
        raise ValueError(f"invalid hex color: {value!r}")
    red = int(text[0:2], 16)
    green = int(text[2:4], 16)
    blue = int(text[4:6], 16)
    return red, green, blue

def parse_money(value: str) -> float:
    """Parse '$1,234.56' (or bare digits) into a float."""
    cleaned = re.sub(r"[^0-9.\-]", "", value)
    if not cleaned:
        raise ValueError(f"cannot parse money: {value!r}")
    return float(cleaned)

def parse_time_range(value: str) -> tuple[str, str]:
    """Split '09:00-17:30' into its two clock-time endpoints."""
    start_text, _, end_text = value.partition("-")
    return start_text.strip(), end_text.strip()

def parse_email(value: str) -> tuple[str, str] | None:
    """Split an email address into (user, domain), or None when invalid."""
    match = re.fullmatch(r"([^@\s]+)@([^@\s]+\.[^@\s]+)", value.strip())
    if not match:
        return None
    return match.group(1), match.group(2)

def parse_grid_size(value: str) -> tuple[int, int]:
    """Parse '3x4' or '3 x 4' into (rows, columns)."""
    match = re.fullmatch(r"\s*(\d+)\s*[xX×]\s*(\d+)\s*", value)
    if not match:
        raise ValueError(f"invalid grid size: {value!r}")
    return int(match.group(1)), int(match.group(2))

def parse_log_line(line: str) -> dict[str, str]:
    """Extract timestamp, level, logger, and message from a log line."""
    match = re.match(r"(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+(.+)", line)
    if not match:
        return {"message": line}
    return {
        "timestamp": match.group(1),
        "level": match.group(2),
        "logger": match.group(3),
        "message": match.group(4),
    }

def parse_semicolon_list(text: str) -> list[str]:
    """Split on semicolons, dropping empties and trimming whitespace."""
    return [part.strip() for part in text.split(";") if part.strip()]

def parse_pairs(text: str) -> dict[str, str]:
    """Parse 'a=1; b=2' into a dict of string pairs."""
    result: dict[str, str] = {}
    for token in parse_semicolon_list(text):
        key, _, value = token.partition("=")
        if key:
            result[key.strip()] = value.strip()
    return result

def parse_sql_ddl_type(value: str) -> str:
    """Normalize a SQL column type like 'VARCHAR(255)' to 'varchar'."""
    return re.sub(r"\(.*\)", "", value).strip().lower()
