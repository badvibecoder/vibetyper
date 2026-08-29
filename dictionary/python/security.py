"""Security helpers: password hashing, token generation, input sanitization,
and constant-time comparison — the small primitives that matter most."""

from __future__ import annotations

import hashlib
import hmac
import secrets
import string
from typing import Optional

ALPHANUMERIC = string.ascii_letters + string.digits


def generate_token(length: int = 32) -> str:
    """Return a cryptographically random URL-safe token."""
    return secrets.token_urlsafe(length)


def generate_otp(digits: int = 6) -> str:
    """Return a numeric one-time password of the given length."""
    return "".join(secrets.choice(string.digits) for _ in range(digits))


def hash_password(password: str, salt: str = "") -> str:
    """Hash a password with a salt using PBKDF2 (single iteration demo)."""
    if not salt:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
    )
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Check a password against a stored hash in constant time."""
    try:
        salt, expected = stored.split("$", 1)
    except ValueError:
        return False
    candidate = hash_password(password, salt).split("$", 1)[1]
    return hmac.compare_digest(candidate, expected)


def constant_time_equals(left: str, right: str) -> bool:
    """Compare two strings without leaking length via timing."""
    return hmac.compare_digest(left.encode(), right.encode())


def sanitize_input(value: str, max_length: int = 256) -> str:
    """Strip control characters and cap the length of untrusted input."""
    cleaned = "".join(ch for ch in value if ch.isprintable())
    return cleaned[:max_length]


def sha256_hex(value: str) -> str:
    """Return the SHA-256 hex digest of a string."""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sign_message(secret: str, message: str) -> str:
    """Create an HMAC-SHA256 signature for a message."""
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()


def verify_signature(secret: str, message: str, signature: str) -> bool:
    """Verify an HMAC signature in constant time."""
    expected = sign_message(secret, message)
    return hmac.compare_digest(expected, signature)


def is_strong_password(password: str, min_length: int = 12) -> bool:
    """Return True when a password meets basic strength rules."""
    if len(password) < min_length:
        return False
    has_upper = any(ch.isupper() for ch in password)
    has_lower = any(ch.islower() for ch in password)
    has_digit = any(ch.isdigit() for ch in password)
    has_symbol = any(ch in "!@#$%^&*()-_=+" for ch in password)
    return has_upper and has_lower and has_digit and has_symbol


def redact_secrets(text: str, *secrets_to_hide: str) -> str:
    """Replace any occurrence of known secrets with [REDACTED]."""
    result = text
    for secret in secrets_to_hide:
        if secret:
            result = result.replace(secret, "[REDACTED]")
    return result


def random_api_key(prefix: str = "vt") -> str:
    """Generate a prefixed API key with 32 random bytes of entropy."""
    return f"{prefix}_{secrets.token_urlsafe(32)}"


def entropy_bits(password: str) -> float:
    """Estimate password entropy in bits based on character classes."""
    if not password:
        return 0.0
    pool = 0
    if any(ch.islower() for ch in password):
        pool += 26
    if any(ch.isupper() for ch in password):
        pool += 26
    if any(ch.isdigit() for ch in password):
        pool += 10
    if any(ch in "!@#$%^&*()-_=+[]{};:,.<>?/|~" for ch in password):
        pool += 32
    return len(password) * (__import__("math").log2(pool) if pool else 0)
