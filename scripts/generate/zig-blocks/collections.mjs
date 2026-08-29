// vibetyper zig dictionary data — collections & container helpers
// Each entry is ONE complete, balanced top-level Zig unit. The generator adds
// `const std = @import("std");` at the top of each output file, so blocks may
// use `std.` freely. String.raw keeps backslash escapes literal.

export const blocks = [
  String.raw`fn count_occurrences(allocator: std.mem.Allocator, items: []const []const u8) !std.StringHashMap(usize) {
    var counts = std.StringHashMap(usize).init(allocator);
    for (items) |item| {
        const gop = try counts.getOrPut(item);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += 1;
    }
    return counts;
}`,

  String.raw`fn dedupe_alloc(allocator: std.mem.Allocator, items: []const []const u8) !std.ArrayList([]const u8) {
    var seen = std.StringHashMap(void).init(allocator);
    defer seen.deinit();
    var out = std.ArrayList([]const u8).init(allocator);
    for (items) |item| {
        const gop = try seen.getOrPut(item);
        if (!gop.found_existing) try out.append(item);
    }
    return out;
}`,

  String.raw`fn group_by_first_letter(allocator: std.mem.Allocator, words: []const []const u8) !std.StringHashMap(std.ArrayList([]const u8)) {
    var groups = std.StringHashMap(std.ArrayList([]const u8)).init(allocator);
    for (words) |word| {
        if (word.len == 0) continue;
        const key = word[0..1];
        const gop = try groups.getOrPut(key);
        if (!gop.found_existing) {
            gop.value_ptr.* = std.ArrayList([]const u8).init(allocator);
        }
        try gop.value_ptr.append(word);
    }
    return groups;
}`,

  String.raw`fn chunk_slices(allocator: std.mem.Allocator, items: []const []const u8, size: usize) !std.ArrayList([]const []const u8) {
    if (size == 0) return error.InvalidChunkSize;
    var chunks = std.ArrayList([]const []const u8).init(allocator);
    var start: usize = 0;
    while (start < items.len) {
        const end = @min(start + size, items.len);
        try chunks.append(items[start..end]);
        start = end;
    }
    return chunks;
}`,

  // Juggling rotation: walk each gcd cycle so the shift runs in O(n).
  String.raw`fn rotate_right_inplace(buf: []u32, k: usize) void {
    const n = buf.len;
    if (n == 0) return;
    const shift = k % n;
    const cycles = std.math.gcd(n, n - shift);
    for (0..cycles) |start| {
        const hold = buf[start];
        var j = start; var next = (j + n - shift) % n;
        while (next != start) {
            buf[j] = buf[next];
            j = next;
            next = (j + n - shift) % n;
        }
        buf[j] = hold;
    }
}`,

  String.raw`fn most_frequent(allocator: std.mem.Allocator, items: []const []const u8) !?[]const u8 {
    var counts = std.StringHashMap(usize).init(allocator);
    defer counts.deinit();
    var best: ?[]const u8 = null;
    var best_count: usize = 0;
    for (items) |item| {
        const gop = try counts.getOrPut(item);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += 1;
        if (gop.value_ptr.* > best_count) {
            best_count = gop.value_ptr.*;
            best = item;
        }
    }
    return best;
}`,

  String.raw`fn intersection_sorted(allocator: std.mem.Allocator, a: []const i32, b: []const i32) !std.ArrayList(i32) {
    var out = std.ArrayList(i32).init(allocator);
    var i: usize = 0;
    var j: usize = 0;
    while (i < a.len and j < b.len) {
        if (a[i] == b[j]) {
            try out.append(a[i]);
            i += 1; j += 1;
        } else if (a[i] < b[j]) {
            i += 1;
        } else {
            j += 1;
        }
    }
    return out;
}`,

  String.raw`fn union_sorted(allocator: std.mem.Allocator, a: []const i32, b: []const i32) !std.ArrayList(i32) {
    var out = std.ArrayList(i32).init(allocator);
    var i: usize = 0; var j: usize = 0;
    while (i < a.len or j < b.len) {
        const pick_a = j >= b.len or (i < a.len and a[i] <= b[j]);
        const v = if (pick_a) a[i] else b[j];
        try out.append(v);
        if (pick_a) {
            i += 1;
            if (j < b.len and b[j] == v) j += 1;
        } else {
            j += 1;
        }
    }
    return out;
}`,

  String.raw`fn running_sums_alloc(allocator: std.mem.Allocator, values: []const i64) ![]i64 {
    const out = try allocator.alloc(i64, values.len);
    var total: i64 = 0;
    for (values, 0..) |v, i| {
        total += v;
        out[i] = total;
    }
    return out;
}`,

  String.raw`fn pairwise_sum(allocator: std.mem.Allocator, a: []const i64, b: []const i64) !std.ArrayList(i64) {
    const n = @min(a.len, b.len);
    var out = std.ArrayList(i64).init(allocator);
    for (0..n) |i| {
        try out.append(a[i] + b[i]);
    }
    return out;
}`,

  String.raw`fn flatten_bytes(allocator: std.mem.Allocator, chunks: []std.ArrayList(u8)) !std.ArrayList(u8) {
    var out = std.ArrayList(u8).init(allocator);
    for (chunks) |chunk| {
        try out.appendSlice(chunk.items);
    }
    return out;
}`,

  String.raw`fn split_at_predicate(allocator: std.mem.Allocator, values: []const i32, pred: *const fn (i32) bool) !struct { pass: std.ArrayList(i32), fail: std.ArrayList(i32) } {
    var pass = std.ArrayList(i32).init(allocator);
    var fail = std.ArrayList(i32).init(allocator);
    for (values) |v| {
        if (pred(v)) {
            try pass.append(v);
        } else {
            try fail.append(v);
        }
    }
    return .{ .pass = pass, .fail = fail };
}`,

  // O(n*k) scan keeps this simple and allocation-light.
  String.raw`fn sliding_window_max(allocator: std.mem.Allocator, values: []const i32, k: usize) !std.ArrayList(i32) {
    if (k == 0 or k > values.len) return error.BadWindow;
    var out = std.ArrayList(i32).init(allocator);
    for (0..values.len - k + 1) |i| {
        var best = values[i];
        for (values[i + 1 .. i + k]) |v| {
            if (v > best) best = v;
        }
        try out.append(best);
    }
    return out;
}`,

  String.raw`fn histogram_256(allocator: std.mem.Allocator, data: []const u8) !std.ArrayList(usize) {
    var bins = std.ArrayList(usize).init(allocator);
    try bins.appendNTimes(0, 256);
    for (data) |byte| {
        bins.items[byte] += 1;
    }
    return bins;
}`,

  String.raw`fn sorted_insert(list: *std.ArrayList(i32), value: i32) !void {
    var pos: usize = 0;
    while (pos < list.items.len and list.items[pos] < value) : (pos += 1) {}
    try list.insert(pos, value);
}`,

  String.raw`fn index_of_max(values: []const f64) ?usize {
    if (values.len == 0) return null;
    var best: usize = 0;
    for (values, 0..) |v, i| {
        if (v > values[best]) best = i;
    }
    return best;
}`,

  String.raw`fn remove_dups_sorted_inplace(values: []i32) usize {
    if (values.len == 0) return 0;
    var write: usize = 1;
    for (values[1..]) |v| {
        if (v != values[write - 1]) {
            values[write] = v;
            write += 1;
        }
    }
    return write;
}`,

  // Exclusive prefix sums: out[0] = 0, out[i] = sum of values[0..i].
  String.raw`fn prefix_sums_alloc(allocator: std.mem.Allocator, values: []const u64) ![]u64 {
    const out = try allocator.alloc(u64, values.len + 1);
    out[0] = 0;
    for (values, 0..) |v, i| {
        out[i + 1] = out[i] + v;
    }
    return out;
}`,

  String.raw`fn merge_sorted_alloc(allocator: std.mem.Allocator, a: []const i32, b: []const i32) ![]i32 {
    var out = std.ArrayList(i32).init(allocator);
    var i: usize = 0; var j: usize = 0;
    while (i < a.len and j < b.len) {
        if (a[i] <= b[j]) {
            try out.append(a[i]);
            i += 1;
        } else {
            try out.append(b[j]);
            j += 1;
        }
    }
    try out.appendSlice(a[i..]);
    try out.appendSlice(b[j..]);
    return out.toOwnedSlice();
}`,

  String.raw`fn partition_even_odd(allocator: std.mem.Allocator, values: []const i32) !struct { evens: std.ArrayList(i32), odds: std.ArrayList(i32) } {
    var evens = std.ArrayList(i32).init(allocator);
    var odds = std.ArrayList(i32).init(allocator);
    for (values) |v| {
        if (v % 2 == 0) {
            try evens.append(v);
        } else {
            try odds.append(v);
        }
    }
    return .{ .evens = evens, .odds = odds };
}`,

  String.raw`fn pairwise_diffs_alloc(allocator: std.mem.Allocator, values: []const i32) ![]i32 {
    if (values.len == 0) return error.EmptyInput;
    const out = try allocator.alloc(i32, values.len - 1);
    for (0..values.len - 1) |i| {
        out[i] = values[i + 1] - values[i];
    }
    return out;
}`,

  String.raw`fn top_k_smallest(allocator: std.mem.Allocator, values: []const i32, k: usize) ![]i32 {
    const kk = @min(k, values.len);
    const sorted = try allocator.dupe(i32, values);
    defer allocator.free(sorted);
    std.sort.block(i32, sorted, {}, std.sort.asc(i32));
    return allocator.dupe(i32, sorted[0..kk]);
}`,
];
// total: 22
