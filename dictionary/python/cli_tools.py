"""Command-line and filesystem helpers: argument parsing, path safety,
temporary files, and logging that CLIs tend to share."""

from __future__ import annotations

import argparse
import os
import shutil
import tempfile
from pathlib import Path
from typing import Iterable, Iterator, Optional


def build_parser(description: str) -> argparse.ArgumentParser:
    """Create an argument parser with sensible defaults."""
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--verbose", action="store_true", help="enable debug output")
    parser.add_argument("--dry-run", action="store_true", help="show what would happen")
    return parser


def safe_join(base: Path, *parts: str) -> Path:
    """Join path parts and reject traversal outside of *base*."""
    resolved = (base / Path(*parts)).resolve()
    if not str(resolved).startswith(str(base.resolve()) + os.sep):
        raise ValueError("path escapes base directory")
    return resolved


def ensure_dir(path: Path) -> Path:
    """Create a directory (and parents) if it does not exist."""
    path.mkdir(parents=True, exist_ok=True)
    return path


def list_files(directory: Path, pattern: str = "*") -> list[Path]:
    """Return all files under *directory* matching a glob pattern."""
    return sorted(directory.rglob(pattern))


def read_text_safe(path: Path, default: str = "") -> str:
    """Read a file as UTF-8 text, returning *default* on failure."""
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return default


def write_text_atomic(path: Path, content: str) -> None:
    """Write a file via a temp file + rename to avoid partial writes."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(content)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def copy_tree_filtered(
    source: Path,
    destination: Path,
    predicate,
) -> int:
    """Copy files matching *predicate*, returning the number copied."""
    count = 0
    for file in source.rglob("*"):
        if file.is_file() and predicate(file):
            relative = file.relative_to(source)
            target = destination / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file, target)
            count += 1
    return count


def human_size(num_bytes: int) -> str:
    """Format a byte count into a human-readable string."""
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024 or unit == "TB":
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} PB"


def file_extension(path: Path) -> str:
    """Return a lower-cased file extension without the dot."""
    return path.suffix.lstrip(".").lower()


def unique_path(directory: Path, name: str) -> Path:
    """Return a non-colliding path by appending a counter when needed."""
    candidate = directory / name
    counter = 1
    while candidate.exists():
        candidate = directory / f"{name}.{counter}"
        counter += 1
    return candidate


def walk_lines(path: Path) -> Iterator[str]:
    """Yield a file's lines lazily, stripping trailing whitespace."""
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            yield line.rstrip("\n")


def confirm(prompt: str, default: bool = True) -> bool:
    """Ask a yes/no question on the command line."""
    suffix = " [Y/n] " if default else " [y/N] "
    answer = input(prompt + suffix).strip().lower()
    if not answer:
        return default
    return answer in ("y", "yes")


def count_lines(path: Path) -> int:
    """Count the number of lines in a file."""
    return sum(1 for _ in path.open("r", encoding="utf-8"))
