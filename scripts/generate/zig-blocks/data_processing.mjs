// vibetyper zig dictionary data — data processing & parsing
export const blocks = [
  String.raw`const QueryPair = struct {
    key: []const u8,
    value: []const u8,
};`,

  String.raw`fn parse_query_string_alloc(allocator: std.mem.Allocator, query: []const u8) !std.ArrayList(QueryPair) {
    var pairs = std.ArrayList(QueryPair).init(allocator);
    var it = std.mem.splitScalar(u8, query, '&');
    while (it.next()) |part| {
        const eq = std.mem.indexOfScalar(u8, part, '=') orelse continue;
        try pairs.append(.{ .key = part[0..eq], .value = part[eq + 1 ..] });
    }
    return pairs;
}`,

  String.raw`fn parse_csv_row_alloc(allocator: std.mem.Allocator, line: []const u8) !std.ArrayList([]const u8) {
    var fields = std.ArrayList([]const u8).init(allocator);
    var it = std.mem.splitScalar(u8, line, ',');
    while (it.next()) |field| {
        try fields.append(std.mem.trim(u8, field, " \t"));
    }
    return fields;
}`,

  String.raw`fn parse_key_value_line(line: []const u8) ?struct { key: []const u8, value: []const u8 } {
    if (std.mem.trim(u8, line, " \t").len == 0) return null;
    const eq = std.mem.indexOfScalar(u8, line, '=') orelse return null;
    if (eq == 0) return null;
    return .{ .key = std.mem.trim(u8, line[0..eq], " \t"), .value = std.mem.trim(u8, line[eq + 1 ..], " \t") };
}`,

  String.raw`fn extract_numbers_alloc(allocator: std.mem.Allocator, text: []const u8) !std.ArrayList(f64) {
    var numbers = std.ArrayList(f64).init(allocator);
    var start: ?usize = null; var i: usize = 0;
    while (i <= text.len) : (i += 1) {
        const keep = i < text.len and ((text[i] >= '0' and text[i] <= '9') or text[i] == '.' or text[i] == '-');
        if (keep) {
            if (start == null) start = i;
        } else if (start) |s| {
            if (std.fmt.parseFloat(f64, text[s..i])) |parsed| {
                try numbers.append(parsed);
            } else |_| {}
            start = null;
        }
    }
    return numbers;
}`,

  String.raw`fn tokenize_words_alloc(allocator: std.mem.Allocator, text: []const u8) !std.ArrayList([]const u8) {
    var words = std.ArrayList([]const u8).init(allocator);
    var it = std.mem.tokenizeAny(u8, text, " \t\n\r");
    while (it.next()) |word| try words.append(word);
    return words;
}`,

  String.raw`fn normalize_text_alloc(allocator: std.mem.Allocator, text: []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    var pending_space = false;
    for (text) |c| {
        const ws = c == ' ' or c == '\t' or c == '\n' or c == '\r';
        if (ws) {
            pending_space = true;
        } else {
            if (pending_space and out.items.len > 0) try out.append(' ');
            pending_space = false;
            try out.append(if (c >= 'A' and c <= 'Z') c + 32 else c);
        }
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn count_lines_words_chars(text: []const u8) struct { lines: usize, words: usize, chars: usize } {
    var lines: usize = 1;
    var words: usize = 0;
    var in_word = false;
    for (text) |c| {
        if (c == '\n') lines += 1;
        if (c == ' ' or c == '\t' or c == '\n' or c == '\r') {
            in_word = false;
        } else if (!in_word) {
            words += 1;
            in_word = true;
        }
    }
    return .{ .lines = lines, .words = words, .chars = text.len };
}`,

  String.raw`fn parse_integer_list_alloc(allocator: std.mem.Allocator, text: []const u8) !std.ArrayList(i64) {
    var values = std.ArrayList(i64).init(allocator);
    var it = std.mem.splitScalar(u8, text, ',');
    while (it.next()) |part| {
        const trimmed = std.mem.trim(u8, part, " \t");
        if (trimmed.len == 0) continue;
        try values.append(try std.fmt.parseInt(i64, trimmed, 10));
    }
    return values;
}`,

  String.raw`fn transpose_matrix_alloc(allocator: std.mem.Allocator, rows: []const []const f64) ![][]f64 {
    if (rows.len == 0) return &[_][]f64{};
    const cols = rows[0].len;
    for (rows[1..]) |row| {
        if (row.len != cols) return error.RaggedMatrix;
    }
    const out = try allocator.alloc([]f64, cols);
    for (out) |*col| col.* = try allocator.alloc(f64, rows.len);
    for (rows, 0..) |row, r| {
        for (row, 0..) |value, c| out[c][r] = value;
    }
    return out;
}`,

  String.raw`fn sum_by_key(allocator: std.mem.Allocator, pairs: []const struct { key: []const u8, value: i64 }) !std.StringHashMap(i64) {
    var sums = std.StringHashMap(i64).init(allocator);
    for (pairs) |pair| {
        const entry = try sums.getOrPut(pair.key);
        if (!entry.found_existing) entry.value_ptr.* = 0;
        entry.value_ptr.* += pair.value;
    }
    return sums;
}`,

  String.raw`fn binned_counts_alloc(allocator: std.mem.Allocator, values: []const f64, bin_count: usize) !std.ArrayList(usize) {
    if (bin_count == 0 or values.len == 0) return error.InvalidInput;
    var counts = std.ArrayList(usize).init(allocator);
    try counts.appendNTimes(0, bin_count);
    const lo = std.mem.min(f64, values);
    const hi = std.mem.max(f64, values);
    if (hi == lo) return counts;
    const scale = @as(f64, @floatFromInt(bin_count)) / (hi - lo);
    for (values) |v| {
        const idx = @as(usize, @intFromFloat((v - lo) * scale));
        counts.items[@min(idx, bin_count - 1)] += 1;
    }
    return counts;
}`,

  String.raw`fn interpolate_missing_alloc(allocator: std.mem.Allocator, series: []const ?f64) ![]f64 {
    const out = try allocator.alloc(f64, series.len);
    @memset(out, 0.0);
    var prev_idx: ?usize = null;
    for (series, 0..) |maybe, i| {
        const value = maybe orelse continue;
        if (prev_idx) |p| {
            const step = (value - out[p]) / @as(f64, @floatFromInt(i - p));
            for (p + 1..i) |j| out[j] = out[p] + step * @as(f64, @floatFromInt(j - p));
        }
        out[i] = value;
        prev_idx = i;
    }
    return out;
}`,

  String.raw`fn parse_duration_seconds(text: []const u8) ?u64 {
    var total: u64 = 0;
    var start: usize = 0;
    var i: usize = 0;
    while (i < text.len) {
        if (text[i] >= '0' and text[i] <= '9') { i += 1; continue; }
        if (i == start) return null;
        const amount = std.fmt.parseInt(u64, text[start..i], 10) catch return null;
        const mult: u64 = if (text[i] == 'h') 3600 else if (text[i] == 'm') 60 else if (text[i] == 's') 1 else return null;
        total += amount * mult;
        i += 1; start = i;
    }
    return if (i == start and i > 0) total else null;
}`,

  String.raw`fn parse_size_bytes(text: []const u8) ?u64 {
    var i: usize = 0;
    while (i < text.len and (text[i] >= '0' and text[i] <= '9' or text[i] == '.')) : (i += 1) {}
    if (i == 0) return null;
    const number = std.fmt.parseFloat(f64, text[0..i]) catch return null;
    const suffix = text[i..];
    const mult: f64 = if (std.mem.eql(u8, suffix, "KB")) 1024.0
        else if (std.mem.eql(u8, suffix, "MB")) 1024.0 * 1024.0
        else if (std.mem.eql(u8, suffix, "GB")) 1024.0 * 1024.0 * 1024.0
        else return null;
    return @intFromFloat(number * mult);
}`,

  String.raw`fn split_commands_quoted_alloc(allocator: std.mem.Allocator, text: []const u8) !std.ArrayList([]const u8) {
    var commands = std.ArrayList([]const u8).init(allocator);
    var start: usize = 0;
    var in_quote = false;
    for (text, 0..) |c, i| {
        if (c == '"') {
            in_quote = !in_quote;
        } else if (c == ';' and !in_quote) {
            try commands.append(text[start..i]);
            start = i + 1;
        }
    }
    try commands.append(text[start..]);
    return commands;
}`,

  String.raw`fn find_duplicates_alloc(allocator: std.mem.Allocator, items: []const []const u8) !std.ArrayList([]const u8) {
    var counts = std.StringHashMap(usize).init(allocator);
    defer counts.deinit();
    var duplicates = std.ArrayList([]const u8).init(allocator);
    for (items) |item| {
        const entry = try counts.getOrPut(item);
        if (!entry.found_existing) entry.value_ptr.* = 0;
        entry.value_ptr.* += 1;
        if (entry.value_ptr.* == 2) try duplicates.append(item);
    }
    return duplicates;
}`,

  String.raw`fn aggregate_counts(allocator: std.mem.Allocator, labels: []const []const u8) !std.StringHashMap(usize) {
    var counts = std.StringHashMap(usize).init(allocator);
    for (labels) |label| {
        const entry = try counts.getOrPut(label);
        if (!entry.found_existing) entry.value_ptr.* = 0;
        entry.value_ptr.* += 1;
    }
    return counts;
}`,

  String.raw`fn outliers_alloc(allocator: std.mem.Allocator, values: []const f64) !std.ArrayList(f64) {
    if (values.len == 0) return std.ArrayList(f64).init(allocator);
    var mean: f64 = 0.0;
    for (values) |v| mean += v;
    mean /= @as(f64, @floatFromInt(values.len));
    var variance: f64 = 0.0;
    for (values) |v| variance += (v - mean) * (v - mean);
    variance /= @as(f64, @floatFromInt(values.len));
    const dev = @sqrt(variance);
    var outliers = std.ArrayList(f64).init(allocator);
    for (values) |v| {
        if (v < mean - 2.0 * dev or v > mean + 2.0 * dev) try outliers.append(v);
    }
    return outliers;
}`,

  String.raw`fn minmax_normalize_alloc(allocator: std.mem.Allocator, values: []const f64) ![]f64 {
    if (values.len == 0) return allocator.alloc(f64, 0);
    const lo = std.mem.min(f64, values);
    const hi = std.mem.max(f64, values);
    const out = try allocator.alloc(f64, values.len);
    if (hi == lo) {
        @memset(out, 0.0);
        return out;
    }
    for (values, 0..) |v, i| out[i] = (v - lo) / (hi - lo);
    return out;
}`,

  String.raw`fn parse_coord_pair(text: []const u8) ?struct { lat: f64, lon: f64 } {
    const comma = std.mem.indexOfScalar(u8, text, ',') orelse return null;
    if (comma == 0 or comma == text.len - 1) return null;
    const lat = std.fmt.parseFloat(f64, text[0..comma]) catch return null;
    const lon = std.fmt.parseFloat(f64, text[comma + 1 ..]) catch return null;
    return .{ .lat = lat, .lon = lon };
}`,

  String.raw`fn redact_numbers_alloc(allocator: std.mem.Allocator, text: []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    var in_digits = false;
    for (text) |c| {
        if (c >= '0' and c <= '9') {
            if (!in_digits) {
                try out.append('#');
                in_digits = true;
            }
        } else {
            try out.append(c);
            in_digits = false;
        }
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn sample_every_nth_alloc(allocator: std.mem.Allocator, data: []const u8, step: usize) ![]const u8 {
    if (step == 0) return error.InvalidStep;
    var count: usize = 0;
    var i: usize = 0;
    while (i < data.len) : (i += step) count += 1;
    const out = try allocator.alloc(u8, count);
    var j: usize = 0;
    i = 0;
    while (i < data.len) : (i += step) {
        out[j] = data[i];
        j += 1;
    }
    return out;
}`,

  String.raw`fn cumulative_average_alloc(allocator: std.mem.Allocator, values: []const f64) ![]f64 {
    const out = try allocator.alloc(f64, values.len);
    var running: f64 = 0.0;
    for (values, 0..) |v, i| {
        running += v;
        out[i] = running / @as(f64, @floatFromInt(i + 1));
    }
    return out;
}`,
];
// total: 24
