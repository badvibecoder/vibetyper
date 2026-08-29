package math_utils

import "core:math"
import "core:sort"

// gcd computes the greatest common divisor via Euclid's algorithm.
gcd :: proc(a, b: int) -> int {
	x := abs(a)
	y := abs(b)
	for y != 0 {
		x, y = y, x % y
	}
	return x
}

// lcm computes the least common multiple of two integers.
lcm :: proc(a, b: int) -> int {
	if a == 0 || b == 0 {
		return 0
	}
	return abs(a / gcd(a, b) * b)
}

// is_prime checks primality with a 2,3 wheel and sqrt bound.
is_prime :: proc(n: int) -> bool {
	if n < 2 {
		return false
	}
	if n % 2 == 0 {
		return n == 2
	}
	if n % 3 == 0 {
		return n == 3
	}
	for d := 5; d * d <= n; d += 6 {
		if n % d == 0 || n % (d + 2) == 0 {
			return false
		}
	}
	return true
}

// fibonacci returns the n-th Fibonacci number iteratively.
fibonacci :: proc(n: int) -> i64 {
	if n <= 0 {
		return 0
	}
	a: i64 = 0
	b: i64 = 1
	for i in 1 ..< n {
		a, b = b, a + b
	}
	return b
}

// factorial computes n! with an overflow guard.
factorial :: proc(n: int) -> i64 {
	if n < 0 {
		return 0
	}
	result: i64 = 1
	for i := 2; i <= n; i += 1 {
		result *= i64(i)
	}
	return result
}

// binomial computes the binomial coefficient n choose k.
binomial :: proc(n, k: int) -> i64 {
	if k < 0 || k > n {
		return 0
	}
	k = min(k, n - k)
	result: i64 = 1
	for i in 0 ..< k {
		result = result * i64(n - i) / i64(i + 1)
	}
	return result
}

// mean computes the arithmetic mean of a slice.
mean :: proc(values: []f64) -> f64 {
	if len(values) == 0 {
		return 0
	}
	total := 0.0
	for v in values {
		total += v
	}
	return total / f64(len(values))
}

// median returns the middle value of a sorted-able slice.
median :: proc(values: []f64) -> f64 {
	if len(values) == 0 {
		return 0
	}
	sorted := make([]f64, len(values))
	defer delete(sorted)
	copy(sorted, values)
	sort.quick_sort(sorted[:])
	mid := len(sorted) / 2
	if len(sorted) % 2 == 1 {
		return sorted[mid]
	}
	return (sorted[mid - 1] + sorted[mid]) / 2
}

// variance computes the population variance of a slice.
variance :: proc(values: []f64) -> f64 {
	if len(values) < 2 {
		return 0
	}
	m := mean(values)
	sum := 0.0
	for v in values {
		d := v - m
		sum += d * d
	}
	return sum / f64(len(values))
}

// stddev computes the population standard deviation.
stddev :: proc(values: []f64) -> f64 {
	return math.sqrt(variance(values))
}

// clamp_angle wraps an angle in radians into [-pi, pi].
clamp_angle :: proc(angle: f64) -> f64 {
	tau := 2 * math.PI
	angle = math.mod(angle + math.PI, tau)
	if angle < 0 {
		angle += tau
	}
	return angle - math.PI
}

// radians_to_degrees converts radians to degrees.
radians_to_degrees :: proc(rad: f64) -> f64 {
	return rad * 180 / math.PI
}

// degrees_to_radians converts degrees to radians.
degrees_to_radians :: proc(deg: f64) -> f64 {
	return deg * math.PI / 180
}

// lerp linearly interpolates between a and b by t in [0, 1].
lerp :: proc(a, b, t: f64) -> f64 {
	return a + (b - a) * clamp(t, 0, 1)
}

// smoothstep eases t through a hermite curve in [0, 1].
smoothstep :: proc(t: f64) -> f64 {
	t = clamp(t, 0, 1)
	return t * t * (3 - 2 * t)
}

// remap_range rescales a value from one interval to another.
remap_range :: proc(value, from_lo, from_hi, to_lo, to_hi: f64) -> f64 {
	if from_hi == from_lo {
		return to_lo
	}
	t := (value - from_lo) / (from_hi - from_lo)
	return to_lo + t * (to_hi - to_lo)
}

// round_to rounds a value to a given number of decimal places.
round_to :: proc(value: f64, places: int) -> f64 {
	factor := math.pow(10, f64(places))
	return math.round(value * factor) / factor
}

// is_power_of_two checks whether an integer is a power of two.
is_power_of_two :: proc(n: int) -> bool {
	return n > 0 && (n & (n - 1)) == 0
}

// next_power_of_two rounds up to the smallest power of two >= n.
next_power_of_two :: proc(n: int) -> int {
	if n <= 1 {
		return 1
	}
	result := 1
	for result < n {
		result <<= 1
	}
	return result
}

// digit_sum adds up the decimal digits of a non-negative integer.
digit_sum :: proc(n: int) -> int {
	m := abs(n)
	sum := 0
	for m > 0 {
		sum += m % 10
		m /= 10
	}
	return sum
}

// collatz_steps counts the steps to reach 1 in the Collatz sequence.
collatz_steps :: proc(n: int) -> int {
	if n <= 1 {
		return 0
	}
	steps := 0
	m := n
	for m != 1 {
		if m % 2 == 0 {
			m /= 2
		} else {
			m = 3 * m + 1
		}
		steps += 1
	}
	return steps
}

// sigmoid maps a raw score into the (0, 1) range.
sigmoid :: proc(x: f64) -> f64 {
	return 1 / (1 + math.exp(-x))
}
