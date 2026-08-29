-- vec2_new builds a 2D vector.
local function vec2_new(x, y)
	return { x = x or 0, y = y or 0 }
end

-- vec2_add sums two 2D vectors component-wise.
local function vec2_add(a, b)
	return { x = a.x + b.x, y = a.y + b.y }
end

-- vec2_sub subtracts b from a component-wise.
local function vec2_sub(a, b)
	return { x = a.x - b.x, y = a.y - b.y }
end

-- vec2_dot computes the dot product of two 2D vectors.
local function vec2_dot(a, b)
	return a.x * b.x + a.y * b.y
end

-- vec2_length returns the Euclidean magnitude.
local function vec2_length(v)
	return math.sqrt(v.x * v.x + v.y * v.y)
end

-- vec2_normalize returns a unit vector, or the zero vector.
local function vec2_normalize(v)
	local length = vec2_length(v)
	if length == 0 then
		return { x = 0, y = 0 }
	end
	return { x = v.x / length, y = v.y / length }
end

-- vec2_scale multiplies a vector by a scalar.
local function vec2_scale(v, factor)
	return { x = v.x * factor, y = v.y * factor }
end

-- distance_2d measures the straight-line distance between points.
local function distance_2d(a, b)
	local dx = a.x - b.x
	local dy = a.y - b.y
	return math.sqrt(dx * dx + dy * dy)
end

-- midpoint_2d averages two points.
local function midpoint_2d(a, b)
	return { x = (a.x + b.x) / 2, y = (a.y + b.y) / 2 }
end

-- rect_new builds an axis-aligned rectangle.
local function rect_new(x, y, width, height)
	return { x = x, y = y, width = width, height = height }
end

-- rect_contains tests whether a point lies inside a rectangle.
local function rect_contains(r, p)
	return p.x >= r.x and p.x <= r.x + r.width and p.y >= r.y and p.y <= r.y + r.height
end

-- circle_area computes the area of a circle by radius.
local function circle_area(radius)
	return math.pi * radius * radius
end

-- circle_contains tests point membership in a circle.
local function circle_contains(cx, cy, radius, p)
	local dx = p.x - cx
	local dy = p.y - cy
	return dx * dx + dy * dy <= radius * radius
end

-- polygon_area computes the area via the shoelace formula.
local function polygon_area(points)
	if #points < 3 then
		return 0
	end
	local total = 0
	for i = 1, #points do
		local j = i % #points + 1
		total = total + points[i].x * points[j].y - points[j].x * points[i].y
	end
	return math.abs(total) / 2
end

-- centroid_2d averages a set of points into one.
local function centroid_2d(points)
	if #points == 0 then
		return { x = 0, y = 0 }
	end
	local x, y = 0, 0
	for _, p in ipairs(points) do
		x = x + p.x
		y = y + p.y
	end
	return { x = x / #points, y = y / #points }
end

-- reflect_2d mirrors a vector across a unit normal.
local function reflect_2d(v, normal)
	local dot = vec2_dot(v, normal)
	return { x = v.x - 2 * dot * normal.x, y = v.y - 2 * dot * normal.y }
end

-- project_scalar yields the scalar projection of a onto b.
local function project_scalar(a, b)
	local length = vec2_length(b)
	if length == 0 then
		return 0
	end
	return vec2_dot(a, b) / length
end

-- angle_between returns the angle between two vectors in radians.
local function angle_between(a, b)
	local length_a = vec2_length(a)
	local length_b = vec2_length(b)
	if length_a == 0 or length_b == 0 then
		return 0
	end
	local cosine = vec2_dot(a, b) / (length_a * length_b)
	return math.acos(math.max(-1, math.min(1, cosine)))
end

-- vec3_dot computes the dot product of two 3D vectors.
local function vec3_dot(a, b)
	return a.x * b.x + a.y * b.y + a.z * b.z
end

-- vec3_cross computes the cross product of two 3D vectors.
local function vec3_cross(a, b)
	return {
		x = a.y * b.z - a.z * b.y,
		y = a.z * b.x - a.x * b.z,
		z = a.x * b.y - a.y * b.x,
	}
end

-- vec3_length returns the Euclidean magnitude of a 3D vector.
local function vec3_length(v)
	return math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
end
