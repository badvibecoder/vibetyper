"""Statistical helpers implemented from first principles: central tendency,
spread, distributions, and lightweight regression for analytics code."""
from __future__ import annotations
import math
from collections import Counter
from typing import Iterable, Sequence

def mean(values: Sequence[float]) -> float:
    """Arithmetic mean of a sequence, raising on an empty input."""
    if not values:
        raise ValueError("cannot take the mean of an empty sequence")
    return sum(values) / len(values)

def median(values: Sequence[float]) -> float:
    """Middle value of a sorted copy of the input."""
    ordered = sorted(values)
    count = len(ordered)
    if count == 0:
        raise ValueError("cannot take the median of an empty sequence")
    midpoint = count // 2
    if count % 2:
        return ordered[midpoint]
    return (ordered[midpoint - 1] + ordered[midpoint]) / 2

def mode(values: Iterable[float]) -> list[float]:
    """Return every value that occurs most often, in stable order."""
    counts = Counter(values)
    if not counts:
        return []
    highest = max(counts.values())
    return [value for value, count in counts.items() if count == highest]

def variance(values: Sequence[float], ddof: int = 1) -> float:
    """Sample variance; pass ddof=0 for the population variant."""
    if len(values) <= ddof:
        raise ValueError("not enough values to compute variance")
    average = mean(values)
    squared_deviations = sum((value - average) ** 2 for value in values)
    return squared_deviations / (len(values) - ddof)

def standard_deviation(values: Sequence[float], ddof: int = 1) -> float:
    """Square root of the variance."""
    return math.sqrt(variance(values, ddof=ddof))

def percentile(values: Sequence[float], rank: float) -> float:
    """Nearest-rank percentile: 50 is the median, 100 the maximum."""
    if not values or not 0 <= rank <= 100:
        raise ValueError("percentile rank must be between 0 and 100")
    ordered = sorted(values)
    position = max(0, math.ceil(rank / 100 * len(ordered)) - 1)
    return ordered[position]

def interquartile_range(values: Sequence[float]) -> float:
    """Spread between the 25th and 75th percentiles."""
    return percentile(values, 75) - percentile(values, 25)

def z_score(value: float, average: float, deviation: float) -> float:
    """Standard score: how many deviations above the mean."""
    if deviation == 0:
        return 0.0
    return (value - average) / deviation

def covariance(first: Sequence[float], second: Sequence[float]) -> float:
    """Pairwise co-variation of two equally sized sequences."""
    if len(first) != len(second) or not first:
        raise ValueError("covariance needs two non-empty sequences of equal length")
    mean_first = mean(first)
    mean_second = mean(second)
    return sum(
        (a - mean_first) * (b - mean_second) for a, b in zip(first, second)
    ) / (len(first) - 1)

def correlation(first: Sequence[float], second: Sequence[float]) -> float:
    """Pearson correlation coefficient in the range -1..1."""
    denominator = standard_deviation(first) * standard_deviation(second)
    if denominator == 0:
        return 0.0
    return covariance(first, second) / denominator

def linear_regression(xs: Sequence[float], ys: Sequence[float]) -> tuple[float, float]:
    """Fit y = slope * x + intercept via ordinary least squares."""
    if len(xs) != len(ys) or not xs:
        raise ValueError("regression needs matching non-empty sequences")
    slope = covariance(xs, ys) / variance(xs, ddof=0)
    intercept = mean(ys) - slope * mean(xs)
    return slope, intercept

def moving_average(values: Sequence[float], window: int) -> list[float]:
    """Simple rolling average with a fixed window size."""
    if window <= 0:
        raise ValueError("window must be positive")
    if window > len(values):
        return [mean(values)]
    result: list[float] = []
    total = sum(values[:window])
    result.append(total / window)
    for index in range(window, len(values)):
        total += values[index] - values[index - window]
        result.append(total / window)
    return result

def exponential_moving_average(values: Sequence[float], alpha: float) -> list[float]:
    """Smoothed series where newer samples weigh more."""
    if not values:
        return []
    smoothed = [values[0]]
    for value in values[1:]:
        smoothed.append(alpha * value + (1 - alpha) * smoothed[-1])
    return smoothed

def weighted_average(values: Sequence[float], weights: Sequence[float]) -> float:
    """Average where each value contributes according to its weight."""
    if len(values) != len(weights) or not values:
        raise ValueError("values and weights must match and be non-empty")
    total_weight = sum(weights)
    if total_weight == 0:
        raise ValueError("weights must not sum to zero")
    return sum(value * weight for value, weight in zip(values, weights)) / total_weight

def normalize(values: Sequence[float]) -> list[float]:
    """Scale values into the range [0, 1] using min-max scaling."""
    if not values:
        return []
    low = min(values)
    high = max(values)
    if high == low:
        return [0.0] * len(values)
    return [(value - low) / (high - low) for value in values]

def standardize(values: Sequence[float]) -> list[float]:
    """Center values on zero with unit variance."""
    if not values:
        return []
    average = mean(values)
    deviation = standard_deviation(values, ddof=0)
    if deviation == 0:
        return [0.0] * len(values)
    return [(value - average) / deviation for value in values]

def histogram(values: Sequence[float], bins: int) -> list[int]:
    """Count values falling into *bins* equal-width buckets."""
    if not values or bins <= 0:
        return []
    low = min(values)
    width = (max(values) - low) / bins
    counts = [0] * bins
    for value in values:
        index = int((value - low) / width)
        index = min(index, bins - 1)
        counts[index] += 1
    return counts

def detect_outliers(values: Sequence[float], factor: float = 1.5) -> list[float]:
    """Flag values beyond the Tukey fences as outliers."""
    if not values:
        return []
    q1 = percentile(values, 25)
    q3 = percentile(values, 75)
    spread = (q3 - q1) * factor
    lower = q1 - spread
    upper = q3 + spread
    return [value for value in values if value < lower or value > upper]

def entropy(probabilities: Sequence[float]) -> float:
    """Shannon entropy of a probability distribution, in bits."""
    total = 0.0
    for probability in probabilities:
        if probability <= 0:
            continue
        total -= probability * math.log2(probability)
    return total

def winsorize(values: Sequence[float], limits: float = 0.05) -> list[float]:
    """Clip the tails of a sample to the given quantiles."""
    if not 0 <= limits < 0.5:
        raise ValueError("limits must be in [0, 0.5)")
    if not values:
        return []
    lower = percentile(values, limits * 100)
    upper = percentile(values, 100 - limits * 100)
    return [max(lower, min(value, upper)) for value in values]
