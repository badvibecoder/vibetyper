// vibetyper zig dictionary data — string utilities.
// Each entry is ONE complete, balanced top-level Zig unit. The generator adds
// `const std = @import("std");` at the top of each output file, so blocks may
// use `std.` freely. String.raw keeps backslash escapes literal.

export const blocks = [
  String.raw`fn to_lower_ascii(buf: []u8) void {
    for (buf) |*c| {
        if (c.* >= 'A' and c.* <= 'Z') {
            c.* += 32;
        }
    }
}`,

  String.raw`fn reverse_slice(buf: []u8) void {
    var i: usize = 0;
    var j: usize = buf.len;
    while (i < j) {
        j -= 1;
        const tmp = buf[i];
        buf[i] = buf[j];
        buf[j] = tmp;
        i += 1;
    }
}`,

  String.raw`fn count_occurrences(haystack: []const u8, needle: u8) usize {
    var count: usize = 0;
    for (haystack) |c| {
        if (c == needle) count += 1;
    }
    return count;
}`,

  String.raw`fn count_words(text: []const u8) usize {
    var count: usize = 0;
    var in_word = false;
    for (text) |c| {
        const ws = c == ' ' or c == '\t' or c == '\n' or c == '\r';
        if (!ws and !in_word) {
            count += 1;
            in_word = true;
        } else if (ws) {
            in_word = false;
        }
    }
    return count;
}`,

  String.raw`fn first_word(text: []const u8) []const u8 {
    var end: usize = 0;
    while (end < text.len and text[end] != ' ' and text[end] != '\t') : (end += 1) {}
    return text[0..end];
}`,

  String.raw`fn trim_whitespace(text: []const u8) []const u8 {
    var start: usize = 0;
    var end: usize = text.len;
    while (start < end and (text[start] == ' ' or text[start] == '\t' or text[start] == '\n' or text[start] == '\r')) : (start += 1) {}
    while (end > start and (text[end - 1] == ' ' or text[end - 1] == '\t' or text[end - 1] == '\n' or text[end - 1] == '\r')) : (end -= 1) {}
    return text[start..end];
}`,

  String.raw`fn ends_with_str(haystack: []const u8, suffix: []const u8) bool {
    if (suffix.len > haystack.len) return false;
    return std.mem.eql(u8, haystack[haystack.len - suffix.len ..], suffix);
}`,

  String.raw`fn index_of_byte(haystack: []const u8, needle: u8) ?usize {
    for (haystack, 0..) |c, i| {
        if (c == needle) return i;
    }
    return null;
}`,

  String.raw`fn split_alloc(allocator: std.mem.Allocator, text: []const u8, sep: u8) !std.ArrayList([]const u8) {
    var parts = std.ArrayList([]const u8).init(allocator);
    var start: usize = 0;
    for (text, 0..) |c, i| {
        if (c == sep) {
            try parts.append(text[start..i]);
            start = i + 1;
        }
    }
    try parts.append(text[start..]);
    return parts;
}`,

  String.raw`fn join_alloc(allocator: std.mem.Allocator, parts: []const []const u8, sep: []const u8) ![]u8 {
    var total: usize = 0;
    for (parts) |p| total += p.len;
    if (parts.len > 0) total += sep.len * (parts.len - 1);
    const out = try allocator.alloc(u8, total);
    var pos: usize = 0;
    for (parts, 0..) |p, i| {
        if (i > 0) {
            @memcpy(out[pos .. pos + sep.len], sep);
            pos += sep.len;
        }
        @memcpy(out[pos .. pos + p.len], p);
        pos += p.len;
    }
    return out;
}`,

  String.raw`fn is_palindrome(text: []const u8) bool {
    var i: usize = 0;
    var j: usize = text.len;
    while (i < j) {
        j -= 1;
        if (text[i] != text[j]) return false;
        i += 1;
    }
    return true;
}`,

  String.raw`fn caesar_alloc(allocator: std.mem.Allocator, text: []const u8, shift: u8) ![]u8 {
    const out = try allocator.alloc(u8, text.len);
    for (text, 0..) |c, i| {
        if (c >= 'a' and c <= 'z') {
            out[i] = 'a' + (c - 'a' + shift) % 26;
        } else if (c >= 'A' and c <= 'Z') {
            out[i] = 'A' + (c - 'A' + shift) % 26;
        } else {
            out[i] = c;
        }
    }
    return out;
}`,

  String.raw`fn longest_common_prefix(left: []const u8, right: []const u8) usize {
    const n = @min(left.len, right.len);
    var i: usize = 0;
    while (i < n and left[i] == right[i]) : (i += 1) {}
    return i;
}`,

  String.raw`fn repeat_alloc(allocator: std.mem.Allocator, ch: u8, count: usize) ![]u8 {
    const out = try allocator.alloc(u8, count);
    @memset(out, ch);
    return out;
}`,

  String.raw`fn truncate_alloc(allocator: std.mem.Allocator, text: []const u8, max_len: usize) ![]u8 {
    if (text.len <= max_len) return allocator.dupe(u8, text);
    const out = try allocator.alloc(u8, max_len);
    @memcpy(out, text[0..max_len]);
    return out;
}`,

  String.raw`fn count_letters(text: []const u8) usize {
    var count: usize = 0;
    for (text) |c| {
        if ((c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z')) count += 1;
    }
    return count;
}`,

  String.raw`fn split_lines(allocator: std.mem.Allocator, text: []const u8) !std.ArrayList([]const u8) {
    var lines = std.ArrayList([]const u8).init(allocator);
    var start: usize = 0;
    for (text, 0..) |c, i| {
        if (c == '\n') {
            var end = i;
            if (end > start and text[end - 1] == '\r') end -= 1;
            try lines.append(text[start..end]);
            start = i + 1;
        }
    }
    try lines.append(text[start..]);
    return lines;
}`,

  String.raw`fn mask_card_alloc(allocator: std.mem.Allocator, card: []const u8) ![]u8 {
    if (card.len <= 4) return allocator.dupe(u8, card);
    const out = try allocator.alloc(u8, card.len);
    @memset(out[0 .. card.len - 4], '*');
    @memcpy(out[card.len - 4 ..], card[card.len - 4 ..]);
    return out;
}`,

  String.raw`fn to_title_case_alloc(allocator: std.mem.Allocator, text: []const u8) ![]u8 {
    const out = try allocator.dupe(u8, text);
    var capitalize = true;
    for (out) |*c| {
        if (c.* == ' ') {
            capitalize = true;
        } else if (capitalize and c.* >= 'a' and c.* <= 'z') {
            c.* -= 32;
            capitalize = false;
        } else {
            capitalize = false;
        }
    }
    return out;
}`,

  String.raw`fn snake_to_camel_alloc(allocator: std.mem.Allocator, ident: []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    var upper_next = false;
    for (ident) |c| {
        if (c == '_') {
            upper_next = true;
        } else if (upper_next) {
            try out.append(if (c >= 'a' and c <= 'z') c - 32 else c);
            upper_next = false;
        } else {
            try out.append(c);
        }
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn rot13(text: []const u8, buf: []u8) usize {
    const n = @min(text.len, buf.len);
    for (text[0..n], 0..) |c, i| {
        if (c >= 'a' and c <= 'z') {
            buf[i] = 'a' + (c - 'a' + 13) % 26;
        } else if (c >= 'A' and c <= 'Z') {
            buf[i] = 'A' + (c - 'A' + 13) % 26;
        } else {
            buf[i] = c;
        }
    }
    return n;
}`,

  String.raw`fn has_unique_chars(text: []const u8) bool {
    var seen: [256]bool = [_]bool{false} ** 256;
    for (text) |c| {
        if (seen[c]) return false;
        seen[c] = true;
    }
    return true;
}`,

  String.raw`fn wrap_alloc(allocator: std.mem.Allocator, text: []const u8, width: usize) !std.ArrayList([]const []const u8) {
    var words = std.ArrayList([]const u8).init(allocator);
    defer words.deinit();
    var it = std.mem.tokenizeAny(u8, text, " \t\n");
    while (it.next()) |word| try words.append(word);

    var lines = std.ArrayList([]const []const u8).init(allocator);
    var start: usize = 0;
    var taken: usize = 0;
    for (words.items, 0..) |word, i| {
        const need = word.len + if (taken == 0) 0 else 1;
        if (taken + need > width and taken > 0) {
            try lines.append(words.items[start..i]);
            start = i;
            taken = 0;
        }
        taken += word.len + if (taken == 0) 0 else 1;
    }
    if (start < words.items.len) try lines.append(words.items[start..]);
    return lines;
}`,

  String.raw`fn levenshtein(a: []const u8, b: []const u8) usize {
    // Assumes inputs are short (<128 bytes) so fixed buffers suffice.
    var prev: [128]usize = undefined;
    var cur: [128]usize = undefined;
    for (0..=b.len) |i| prev[i] = i;
    for (a, 0..) |ca, i| {
        cur[0] = i + 1;
        for (b, 0..) |cb, j| {
            cur[j + 1] = if (ca == cb) prev[j] else @min(prev[j], @min(prev[j + 1], cur[j])) + 1;
        }
        @memcpy(prev[0 .. b.len + 1], cur[0 .. b.len + 1]);
    }
    return prev[b.len];
}`,

  String.raw`fn extract_digits_alloc(allocator: std.mem.Allocator, text: []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    for (text) |c| {
        if (c >= '0' and c <= '9') try out.append(c);
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn is_anagram(left: []const u8, right: []const u8) bool {
    var counts: [26]i16 = [_]i16{0} ** 26;
    for (left) |c| {
        if (c >= 'a' and c <= 'z') counts[c - 'a'] += 1;
        if (c >= 'A' and c <= 'Z') counts[c - 'A'] += 1;
    }
    for (right) |c| {
        if (c >= 'a' and c <= 'z') counts[c - 'a'] -= 1;
        if (c >= 'A' and c <= 'Z') counts[c - 'A'] -= 1;
    }
    for (counts) |n| {
        if (n != 0) return false;
    }
    return true;
}`,
];
// total: 26
