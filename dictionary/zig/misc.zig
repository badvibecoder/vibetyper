const std = @import("std");

// vibetyper Zig dictionary — misc utilities

fn xorshift64(state: *u64) u64 {
    var x = state.*;
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    state.* = x;
    return x;
}

fn rand_u64_range(state: *u64, lo: u64, hi: u64) u64 {
    const span = hi - lo;
    return lo + xorshift64(state) % span;
}

fn is_power_of_two(value: u64) bool {
    return value > 0 and (value & (value - 1)) == 0;
}

fn reverse_bits_u32(value: u32) u32 {
    var v = value;
    var reversed: u32 = 0;
    var i: u32 = 0;
    while (i < 32) : (i += 1) {
        reversed = (reversed << 1) | (v & 1);
        v >>= 1;
    }
    return reversed;
}

fn popcount_u32(value: u32) u32 {
    return @popCount(value);
}

fn align_up(value: usize, alignment: usize) usize {
    return (value + alignment - 1) & ~(alignment - 1);
}

fn clamp_i32(value: i32, lo: i32, hi: i32) i32 {
    return std.math.clamp(value, lo, hi);
}

fn parse_int_strict(text: []const u8) !i64 {
    return std.fmt.parseInt(i64, text, 10);
}

fn parse_float_strict(text: []const u8) !f64 {
    return std.fmt.parseFloat(f64, text);
}

fn env_var_or_default(allocator: std.mem.Allocator, key: []const u8, fallback: []const u8) ![]u8 {
    return std.process.getEnvVarOwned(allocator, key) catch |err| switch (err) {
        error.EnvironmentVariableNotFound => allocator.dupe(u8, fallback),
        else => return err,
    };
}

fn sleep_ms(ms: u64) void {
    std.time.sleep(ms * std.time.ns_per_ms);
}

fn elapsed_ms(start: i64) i64 {
    return std.time.milliTimestamp() - start;
}

fn swap_bytes_u16(value: u16) u16 {
    return (value << 8) | (value >> 8);
}

fn swap_bytes_u32(value: u32) u32 {
    return ((value & 0x000000ff) << 24) |
        ((value & 0x0000ff00) << 8) |
        ((value & 0x00ff0000) >> 8) |
        ((value & 0xff000000) >> 24);
}

fn median_of_three(a: i32, b: i32, c: i32) i32 {
    if ((a > b) != (a > c)) return a;
    if ((b > a) != (b > c)) return b;
    return c;
}

fn min_max_slice(values: []const i32) ?struct { min: i32, max: i32 } {
    if (values.len == 0) return null;
    var min = values[0];
    var max = values[0];
    for (values[1..]) |v| {
        min = @min(min, v);
        max = @max(max, v);
    }
    return .{ .min = min, .max = max };
}

fn bits_to_string_alloc(allocator: std.mem.Allocator, value: u8) ![]u8 {
    const out = try allocator.alloc(u8, 8);
    var i: usize = 0;
    var bit: u3 = 7;
    while (i < 8) : (i += 1) {
        out[i] = if (((value >> bit) & 1) == 1) '1' else '0';
        bit -= 1;
    }
    return out;
}

fn starts_with_ignore_case(haystack: []const u8, prefix: []const u8) bool {
    if (prefix.len > haystack.len) return false;
    for (prefix, 0..) |c, i| {
        const lower_c = if (c >= 'A' and c <= 'Z') c + 32 else c;
        const lower_h = if (haystack[i] >= 'A' and haystack[i] <= 'Z') haystack[i] + 32 else haystack[i];
        if (lower_c != lower_h) return false;
    }
    return true;
}

fn safe_divide(a: f64, b: f64) !f64 {
    if (b == 0.0) return error.DivisionByZero;
    return a / b;
}

fn percent_change(previous: f64, current: f64) f64 {
    if (previous == 0.0) return 0.0;
    return (current - previous) / previous * 100.0;
}

fn round_up_div(a: u64, b: u64) u64 {
    if (b == 0) return 0;
    return (a + b - 1) / b;
}

fn is_within(value: f64, lo: f64, hi: f64) bool {
    return value >= lo and value <= hi;
}
