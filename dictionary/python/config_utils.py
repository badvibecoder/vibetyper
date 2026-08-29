"""Configuration handling: deep merging, dotted-path access, environment
coercion, and redaction of sensitive values."""
from __future__ import annotations
import json
import os
from typing import Any

def merge_configs(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    """Deep-merge two config dicts, with *override* winning."""
    merged = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = merge_configs(merged[key], value)
        else:
            merged[key] = value
    return merged

def get_path(config: dict[str, Any], dotted: str, default: Any = None) -> Any:
    """Read a nested value using 'a.b.c' style keys."""
    current: Any = config
    for part in dotted.split("."):
        if not isinstance(current, dict) or part not in current:
            return default
        current = current[part]
    return current

def set_path(config: dict[str, Any], dotted: str, value: Any) -> None:
    """Write a nested value, creating intermediate dicts as needed."""
    parts = dotted.split(".")
    current = config
    for part in parts[:-1]:
        current = current.setdefault(part, {})
    current[parts[-1]] = value

def flatten_config(config: dict[str, Any], prefix: str = "") -> dict[str, str]:
    """Turn a nested config into dotted-key string values."""
    flat: dict[str, str] = {}
    for key, value in config.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flat.update(flatten_config(value, full_key))
        else:
            flat[full_key] = str(value)
    return flat

def unflatten_config(flat: dict[str, str]) -> dict[str, Any]:
    """Rebuild nested dicts from dotted-key string values."""
    result: dict[str, Any] = {}
    for dotted, value in flat.items():
        set_path(result, dotted, value)
    return result

def env_bool(name: str, default: bool = False) -> bool:
    """Read a boolean from an environment variable."""
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}

def env_int(name: str, default: int = 0) -> int:
    """Read an integer from an environment variable with a fallback."""
    try:
        return int(os.environ.get(name, "").strip())
    except ValueError:
        return default

def parse_env_line(line: str) -> tuple[str, str] | None:
    """Parse one 'KEY=value' line from a dotenv file."""
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    key, _, value = line.partition("=")
    key = key.strip()
    if not key:
        return None
    return key, value.strip().strip('"').strip("'")

def missing_keys(config: dict[str, Any], required: list[str]) -> list[str]:
    """Return the dotted keys from *required* that are absent."""
    return [key for key in required if get_path(config, key) is None]

def interpolate_env(template: str, environ: dict[str, str] | None = None) -> str:
    """Expand ${VAR} references inside a template string."""
    env = environ if environ is not None else os.environ
    for key, value in env.items():
        template = template.replace(f"${{{key}}}", value)
    return template

def redact_config(config: dict[str, Any], sensitive: set[str]) -> dict[str, Any]:
    """Replace values under sensitive dotted keys with '***'."""
    result = dict(config)
    for key in sensitive:
        if get_path(result, key) is not None:
            set_path(result, key, "***")
    return result

def coerce_value(raw: str, target: type) -> Any:
    """Convert a raw string into an int, float, bool, or JSON value."""
    if target is bool:
        return raw.strip().lower() in {"1", "true", "yes", "on"}
    if target is int:
        return int(raw)
    if target is float:
        return float(raw)
    return json.loads(raw)

def load_section(text: str, section: str) -> dict[str, str]:
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
    return values

def defaults_for(schema: dict[str, Any]) -> dict[str, Any]:
    """Build a config skeleton from a schema of default values."""
    result: dict[str, Any] = {}
    for key, value in schema.items():
        if isinstance(value, dict):
            result[key] = defaults_for(value)
        else:
            result[key] = value
    return result

def env_prefix(prefix: str, environ: dict[str, str] | None = None) -> dict[str, str]:
    """Collect environment variables sharing a prefix, key stripped."""
    env = environ if environ is not None else os.environ
    result: dict[str, str] = {}
    for name, value in env.items():
        if name.startswith(prefix):
            result[name[len(prefix) :]] = value
    return result

def validate_types(config: dict[str, Any], expected: dict[str, type]) -> list[str]:
    """Check that dotted config keys hold values of the expected type."""
    problems: list[str] = []
    for dotted, expected_type in expected.items():
        value = get_path(config, dotted)
        if value is not None and not isinstance(value, expected_type):
            problems.append(f"{dotted} should be {expected_type.__name__}")
    return problems
