"""Data munging utilities: CSV/JSON handling, group-by, flattening, and
windowed aggregation — the unglamorous code that powers real pipelines."""

from __future__ import annotations

import csv
import io
import json
from collections import defaultdict
from itertools import islice
from typing import Any, Iterable, Iterator, Sequence, TypeVar

T = TypeVar("T")


def read_csv(text: str, delimiter: str = ",") -> list[dict[str, str]]:
    """Parse CSV text into a list of dicts keyed by header row."""
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
    return list(reader)


def write_csv(rows: Iterable[dict[str, Any]]) -> str:
    """Serialize a list of dicts into CSV text with a header row."""
    rows = list(rows)
    if not rows:
        return ""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


def group_by(rows: Iterable[dict[str, Any]], key: str) -> dict[Any, list[dict[str, Any]]]:
    """Group a list of dicts by a shared key field."""
    grouped: dict[Any, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[row[key]].append(row)
    return dict(grouped)


def flatten(items: Iterable[Iterable[T]]) -> Iterator[T]:
    """Yield every item from nested iterables in order."""
    for sublist in items:
        yield from sublist


def unique_preserving_order(items: Iterable[T]) -> list[T]:
    """Deduplicate a sequence while keeping first-seen order."""
    seen: set[T] = set()
    result: list[T] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def chunk_aggregate(
    values: Sequence[float],
    size: int,
    operation: str = "sum",
) -> list[float]:
    """Aggregate consecutive chunks of *size* using a named operation."""
    functions = {
        "sum": sum,
        "max": max,
        "min": min,
        "avg": lambda chunk: sum(chunk) / len(chunk),
    }
    if operation not in functions:
        raise ValueError(f"unknown operation: {operation}")
    chunks = [values[i : i + size] for i in range(0, len(values), size)]
    return [functions[operation](chunk) for chunk in chunks if chunk]


def json_loads(text: str) -> Any:
    """Parse JSON text, tolerating trailing whitespace."""
    return json.loads(text.strip())


def json_dumps(value: Any, pretty: bool = True) -> str:
    """Serialize a value to JSON with optional pretty-printing."""
    if pretty:
        return json.dumps(value, indent=2, sort_keys=True)
    return json.dumps(value, separators=(",", ":"))


def select_fields(rows: Iterable[dict[str, Any]], *fields: str) -> list[dict[str, Any]]:
    """Project each row down to the requested fields."""
    return [{field: row[field] for field in fields} for row in rows]


def filter_rows(
    rows: Iterable[dict[str, Any]],
    predicate: Any,
) -> list[dict[str, Any]]:
    """Keep only rows where *predicate(row)* is truthy."""
    return [row for row in rows if predicate(row)]


def rolling_sum(values: Sequence[float], window: int) -> list[float]:
    """Compute a rolling sum over a fixed-size sliding window."""
    if window <= 0:
        raise ValueError("window must be positive")
    result: list[float] = []
    for i in range(len(values) - window + 1):
        result.append(sum(values[i : i + window]))
    return result


def percent_change(previous: float, current: float) -> float:
    """Return the percentage change from *previous* to *current*."""
    if previous == 0:
        return 0.0 if current == 0 else float("inf")
    return (current - previous) / abs(previous) * 100.0


def take(iterable: Iterable[T], limit: int) -> Iterator[T]:
    """Yield at most *limit* items from an iterable."""
    yield from islice(iterable, limit)


def transpose(matrix: Sequence[Sequence[T]]) -> list[list[T]]:
    """Return the transpose of a rectangular matrix."""
    return [list(row) for row in zip(*matrix)]
