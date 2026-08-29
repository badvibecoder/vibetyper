"""Filesystem helpers: reading, writing, scanning, and maintenance
routines that keep file handling consistent across the project."""
from __future__ import annotations
import hashlib
import json
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

def read_lines(path: str | Path) -> list[str]:
    """Read a file and return its non-empty, stripped lines."""
    result: list[str] = []
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped:
                result.append(stripped)
    return result

def write_json(path: str | Path, data: Any) -> None:
    """Serialize *data* to pretty-printed JSON at *path*."""
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write("\n")

def read_json(path: str | Path) -> Any:
    """Load JSON from a file, returning the parsed value."""
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)

def ensure_dir(path: str | Path) -> Path:
    """Create *path* and its parents when missing; return it."""
    directory = Path(path)
    directory.mkdir(parents=True, exist_ok=True)
    return directory

def find_files(root: str | Path, pattern: str) -> list[Path]:
    """Recursively list files under *root* matching a glob pattern."""
    return sorted(Path(root).rglob(pattern))

def unique_filename(directory: str | Path, base: str, ext: str) -> Path:
    """Return a path like base-2.ext that does not already exist."""
    candidate = Path(directory) / f"{base}.{ext}"
    counter = 2
    while candidate.exists():
        candidate = Path(directory) / f"{base}-{counter}.{ext}"
        counter += 1
    return candidate

def copy_file_atomic(source: str | Path, destination: str | Path) -> None:
    """Copy a file to a temp sibling, then rename into place."""
    source = Path(source)
    destination = Path(destination)
    temp = destination.with_name(destination.name + ".tmp")
    shutil.copy2(source, temp)
    os.replace(temp, destination)

def file_size_human(path: str | Path) -> str:
    """Return the size of a file as a human-readable string."""
    size = float(os.path.getsize(path))
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024 or unit == "TB":
            return f"{size:.1f} {unit}" if unit != "B" else f"{int(size)} B"
        size /= 1024
    return f"{size:.1f} TB"

def tail(path: str | Path, count: int = 10) -> list[str]:
    """Return the last *count* lines of a text file."""
    with open(path, encoding="utf-8") as handle:
        lines = handle.readlines()
    return [line.rstrip("\n") for line in lines[-count:]]

def sha256_of_file(path: str | Path) -> str:
    """Compute the SHA-256 digest of a file in chunks."""
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()

def count_lines(path: str | Path) -> int:
    """Count the lines in a file without loading it into memory."""
    total = 0
    with open(path, encoding="utf-8") as handle:
        for _ in handle:
            total += 1
    return total

def remove_empty_dirs(root: str | Path) -> int:
    """Delete empty directories under *root*, innermost first."""
    removed = 0
    for directory in sorted(Path(root).rglob("*"), reverse=True):
        if directory.is_dir() and not any(directory.iterdir()):
            directory.rmdir()
            removed += 1
    return removed

def extension_counts(root: str | Path) -> dict[str, int]:
    """Count files by extension under *root*."""
    counts: dict[str, int] = {}
    for entry in Path(root).rglob("*"):
        if entry.is_file() and entry.suffix:
            suffix = entry.suffix.lower()
            counts[suffix] = counts.get(suffix, 0) + 1
    return dict(sorted(counts.items()))

def touch(path: str | Path) -> None:
    """Create an empty file at *path*, updating its mtime if present."""
    Path(path).touch()

def backup_with_timestamp(path: str | Path) -> Path:
    """Copy a file to a sibling named with a UTC timestamp suffix."""
    source = Path(path)
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    backup = source.with_name(f"{source.stem}.{stamp}{source.suffix}")
    shutil.copy2(source, backup)
    return backup

def list_recent_files(directory: str | Path, limit: int = 5) -> list[Path]:
    """Return the most recently modified regular files in a directory."""
    entries = [e for e in Path(directory).iterdir() if e.is_file()]
    entries.sort(key=lambda e: e.stat().st_mtime, reverse=True)
    return entries[:limit]

def split_large_file(path: str | Path, max_lines: int) -> int:
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
    return part_number

def is_text_file(path: str | Path, sample_size: int = 1024) -> bool:
    """Heuristically decide whether a file holds text rather than binary."""
    with open(path, "rb") as handle:
        sample = handle.read(sample_size)
    if not sample:
        return True
    null_bytes = sample.count(b"\x00")
    return null_bytes / len(sample) < 0.3

def total_size(directory: str | Path) -> int:
    """Sum the byte sizes of every file under a directory tree."""
    total = 0
    for entry in Path(directory).rglob("*"):
        if entry.is_file():
            total += entry.stat().st_size
    return total

def safe_filename(name: str) -> str:
    """Replace characters that are unsafe on most filesystems."""
    cleaned = re.sub(r"[^\w\-. ]", "_", name)
    return cleaned.strip(" .") or "untitled"
