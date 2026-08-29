"""E-commerce domain records and price logic: products, carts, orders,
coupons, inventory, and currency-aware totals."""
from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Any

def round_money(amount: float) -> float:
    """Round a float to two decimal places, avoiding banker's rounding."""
    return math.floor(amount * 100 + 0.5) / 100

@dataclass
class Product:
    """A sellable item with a unit price and stock code."""

    sku: str
    name: str
    price: float
    weight_kg: float = 0.0
    category: str = "general"

    def price_with_tax(self, rate: float = 0.2) -> float:
        return round_money(self.price * (1 + rate))

@dataclass
class CartItem:
    """A product quantity pair inside a shopping cart."""

    product: Product
    quantity: int = 1

    def line_total(self) -> float:
        return round_money(self.product.price * self.quantity)

@dataclass
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
        return round_money(sum(item.line_total() for item in self.items.values()))

@dataclass
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
        return 0.0

def discount_price(price: float, percent: float) -> float:
    """Apply a percentage discount to a price."""
    if not 0 <= percent <= 100:
        raise ValueError("discount percent must be between 0 and 100")
    return round_money(price * (1 - percent / 100))

def shipping_cost(weight_kg: float, zone: str) -> float:
    """Estimate shipping by weight band and destination zone."""
    rates = {"local": 4.99, "regional": 9.99, "international": 24.99}
    base = rates.get(zone, 19.99)
    surcharge = max(0.0, math.ceil(weight_kg) - 1) * 1.5
    return round_money(base + surcharge)

def tax_for(amount: float, region: str) -> float:
    """Sales tax for a region, keyed by ISO 3166-1 alpha-2 code."""
    rates = {"US": 0.0725, "CA": 0.13, "UK": 0.2, "DE": 0.19, "AU": 0.1}
    return round_money(amount * rates.get(region, 0.0))

@dataclass
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
        self.reserved = max(0, self.reserved - quantity)

def split_payment(amount: float, parts: int) -> list[float]:
    """Split a total into *parts* equal instalments to the cent."""
    if parts <= 0:
        raise ValueError("parts must be positive")
    total_cents = int(round_money(amount) * 100)
    base, remainder = divmod(total_cents, parts)
    result = [base] * parts
    for index in range(remainder):
        result[index] += 1
    return [round_money(cents / 100) for cents in result]

def tier_price(quantity: int, tiers: dict[int, float]) -> float:
    """Pick the unit price for the first tier whose minimum is met."""
    if quantity <= 0:
        return 0.0
    best = None
    for minimum, price in sorted(tiers.items()):
        if quantity >= minimum:
            best = price
        else:
            break
    return best if best is not None else max(tiers.values(), default=0.0)

def free_shipping_threshold(zone: str) -> float:
    """Minimum order subtotal that qualifies for free shipping."""
    thresholds = {"local": 35.0, "regional": 75.0, "international": 150.0}
    return thresholds.get(zone, 100.0)

def cart_summary(items: list[CartItem]) -> dict[str, Any]:
    """Aggregate line items into a printable order summary."""
    subtotal = sum(item.line_total() for item in items)
    total_units = sum(item.quantity for item in items)
    return {
        "items": len(items),
        "units": total_units,
        "subtotal": round_money(subtotal),
    }

def stock_status(available: int, low_threshold: int = 5) -> str:
    """Classify stock level as in-stock, low, or out-of-stock."""
    if available <= 0:
        return "out-of-stock"
    if available <= low_threshold:
        return "low"
    return "in-stock"

def currency_symbol(code: str) -> str:
    """Map a currency code to its common symbol."""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", "AUD": "A$", "CAD": "C$"}
    return symbols.get(code.upper(), code.upper())

def loyalty_points(spent: float, rate: int = 10) -> int:
    """Earn one loyalty point per *rate* currency units spent."""
    return int(spent // rate)

@dataclass
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
        self.status = "shipped"

def bulk_discount(lines: list[CartItem]) -> float:
    """Apply a graduated discount when an order passes quantity bands."""
    units = sum(item.quantity for item in lines)
    if units >= 50:
        return 0.15
    if units >= 20:
        return 0.10
    if units >= 5:
        return 0.05
    return 0.0
