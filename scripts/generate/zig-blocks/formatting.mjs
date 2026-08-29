// vibetyper zig dictionary data — formatting & rendering
export const blocks = [
  String.raw`fn byte_size_human_alloc(allocator: std.mem.Allocator, bytes: u64) ![]u8 {
    const units = [_][]const u8{ "B", "KiB", "MiB", "GiB", "TiB" };
    var value: f64 = @floatFromInt(bytes);
    var unit: usize = 0;
    while (value >= 1024.0 and unit + 1 < units.len) : (unit += 1) {
        value /= 1024.0;
    }
    if (unit == 0) return std.fmt.allocPrint(allocator, "{d} {s}", .{ bytes, units[0] });
    return std.fmt.allocPrint(allocator, "{d:.1} {s}", .{ value, units[unit] });
}`,

  String.raw`fn duration_hms_alloc(allocator: std.mem.Allocator, seconds: u64) ![]u8 {
    const h = seconds / 3600;
    const m = seconds % 3600 / 60;
    const s = seconds % 60;
    return std.fmt.allocPrint(allocator, "{d}h {d:0>2}m {d:0>2}s", .{ h, m, s });
}`,

  String.raw`fn number_with_commas_alloc(allocator: std.mem.Allocator, value: u64) ![]u8 {
    const plain = try std.fmt.allocPrint(allocator, "{d}", .{value});
    defer allocator.free(plain);
    const groups = (plain.len - 1) / 3;
    const out = try allocator.alloc(u8, plain.len + groups);
    var out_i: usize = 0;
    for (plain, 0..) |ch, i| {
        if (out_i > 0 and (plain.len - i) % 3 == 0) {
            out[out_i] = ',';
            out_i += 1;
        }
        out[out_i] = ch;
        out_i += 1;
    }
    return out;
}`,

  String.raw`fn pad_start(text: []const u8, buf: []u8, width: usize, pad: u8) usize {
    const target = @min(width, buf.len);
    const keep = @min(text.len, target);
    const padding = target - keep;
    @memset(buf[0..padding], pad);
    @memcpy(buf[padding..target], text[0..keep]);
    return target;
}`,

  String.raw`fn pad_end(text: []const u8, buf: []u8, width: usize, pad: u8) usize {
    const target = @min(width, buf.len);
    const keep = @min(text.len, target);
    @memcpy(buf[0..keep], text[0..keep]);
    @memset(buf[keep..target], pad);
    return target;
}`,

  String.raw`fn truncate_middle_alloc(allocator: std.mem.Allocator, text: []const u8, max_len: usize) ![]u8 {
    if (text.len <= max_len) return allocator.dupe(u8, text);
    const head = (max_len + 1) / 2 - 1;
    const tail = max_len - head - 3;
    const out = try allocator.alloc(u8, max_len);
    @memcpy(out[0..head], text[0..head]);
    @memcpy(out[head .. head + 3], "...");
    @memcpy(out[head + 3 ..], text[text.len - tail ..]);
    return out;
}`,

  String.raw`fn format_percent_alloc(allocator: std.mem.Allocator, ratio: f64) ![]u8 {
    const clamped = std.math.clamp(ratio, 0.0, 1.0);
    return std.fmt.allocPrint(allocator, "{d:.1}%", .{clamped * 100.0});
}`,

  String.raw`fn format_table_row_alloc(allocator: std.mem.Allocator, cells: []const []const u8, widths: []const usize) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    for (cells, 0..) |cell, i| {
        const w = if (i < widths.len) widths[i] else cell.len;
        if (cell.len < w) try out.appendNTimes(' ', w - cell.len);
        try out.appendSlice(cell);
        if (i + 1 < cells.len) try out.append(' ');
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn human_list_alloc(allocator: std.mem.Allocator, parts: []const []const u8) ![]u8 {
    if (parts.len == 0) return allocator.alloc(u8, 0);
    if (parts.len == 1) return allocator.dupe(u8, parts[0]);
    var out = std.ArrayList(u8).init(allocator);
    for (parts[0 .. parts.len - 1]) |p| {
        try out.appendSlice(p);
        try out.appendSlice(", ");
    }
    try out.appendSlice("and ");
    try out.appendSlice(parts[parts.len - 1]);
    return out.toOwnedSlice();
}`,

  String.raw`fn format_elapsed_ms(allocator: std.mem.Allocator, ms: u64) ![]u8 {
    if (ms < 1000) return std.fmt.allocPrint(allocator, "{d}ms", .{ms});
    const seconds: f64 = @as(f64, @floatFromInt(ms)) / 1000.0;
    return std.fmt.allocPrint(allocator, "{d:.1}s", .{seconds});
}`,

  String.raw`fn format_money_cents_alloc(allocator: std.mem.Allocator, cents: u64) ![]u8 {
    const dollars = cents / 100;
    var out = std.ArrayList(u8).init(allocator);
    const text = try std.fmt.allocPrint(allocator, "{d}", .{dollars});
    defer allocator.free(text);
    try out.append('$');
    for (text, 0..) |ch, i| {
        if (out.items.len > 1 and (text.len - i) % 3 == 0) try out.append(',');
        try out.append(ch);
    }
    try out.writer().print(".{d:0>2}", .{cents % 100});
    return out.toOwnedSlice();
}`,

  String.raw`fn format_rate_alloc(allocator: std.mem.Allocator, count: u64, seconds: f64) ![]u8 {
    if (seconds <= 0.0) return allocator.dupe(u8, "0 req/s");
    const rate = @as(f64, @floatFromInt(count)) / seconds;
    return std.fmt.allocPrint(allocator, "{d:.0} req/s", .{rate});
}`,

  String.raw`fn hex_pairs_alloc(allocator: std.mem.Allocator, bytes: []const u8) ![]u8 {
    if (bytes.len == 0) return allocator.alloc(u8, 0);
    const out = try allocator.alloc(u8, bytes.len * 3 - 1);
    for (bytes, 0..) |b, i| {
        _ = std.fmt.bufPrint(out[i * 3 .. i * 3 + 2], "{x:0>2}", .{b}) catch unreachable;
        if (i + 1 < bytes.len) out[i * 3 + 2] = ' ';
    }
    return out;
}`,

  String.raw`fn format_count_alloc(allocator: std.mem.Allocator, count: u64, noun: []const u8) ![]u8 {
    if (count == 1) return std.fmt.allocPrint(allocator, "{d} {s}", .{ count, noun });
    const plural = try std.fmt.allocPrint(allocator, "{s}s", .{noun});
    defer allocator.free(plural);
    return std.fmt.allocPrint(allocator, "{d} {s}", .{ count, plural });
}`,

  String.raw`fn f64_fixed_alloc(allocator: std.mem.Allocator, value: f64, decimals: u32) ![]u8 {
    const d: usize = decimals;
    const scale = std.math.pow(f64, 10.0, @floatFromInt(d));
    const scaled = @round(value * scale);
    const int_part: i64 = @intFromFloat(scaled / scale);
    const frac_part: i64 = @intFromFloat(@abs(scaled)) % @as(i64, @intFromFloat(scale));
    const int_str = try std.fmt.allocPrint(allocator, "{d}", .{int_part});
    defer allocator.free(int_str);
    const out = try allocator.alloc(u8, int_str.len + 1 + d);
    @memcpy(out[0..int_str.len], int_str);
    out[int_str.len] = '.';
    for (0..d) |i| {
        out[int_str.len + 1 + i] = '0' + @as(u8, @intCast((frac_part / std.math.pow(i64, 10, @intCast(d - 1 - i))) % 10));
    }
    return out;
}`,

  String.raw`fn format_version_alloc(allocator: std.mem.Allocator, major: u32, minor: u32, patch: u32) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    try out.writer().print("{d}.{d}.{d}", .{ major, minor, patch });
    return out.toOwnedSlice();
}`,

  String.raw`fn iso_date_alloc(allocator: std.mem.Allocator, year: u32, month: u32, day: u32) ![]u8 {
    var buf: [16]u8 = undefined;
    const s = std.fmt.bufPrint(&buf, "{d:0>4}-{d:0>2}-{d:0>2}", .{ year, month, day }) catch unreachable;
    return allocator.dupe(u8, s);
}`,

  String.raw`fn time_12h_alloc(allocator: std.mem.Allocator, hour: u32, minute: u32) ![]u8 {
    const h12 = if (hour % 12 == 0) 12 else hour % 12;
    const period = if (hour < 12) "AM" else "PM";
    return std.fmt.allocPrint(allocator, "{d}:{d:0>2} {s}", .{ h12, minute, period });
}`,

  String.raw`fn sorted_map_string_alloc(allocator: std.mem.Allocator, map: std.StringHashMap(i64)) ![]u8 {
    var keys = std.ArrayList([]const u8).init(allocator);
    defer keys.deinit();
    var it = map.keyIterator();
    while (it.next()) |k| try keys.append(k.*);
    std.mem.sort([]const u8, keys.items, {}, struct {
        fn lessThan(_: void, a: []const u8, b: []const u8) bool { return std.mem.lessThan(u8, a, b); }
    }.lessThan);
    var out = std.ArrayList(u8).init(allocator);
    for (keys.items, 0..) |k, i| {
        try out.writer().print("{s}{s}={d}", .{ if (i > 0) ", " else "", k, map.get(k).? });
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn line_numbered_alloc(allocator: std.mem.Allocator, lines: []const []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    for (lines, 0..) |line, i| {
        if (i + 1 < 10) try out.append(' ');
        try out.writer().print("{d}: {s}\n", .{ i + 1, line });
    }
    return out.toOwnedSlice();
}`,
];
// total: 20
