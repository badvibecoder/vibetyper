"""Data models and serialization: dataclasses, enums, and to/from dict
conversion that a typical service layer relies on."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Optional


class Status(str, Enum):
    """An enum of canonical record states."""

    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


@dataclass
class Address:
    """A postal address value object."""

    street: str
    city: str
    zip_code: str
    country: str = "US"

    def full(self) -> str:
        return f"{self.street}, {self.city} {self.zip_code}, {self.country}"


@dataclass
class User:
    """A user account with mutable derived state."""

    id: int
    username: str
    email: str
    status: Status = Status.ACTIVE
    tags: list[str] = field(default_factory=list)

    def is_active(self) -> bool:
        return self.status is Status.ACTIVE

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["status"] = self.status.value
        return data


@dataclass(frozen=True)
class Point:
    """An immutable 2-D coordinate."""

    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


@dataclass
class Order:
    """A line-item order that computes its own total."""

    order_id: str
    items: list[dict[str, float]] = field(default_factory=list)
    tax_rate: float = 0.08

    def subtotal(self) -> float:
        return sum(item["price"] * item["qty"] for item in self.items)

    def total(self) -> float:
        return self.subtotal() * (1 + self.tax_rate)


@dataclass
class Page:
    """A paginated slice plus metadata."""

    items: list[Any]
    page: int
    page_size: int
    total: int

    @property
    def has_more(self) -> bool:
        return self.page * self.page_size < self.total


class Priority(Enum):
    """An ordered priority enum."""

    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

    def at_least(self, other: "Priority") -> bool:
        return self.value >= other.value


@dataclass
class Config:
    """Nested configuration with a typed lookup helper."""

    values: dict[str, Any] = field(default_factory=dict)

    def get(self, key: str, default: Any = None) -> Any:
        current: Any = self.values
        for part in key.split("."):
            if not isinstance(current, dict) or part not in current:
                return default
            current = current[part]
        return current


def from_dict(cls: type, data: dict[str, Any]) -> Any:
    """Construct a dataclass instance from a dict of field values."""
    fields = {f.name for f in cls.__dataclass_fields__.values()}
    return cls(**{k: v for k, v in data.items() if k in fields})


def to_dict(instance: Any) -> dict[str, Any]:
    """Serialize a dataclass instance back to a plain dict."""
    return asdict(instance)


def merge_models(*models: dict[str, Any]) -> dict[str, Any]:
    """Shallow-merge several dict-like models, later keys winning."""
    merged: dict[str, Any] = {}
    for model in models:
        merged.update(model)
    return merged


@dataclass
class Result:
    """A result wrapper with an optional error message."""

    ok: bool
    value: Any = None
    error: Optional[str] = None

    @classmethod
    def success(cls, value: Any) -> "Result":
        return cls(ok=True, value=value)

    @classmethod
    def failure(cls, message: str) -> "Result":
        return cls(ok=False, error=message)
