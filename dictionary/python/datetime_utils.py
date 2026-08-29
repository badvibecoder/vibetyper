"""Date and time helpers: calendar math, parsing, formatting, and
timezone adjustments used by scheduling and reporting services."""
from __future__ import annotations
import calendar
from datetime import date, datetime, timedelta, timezone

def days_between(start: date, end: date) -> int:
    """Return the number of calendar days between two dates."""
    return (end - start).days

def add_weekdays(start: date, count: int) -> date:
    """Advance *count* business days, skipping Saturdays and Sundays."""
    current = start
    added = 0
    while added < count:
        current += timedelta(days=1)
        if current.weekday() < 5:
            added += 1
    return current

def last_day_of_month(year: int, month: int) -> date:
    """Return the final day of the given month."""
    _, last = calendar.monthrange(year, month)
    return date(year, month, last)

def iso_weekday_name(day: date) -> str:
    """Return the English name of the weekday for *day*."""
    names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return names[day.weekday()]

def parse_iso_date(value: str) -> date:
    """Parse a YYYY-MM-DD string into a date, raising on bad input."""
    return date.fromisoformat(value.strip())

def format_duration(seconds: float) -> str:
    """Format a duration as e.g. '3h 12m' or '45s'."""
    seconds = max(0, int(seconds))
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes:02d}m"
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{secs}s"

def next_quarter_start(day: date) -> date:
    """Return the first day of the next calendar quarter after *day*."""
    month = ((day.month - 1) // 3 + 1) * 3 + 1
    year = day.year
    if month > 12:
        month = 1
        year += 1
    return date(year, month, 1)

def is_leap_year(year: int) -> bool:
    """Return True when *year* is a leap year."""
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

def month_range(year: int, month: int) -> tuple[date, date]:
    """Return the first and last day of a month as a pair."""
    first = date(year, month, 1)
    return first, last_day_of_month(year, month)

def to_unix_timestamp(dt: datetime) -> int:
    """Convert an aware datetime to a UTC epoch timestamp."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp())

def from_unix_timestamp(timestamp: int) -> datetime:
    """Convert an epoch timestamp into an aware UTC datetime."""
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)

def age_from_birthdate(birth: date, today: date | None = None) -> int:
    """Compute age in whole years from a birth date."""
    today = today or date.today()
    years = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        years -= 1
    return years

def time_ago(dt: datetime, now: datetime | None = None) -> str:
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
    return f"{days} day{'s' if days != 1 else ''} ago"

def business_days_in_month(year: int, month: int) -> int:
    """Count weekdays within a month, excluding weekends."""
    first, last = month_range(year, month)
    total = 0
    current = first
    while current <= last:
        if current.weekday() < 5:
            total += 1
        current += timedelta(days=1)
    return total

def weekday_of_date(value: str) -> str:
    """Return the weekday name for an ISO date string."""
    return iso_weekday_name(parse_iso_date(value))

def overlapping_interval(first: tuple[datetime, datetime], second: tuple[datetime, datetime]) -> timedelta | None:
    """Return the overlap between two time intervals, or None."""
    start = max(first[0], second[0])
    end = min(first[1], second[1])
    if end <= start:
        return None
    return end - start

def quarterly_bucket(day: date) -> str:
    """Label a date with its quarter, e.g. '2025-Q2'."""
    quarter = (day.month - 1) // 3 + 1
    return f"{day.year}-Q{quarter}"

def adjust_timezone(dt: datetime, offset_hours: int) -> datetime:
    """Shift a naive datetime by a fixed UTC offset in hours."""
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    return dt.replace(tzinfo=timezone(timedelta(hours=offset_hours)))

def minutes_until_next_hour(dt: datetime) -> int:
    """Minutes remaining until the top of the next hour."""
    return 60 - dt.minute - (1 if dt.second else 0)

def easter_sunday(year: int) -> date:
    """Compute Easter Sunday using the anonymous Gregorian algorithm."""
    a = year % 19
    b, c = divmod(year, 100)
    d = (b - b // 4 - (8 * b + 13) // 25 + 19 * a + 15) % 30
    e = d - (d // 28) * (1 - (d // 28) * (29 // (d + 1)) * ((21 - a) // 11))
    f = (year + year // 4 + e + 2 - c + c // 4) % 7
    month = 3 + (e - f + 40) // 44
    day = e - f + 28 - 31 * (month // 4)
    return date(year, month, day)
