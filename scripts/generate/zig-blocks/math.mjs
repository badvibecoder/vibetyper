// vibetyper zig dictionary data — math & numeric utilities
// Each entry is ONE complete, balanced top-level Zig unit. The generator adds
// `const std = @import("std");` at the top of each output file, so blocks may
// use `std.` freely. String.raw keeps backslash escapes literal.

export const blocks = [
  String.raw`fn gcd(a: u64, b: u64) u64 {
    var x = a;
    var y = b;
    while (y != 0) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x;
}`,

  String.raw`fn lcm(a: u64, b: u64) u64 {
    if (a == 0 or b == 0) return 0;
    return (a / gcd(a, b)) * b;
}`,

  String.raw`fn is_prime(n: u64) bool {
    if (n < 2) return false;
    if (n % 2 == 0) return n == 2;
    var d: u64 = 3;
    while (d * d <= n) : (d += 2) {
        if (n % d == 0) return false;
    }
    return true;
}`,

  // Sieve of Eratosthenes; result[n] is true when n is prime.
  String.raw`fn sieve_alloc(allocator: std.mem.Allocator, limit: usize) !std.ArrayList(bool) {
    var prime = std.ArrayList(bool).init(allocator);
    try prime.appendNTimes(true, limit + 1);
    prime.items[0] = false;
    if (limit >= 1) prime.items[1] = false;
    var i: usize = 2;
    while (i * i <= limit) : (i += 1) {
        if (prime.items[i]) {
            var j = i * i;
            while (j <= limit) : (j += i) prime.items[j] = false;
        }
    }
    return prime;
}`,

  String.raw`fn nth_fibonacci(n: u32) u64 {
    if (n == 0) return 0;
    var a: u64 = 0;
    var b: u64 = 1;
    for (1..n) |_| {
        const next = a + b;
        a = b;
        b = next;
    }
    return b;
}`,

  String.raw`fn factorial_checked(n: u64) ?u64 {
    var result: u64 = 1;
    for (2..=n) |i| {
        const wide = @as(u128, result) * i;
        if (wide > std.math.maxInt(u64)) return null;
        result = @intCast(wide);
    }
    return result;
}`,

  String.raw`fn clamp_u32(value: u32, lo: u32, hi: u32) u32 {
    if (value < lo) return lo;
    if (value > hi) return hi;
    return value;
}`,

  String.raw`fn degrees_to_radians(deg: f64) f64 {
    const per_degree = std.math.pi / 180.0;
    return deg * per_degree;
}`,

  String.raw`fn mean_f64(values: []const f64) f64 {
    if (values.len == 0) return 0.0;
    var total: f64 = 0.0;
    for (values) |v| total += v;
    return total / @as(f64, @floatFromInt(values.len));
}`,

  String.raw`fn median_alloc(allocator: std.mem.Allocator, values: []const f64) !f64 {
    if (values.len == 0) return error.EmptyInput;
    const sorted = try allocator.dupe(f64, values);
    defer allocator.free(sorted);
    std.sort.block(f64, sorted, {}, std.sort.asc(f64));
    const mid = sorted.len / 2;
    if (sorted.len % 2 == 1) return sorted[mid];
    return (sorted[mid - 1] + sorted[mid]) / 2.0;
}`,

  String.raw`fn standard_deviation(values: []const f64) f64 {
    if (values.len == 0) return 0.0;
    const mean = mean_f64(values);
    var sum_sq: f64 = 0.0;
    for (values) |v| {
        const diff = v - mean;
        sum_sq += diff * diff;
    }
    return @sqrt(sum_sq / @as(f64, @floatFromInt(values.len)));
}`,

  String.raw`fn percentile_alloc(allocator: std.mem.Allocator, values: []const f64, p: f64) !f64 {
    if (values.len == 0) return error.EmptyInput;
    const sorted = try allocator.dupe(f64, values);
    defer allocator.free(sorted);
    std.sort.block(f64, sorted, {}, std.sort.asc(f64));
    const raw: usize = @intFromFloat(@floor(p * @as(f64, @floatFromInt(sorted.len - 1))));
    return sorted[@min(raw, sorted.len - 1)];
}`,

  String.raw`fn euclidean_distance(ax: f64, ay: f64, bx: f64, by: f64) f64 {
    const dx = ax - bx;
    const dy = ay - by;
    return @sqrt(dx * dx + dy * dy);
}`,

  String.raw`fn lerp(a: f64, b: f64, t: f64) f64 {
    // t outside 0..1 extrapolates past the endpoints.
    return a + (b - a) * t;
}`,

  String.raw`fn modular_pow(base: u64, exponent: u64, modulus: u64) u64 {
    var result: u64 = 1;
    var b = base % modulus;
    var e = exponent;
    while (e > 0) {
        if (e % 2 == 1) result = @intCast((@as(u128, result) * b) % @as(u128, modulus));
        b = @intCast((@as(u128, b) * b) % @as(u128, modulus));
        e /= 2;
    }
    return result;
}`,

  String.raw`fn digit_sum(n: u64) u32 {
    var total: u32 = 0;
    var rest = n;
    while (rest > 0) {
        total += @intCast(rest % 10);
        rest /= 10;
    }
    return total;
}`,

  String.raw`fn is_palindrome_number(n: u32) bool {
    if (n < 10) return true;
    var reversed: u64 = 0;
    var rest: u64 = n;
    while (rest > 0) {
        reversed = reversed * 10 + rest % 10;
        rest /= 10;
    }
    return reversed == @as(u64, n);
}`,

  String.raw`fn collatz_steps(n: u64) ?u32 {
    var steps: u32 = 0;
    var current = n;
    while (current != 1) {
        if (steps > 10000) return null;
        current = if (current % 2 == 0) current / 2 else 3 * current + 1;
        steps += 1;
    }
    return steps;
}`,

  String.raw`fn is_perfect_square(n: u64) bool {
    if (n == 0) return true;
    const root: u64 = @intFromFloat(@sqrt(@as(f64, @floatFromInt(n))));
    const lo: u128 = @as(u128, root) * root;
    const hi: u128 = @as(u128, root + 1) * (root + 1);
    return lo == @as(u128, n) or hi == @as(u128, n);
}`,

  String.raw`fn popcount_u64(value: u64) u32 {
    // Set-bit count, handy for Hamming distance work.
    return @popCount(value);
}`,

  String.raw`fn to_base_string_alloc(allocator: std.mem.Allocator, value: u64, base: u8) ![]u8 {
    if (base < 2 or base > 36) return error.InvalidBase;
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    var buf: [64]u8 = undefined;
    var idx: usize = 64;
    var rest = value;
    while (rest > 0 or idx == 64) {
        idx -= 1;
        buf[idx] = digits[@intCast(rest % @as(u64, base))];
        rest /= @as(u64, base);
    }
    return allocator.dupe(u8, buf[idx..]);
}`,

  String.raw`fn moving_average_alloc(allocator: std.mem.Allocator, values: []const f64, window: usize) ![]f64 {
    if (window == 0) return error.InvalidWindow;
    if (values.len < window) return error.NotEnoughData;
    const out = try allocator.alloc(f64, values.len - window + 1);
    var running: f64 = 0.0;
    for (values[0..window]) |v| running += v;
    out[0] = running / @as(f64, @floatFromInt(window));
    for (1..out.len) |i| {
        running += values[i + window - 1] - values[i - 1];
        out[i] = running / @as(f64, @floatFromInt(window));
    }
    return out;
}`,

  String.raw`fn safe_divide_f64(numerator: f64, denominator: f64) !f64 {
    if (denominator == 0.0) return error.DivideByZero;
    return numerator / denominator;
}`,

  String.raw`fn round_to_places(value: f64, places: u32) f64 {
    const scale = std.math.pow(f64, 10.0, @floatFromInt(places));
    return @round(value * scale) / scale;
}`,
];
// total: 24
