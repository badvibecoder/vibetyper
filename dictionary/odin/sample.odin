package main

import "core:fmt"

// add returns the sum of two integers.
add :: proc(a, b: int) -> int {
	return a + b
}

// clamp restricts a value to the inclusive range [low, high].
clamp :: proc(value, low, high: f64) -> f64 {
	if value < low {
		return low
	}
	if value > high {
		return high
	}
	return value
}

// average computes the arithmetic mean of a dynamic array.
average :: proc(values: []f64) -> f64 {
	if len(values) == 0 {
		return 0
	}
	total: f64 = 0
	for value in values {
		total += value
	}
	return total / f64(len(values))
}

// is_even reports whether an integer is divisible by two.
is_even :: proc(n: int) -> bool {
	return n % 2 == 0
}

// greet prints a greeting for the provided name.
greet :: proc(name: string) {
	fmt.printf("Hello, %s!\n", name)
}
