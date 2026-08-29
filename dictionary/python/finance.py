"""Financial calculations: money formatting, compounding, ratios, and
descriptive statistics with careful floating-point handling."""

from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable, Sequence


def format_money(amount: float, symbol: str = "$") -> str:
    """Format a numeric amount as currency with two decimals."""
    sign = "-" if amount < 0 else ""
    absolute = abs(amount)
    return f"{sign}{symbol}{absolute:,.2f}"


def compound_interest(
    principal: float,
    rate: float,
    years: int,
    periods: int = 12,
) -> float:
    """Return the future value of *principal* compounded *periods* per year."""
    return principal * (1 + rate / periods) ** (periods * years)


def simple_interest(principal: float, rate: float, years: float) -> float:
    """Return the total amount under simple (non-compounded) interest."""
    return principal * (1 + rate * years)


def annual_percentage_yield(rate: float, periods: int = 12) -> float:
    """Convert a nominal annual rate to an effective annual yield."""
    return (1 + rate / periods) ** periods - 1


def loan_payment(principal: float, annual_rate: float, months: int) -> float:
    """Compute a fixed monthly payment for an amortizing loan."""
    if months <= 0:
        raise ValueError("months must be positive")
    if annual_rate == 0:
        return principal / months
    monthly_rate = annual_rate / 12
    factor = (1 + monthly_rate) ** months
    return principal * monthly_rate * factor / (factor - 1)


def round_money(value: float, cents: str = "0.01") -> Decimal:
    """Round a float to cents using banker-neutral half-up semantics."""
    return Decimal(str(value)).quantize(Decimal(cents), rounding=ROUND_HALF_UP)


def mean(values: Iterable[float]) -> float:
    """Return the arithmetic mean of a non-empty sequence."""
    values = list(values)
    if not values:
        raise ValueError("mean of empty sequence")
    return sum(values) / len(values)


def median(values: Sequence[float]) -> float:
    """Return the median of a sequence."""
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2 == 0:
        return (ordered[mid - 1] + ordered[mid]) / 2
    return ordered[mid]


def variance(values: Sequence[float], sample: bool = True) -> float:
    """Return variance, using the sample formula by default."""
    if len(values) < 2:
        return 0.0
    avg = mean(values)
    denominator = len(values) - 1 if sample else len(values)
    return sum((value - avg) ** 2 for value in values) / denominator


def standard_deviation(values: Sequence[float]) -> float:
    """Return the sample standard deviation."""
    return variance(values) ** 0.5


def percentage_of(part: float, whole: float) -> float:
    """Return *part* expressed as a percentage of *whole*."""
    if whole == 0:
        return 0.0
    return part / whole * 100.0


def tip_amount(bill: float, rate: float = 0.2) -> float:
    """Compute a gratuity for a restaurant bill."""
    return bill * rate


def discount_price(price: float, discount_percent: float) -> float:
    """Apply a percentage discount to a price."""
    return price * (1 - discount_percent / 100.0)


def moving_average(values: Sequence[float], window: int) -> list[float]:
    """Return the simple moving average over a sliding window."""
    if window <= 0:
        raise ValueError("window must be positive")
    result = []
    for i in range(len(values) - window + 1):
        result.append(sum(values[i : i + window]) / window)
    return result
