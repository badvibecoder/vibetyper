"""Hashing and secret-handling helpers built on the standard library:
digests, HMAC, key derivation, and safe random generation."""
from __future__ import annotations
import base64
import hashlib
import hmac
import secrets
import string

def sha256_hex(data: bytes | str) -> str:
    """Return the hex SHA-256 digest of bytes or a UTF-8 string."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()

def md5_hex(data: bytes | str) -> str:
    """Return the hex MD5 digest (checksum use only, not security)."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.md5(data).hexdigest()

def hmac_sha256(key: bytes | str, message: bytes | str) -> str:
    """Compute an HMAC-SHA256 signature over *message*."""
    if isinstance(key, str):
        key = key.encode("utf-8")
    if isinstance(message, str):
        message = message.encode("utf-8")
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def constant_time_compare(first: bytes, second: bytes) -> bool:
    """Compare two byte strings without leaking length differences."""
    return hmac.compare_digest(first, second)

def random_token(byte_count: int = 16) -> str:
    """Return a URL-safe random token with *byte_count* bytes of entropy."""
    return secrets.token_urlsafe(byte_count)

def secure_random_int(low: int, high: int) -> int:
    """Return a cryptographically random integer in [low, high]."""
    if high < low:
        raise ValueError("high must be at least low")
    return secrets.randbelow(high - low + 1) + low

def random_password(length: int = 16) -> str:
    """Generate a password mixing letters, digits, and symbols."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))

def hash_password(password: str, iterations: int = 120_000) -> str:
    """Derive a salted PBKDF2 hash in the format iterations$salt$digest."""
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), iterations
    ).hex()
    return f"{iterations}${salt}${digest}"

def verify_password(password: str, stored: str) -> bool:
    """Check a password against a hash produced by hash_password."""
    iterations_text, salt, expected = stored.split("$")
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), int(iterations_text)
    ).hex()
    return hmac.compare_digest(digest, expected)

def xor_bytes(first: bytes, second: bytes) -> bytes:
    """Byte-wise XOR of two equal-length byte strings."""
    if len(first) != len(second):
        raise ValueError("inputs must have equal length")
    return bytes(a ^ b for a, b in zip(first, second))

def base64url_encode(data: bytes) -> str:
    """Encode bytes as unpadded, URL-safe base64."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def base64url_decode(text: str) -> bytes:
    """Decode unpadded, URL-safe base64 back into bytes."""
    padding = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + padding)

def checksum16(data: bytes) -> int:
    """Return a simple 16-bit additive checksum over a byte string."""
    return sum(data) & 0xFFFF

def derive_key(passphrase: str, salt: bytes, length: int = 32) -> bytes:
    """Derive a *length*-byte key from a passphrase using scrypt."""
    return hashlib.scrypt(
        passphrase.encode(), salt=salt, n=2**14, r=8, p=1, dklen=length
    )

def is_strong_password(password: str) -> bool:
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
    return categories >= 3

def fingerprint(data: bytes) -> str:
    """Short, stable identifier for a blob of bytes."""
    return sha256_hex(data)[:16]

def obfuscate_email(email: str) -> str:
    """Mask an email address for display, keeping first and last chars."""
    user, _, domain = email.partition("@")
    if len(user) <= 2:
        return f"*@*{domain}"
    return f"{user[0]}***{user[-1]}@{domain}"
