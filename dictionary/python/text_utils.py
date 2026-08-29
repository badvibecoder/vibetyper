"""String and text handling helpers: case conversion, parsing, masking,
and small parsing combinators used across a codebase."""

from __future__ import annotations

import re
from typing import Iterable, Iterator, Sequence

WORD_RE = re.compile(r"\b\w+\b")


def word_count(text: str) -> int:
    """Count whitespace-delimited words in *text*."""
    return len(text.split())


def extract_words(text: str) -> list[str]:
    """Return all word tokens from *text* in order."""
    return WORD_RE.findall(text)


def title_case(text: str) -> str:
    """Title-case a string while leaving small words lower-case."""
    small = {"a", "an", "and", "the", "of", "for", "to", "in", "on"}
    words = text.split()
    result = []
    for index, word in enumerate(words):
        if word.lower() in small and index != 0:
            result.append(word.lower())
        else:
            result.append(word.capitalize())
    return " ".join(result)


def mask_secret(secret: str, visible: int = 4) -> str:
    """Mask all but the last *visible* characters of a secret."""
    if len(secret) <= visible:
        return "*" * len(secret)
    return "*" * (len(secret) - visible) + secret[-visible:]


def split_camel_case(value: str) -> str:
    """Insert spaces between camelCase or PascalCase words."""
    return re.sub(r"(?<!^)(?=[A-Z])", " ", value)


def is_palindrome(text: str) -> bool:
    """Return True when *text* reads the same forwards and backwards."""
    cleaned = re.sub(r"[^a-z0-9]", "", text.lower())
    return cleaned == cleaned[::-1]


def wrap(text: str, width: int = 80) -> list[str]:
    """Wrap *text* into lines no longer than *width* characters."""
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 > width and current:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()
    if current:
        lines.append(current)
    return lines


def common_prefix(strings: Sequence[str]) -> str:
    """Return the longest common prefix shared by all strings."""
    if not strings:
        return ""
    shortest = min(strings, key=len)
    for index, char in enumerate(shortest):
        if any(s[index] != char for s in strings):
            return shortest[:index]
    return shortest


def levenshtein(left: str, right: str) -> int:
    """Compute the edit distance between two strings."""
    if len(left) < len(right):
        left, right = right, left
    previous = list(range(len(right) + 1))
    for i, char_left in enumerate(left, start=1):
        current = [i]
        for j, char_right in enumerate(right, start=1):
            insert = previous[j] + 1
            delete = current[j - 1] + 1
            substitute = previous[j - 1] + (char_left != char_right)
            current.append(min(insert, delete, substitute))
        previous = current
    return previous[-1]


def slug_to_words(slug: str) -> str:
    """Convert a kebab-case slug back into spaced words."""
    return slug.replace("-", " ").replace("_", " ").strip()


def parse_key_value(text: str) -> dict[str, str]:
    """Parse lines of `key=value` text into a dict."""
    result: dict[str, str] = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, _, value = line.partition("=")
        if key and value:
            result[key.strip()] = value.strip()
    return result


def dedent_block(text: str) -> str:
    """Remove the common leading indentation from a block of text."""
    import textwrap

    return textwrap.dedent(text).strip()


def csv_to_list(value: str) -> list[str]:
    """Split a comma-separated string into a trimmed list."""
    return [item.strip() for item in value.split(",") if item.strip()]


def ellipsize_middle(value: str, limit: int = 40) -> str:
    """Shorten a long string by trimming the middle, keeping both ends."""
    if len(value) <= limit:
        return value
    keep = max(1, (limit - 3) // 2)
    return value[:keep] + "..." + value[-keep:]
