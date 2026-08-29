-- gcd computes the greatest common divisor via Euclid's algorithm.
local function gcd(a, b)
	a, b = math.abs(a), math.abs(b)
	while b ~= 0 do
		a, b = b, a % b
	end
	return a
end

-- lcm computes the least common multiple of two integers.
local function lcm(a, b)
	if a == 0 or b == 0 then
		return 0
	end
	return math.abs(a * b) / gcd(a, b)
end

-- is_prime checks primality up to the square root of n.
local function is_prime(n)
	if n < 2 then
		return false
	end
	if n % 2 == 0 then
		return n == 2
	end
	for d = 3, math.sqrt(n), 2 do
		if n % d == 0 then
			return false
		end
	end
	return true
end

-- nth_fib returns the n-th Fibonacci number, starting at 0.
local function nth_fib(n)
	if n <= 0 then
		return 0
	end
	local a, b = 0, 1
	for _ = 2, n do
		a, b = b, a + b
	end
	return b
end

-- factorial multiplies the integers from 1 to n.
local function factorial(n)
	if n < 0 then
		return nil
	end
	local result = 1
	for i = 2, n do
		result = result * i
	end
	return result
end

-- clamp confines a value to the inclusive range [lo, hi].
local function clamp(value, lo, hi)
	if value < lo then
		return lo
	end
	if value > hi then
		return hi
	end
	return value
end

-- lerp interpolates between a and b by t in the range [0, 1].
local function lerp(a, b, t)
	return a + (b - a) * clamp(t, 0, 1)
end

-- round rounds a number to the nearest integer or decimal place.
local function round(value, places)
	places = places or 0
	local factor = 10 ^ places
	return math.floor(value * factor + 0.5) / factor
end

-- mean returns the arithmetic average of a list of numbers.
local function mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + v
	end
	return total / #values
end

-- median finds the middle value of a sorted copy.
local function median(values)
	local sorted = {}
	for i, v in ipairs(values) do
		sorted[i] = v
	end
	table.sort(sorted)
	local mid = math.floor(#sorted / 2) + 1
	if #sorted % 2 == 1 then
		return sorted[mid]
	end
	return (sorted[mid - 1] + sorted[mid]) / 2
end

-- variance computes the population variance of a list.
local function variance(values)
	local m = mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + (v - m) ^ 2
	end
	return total / #values
end

-- stddev returns the population standard deviation.
local function stddev(values)
	return math.sqrt(variance(values))
end

-- percentile estimates the value at a given percentage rank.
local function percentile(values, p)
	local sorted = {}
	for i, v in ipairs(values) do
		sorted[i] = v
	end
	table.sort(sorted)
	if #sorted == 0 then
		return nil
	end
	local index = math.max(1, math.min(#sorted, math.ceil(p / 100 * #sorted)))
	return sorted[index]
end

-- is_power_of_two checks whether n is a positive power of two.
local function is_power_of_two(n)
	return n > 0 and (n & (n - 1)) == 0
end

-- next_power_of_two rounds n up to the next power of two.
local function next_power_of_two(n)
	if n <= 1 then
		return 1
	end
	local result = 1
	while result < n do
		result = result * 2
	end
	return result
end

-- digit_sum adds the decimal digits of a non-negative integer.
local function digit_sum(n)
	local m = math.abs(n)
	local total = 0
	while m > 0 do
		total = total + m % 10
		m = math.floor(m / 10)
	end
	return total
end

-- collatz_steps counts the steps to reach 1 in the Collatz sequence.
local function collatz_steps(n)
	if n <= 1 then
		return 0
	end
	local steps = 0
	while n ~= 1 do
		if n % 2 == 0 then
			n = n / 2
		else
			n = 3 * n + 1
		end
		steps = steps + 1
	end
	return steps
end

-- binomial computes n choose k using multiplicative form.
local function binomial(n, k)
	if k < 0 or k > n then
		return 0
	end
	k = math.min(k, n - k)
	local result = 1
	for i = 1, k do
		result = result * (n - i + 1) / i
	end
	return result
end

-- sigmoid squashes a raw score into the open interval (0, 1).
local function sigmoid(x)
	return 1 / (1 + math.exp(-x))
end

-- smoothstep eases a value through a hermite curve in [0, 1].
local function smoothstep(t)
	t = clamp(t, 0, 1)
	return t * t * (3 - 2 * t)
end

-- mod_angle wraps an angle in degrees into [0, 360).
local function mod_angle(degrees)
	return degrees % 360
end
