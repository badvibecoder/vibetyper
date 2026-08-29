"""Game and simulation math: clamped movement, easing, dice rolls, seeded
shuffles, and progression curves used by the demo games."""
from __future__ import annotations
import math
import random
from typing import Callable, Sequence

def clamp(value: float, low: float, high: float) -> float:
    """Constrain a value to the inclusive [low, high] range."""
    return max(low, min(value, high))

def lerp(start: float, end: float, t: float) -> float:
    """Linear interpolation between two values."""
    return start + (end - start) * t

def smoothstep(edge0: float, edge1: float, value: float) -> float:
    """Hermite easing that is flat at both edges."""
    t = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)

def roll_dice(count: int, sides: int = 6) -> list[int]:
    """Roll *count* dice with the given number of sides."""
    if sides < 2:
        raise ValueError("dice must have at least two sides")
    return [random.randint(1, sides) for _ in range(count)]

def weighted_pick(items: Sequence[str], weights: Sequence[float]) -> str:
    """Choose an item proportional to its weight."""
    if len(items) != len(weights) or not items:
        raise ValueError("items and weights must match and be non-empty")
    total = sum(weights)
    roll = random.uniform(0, total)
    cumulative = 0.0
    for item, weight in zip(items, weights):
        cumulative += weight
        if roll <= cumulative:
            return item
    return items[-1]

def shuffle_seeded(items: list[str], seed: int) -> list[str]:
    """Shuffle a list deterministically from a seed value."""
    rng = random.Random(seed)
    shuffled = list(items)
    rng.shuffle(shuffled)
    return shuffled

def grid_neighbors(position: tuple[int, int], width: int, height: int) -> list[tuple[int, int]]:
    """Four-connected neighbors of a cell inside a grid."""
    x, y = position
    candidates = [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]
    return [(nx, ny) for nx, ny in candidates if 0 <= nx < width and 0 <= ny < height]

def angle_to_target(origin: tuple[float, float], target: tuple[float, float]) -> float:
    """Bearing from origin to target in degrees, 0 pointing right."""
    return math.degrees(math.atan2(target[1] - origin[1], target[0] - origin[0]))

def experience_for_level(level: int, base: int = 100, growth: float = 1.5) -> int:
    """Total XP required to reach a given level."""
    if level <= 1:
        return 0
    return int(base * (growth ** (level - 1) - 1) / (growth - 1))

def level_from_experience(xp: int, base: int = 100, growth: float = 1.5) -> int:
    """Invert the XP curve to find the level for an XP total."""
    if xp <= 0:
        return 1
    return int(math.log(1 + xp * (growth - 1) / base, growth)) + 1

def damage_after_armor(damage: float, armor: float) -> int:
    """Reduce damage by a flat-then-mitigated armor formula."""
    mitigated = damage * (100.0 / (100.0 + armor))
    return max(1, int(round(mitigated)))

def critical_hit(crit_rate: float, roll: float | None = None) -> bool:
    """Decide whether an attack crits given a rate in [0, 1]."""
    roll = random.random() if roll is None else roll
    return roll < crit_rate

def spawn_interval(level: int, base: float = 2.0, floor: float = 0.4) -> float:
    """Seconds between spawns, shrinking as levels rise."""
    return max(floor, base * 0.92 ** (level - 1))

def pseudo_random(seed: int) -> Callable[[], float]:
    """Create a deterministic PRNG function from a seed."""
    state = seed

    def next_value() -> float:
        nonlocal state
        state = (state * 1103515245 + 12345) & 0x7FFFFFFF
        return state / 0x7FFFFFFF

    return next_value

def combo_multiplier(combo: int) -> float:
    """Score multiplier that climbs with the combo counter."""
    return 1.0 + min(combo, 50) * 0.02

def tile_distance(first: tuple[int, int], second: tuple[int, int]) -> int:
    """Chebyshev distance between two grid tiles."""
    return max(abs(first[0] - second[0]), abs(first[1] - second[1]))

def oscillation(t: float, period: float, amplitude: float) -> float:
    """Smooth sine oscillation for visual motion."""
    return amplitude * math.sin(2 * math.pi * t / period)

def point_in_circle(center: tuple[float, float], radius: float, point: tuple[float, float]) -> bool:
    """Test whether a point falls inside a circle."""
    dx = point[0] - center[0]
    dy = point[1] - center[1]
    return dx * dx + dy * dy <= radius * radius
