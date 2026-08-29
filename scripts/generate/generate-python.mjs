// generate-python.mjs
// Expands the Python dictionary with new hand-authored code blocks.
// Writes only NEW files under dictionary/python/ — existing hand-written
// files and the `setup` metadata file are never touched.
//
// Block format (blockmode = "indent"): each top-level def/async def/class
// (optionally decorated) is one complete block, body indented 4 spaces.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'dictionary', 'python');

const files = [
  // ---------------------------------------------------------------------------
  // datetime_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'datetime_utils.py',
    blocks: [
`"""Date and time helpers: calendar math, parsing, formatting, and
timezone adjustments used by scheduling and reporting services."""
from __future__ import annotations
import calendar
from datetime import date, datetime, timedelta, timezone`,

`def days_between(start: date, end: date) -> int:
    """Return the number of calendar days between two dates."""
    return (end - start).days`,

`def add_weekdays(start: date, count: int) -> date:
    """Advance *count* business days, skipping Saturdays and Sundays."""
    current = start
    added = 0
    while added < count:
        current += timedelta(days=1)
        if current.weekday() < 5:
            added += 1
    return current`,

`def last_day_of_month(year: int, month: int) -> date:
    """Return the final day of the given month."""
    _, last = calendar.monthrange(year, month)
    return date(year, month, last)`,

`def iso_weekday_name(day: date) -> str:
    """Return the English name of the weekday for *day*."""
    names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return names[day.weekday()]`,

`def parse_iso_date(value: str) -> date:
    """Parse a YYYY-MM-DD string into a date, raising on bad input."""
    return date.fromisoformat(value.strip())`,

`def format_duration(seconds: float) -> str:
    """Format a duration as e.g. '3h 12m' or '45s'."""
    seconds = max(0, int(seconds))
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes:02d}m"
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{secs}s"`,

`def next_quarter_start(day: date) -> date:
    """Return the first day of the next calendar quarter after *day*."""
    month = ((day.month - 1) // 3 + 1) * 3 + 1
    year = day.year
    if month > 12:
        month = 1
        year += 1
    return date(year, month, 1)`,

`def is_leap_year(year: int) -> bool:
    """Return True when *year* is a leap year."""
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)`,

`def month_range(year: int, month: int) -> tuple[date, date]:
    """Return the first and last day of a month as a pair."""
    first = date(year, month, 1)
    return first, last_day_of_month(year, month)`,

`def to_unix_timestamp(dt: datetime) -> int:
    """Convert an aware datetime to a UTC epoch timestamp."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp())`,

`def from_unix_timestamp(timestamp: int) -> datetime:
    """Convert an epoch timestamp into an aware UTC datetime."""
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)`,

`def age_from_birthdate(birth: date, today: date | None = None) -> int:
    """Compute age in whole years from a birth date."""
    today = today or date.today()
    years = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        years -= 1
    return years`,

`def time_ago(dt: datetime, now: datetime | None = None) -> str:
    """Human description of how long ago *dt* occurred."""
    now = now or datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = now - dt
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "just now"
    if minutes < 60:
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = hours // 24
    return f"{days} day{'s' if days != 1 else ''} ago"`,

`def business_days_in_month(year: int, month: int) -> int:
    """Count weekdays within a month, excluding weekends."""
    first, last = month_range(year, month)
    total = 0
    current = first
    while current <= last:
        if current.weekday() < 5:
            total += 1
        current += timedelta(days=1)
    return total`,

`def weekday_of_date(value: str) -> str:
    """Return the weekday name for an ISO date string."""
    return iso_weekday_name(parse_iso_date(value))`,

`def overlapping_interval(first: tuple[datetime, datetime], second: tuple[datetime, datetime]) -> timedelta | None:
    """Return the overlap between two time intervals, or None."""
    start = max(first[0], second[0])
    end = min(first[1], second[1])
    if end <= start:
        return None
    return end - start`,

`def quarterly_bucket(day: date) -> str:
    """Label a date with its quarter, e.g. '2025-Q2'."""
    quarter = (day.month - 1) // 3 + 1
    return f"{day.year}-Q{quarter}"`,

`def adjust_timezone(dt: datetime, offset_hours: int) -> datetime:
    """Shift a naive datetime by a fixed UTC offset in hours."""
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    return dt.replace(tzinfo=timezone(timedelta(hours=offset_hours)))`,

`def minutes_until_next_hour(dt: datetime) -> int:
    """Minutes remaining until the top of the next hour."""
    return 60 - dt.minute - (1 if dt.second else 0)`,

`def easter_sunday(year: int) -> date:
    """Compute Easter Sunday using the anonymous Gregorian algorithm."""
    a = year % 19
    b, c = divmod(year, 100)
    d = (b - b // 4 - (8 * b + 13) // 25 + 19 * a + 15) % 30
    e = d - (d // 28) * (1 - (d // 28) * (29 // (d + 1)) * ((21 - a) // 11))
    f = (year + year // 4 + e + 2 - c + c // 4) % 7
    month = 3 + (e - f + 40) // 44
    day = e - f + 28 - 31 * (month // 4)
    return date(year, month, day)`,
    ],
  },

  // ---------------------------------------------------------------------------
  // file_io.py
  // ---------------------------------------------------------------------------
  {
    name: 'file_io.py',
    blocks: [
`"""Filesystem helpers: reading, writing, scanning, and maintenance
routines that keep file handling consistent across the project."""
from __future__ import annotations
import hashlib
import json
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any`,

`def read_lines(path: str | Path) -> list[str]:
    """Read a file and return its non-empty, stripped lines."""
    result: list[str] = []
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped:
                result.append(stripped)
    return result`,

`def write_json(path: str | Path, data: Any) -> None:
    """Serialize *data* to pretty-printed JSON at *path*."""
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write("\\n")`,

`def read_json(path: str | Path) -> Any:
    """Load JSON from a file, returning the parsed value."""
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)`,

`def ensure_dir(path: str | Path) -> Path:
    """Create *path* and its parents when missing; return it."""
    directory = Path(path)
    directory.mkdir(parents=True, exist_ok=True)
    return directory`,

`def find_files(root: str | Path, pattern: str) -> list[Path]:
    """Recursively list files under *root* matching a glob pattern."""
    return sorted(Path(root).rglob(pattern))`,

`def unique_filename(directory: str | Path, base: str, ext: str) -> Path:
    """Return a path like base-2.ext that does not already exist."""
    candidate = Path(directory) / f"{base}.{ext}"
    counter = 2
    while candidate.exists():
        candidate = Path(directory) / f"{base}-{counter}.{ext}"
        counter += 1
    return candidate`,

`def copy_file_atomic(source: str | Path, destination: str | Path) -> None:
    """Copy a file to a temp sibling, then rename into place."""
    source = Path(source)
    destination = Path(destination)
    temp = destination.with_name(destination.name + ".tmp")
    shutil.copy2(source, temp)
    os.replace(temp, destination)`,

`def file_size_human(path: str | Path) -> str:
    """Return the size of a file as a human-readable string."""
    size = float(os.path.getsize(path))
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024 or unit == "TB":
            return f"{size:.1f} {unit}" if unit != "B" else f"{int(size)} B"
        size /= 1024
    return f"{size:.1f} TB"`,

`def tail(path: str | Path, count: int = 10) -> list[str]:
    """Return the last *count* lines of a text file."""
    with open(path, encoding="utf-8") as handle:
        lines = handle.readlines()
    return [line.rstrip("\\n") for line in lines[-count:]]`,

`def sha256_of_file(path: str | Path) -> str:
    """Compute the SHA-256 digest of a file in chunks."""
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()`,

`def count_lines(path: str | Path) -> int:
    """Count the lines in a file without loading it into memory."""
    total = 0
    with open(path, encoding="utf-8") as handle:
        for _ in handle:
            total += 1
    return total`,

`def remove_empty_dirs(root: str | Path) -> int:
    """Delete empty directories under *root*, innermost first."""
    removed = 0
    for directory in sorted(Path(root).rglob("*"), reverse=True):
        if directory.is_dir() and not any(directory.iterdir()):
            directory.rmdir()
            removed += 1
    return removed`,

`def extension_counts(root: str | Path) -> dict[str, int]:
    """Count files by extension under *root*."""
    counts: dict[str, int] = {}
    for entry in Path(root).rglob("*"):
        if entry.is_file() and entry.suffix:
            suffix = entry.suffix.lower()
            counts[suffix] = counts.get(suffix, 0) + 1
    return dict(sorted(counts.items()))`,

`def touch(path: str | Path) -> None:
    """Create an empty file at *path*, updating its mtime if present."""
    Path(path).touch()`,

`def backup_with_timestamp(path: str | Path) -> Path:
    """Copy a file to a sibling named with a UTC timestamp suffix."""
    source = Path(path)
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    backup = source.with_name(f"{source.stem}.{stamp}{source.suffix}")
    shutil.copy2(source, backup)
    return backup`,

`def list_recent_files(directory: str | Path, limit: int = 5) -> list[Path]:
    """Return the most recently modified regular files in a directory."""
    entries = [e for e in Path(directory).iterdir() if e.is_file()]
    entries.sort(key=lambda e: e.stat().st_mtime, reverse=True)
    return entries[:limit]`,

`def split_large_file(path: str | Path, max_lines: int) -> int:
    """Split a file into numbered parts of at most *max_lines* lines."""
    source = Path(path)
    part_number = 0
    current: list[str] = []
    with open(source, encoding="utf-8") as handle:
        for line in handle:
            current.append(line)
            if len(current) >= max_lines:
                part_number += 1
                part = source.with_name(f"{source.stem}.part{part_number}")
                with open(part, "w", encoding="utf-8") as out:
                    out.writelines(current)
                current = []
    if current:
        part_number += 1
        part = source.with_name(f"{source.stem}.part{part_number}")
        with open(part, "w", encoding="utf-8") as out:
            out.writelines(current)
    return part_number`,

`def is_text_file(path: str | Path, sample_size: int = 1024) -> bool:
    """Heuristically decide whether a file holds text rather than binary."""
    with open(path, "rb") as handle:
        sample = handle.read(sample_size)
    if not sample:
        return True
    null_bytes = sample.count(b"\\x00")
    return null_bytes / len(sample) < 0.3`,

`def total_size(directory: str | Path) -> int:
    """Sum the byte sizes of every file under a directory tree."""
    total = 0
    for entry in Path(directory).rglob("*"):
        if entry.is_file():
            total += entry.stat().st_size
    return total`,

`def safe_filename(name: str) -> str:
    """Replace characters that are unsafe on most filesystems."""
    cleaned = re.sub(r"[^\\w\\-. ]", "_", name)
    return cleaned.strip(" .") or "untitled"`,
    ],
  },

  // ---------------------------------------------------------------------------
  // geometry.py
  // ---------------------------------------------------------------------------
  {
    name: 'geometry.py',
    blocks: [
`"""2-D geometry helpers: distances, intersections, polygons, and spatial
queries shared by the mapping and simulation modules."""
from __future__ import annotations
import math
from typing import Iterable
Point = tuple[float, float]`,

`def euclidean_distance(first: Point, second: Point) -> float:
    """Return the straight-line distance between two points."""
    dx = first[0] - second[0]
    dy = first[1] - second[1]
    return math.hypot(dx, dy)`,

`def manhattan_distance(first: Point, second: Point) -> float:
    """Return the grid distance between two points."""
    return abs(first[0] - second[0]) + abs(first[1] - second[1])`,

`def polygon_area(points: list[Point]) -> float:
    """Compute the area of a polygon via the shoelace formula."""
    area = 0.0
    count = len(points)
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2`,

`def point_in_polygon(point: Point, polygon: list[Point]) -> bool:
    """Ray-cast test for whether a point lies inside a polygon."""
    x, y = point
    inside = False
    count = len(polygon)
    for index in range(count):
        x1, y1 = polygon[index]
        x2, y2 = polygon[(index + 1) % count]
        crosses = (y1 > y) != (y2 > y)
        if crosses:
            hit_x = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if hit_x > x:
                inside = not inside
    return inside`,

`def circle_intersection_area(radius_a: float, radius_b: float, distance: float) -> float:
    """Area shared by two circles with given radii and center distance."""
    if distance >= radius_a + radius_b:
        return 0.0
    if distance <= abs(radius_a - radius_b):
        return math.pi * min(radius_a, radius_b) ** 2
    term_a = radius_a**2 * math.acos(
        (distance**2 + radius_a**2 - radius_b**2) / (2 * distance * radius_a)
    )
    term_b = radius_b**2 * math.acos(
        (distance**2 + radius_b**2 - radius_a**2) / (2 * distance * radius_b)
    )
    term_c = 0.5 * math.sqrt(
        (-distance + radius_a + radius_b)
        * (distance + radius_a - radius_b)
        * (distance - radius_a + radius_b)
        * (distance + radius_a + radius_b)
    )
    return term_a + term_b - term_c`,

`def rotate_point(point: Point, angle_degrees: float, origin: Point = (0.0, 0.0)) -> Point:
    """Rotate *point* around *origin* by a clockwise angle in degrees."""
    radians = math.radians(angle_degrees)
    cosine = math.cos(radians)
    sine = math.sin(radians)
    x = point[0] - origin[0]
    y = point[1] - origin[1]
    return (
        origin[0] + x * cosine - y * sine,
        origin[1] + x * sine + y * cosine,
    )`,

`def bounding_box(points: Iterable[Point]) -> tuple[Point, Point]:
    """Return the (min, max) corners enclosing all points."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (min(xs), min(ys)), (max(xs), max(ys))`,

`def line_intersection(first_start: Point, first_end: Point, second_start: Point, second_end: Point) -> Point | None:
    """Return the crossing point of two segments, or None when parallel."""
    x1, y1 = first_start
    x2, y2 = first_end
    x3, y3 = second_start
    x4, y4 = second_end
    denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if denominator == 0:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator
    if 0 <= t <= 1 and 0 <= u <= 1:
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    return None`,

`def haversine_km(lat_a: float, lon_a: float, lat_b: float, lon_b: float, earth_radius: float = 6371.0) -> float:
    """Great-circle distance between two coordinates in kilometres."""
    phi_a = math.radians(lat_a)
    phi_b = math.radians(lat_b)
    delta_phi = math.radians(lat_b - lat_a)
    delta_lambda = math.radians(lon_b - lon_a)
    value = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi_a) * math.cos(phi_b) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * earth_radius * math.asin(math.sqrt(value))`,

`def polygon_centroid(points: list[Point]) -> Point:
    """Return the area-weighted centroid of a simple polygon."""
    area_twice = 0.0
    centroid_x = 0.0
    centroid_y = 0.0
    count = len(points)
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        cross = x1 * y2 - x2 * y1
        area_twice += cross
        centroid_x += (x1 + x2) * cross
        centroid_y += (y1 + y2) * cross
    if area_twice == 0:
        raise ValueError("degenerate polygon has no centroid")
    return (centroid_x / (3 * area_twice), centroid_y / (3 * area_twice))`,

`def angle_between(vertex: Point, first: Point, second: Point) -> float:
    """Angle in degrees between the rays vertex->first and vertex->second."""
    vector_a = (first[0] - vertex[0], first[1] - vertex[1])
    vector_b = (second[0] - vertex[0], second[1] - vertex[1])
    dot = vector_a[0] * vector_b[0] + vector_a[1] * vector_b[1]
    magnitude = math.hypot(*vector_a) * math.hypot(*vector_b)
    if magnitude == 0:
        return 0.0
    return math.degrees(math.acos(max(-1.0, min(1.0, dot / magnitude))))`,

`def points_on_circle(center: Point, radius: float, count: int) -> list[Point]:
    """Distribute *count* points evenly around a circle."""
    return [
        (
            center[0] + radius * math.cos(2 * math.pi * index / count),
            center[1] + radius * math.sin(2 * math.pi * index / count),
        )
        for index in range(count)
    ]`,

`def closest_point_on_segment(point: Point, start: Point, end: Point) -> Point:
    """Project a point onto a segment, clamping to its endpoints."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length_squared = dx * dx + dy * dy
    if length_squared == 0:
        return start
    t = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / length_squared
    t = max(0.0, min(1.0, t))
    return (start[0] + t * dx, start[1] + t * dy)`,

`def triangle_area(first: Point, second: Point, third: Point) -> float:
    """Area of the triangle formed by three points (Heron's formula)."""
    a = euclidean_distance(first, second)
    b = euclidean_distance(second, third)
    c = euclidean_distance(third, first)
    semiperimeter = (a + b + c) / 2
    return math.sqrt(semiperimeter * (semiperimeter - a) * (semiperimeter - b) * (semiperimeter - c))`,

`def line_parameters(first: Point, second: Point) -> tuple[float, float] | None:
    """Return (slope, intercept) for a line, or None when vertical."""
    dx = second[0] - first[0]
    if dx == 0:
        return None
    slope = (second[1] - first[1]) / dx
    return slope, first[1] - slope * first[0]`,

`def is_convex(points: list[Point]) -> bool:
    """Return True when a polygon's vertices all turn the same direction."""
    count = len(points)
    if count < 3:
        return False
    sign = 0
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        x3, y3 = points[(index + 2) % count]
        cross = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)
        if cross != 0:
            current_sign = 1 if cross > 0 else -1
            if sign and current_sign != sign:
                return False
            sign = current_sign
    return True`,

`def scale_polygon(points: list[Point], factor: float, origin: Point = (0.0, 0.0)) -> list[Point]:
    """Scale every vertex of a polygon about *origin* by *factor*."""
    return [
        (origin[0] + (x - origin[0]) * factor, origin[1] + (y - origin[1]) * factor)
        for x, y in points
    ]`,

`def polygon_perimeter(points: list[Point]) -> float:
    """Sum the edge lengths of a polygon."""
    return sum(
        euclidean_distance(points[index], points[(index + 1) % len(points)])
        for index in range(len(points))
    )`,
    ],
  },
  // ---------------------------------------------------------------------------
  // stats_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'stats_utils.py',
    blocks: [
`"""Statistical helpers implemented from first principles: central tendency,
spread, distributions, and lightweight regression for analytics code."""
from __future__ import annotations
import math
from collections import Counter
from typing import Iterable, Sequence`,

`def mean(values: Sequence[float]) -> float:
    """Arithmetic mean of a sequence, raising on an empty input."""
    if not values:
        raise ValueError("cannot take the mean of an empty sequence")
    return sum(values) / len(values)`,

`def median(values: Sequence[float]) -> float:
    """Middle value of a sorted copy of the input."""
    ordered = sorted(values)
    count = len(ordered)
    if count == 0:
        raise ValueError("cannot take the median of an empty sequence")
    midpoint = count // 2
    if count % 2:
        return ordered[midpoint]
    return (ordered[midpoint - 1] + ordered[midpoint]) / 2`,

`def mode(values: Iterable[float]) -> list[float]:
    """Return every value that occurs most often, in stable order."""
    counts = Counter(values)
    if not counts:
        return []
    highest = max(counts.values())
    return [value for value, count in counts.items() if count == highest]`,

`def variance(values: Sequence[float], ddof: int = 1) -> float:
    """Sample variance; pass ddof=0 for the population variant."""
    if len(values) <= ddof:
        raise ValueError("not enough values to compute variance")
    average = mean(values)
    squared_deviations = sum((value - average) ** 2 for value in values)
    return squared_deviations / (len(values) - ddof)`,

`def standard_deviation(values: Sequence[float], ddof: int = 1) -> float:
    """Square root of the variance."""
    return math.sqrt(variance(values, ddof=ddof))`,

`def percentile(values: Sequence[float], rank: float) -> float:
    """Nearest-rank percentile: 50 is the median, 100 the maximum."""
    if not values or not 0 <= rank <= 100:
        raise ValueError("percentile rank must be between 0 and 100")
    ordered = sorted(values)
    position = max(0, math.ceil(rank / 100 * len(ordered)) - 1)
    return ordered[position]`,

`def interquartile_range(values: Sequence[float]) -> float:
    """Spread between the 25th and 75th percentiles."""
    return percentile(values, 75) - percentile(values, 25)`,

`def z_score(value: float, average: float, deviation: float) -> float:
    """Standard score: how many deviations above the mean."""
    if deviation == 0:
        return 0.0
    return (value - average) / deviation`,

`def covariance(first: Sequence[float], second: Sequence[float]) -> float:
    """Pairwise co-variation of two equally sized sequences."""
    if len(first) != len(second) or not first:
        raise ValueError("covariance needs two non-empty sequences of equal length")
    mean_first = mean(first)
    mean_second = mean(second)
    return sum(
        (a - mean_first) * (b - mean_second) for a, b in zip(first, second)
    ) / (len(first) - 1)`,

`def correlation(first: Sequence[float], second: Sequence[float]) -> float:
    """Pearson correlation coefficient in the range -1..1."""
    denominator = standard_deviation(first) * standard_deviation(second)
    if denominator == 0:
        return 0.0
    return covariance(first, second) / denominator`,

`def linear_regression(xs: Sequence[float], ys: Sequence[float]) -> tuple[float, float]:
    """Fit y = slope * x + intercept via ordinary least squares."""
    if len(xs) != len(ys) or not xs:
        raise ValueError("regression needs matching non-empty sequences")
    slope = covariance(xs, ys) / variance(xs, ddof=0)
    intercept = mean(ys) - slope * mean(xs)
    return slope, intercept`,

`def moving_average(values: Sequence[float], window: int) -> list[float]:
    """Simple rolling average with a fixed window size."""
    if window <= 0:
        raise ValueError("window must be positive")
    if window > len(values):
        return [mean(values)]
    result: list[float] = []
    total = sum(values[:window])
    result.append(total / window)
    for index in range(window, len(values)):
        total += values[index] - values[index - window]
        result.append(total / window)
    return result`,

`def exponential_moving_average(values: Sequence[float], alpha: float) -> list[float]:
    """Smoothed series where newer samples weigh more."""
    if not values:
        return []
    smoothed = [values[0]]
    for value in values[1:]:
        smoothed.append(alpha * value + (1 - alpha) * smoothed[-1])
    return smoothed`,

`def weighted_average(values: Sequence[float], weights: Sequence[float]) -> float:
    """Average where each value contributes according to its weight."""
    if len(values) != len(weights) or not values:
        raise ValueError("values and weights must match and be non-empty")
    total_weight = sum(weights)
    if total_weight == 0:
        raise ValueError("weights must not sum to zero")
    return sum(value * weight for value, weight in zip(values, weights)) / total_weight`,

`def normalize(values: Sequence[float]) -> list[float]:
    """Scale values into the range [0, 1] using min-max scaling."""
    if not values:
        return []
    low = min(values)
    high = max(values)
    if high == low:
        return [0.0] * len(values)
    return [(value - low) / (high - low) for value in values]`,

`def standardize(values: Sequence[float]) -> list[float]:
    """Center values on zero with unit variance."""
    if not values:
        return []
    average = mean(values)
    deviation = standard_deviation(values, ddof=0)
    if deviation == 0:
        return [0.0] * len(values)
    return [(value - average) / deviation for value in values]`,

`def histogram(values: Sequence[float], bins: int) -> list[int]:
    """Count values falling into *bins* equal-width buckets."""
    if not values or bins <= 0:
        return []
    low = min(values)
    width = (max(values) - low) / bins
    counts = [0] * bins
    for value in values:
        index = int((value - low) / width)
        index = min(index, bins - 1)
        counts[index] += 1
    return counts`,

`def detect_outliers(values: Sequence[float], factor: float = 1.5) -> list[float]:
    """Flag values beyond the Tukey fences as outliers."""
    if not values:
        return []
    q1 = percentile(values, 25)
    q3 = percentile(values, 75)
    spread = (q3 - q1) * factor
    lower = q1 - spread
    upper = q3 + spread
    return [value for value in values if value < lower or value > upper]`,

`def entropy(probabilities: Sequence[float]) -> float:
    """Shannon entropy of a probability distribution, in bits."""
    total = 0.0
    for probability in probabilities:
        if probability <= 0:
            continue
        total -= probability * math.log2(probability)
    return total`,

`def winsorize(values: Sequence[float], limits: float = 0.05) -> list[float]:
    """Clip the tails of a sample to the given quantiles."""
    if not 0 <= limits < 0.5:
        raise ValueError("limits must be in [0, 0.5)")
    if not values:
        return []
    lower = percentile(values, limits * 100)
    upper = percentile(values, 100 - limits * 100)
    return [max(lower, min(value, upper)) for value in values]`,
    ],
  },

  // ---------------------------------------------------------------------------
  // http_client.py
  // ---------------------------------------------------------------------------
  {
    name: 'http_client.py',
    blocks: [
`"""HTTP request helpers: URL building, header handling, retries, and small
response utilities shared by the API client modules."""
from __future__ import annotations
import base64
import mimetypes
import time
from typing import Any
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse`,

`def build_query_string(params: dict[str, Any]) -> str:
    """Encode a dict of parameters into a URL query string."""
    return urlencode(params, doseq=True)`,

`def parse_url(url: str) -> dict[str, str]:
    """Split a URL into scheme, host, path, query, and fragment parts."""
    parsed = urlparse(url)
    return {
        "scheme": parsed.scheme,
        "host": parsed.hostname or "",
        "port": str(parsed.port) if parsed.port else "",
        "path": parsed.path,
        "query": parsed.query,
        "fragment": parsed.fragment,
    }`,

`def basic_auth_header(username: str, password: str) -> str:
    """Build the Authorization value for HTTP Basic auth."""
    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    return f"Basic {token}"`,

`def bearer_auth_header(token: str) -> str:
    """Build the Authorization value for a bearer token."""
    return f"Bearer {token}"`,

`def safe_url_join(base: str, path: str) -> str:
    """Join a base URL with a possibly absolute path safely."""
    return urljoin(base.rstrip("/") + "/", path.lstrip("/"))`,

`def status_message(code: int) -> str:
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
    return phrases.get(code, "Unknown")`,

`def is_success_status(code: int) -> bool:
    """Return True for any 2xx status code."""
    return 200 <= code < 300`,

`def redact_query_params(url: str, sensitive: set[str]) -> str:
    """Strip sensitive query parameters for logging purposes."""
    parsed = urlparse(url)
    kept = [(key, value) for key, value in parse_qsl(parsed.query) if key not in sensitive]
    query = urlencode(kept)
    return parsed._replace(query=query).geturl()`,

`def parse_http_headers(raw: str) -> dict[str, str]:
    """Parse a raw CRLF-separated header block into a lower-case dict."""
    headers: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        name, _, value = line.partition(":")
        headers[name.strip().lower()] = value.strip()
    return headers`,

`def content_type_for(path: str) -> str:
    """Guess a MIME type from a file extension."""
    guess, _ = mimetypes.guess_type(path)
    return guess or "application/octet-stream"`,

`def cache_max_age(headers: dict[str, str]) -> int | None:
    """Seconds a response may be cached, parsed from Cache-Control."""
    directive = headers.get("cache-control", "")
    for part in directive.split(","):
        key, _, value = part.strip().partition("=")
        if key == "max-age":
            try:
                return int(value)
            except ValueError:
                return None
    return None`,

`def rate_limit_delay(requests_per_second: float) -> float:
    """Minimum seconds to wait between requests at the given rate."""
    if requests_per_second <= 0:
        return 0.0
    return 1.0 / requests_per_second`,

`def hostname_of(url: str) -> str:
    """Return just the hostname portion of a URL."""
    return urlparse(url).hostname or ""`,

`def redirect_target(headers: dict[str, str], base_url: str) -> str | None:
    """Resolve a Location header against the original URL, if present."""
    location = headers.get("location")
    if not location:
        return None
    return urljoin(base_url, location)`,

`def range_header(size: int, chunk: int, chunk_count: int) -> str:
    """Build a Range header for one chunk of a larger download."""
    start = chunk * size
    end = min(start + size - 1, chunk_count * size - 1)
    return f"bytes={start}-{end}"`,

`def user_agent(name: str, version: str) -> str:
    """Compose a recognizable User-Agent string."""
    return f"{name}/{version}"`,

`def retry_with_backoff(attempt: int, base_delay: float = 0.5, factor: float = 2.0) -> float:
    """Seconds to sleep before retry *attempt*, growing exponentially."""
    return base_delay * (factor ** (attempt - 1))`,

`def query_params(url: str) -> dict[str, str]:
    """Return the query string of a URL as a dict of strings."""
    return dict(parse_qsl(urlparse(url).query))`,
    ],
  },

  // ---------------------------------------------------------------------------
  // parsing.py
  // ---------------------------------------------------------------------------
  {
    name: 'parsing.py',
    blocks: [
`"""Robust parsing helpers: numbers, sizes, durations, CSV rows, and small
structured formats that appear all over the codebase."""
from __future__ import annotations
import re
from datetime import date, datetime, timedelta
from typing import Any`,

`def parse_int_safe(value: Any, default: int = 0) -> int:
    """Parse an integer, falling back to *default* on any failure."""
    try:
        return int(str(value).strip().replace(",", ""))
    except (TypeError, ValueError):
        return default`,

`def parse_float_safe(value: Any, default: float = 0.0) -> float:
    """Parse a float, tolerating currency symbols and units."""
    try:
        cleaned = re.sub(r"[^0-9.eE+-]", "", str(value))
        return float(cleaned)
    except (TypeError, ValueError):
        return default`,

`def split_quoted(text: str, delimiter: str = ",") -> list[str]:
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
    return fields`,

`def parse_duration(text: str) -> int:
    """Parse '2h 30m 15s' style text into a total number of seconds."""
    pattern = re.compile(r"(\\d+)\\s*(d|h|m|s)", re.IGNORECASE)
    multipliers = {"d": 86400, "h": 3600, "m": 60, "s": 1}
    total = 0
    for amount, unit in pattern.findall(text):
        total += int(amount) * multipliers[unit.lower()]
    return total`,

`def parse_size(text: str) -> int:
    """Parse '12.5 MB' into a byte count (binary units)."""
    match = re.fullmatch(r"\\s*([0-9.]+)\\s*([KMGTP]?i?B)?\\s*", text, re.IGNORECASE)
    if not match:
        raise ValueError(f"cannot parse size: {text!r}")
    amount = float(match.group(1))
    unit = (match.group(2) or "B").upper().replace("I", "")
    return int(amount * 1024 ** ["B", "KB", "MB", "GB", "TB", "PB"].index(unit))`,

`def parse_bool(value: Any) -> bool:
    """Interpret common truthy/falsy strings as booleans."""
    if isinstance(value, bool):
        return value
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "yes", "on", "y", "enabled"}:
        return True
    if normalized in {"0", "false", "no", "off", "n", "disabled"}:
        return False
    raise ValueError(f"cannot parse boolean: {value!r}")`,

`def parse_version(value: str) -> tuple[int, int, int]:
    """Split a dotted version string into major, minor, patch."""
    parts = value.strip().lstrip("v").split(".")
    numbers = [int(part) for part in parts[:3] if part.isdigit()]
    while len(numbers) < 3:
        numbers.append(0)
    return numbers[0], numbers[1], numbers[2]`,

`def parse_interval(value: str) -> tuple[date, date]:
    """Parse '2024-01-01/2024-02-01' into an inclusive date pair."""
    start_text, _, end_text = value.partition("/")
    return date.fromisoformat(start_text.strip()), date.fromisoformat(end_text.strip())`,

`def parse_csv_row(line: str) -> list[str]:
    """Parse one CSV row, unquoting and unescaping quoted fields."""
    fields = split_quoted(line)
    return [
        field.replace('""', '"').strip('"') if field.startswith('"') else field
        for field in fields
    ]`,

`def parse_hex_color(value: str) -> tuple[int, int, int]:
    """Convert '#rrggbb' (or '#rgb') into an (r, g, b) tuple."""
    text = value.strip().lstrip("#")
    if len(text) == 3:
        text = "".join(char * 2 for char in text)
    if len(text) != 6:
        raise ValueError(f"invalid hex color: {value!r}")
    red = int(text[0:2], 16)
    green = int(text[2:4], 16)
    blue = int(text[4:6], 16)
    return red, green, blue`,

`def parse_money(value: str) -> float:
    """Parse '$1,234.56' (or bare digits) into a float."""
    cleaned = re.sub(r"[^0-9.\\-]", "", value)
    if not cleaned:
        raise ValueError(f"cannot parse money: {value!r}")
    return float(cleaned)`,

`def parse_time_range(value: str) -> tuple[str, str]:
    """Split '09:00-17:30' into its two clock-time endpoints."""
    start_text, _, end_text = value.partition("-")
    return start_text.strip(), end_text.strip()`,

`def parse_email(value: str) -> tuple[str, str] | None:
    """Split an email address into (user, domain), or None when invalid."""
    match = re.fullmatch(r"([^@\\s]+)@([^@\\s]+\\.[^@\\s]+)", value.strip())
    if not match:
        return None
    return match.group(1), match.group(2)`,

`def parse_grid_size(value: str) -> tuple[int, int]:
    """Parse '3x4' or '3 x 4' into (rows, columns)."""
    match = re.fullmatch(r"\\s*(\\d+)\\s*[xX×]\\s*(\\d+)\\s*", value)
    if not match:
        raise ValueError(f"invalid grid size: {value!r}")
    return int(match.group(1)), int(match.group(2))`,

`def parse_log_line(line: str) -> dict[str, str]:
    """Extract timestamp, level, logger, and message from a log line."""
    match = re.match(r"(\\S+)\\s+(\\S+)\\s+\\[([^\\]]+)\\]\\s+(.+)", line)
    if not match:
        return {"message": line}
    return {
        "timestamp": match.group(1),
        "level": match.group(2),
        "logger": match.group(3),
        "message": match.group(4),
    }`,

`def parse_semicolon_list(text: str) -> list[str]:
    """Split on semicolons, dropping empties and trimming whitespace."""
    return [part.strip() for part in text.split(";") if part.strip()]`,

`def parse_pairs(text: str) -> dict[str, str]:
    """Parse 'a=1; b=2' into a dict of string pairs."""
    result: dict[str, str] = {}
    for token in parse_semicolon_list(text):
        key, _, value = token.partition("=")
        if key:
            result[key.strip()] = value.strip()
    return result`,

`def parse_sql_ddl_type(value: str) -> str:
    """Normalize a SQL column type like 'VARCHAR(255)' to 'varchar'."""
    return re.sub(r"\\(.*\\)", "", value).strip().lower()`,
    ],
  },
  // ---------------------------------------------------------------------------
  // concurrency.py
  // ---------------------------------------------------------------------------
  {
    name: 'concurrency.py',
    blocks: [
`"""Async and concurrency patterns: bounded fan-out, retries, polling, worker
queues, and timed coordination for service code."""
from __future__ import annotations
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any, AsyncIterable, Awaitable, Callable, Iterable, TypeVar
T = TypeVar("T")`,

`async def run_with_timeout(coro: Awaitable[T], timeout: float) -> T:
    """Await *coro* but raise TimeoutError if it runs too long."""
    return await asyncio.wait_for(coro, timeout=timeout)`,

`async def gather_limited(coros: Iterable[Awaitable[T]], limit: int) -> list[T]:
    """Run awaitables with at most *limit* in flight at once."""
    semaphore = asyncio.Semaphore(limit)

    async def guarded(coro: Awaitable[T]) -> T:
        async with semaphore:
            return await coro

    return list(await asyncio.gather(*(guarded(c) for c in coros)))`,

`async def retry_async(operation: Callable[[], Awaitable[T]], attempts: int, delay: float = 1.0) -> T:
    """Retry an async operation with a growing delay between failures."""
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            return await operation()
        except Exception as error:  # noqa: BLE001
            last_error = error
            if attempt < attempts - 1:
                await asyncio.sleep(delay * (attempt + 1))
    raise RuntimeError(f"operation failed after {attempts} attempts") from last_error`,

`async def wait_for_any(tasks: Iterable[Awaitable[T]], timeout: float) -> T:
    """Return the first result to complete within *timeout* seconds."""
    first, _ = await asyncio.wait(
        {asyncio.ensure_future(task) for task in tasks},
        return_when=asyncio.FIRST_COMPLETED,
        timeout=timeout,
    )
    if not first:
        raise asyncio.TimeoutError(f"no task finished within {timeout}s")
    done = first.pop()
    return await done`,

`async def poll_until(predicate: Callable[[], Awaitable[bool]], timeout: float, interval: float = 0.5) -> bool:
    """Poll an async predicate until it is true or the timeout passes."""
    loop = asyncio.get_event_loop()
    deadline = loop.time() + timeout
    while loop.time() < deadline:
        if await predicate():
            return True
        await asyncio.sleep(interval)
    return False`,

`def thread_pool_map(function: Callable[[T], Any], items: Iterable[T], workers: int = 4) -> list[Any]:
    """Map a blocking function over items using a fixed thread pool."""
    with ThreadPoolExecutor(max_workers=workers) as pool:
        return list(pool.map(function, items))`,

`class TaskQueue:
    """A bounded queue drained by a fixed number of worker tasks."""

    def __init__(self, workers: int = 4) -> None:
        self._queue: asyncio.Queue[Any] = asyncio.Queue()
        self._workers = workers

    async def run(self, handler: Callable[[Any], Awaitable[None]]) -> None:
        async def worker() -> None:
            while True:
                item = await self._queue.get()
                try:
                    await handler(item)
                finally:
                    self._queue.task_done()

        tasks = [asyncio.create_task(worker()) for _ in range(self._workers)]
        await self._queue.join()
        for task in tasks:
            task.cancel()

    async def put(self, item: Any) -> None:
        await self._queue.put(item)`,

`async def run_stages(stages: list[Callable[[T], Awaitable[T]]], initial: T) -> T:
    """Pipe a value through a sequence of async stages in order."""
    current = initial
    for stage in stages:
        current = await stage(current)
    return current`,

`async def heartbeat(interval: float, on_tick: Callable[[int], Awaitable[None]], stop: asyncio.Event) -> None:
    """Emit periodic ticks until the stop event is set."""
    tick_count = 0
    while not stop.is_set():
        await on_tick(tick_count)
        tick_count += 1
        try:
            await asyncio.wait_for(stop.wait(), timeout=interval)
        except asyncio.TimeoutError:
            continue`,

`async def with_lock(lock: asyncio.Lock, coro: Awaitable[T]) -> T:
    """Run an awaitable while holding a lock, releasing it afterwards."""
    async with lock:
        return await coro`,

`async def first_successful(attempts: Iterable[Callable[[], Awaitable[T]]]) -> T:
    """Try operations in order, returning the first one that succeeds."""
    errors: list[Exception] = []
    for operation in attempts:
        try:
            return await operation()
        except Exception as error:  # noqa: BLE001
            errors.append(error)
    raise RuntimeError("all attempts failed") from errors[-1]`,

`class PeriodicTask:
    """Run a coroutine every *interval* seconds until cancelled."""

    def __init__(self, interval: float, target: Callable[[], Awaitable[None]]) -> None:
        self._interval = interval
        self._target = target
        self._task: asyncio.Task[None] | None = None

    def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    async def _loop(self) -> None:
        while True:
            await self._target()
            await asyncio.sleep(self._interval)

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass`,

`async def consume_stream(stream: AsyncIterable[T], on_item: Callable[[T], Awaitable[None]], max_items: int = 1000) -> int:
    """Consume an async iterable, running a handler per item."""
    count = 0
    async for item in stream:
        await on_item(item)
        count += 1
        if count >= max_items:
            break
    return count`,

`async def timeout_group(coros: list[Awaitable[T]], timeout: float) -> list[T]:
    """Await all tasks, cancelling stragglers after the deadline."""
    tasks = [asyncio.create_task(coro) for coro in coros]
    done, pending = await asyncio.wait(tasks, timeout=timeout)
    for task in pending:
        task.cancel()
    return [task.result() for task in done]`,

`def rate_limited_loop(items: Iterable[T], per_second: float) -> Iterable[T]:
    """Yield items, sleeping between them to respect a rate limit."""
    delay = 1.0 / per_second if per_second > 0 else 0.0
    for item in items:
        yield item
        if delay:
            time.sleep(delay)`,

`async def batch_process(items: list[T], handler: Callable[[list[T]], Awaitable[None]], batch_size: int = 100) -> None:
    """Feed items to an async handler in chunks of *batch_size*."""
    for start in range(0, len(items), batch_size):
        await handler(items[start : start + batch_size])`,

`async def supervisor(workers: list[Callable[[], Awaitable[None]]], restart_delay: float = 2.0) -> None:
    """Restart worker coroutines whenever they exit unexpectedly."""
    tasks = {asyncio.create_task(worker()): worker for worker in workers}
    while tasks:
        done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for finished in done:
            worker = tasks.pop(finished)
            try:
                await finished
            except asyncio.CancelledError:
                raise
            except Exception:  # noqa: BLE001
                await asyncio.sleep(restart_delay)
                tasks[asyncio.create_task(worker())] = worker`,

`async def call_with_fallback(primary: Callable[[], Awaitable[T]], fallback: Callable[[], Awaitable[T]]) -> T:
    """Try the primary operation, falling back when it fails."""
    try:
        return await primary()
    except Exception:  # noqa: BLE001
        return await fallback()`,
    ],
  },

  // ---------------------------------------------------------------------------
  // crypto_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'crypto_utils.py',
    blocks: [
`"""Hashing and secret-handling helpers built on the standard library:
digests, HMAC, key derivation, and safe random generation."""
from __future__ import annotations
import base64
import hashlib
import hmac
import secrets
import string`,

`def sha256_hex(data: bytes | str) -> str:
    """Return the hex SHA-256 digest of bytes or a UTF-8 string."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()`,

`def md5_hex(data: bytes | str) -> str:
    """Return the hex MD5 digest (checksum use only, not security)."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.md5(data).hexdigest()`,

`def hmac_sha256(key: bytes | str, message: bytes | str) -> str:
    """Compute an HMAC-SHA256 signature over *message*."""
    if isinstance(key, str):
        key = key.encode("utf-8")
    if isinstance(message, str):
        message = message.encode("utf-8")
    return hmac.new(key, message, hashlib.sha256).hexdigest()`,

`def constant_time_compare(first: bytes, second: bytes) -> bool:
    """Compare two byte strings without leaking length differences."""
    return hmac.compare_digest(first, second)`,

`def random_token(byte_count: int = 16) -> str:
    """Return a URL-safe random token with *byte_count* bytes of entropy."""
    return secrets.token_urlsafe(byte_count)`,

`def secure_random_int(low: int, high: int) -> int:
    """Return a cryptographically random integer in [low, high]."""
    if high < low:
        raise ValueError("high must be at least low")
    return secrets.randbelow(high - low + 1) + low`,

`def random_password(length: int = 16) -> str:
    """Generate a password mixing letters, digits, and symbols."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))`,

`def hash_password(password: str, iterations: int = 120_000) -> str:
    """Derive a salted PBKDF2 hash in the format iterations$salt$digest."""
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), iterations
    ).hex()
    return f"{iterations}\${salt}\${digest}"`,

`def verify_password(password: str, stored: str) -> bool:
    """Check a password against a hash produced by hash_password."""
    iterations_text, salt, expected = stored.split("$")
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), int(iterations_text)
    ).hex()
    return hmac.compare_digest(digest, expected)`,

`def xor_bytes(first: bytes, second: bytes) -> bytes:
    """Byte-wise XOR of two equal-length byte strings."""
    if len(first) != len(second):
        raise ValueError("inputs must have equal length")
    return bytes(a ^ b for a, b in zip(first, second))`,

`def base64url_encode(data: bytes) -> str:
    """Encode bytes as unpadded, URL-safe base64."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")`,

`def base64url_decode(text: str) -> bytes:
    """Decode unpadded, URL-safe base64 back into bytes."""
    padding = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + padding)`,

`def checksum16(data: bytes) -> int:
    """Return a simple 16-bit additive checksum over a byte string."""
    return sum(data) & 0xFFFF`,

`def derive_key(passphrase: str, salt: bytes, length: int = 32) -> bytes:
    """Derive a *length*-byte key from a passphrase using scrypt."""
    return hashlib.scrypt(
        passphrase.encode(), salt=salt, n=2**14, r=8, p=1, dklen=length
    )`,

`def is_strong_password(password: str) -> bool:
    """Score a password against basic strength rules."""
    if len(password) < 12:
        return False
    categories = 0
    if any(char.islower() for char in password):
        categories += 1
    if any(char.isupper() for char in password):
        categories += 1
    if any(char.isdigit() for char in password):
        categories += 1
    if any(not char.isalnum() for char in password):
        categories += 1
    return categories >= 3`,

`def fingerprint(data: bytes) -> str:
    """Short, stable identifier for a blob of bytes."""
    return sha256_hex(data)[:16]`,

`def obfuscate_email(email: str) -> str:
    """Mask an email address for display, keeping first and last chars."""
    user, _, domain = email.partition("@")
    if len(user) <= 2:
        return f"*@*{domain}"
    return f"{user[0]}***{user[-1]}@{domain}"`,
    ],
  },

  // ---------------------------------------------------------------------------
  // ecommerce.py
  // ---------------------------------------------------------------------------
  {
    name: 'ecommerce.py',
    blocks: [
`"""E-commerce domain records and price logic: products, carts, orders,
coupons, inventory, and currency-aware totals."""
from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Any`,

`def round_money(amount: float) -> float:
    """Round a float to two decimal places, avoiding banker's rounding."""
    return math.floor(amount * 100 + 0.5) / 100`,

`@dataclass
class Product:
    """A sellable item with a unit price and stock code."""

    sku: str
    name: str
    price: float
    weight_kg: float = 0.0
    category: str = "general"

    def price_with_tax(self, rate: float = 0.2) -> float:
        return round_money(self.price * (1 + rate))`,

`@dataclass
class CartItem:
    """A product quantity pair inside a shopping cart."""

    product: Product
    quantity: int = 1

    def line_total(self) -> float:
        return round_money(self.product.price * self.quantity)`,

`@dataclass
class Cart:
    """An in-memory shopping cart keyed by SKU."""

    items: dict[str, CartItem] = field(default_factory=dict)

    def add(self, product: Product, quantity: int = 1) -> None:
        current = self.items.get(product.sku)
        if current:
            current.quantity += quantity
        else:
            self.items[product.sku] = CartItem(product, quantity)

    def remove(self, sku: str) -> None:
        self.items.pop(sku, None)

    def total(self) -> float:
        return round_money(sum(item.line_total() for item in self.items.values()))`,

`@dataclass
class Coupon:
    """A discount code that is either a percentage or a fixed amount."""

    code: str
    kind: str
    value: float
    minimum_spend: float = 0.0

    def discount_for(self, subtotal: float) -> float:
        if subtotal < self.minimum_spend:
            return 0.0
        if self.kind == "percent":
            return round_money(subtotal * self.value / 100)
        if self.kind == "fixed":
            return min(self.value, subtotal)
        return 0.0`,

`def discount_price(price: float, percent: float) -> float:
    """Apply a percentage discount to a price."""
    if not 0 <= percent <= 100:
        raise ValueError("discount percent must be between 0 and 100")
    return round_money(price * (1 - percent / 100))`,

`def shipping_cost(weight_kg: float, zone: str) -> float:
    """Estimate shipping by weight band and destination zone."""
    rates = {"local": 4.99, "regional": 9.99, "international": 24.99}
    base = rates.get(zone, 19.99)
    surcharge = max(0.0, math.ceil(weight_kg) - 1) * 1.5
    return round_money(base + surcharge)`,

`def tax_for(amount: float, region: str) -> float:
    """Sales tax for a region, keyed by ISO 3166-1 alpha-2 code."""
    rates = {"US": 0.0725, "CA": 0.13, "UK": 0.2, "DE": 0.19, "AU": 0.1}
    return round_money(amount * rates.get(region, 0.0))`,

`@dataclass
class InventoryItem:
    """A stock record with reserved and available quantities."""

    sku: str
    on_hand: int
    reserved: int = 0

    @property
    def available(self) -> int:
        return max(0, self.on_hand - self.reserved)

    def reserve(self, quantity: int) -> bool:
        if quantity <= self.available:
            self.reserved += quantity
            return True
        return False

    def release(self, quantity: int) -> None:
        self.reserved = max(0, self.reserved - quantity)`,

`def split_payment(amount: float, parts: int) -> list[float]:
    """Split a total into *parts* equal instalments to the cent."""
    if parts <= 0:
        raise ValueError("parts must be positive")
    total_cents = int(round_money(amount) * 100)
    base, remainder = divmod(total_cents, parts)
    result = [base] * parts
    for index in range(remainder):
        result[index] += 1
    return [round_money(cents / 100) for cents in result]`,

`def tier_price(quantity: int, tiers: dict[int, float]) -> float:
    """Pick the unit price for the first tier whose minimum is met."""
    if quantity <= 0:
        return 0.0
    best = None
    for minimum, price in sorted(tiers.items()):
        if quantity >= minimum:
            best = price
        else:
            break
    return best if best is not None else max(tiers.values(), default=0.0)`,

`def free_shipping_threshold(zone: str) -> float:
    """Minimum order subtotal that qualifies for free shipping."""
    thresholds = {"local": 35.0, "regional": 75.0, "international": 150.0}
    return thresholds.get(zone, 100.0)`,

`def cart_summary(items: list[CartItem]) -> dict[str, Any]:
    """Aggregate line items into a printable order summary."""
    subtotal = sum(item.line_total() for item in items)
    total_units = sum(item.quantity for item in items)
    return {
        "items": len(items),
        "units": total_units,
        "subtotal": round_money(subtotal),
    }`,

`def stock_status(available: int, low_threshold: int = 5) -> str:
    """Classify stock level as in-stock, low, or out-of-stock."""
    if available <= 0:
        return "out-of-stock"
    if available <= low_threshold:
        return "low"
    return "in-stock"`,

`def currency_symbol(code: str) -> str:
    """Map a currency code to its common symbol."""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", "AUD": "A$", "CAD": "C$"}
    return symbols.get(code.upper(), code.upper())`,

`def loyalty_points(spent: float, rate: int = 10) -> int:
    """Earn one loyalty point per *rate* currency units spent."""
    return int(spent // rate)`,

`@dataclass
class OrderRecord:
    """A placed order with payment and fulfillment state."""

    order_id: str
    customer_id: str
    lines: list[CartItem] = field(default_factory=list)
    status: str = "pending"

    def subtotal(self) -> float:
        return round_money(sum(line.line_total() for line in self.lines))

    def mark_shipped(self) -> None:
        if self.status not in {"pending", "paid"}:
            raise ValueError(f"cannot ship order in state {self.status!r}")
        self.status = "shipped"`,

`def bulk_discount(lines: list[CartItem]) -> float:
    """Apply a graduated discount when an order passes quantity bands."""
    units = sum(item.quantity for item in lines)
    if units >= 50:
        return 0.15
    if units >= 20:
        return 0.10
    if units >= 5:
        return 0.05
    return 0.0`,
    ],
  },

  // ---------------------------------------------------------------------------
  // ml_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'ml_utils.py',
    blocks: [
`"""Small machine-learning helpers: activations, losses, metrics, and data
preparation routines used in the training pipelines."""
from __future__ import annotations
import math
import random
from typing import Iterable, Iterator, Sequence, TypeVar
T = TypeVar("T")`,

`def sigmoid(value: float) -> float:
    """Logistic activation, stable for large inputs."""
    if value >= 0:
        z = math.exp(-value)
        return 1.0 / (1.0 + z)
    z = math.exp(value)
    return z / (1.0 + z)`,

`def relu(value: float) -> float:
    """Rectified linear activation."""
    return max(0.0, value)`,

`def leaky_relu(value: float, slope: float = 0.01) -> float:
    """Rectified linear with a small negative gradient."""
    return value if value > 0 else slope * value`,

`def softmax(values: Sequence[float]) -> list[float]:
    """Turn logits into a probability distribution."""
    highest = max(values)
    exponentials = [math.exp(value - highest) for value in values]
    total = sum(exponentials)
    return [value / total for value in exponentials]`,

`def mean_squared_error(expected: Sequence[float], predicted: Sequence[float]) -> float:
    """Average squared difference between two sequences."""
    if len(expected) != len(predicted):
        raise ValueError("sequences must have equal length")
    return sum((a - b) ** 2 for a, b in zip(expected, predicted)) / len(expected)`,

`def cross_entropy(expected: Sequence[float], predicted: Sequence[float]) -> float:
    """Categorical cross-entropy between two distributions."""
    total = 0.0
    for target, guess in zip(expected, predicted):
        guess = max(guess, 1e-12)
        total -= target * math.log(guess)
    return total / len(expected)`,

`def accuracy(labels: Sequence[int], predictions: Sequence[int]) -> float:
    """Fraction of predictions that match their labels."""
    if len(labels) != len(predictions) or not labels:
        raise ValueError("labels and predictions must match and be non-empty")
    hits = sum(a == b for a, b in zip(labels, predictions))
    return hits / len(labels)`,

`def train_test_split(items: Sequence[T], ratio: float = 0.8, seed: int | None = None) -> tuple[list[T], list[T]]:
    """Split items into train and test lists with a reproducible shuffle."""
    if not 0 < ratio < 1:
        raise ValueError("ratio must be between 0 and 1")
    rng = random.Random(seed)
    shuffled = list(items)
    rng.shuffle(shuffled)
    boundary = int(len(shuffled) * ratio)
    return shuffled[:boundary], shuffled[boundary:]`,

`def min_max_scale(values: Sequence[float], feature_range: tuple[float, float] = (0.0, 1.0)) -> list[float]:
    """Scale values into a target range using observed min and max."""
    low, high = feature_range
    observed_min = min(values)
    observed_max = max(values)
    if observed_max == observed_min:
        return [(low + high) / 2] * len(values)
    span = observed_max - observed_min
    return [low + (value - observed_min) * (high - low) / span for value in values]`,

`def confusion_matrix(labels: Sequence[int], predictions: Sequence[int], classes: int) -> list[list[int]]:
    """Build a classes x classes table of prediction outcomes."""
    matrix = [[0] * classes for _ in range(classes)]
    for actual, guess in zip(labels, predictions):
        matrix[actual][guess] += 1
    return matrix`,

`def precision_recall(labels: Sequence[int], predictions: Sequence[int], positive: int = 1) -> tuple[float, float]:
    """Precision and recall treating *positive* as the target class."""
    true_positive = sum(a == b == positive for a, b in zip(labels, predictions))
    predicted_positive = sum(p == positive for p in predictions)
    actual_positive = sum(a == positive for a in labels)
    precision = true_positive / predicted_positive if predicted_positive else 0.0
    recall = true_positive / actual_positive if actual_positive else 0.0
    return precision, recall`,

`def f1_score(labels: Sequence[int], predictions: Sequence[int]) -> float:
    """Harmonic mean of precision and recall for the positive class."""
    precision, recall = precision_recall(labels, predictions)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)`,

`def one_hot(index: int, size: int) -> list[int]:
    """Encode an index as a one-hot vector of the given size."""
    if not 0 <= index < size:
        raise ValueError("index out of range")
    vector = [0] * size
    vector[index] = 1
    return vector`,

`def euclidean_norm(values: Sequence[float]) -> float:
    """Length of a vector."""
    return math.sqrt(sum(value * value for value in values))`,

`def cosine_similarity(first: Sequence[float], second: Sequence[float]) -> float:
    """Cosine of the angle between two non-zero vectors."""
    if len(first) != len(second):
        raise ValueError("vectors must have equal length")
    dot = sum(a * b for a, b in zip(first, second))
    denominator = euclidean_norm(first) * euclidean_norm(second)
    if denominator == 0:
        return 0.0
    return dot / denominator`,

`def batch_iterator(data: Sequence[T], batch_size: int) -> Iterator[list[T]]:
    """Yield fixed-size batches from a sequence."""
    if batch_size <= 0:
        raise ValueError("batch size must be positive")
    for start in range(0, len(data), batch_size):
        yield list(data[start : start + batch_size])`,

`def weight_initializer(fan_in: int, fan_out: int) -> list[list[float]]:
    """Initialize a weight matrix using He-style scaling."""
    scale = math.sqrt(2.0 / fan_in)
    return [
        [random.uniform(-scale, scale) for _ in range(fan_out)]
        for _ in range(fan_in)
    ]`,

`def kmeans_assign(points: Sequence[Sequence[float]], centroids: Sequence[Sequence[float]]) -> list[int]:
    """Assign each point to the index of its nearest centroid."""
    assignments: list[int] = []
    for point in points:
        distances = [
            sum((a - b) ** 2 for a, b in zip(point, centroid)) for centroid in centroids
        ]
        assignments.append(distances.index(min(distances)))
    return assignments`,
    ],
  },
  // ---------------------------------------------------------------------------
  // format_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'format_utils.py',
    blocks: [
`"""Human-friendly formatting: sizes, numbers, tables, and text layout for
CLI output, reports, and notifications."""
from __future__ import annotations
import math
import re
from datetime import datetime, timezone
from typing import Iterable, Sequence`,

`def human_bytes(size: int) -> str:
    """Format a byte count as '1.5 MB' using binary units."""
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{value:.1f} PB"`,

`def comma_number(value: int) -> str:
    """Insert thousands separators into an integer."""
    return f"{value:,}"`,

`def percent(value: float, decimals: int = 1) -> str:
    """Format a ratio in [0, 1] as a percentage string."""
    return f"{value * 100:.{decimals}f}%"`,

`def pluralize(count: int, singular: str, plural: str | None = None) -> str:
    """Pick the singular or plural form for a count."""
    if count == 1:
        return singular
    return plural if plural is not None else singular + "s"`,

`def ordinal(number: int) -> str:
    """Return the ordinal suffix form of a number, e.g. 3 -> '3rd'."""
    if 10 <= number % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(number % 10, "th")
    return f"{number}{suffix}"`,

`def pad_number(value: int, width: int = 3) -> str:
    """Zero-pad a number to a fixed width."""
    return str(value).zfill(width)`,

`def format_currency(amount: float, symbol: str = "$", decimals: int = 2) -> str:
    """Format an amount with thousands separators and a symbol."""
    return f"{symbol}{amount:,.{decimals}f}"`,

`def truncate_lines(text: str, max_lines: int) -> str:
    """Cut a block of text after *max_lines*, adding an ellipsis marker."""
    lines = text.splitlines()
    if len(lines) <= max_lines:
        return text
    return "\\n".join(lines[:max_lines]) + "\\n…"`,

`def format_table(headers: Sequence[str], rows: Sequence[Sequence[str]]) -> str:
    """Render rows as an aligned, pipe-separated table."""
    widths = [
        max(len(str(header)), *(len(str(row[index])) for row in rows))
        for index, header in enumerate(headers)
    ]

    def line(cells: Sequence[str]) -> str:
        return " | ".join(str(cell).ljust(widths[index]) for index, cell in enumerate(cells))

    body = [line(headers), "-+-".join("-" * width for width in widths)]
    body.extend(line(row) for row in rows)
    return "\\n".join(body)`,

`def indent_text(text: str, spaces: int = 4) -> str:
    """Prepend leading whitespace to every line of *text*."""
    prefix = " " * spaces
    return "\\n".join(prefix + line for line in text.splitlines())`,

`def format_phone(digits: str, country: str = "US") -> str:
    """Group a digit string into a readable phone number."""
    cleaned = re.sub(r"\\D", "", digits)
    if country == "US" and len(cleaned) == 10:
        return f"({cleaned[0:3]}) {cleaned[3:6]}-{cleaned[6:]}"
    return cleaned`,

`def format_hhmmss(seconds: int) -> str:
    """Format seconds as HH:MM:SS."""
    hours, remainder = divmod(max(0, seconds), 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"`,

`def rate_string(numerator: float, denominator: float, decimals: int = 2) -> str:
    """Format a rate like '3.50/s' or 'n/a' when undefined."""
    if denominator == 0:
        return "n/a"
    return f"{numerator / denominator:.{decimals}f}/s"`,

`def significant_figures(value: float, digits: int = 3) -> str:
    """Format a float to *digits* significant figures."""
    if value == 0:
        return "0"
    return f"{value:.{digits}g}"`,

`def bullet_list(items: Iterable[str], marker: str = "-") -> str:
    """Render an iterable of strings as a bulleted block."""
    return "\\n".join(f"{marker} {item}" for item in items)`,

`def percentage_change(before: float, after: float) -> str:
    """Describe a change as a signed percentage with arrow."""
    if before == 0:
        return "n/a"
    change = (after - before) / abs(before) * 100
    return f"{change:+.1f}%"`,

`def timestamp_iso() -> str:
    """Current UTC time formatted for log prefixes."""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")`,

`def compact_list(items: Sequence[str], limit: int = 3) -> str:
    """Summarize a list like 'a, b, and 3 more'."""
    if not items:
        return ""
    if len(items) <= limit:
        return ", ".join(items)
    shown = ", ".join(items[:limit])
    return f"{shown}, and {len(items) - limit} more"`,
    ],
  },

  // ---------------------------------------------------------------------------
  // config_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'config_utils.py',
    blocks: [
`"""Configuration handling: deep merging, dotted-path access, environment
coercion, and redaction of sensitive values."""
from __future__ import annotations
import json
import os
from typing import Any`,

`def merge_configs(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    """Deep-merge two config dicts, with *override* winning."""
    merged = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = merge_configs(merged[key], value)
        else:
            merged[key] = value
    return merged`,

`def get_path(config: dict[str, Any], dotted: str, default: Any = None) -> Any:
    """Read a nested value using 'a.b.c' style keys."""
    current: Any = config
    for part in dotted.split("."):
        if not isinstance(current, dict) or part not in current:
            return default
        current = current[part]
    return current`,

`def set_path(config: dict[str, Any], dotted: str, value: Any) -> None:
    """Write a nested value, creating intermediate dicts as needed."""
    parts = dotted.split(".")
    current = config
    for part in parts[:-1]:
        current = current.setdefault(part, {})
    current[parts[-1]] = value`,

`def flatten_config(config: dict[str, Any], prefix: str = "") -> dict[str, str]:
    """Turn a nested config into dotted-key string values."""
    flat: dict[str, str] = {}
    for key, value in config.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flat.update(flatten_config(value, full_key))
        else:
            flat[full_key] = str(value)
    return flat`,

`def unflatten_config(flat: dict[str, str]) -> dict[str, Any]:
    """Rebuild nested dicts from dotted-key string values."""
    result: dict[str, Any] = {}
    for dotted, value in flat.items():
        set_path(result, dotted, value)
    return result`,

`def env_bool(name: str, default: bool = False) -> bool:
    """Read a boolean from an environment variable."""
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}`,

`def env_int(name: str, default: int = 0) -> int:
    """Read an integer from an environment variable with a fallback."""
    try:
        return int(os.environ.get(name, "").strip())
    except ValueError:
        return default`,

`def parse_env_line(line: str) -> tuple[str, str] | None:
    """Parse one 'KEY=value' line from a dotenv file."""
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    key, _, value = line.partition("=")
    key = key.strip()
    if not key:
        return None
    return key, value.strip().strip('"').strip("'")`,

`def missing_keys(config: dict[str, Any], required: list[str]) -> list[str]:
    """Return the dotted keys from *required* that are absent."""
    return [key for key in required if get_path(config, key) is None]`,

`def interpolate_env(template: str, environ: dict[str, str] | None = None) -> str:
    """Expand \${VAR} references inside a template string."""
    env = environ if environ is not None else os.environ
    for key, value in env.items():
        template = template.replace(f"\${{{key}}}", value)
    return template`,

`def redact_config(config: dict[str, Any], sensitive: set[str]) -> dict[str, Any]:
    """Replace values under sensitive dotted keys with '***'."""
    result = dict(config)
    for key in sensitive:
        if get_path(result, key) is not None:
            set_path(result, key, "***")
    return result`,

`def coerce_value(raw: str, target: type) -> Any:
    """Convert a raw string into an int, float, bool, or JSON value."""
    if target is bool:
        return raw.strip().lower() in {"1", "true", "yes", "on"}
    if target is int:
        return int(raw)
    if target is float:
        return float(raw)
    return json.loads(raw)`,

`def load_section(text: str, section: str) -> dict[str, str]:
    """Parse the [section] block of an INI-style string."""
    current_section: str | None = None
    values: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith(";"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current_section = line[1:-1]
            continue
        if current_section != section:
            continue
        key, _, value = line.partition("=")
        if key:
            values[key.strip()] = value.strip()
    return values`,

`def defaults_for(schema: dict[str, Any]) -> dict[str, Any]:
    """Build a config skeleton from a schema of default values."""
    result: dict[str, Any] = {}
    for key, value in schema.items():
        if isinstance(value, dict):
            result[key] = defaults_for(value)
        else:
            result[key] = value
    return result`,

`def env_prefix(prefix: str, environ: dict[str, str] | None = None) -> dict[str, str]:
    """Collect environment variables sharing a prefix, key stripped."""
    env = environ if environ is not None else os.environ
    result: dict[str, str] = {}
    for name, value in env.items():
        if name.startswith(prefix):
            result[name[len(prefix) :]] = value
    return result`,

`def validate_types(config: dict[str, Any], expected: dict[str, type]) -> list[str]:
    """Check that dotted config keys hold values of the expected type."""
    problems: list[str] = []
    for dotted, expected_type in expected.items():
        value = get_path(config, dotted)
        if value is not None and not isinstance(value, expected_type):
            problems.append(f"{dotted} should be {expected_type.__name__}")
    return problems`,
    ],
  },

  // ---------------------------------------------------------------------------
  // game_utils.py
  // ---------------------------------------------------------------------------
  {
    name: 'game_utils.py',
    blocks: [
`"""Game and simulation math: clamped movement, easing, dice rolls, seeded
shuffles, and progression curves used by the demo games."""
from __future__ import annotations
import math
import random
from typing import Callable, Sequence`,

`def clamp(value: float, low: float, high: float) -> float:
    """Constrain a value to the inclusive [low, high] range."""
    return max(low, min(value, high))`,

`def lerp(start: float, end: float, t: float) -> float:
    """Linear interpolation between two values."""
    return start + (end - start) * t`,

`def smoothstep(edge0: float, edge1: float, value: float) -> float:
    """Hermite easing that is flat at both edges."""
    t = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)`,

`def roll_dice(count: int, sides: int = 6) -> list[int]:
    """Roll *count* dice with the given number of sides."""
    if sides < 2:
        raise ValueError("dice must have at least two sides")
    return [random.randint(1, sides) for _ in range(count)]`,

`def weighted_pick(items: Sequence[str], weights: Sequence[float]) -> str:
    """Choose an item proportional to its weight."""
    if len(items) != len(weights) or not items:
        raise ValueError("items and weights must match and be non-empty")
    total = sum(weights)
    roll = random.uniform(0, total)
    cumulative = 0.0
    for item, weight in zip(items, weights):
        cumulative += weight
        if roll <= cumulative:
            return item
    return items[-1]`,

`def shuffle_seeded(items: list[str], seed: int) -> list[str]:
    """Shuffle a list deterministically from a seed value."""
    rng = random.Random(seed)
    shuffled = list(items)
    rng.shuffle(shuffled)
    return shuffled`,

`def grid_neighbors(position: tuple[int, int], width: int, height: int) -> list[tuple[int, int]]:
    """Four-connected neighbors of a cell inside a grid."""
    x, y = position
    candidates = [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]
    return [(nx, ny) for nx, ny in candidates if 0 <= nx < width and 0 <= ny < height]`,

`def angle_to_target(origin: tuple[float, float], target: tuple[float, float]) -> float:
    """Bearing from origin to target in degrees, 0 pointing right."""
    return math.degrees(math.atan2(target[1] - origin[1], target[0] - origin[0]))`,

`def experience_for_level(level: int, base: int = 100, growth: float = 1.5) -> int:
    """Total XP required to reach a given level."""
    if level <= 1:
        return 0
    return int(base * (growth ** (level - 1) - 1) / (growth - 1))`,

`def level_from_experience(xp: int, base: int = 100, growth: float = 1.5) -> int:
    """Invert the XP curve to find the level for an XP total."""
    if xp <= 0:
        return 1
    return int(math.log(1 + xp * (growth - 1) / base, growth)) + 1`,

`def damage_after_armor(damage: float, armor: float) -> int:
    """Reduce damage by a flat-then-mitigated armor formula."""
    mitigated = damage * (100.0 / (100.0 + armor))
    return max(1, int(round(mitigated)))`,

`def critical_hit(crit_rate: float, roll: float | None = None) -> bool:
    """Decide whether an attack crits given a rate in [0, 1]."""
    roll = random.random() if roll is None else roll
    return roll < crit_rate`,

`def spawn_interval(level: int, base: float = 2.0, floor: float = 0.4) -> float:
    """Seconds between spawns, shrinking as levels rise."""
    return max(floor, base * 0.92 ** (level - 1))`,

`def pseudo_random(seed: int) -> Callable[[], float]:
    """Create a deterministic PRNG function from a seed."""
    state = seed

    def next_value() -> float:
        nonlocal state
        state = (state * 1103515245 + 12345) & 0x7FFFFFFF
        return state / 0x7FFFFFFF

    return next_value`,

`def combo_multiplier(combo: int) -> float:
    """Score multiplier that climbs with the combo counter."""
    return 1.0 + min(combo, 50) * 0.02`,

`def tile_distance(first: tuple[int, int], second: tuple[int, int]) -> int:
    """Chebyshev distance between two grid tiles."""
    return max(abs(first[0] - second[0]), abs(first[1] - second[1]))`,

`def oscillation(t: float, period: float, amplitude: float) -> float:
    """Smooth sine oscillation for visual motion."""
    return amplitude * math.sin(2 * math.pi * t / period)`,

`def point_in_circle(center: tuple[float, float], radius: float, point: tuple[float, float]) -> bool:
    """Test whether a point falls inside a circle."""
    dx = point[0] - center[0]
    dy = point[1] - center[1]
    return dx * dx + dy * dy <= radius * radius`,
    ],
  },
];

// --- writer ---------------------------------------------------------------
for (const file of files) {
  const target = path.join(OUT, file.name);
  fs.writeFileSync(target, file.blocks.join('\n\n') + '\n');
}

const total = files.reduce((count, file) => count + file.blocks.length, 0);
console.log(`wrote ${files.length} python files, ${total} blocks total`);
