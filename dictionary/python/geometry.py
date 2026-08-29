"""2-D geometry helpers: distances, intersections, polygons, and spatial
queries shared by the mapping and simulation modules."""
from __future__ import annotations
import math
from typing import Iterable
Point = tuple[float, float]

def euclidean_distance(first: Point, second: Point) -> float:
    """Return the straight-line distance between two points."""
    dx = first[0] - second[0]
    dy = first[1] - second[1]
    return math.hypot(dx, dy)

def manhattan_distance(first: Point, second: Point) -> float:
    """Return the grid distance between two points."""
    return abs(first[0] - second[0]) + abs(first[1] - second[1])

def polygon_area(points: list[Point]) -> float:
    """Compute the area of a polygon via the shoelace formula."""
    area = 0.0
    count = len(points)
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2

def point_in_polygon(point: Point, polygon: list[Point]) -> bool:
    """Ray-cast test for whether a point lies inside a polygon."""
    x, y = point
    inside = False
    count = len(polygon)
    for index in range(count):
        x1, y1 = polygon[index]
        x2, y2 = polygon[(index + 1) % count]
        crosses = (y1 > y) != (y2 > y)
        if crosses:
            hit_x = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if hit_x > x:
                inside = not inside
    return inside

def circle_intersection_area(radius_a: float, radius_b: float, distance: float) -> float:
    """Area shared by two circles with given radii and center distance."""
    if distance >= radius_a + radius_b:
        return 0.0
    if distance <= abs(radius_a - radius_b):
        return math.pi * min(radius_a, radius_b) ** 2
    term_a = radius_a**2 * math.acos(
        (distance**2 + radius_a**2 - radius_b**2) / (2 * distance * radius_a)
    )
    term_b = radius_b**2 * math.acos(
        (distance**2 + radius_b**2 - radius_a**2) / (2 * distance * radius_b)
    )
    term_c = 0.5 * math.sqrt(
        (-distance + radius_a + radius_b)
        * (distance + radius_a - radius_b)
        * (distance - radius_a + radius_b)
        * (distance + radius_a + radius_b)
    )
    return term_a + term_b - term_c

def rotate_point(point: Point, angle_degrees: float, origin: Point = (0.0, 0.0)) -> Point:
    """Rotate *point* around *origin* by a clockwise angle in degrees."""
    radians = math.radians(angle_degrees)
    cosine = math.cos(radians)
    sine = math.sin(radians)
    x = point[0] - origin[0]
    y = point[1] - origin[1]
    return (
        origin[0] + x * cosine - y * sine,
        origin[1] + x * sine + y * cosine,
    )

def bounding_box(points: Iterable[Point]) -> tuple[Point, Point]:
    """Return the (min, max) corners enclosing all points."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (min(xs), min(ys)), (max(xs), max(ys))

def line_intersection(first_start: Point, first_end: Point, second_start: Point, second_end: Point) -> Point | None:
    """Return the crossing point of two segments, or None when parallel."""
    x1, y1 = first_start
    x2, y2 = first_end
    x3, y3 = second_start
    x4, y4 = second_end
    denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if denominator == 0:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator
    if 0 <= t <= 1 and 0 <= u <= 1:
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    return None

def haversine_km(lat_a: float, lon_a: float, lat_b: float, lon_b: float, earth_radius: float = 6371.0) -> float:
    """Great-circle distance between two coordinates in kilometres."""
    phi_a = math.radians(lat_a)
    phi_b = math.radians(lat_b)
    delta_phi = math.radians(lat_b - lat_a)
    delta_lambda = math.radians(lon_b - lon_a)
    value = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi_a) * math.cos(phi_b) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * earth_radius * math.asin(math.sqrt(value))

def polygon_centroid(points: list[Point]) -> Point:
    """Return the area-weighted centroid of a simple polygon."""
    area_twice = 0.0
    centroid_x = 0.0
    centroid_y = 0.0
    count = len(points)
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        cross = x1 * y2 - x2 * y1
        area_twice += cross
        centroid_x += (x1 + x2) * cross
        centroid_y += (y1 + y2) * cross
    if area_twice == 0:
        raise ValueError("degenerate polygon has no centroid")
    return (centroid_x / (3 * area_twice), centroid_y / (3 * area_twice))

def angle_between(vertex: Point, first: Point, second: Point) -> float:
    """Angle in degrees between the rays vertex->first and vertex->second."""
    vector_a = (first[0] - vertex[0], first[1] - vertex[1])
    vector_b = (second[0] - vertex[0], second[1] - vertex[1])
    dot = vector_a[0] * vector_b[0] + vector_a[1] * vector_b[1]
    magnitude = math.hypot(*vector_a) * math.hypot(*vector_b)
    if magnitude == 0:
        return 0.0
    return math.degrees(math.acos(max(-1.0, min(1.0, dot / magnitude))))

def points_on_circle(center: Point, radius: float, count: int) -> list[Point]:
    """Distribute *count* points evenly around a circle."""
    return [
        (
            center[0] + radius * math.cos(2 * math.pi * index / count),
            center[1] + radius * math.sin(2 * math.pi * index / count),
        )
        for index in range(count)
    ]

def closest_point_on_segment(point: Point, start: Point, end: Point) -> Point:
    """Project a point onto a segment, clamping to its endpoints."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length_squared = dx * dx + dy * dy
    if length_squared == 0:
        return start
    t = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / length_squared
    t = max(0.0, min(1.0, t))
    return (start[0] + t * dx, start[1] + t * dy)

def triangle_area(first: Point, second: Point, third: Point) -> float:
    """Area of the triangle formed by three points (Heron's formula)."""
    a = euclidean_distance(first, second)
    b = euclidean_distance(second, third)
    c = euclidean_distance(third, first)
    semiperimeter = (a + b + c) / 2
    return math.sqrt(semiperimeter * (semiperimeter - a) * (semiperimeter - b) * (semiperimeter - c))

def line_parameters(first: Point, second: Point) -> tuple[float, float] | None:
    """Return (slope, intercept) for a line, or None when vertical."""
    dx = second[0] - first[0]
    if dx == 0:
        return None
    slope = (second[1] - first[1]) / dx
    return slope, first[1] - slope * first[0]

def is_convex(points: list[Point]) -> bool:
    """Return True when a polygon's vertices all turn the same direction."""
    count = len(points)
    if count < 3:
        return False
    sign = 0
    for index in range(count):
        x1, y1 = points[index]
        x2, y2 = points[(index + 1) % count]
        x3, y3 = points[(index + 2) % count]
        cross = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)
        if cross != 0:
            current_sign = 1 if cross > 0 else -1
            if sign and current_sign != sign:
                return False
            sign = current_sign
    return True

def scale_polygon(points: list[Point], factor: float, origin: Point = (0.0, 0.0)) -> list[Point]:
    """Scale every vertex of a polygon about *origin* by *factor*."""
    return [
        (origin[0] + (x - origin[0]) * factor, origin[1] + (y - origin[1]) * factor)
        for x, y in points
    ]

def polygon_perimeter(points: list[Point]) -> float:
    """Sum the edge lengths of a polygon."""
    return sum(
        euclidean_distance(points[index], points[(index + 1) % len(points)])
        for index in range(len(points))
    )
