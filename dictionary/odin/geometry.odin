package geometry

import "core:math"

// Vec2 is a 2D vector.
Vec2 :: struct {
	x: f64,
	y: f64,
}

// Vec3 is a 3D vector.
Vec3 :: struct {
	x: f64,
	y: f64,
	z: f64,
}

// Rect is an axis-aligned rectangle.
Rect :: struct {
	x:      f64,
	y:      f64,
	width:  f64,
	height: f64,
}

// vec2_add sums two 2D vectors component-wise.
vec2_add :: proc(a, b: Vec2) -> Vec2 {
	return Vec2{a.x + b.x, a.y + b.y}
}

// vec2_sub subtracts b from a component-wise.
vec2_sub :: proc(a, b: Vec2) -> Vec2 {
	return Vec2{a.x - b.x, a.y - b.y}
}

// vec2_dot computes the dot product of two 2D vectors.
vec2_dot :: proc(a, b: Vec2) -> f64 {
	return a.x * b.x + a.y * b.y
}

// vec2_length returns the Euclidean magnitude.
vec2_length :: proc(v: Vec2) -> f64 {
	return math.sqrt(v.x * v.x + v.y * v.y)
}

// vec2_normalize returns a unit vector, or zero for the zero vector.
vec2_normalize :: proc(v: Vec2) -> Vec2 {
	length := vec2_length(v)
	if length == 0 {
		return Vec2{}
	}
	return Vec2{v.x / length, v.y / length}
}

// vec2_scale multiplies a vector by a scalar.
vec2_scale :: proc(v: Vec2, factor: f64) -> Vec2 {
	return Vec2{v.x * factor, v.y * factor}
}

// vec3_dot computes the dot product of two 3D vectors.
vec3_dot :: proc(a, b: Vec3) -> f64 {
	return a.x * b.x + a.y * b.y + a.z * b.z
}

// vec3_cross computes the cross product of two 3D vectors.
vec3_cross :: proc(a, b: Vec3) -> Vec3 {
	return Vec3 {
		a.y * b.z - a.z * b.y,
		a.z * b.x - a.x * b.z,
		a.x * b.y - a.y * b.x,
	}
}

// distance_2d measures the straight-line distance between points.
distance_2d :: proc(a, b: Vec2) -> f64 {
	dx := a.x - b.x
	dy := a.y - b.y
	return math.sqrt(dx * dx + dy * dy)
}

// midpoint_2d averages two points.
midpoint_2d :: proc(a, b: Vec2) -> Vec2 {
	return Vec2{(a.x + b.x) / 2, (a.y + b.y) / 2}
}

// rect_contains tests whether a point lies inside a rectangle.
rect_contains :: proc(r: Rect, p: Vec2) -> bool {
	return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
}

// circle_area computes the area of a circle by radius.
circle_area :: proc(radius: f64) -> f64 {
	return math.PI * radius * radius
}

// circle_contains tests point membership in a circle.
circle_contains :: proc(cx, cy, radius: f64, p: Vec2) -> bool {
	dx := p.x - cx
	dy := p.y - cy
	return dx * dx + dy * dy <= radius * radius
}

// triangle_area_heron computes area from three side lengths.
triangle_area_heron :: proc(a, b, c: f64) -> f64 {
	s := (a + b + c) / 2
	return math.sqrt(max(s * (s - a) * (s - b) * (s - c), 0))
}

// polygon_area computes the signed area via the shoelace formula.
polygon_area :: proc(points: []Vec2) -> f64 {
	sum := 0.0
	n := len(points)
	if n < 3 {
		return 0
	}
	for i in 0 ..< n {
		j := (i + 1) % n
		sum += points[i].x * points[j].y - points[j].x * points[i].y
	}
	return abs(sum) / 2
}

// centroid_2d averages a set of points into one.
centroid_2d :: proc(points: []Vec2) -> Vec2 {
	if len(points) == 0 {
		return Vec2{}
	}
	total := Vec2{}
	for p in points {
		total.x += p.x
		total.y += p.y
	}
	return Vec2{total.x / f64(len(points)), total.y / f64(len(points))}
}

// reflect mirrors a vector across a unit normal.
reflect :: proc(v, normal: Vec2) -> Vec2 {
	dot := vec2_dot(v, normal)
	return Vec2{v.x - 2 * dot * normal.x, v.y - 2 * dot * normal.y}
}

// project yields the scalar projection of a onto b.
project :: proc(a, b: Vec2) -> f64 {
	length_b := vec2_length(b)
	if length_b == 0 {
		return 0
	}
	return vec2_dot(a, b) / length_b
}

// angle_between returns the angle between two vectors in radians.
angle_between :: proc(a, b: Vec2) -> f64 {
	length_a := vec2_length(a)
	length_b := vec2_length(b)
	if length_a == 0 || length_b == 0 {
		return 0
	}
	cosine := clamp(vec2_dot(a, b) / (length_a * length_b), -1, 1)
	return math.acos(cosine)
}
