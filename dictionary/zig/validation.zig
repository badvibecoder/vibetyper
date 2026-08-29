const std = @import("std");

// vibetyper Zig dictionary — input validation

fn is_valid_email(address: []const u8) bool {
    var at_count: usize = 0;
    for (address) |c| {
        if (c == '@') at_count += 1;
    }
    if (at_count != 1) return false;
    const at = std.mem.indexOfScalar(u8, address, '@') orelse return false;
    if (at == 0 or at == address.len - 1) return false;
    return std.mem.indexOfScalar(u8, address, ' ') == null;
}

fn is_strong_password(password: []const u8) bool {
    if (password.len < 8) return false;
    var lower = false;
    var upper = false;
    var digit = false;
    var symbol = false;
    for (password) |c| {
        if (c >= 'a' and c <= 'z') { lower = true; }
        else if (c >= 'A' and c <= 'Z') { upper = true; }
        else if (c >= '0' and c <= '9') { digit = true; }
        else { symbol = true; }
    }
    return lower and upper and digit and symbol;
}

fn is_valid_us_phone(text: []const u8) bool {
    var digits: usize = 0;
    for (text) |c| {
        if (c >= '0' and c <= '9') {
            digits += 1;
        } else if (c != ' ' and c != '-' and c != '(' and c != ')') {
            return false;
        }
    }
    return digits == 10;
}

fn is_valid_ipv4(address: []const u8) bool {
    var parts: usize = 0;
    var it = std.mem.splitScalar(u8, address, '.');
    while (it.next()) |part| {
        if (part.len == 0 or part.len > 3) return false;
        const octet = std.fmt.parseInt(u16, part, 10) catch return false;
        if (octet > 255) return false;
        parts += 1;
    }
    return parts == 4;
}

fn is_valid_hex_color(text: []const u8) bool {
    if (text.len != 7 or text[0] != '#') return false;
    for (text[1..]) |c| {
        const is_digit = c >= '0' and c <= '9';
        const is_letter = (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F');
        if (!is_digit and !is_letter) return false;
    }
    return true;
}

fn is_valid_username(name: []const u8) bool {
    if (name.len < 3 or name.len > 20) return false;
    for (name) |c| {
        const is_alnum = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9');
        if (!is_alnum and c != '_') return false;
    }
    return true;
}

fn is_valid_port(text: []const u8) bool {
    const port = std.fmt.parseInt(u32, text, 10) catch return false;
    return port >= 1 and port <= 65535;
}

fn is_valid_date_ymd(year: u32, month: u32, day: u32) bool {
    if (month < 1 or month > 12) return false;
    const days = [12]u32{ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    var max = days[month - 1];
    if (month == 2 and is_leap_year(year)) max = 29;
    return day >= 1 and day <= max;
}

fn is_leap_year(year: u32) bool {
    if (year % 400 == 0) return true;
    if (year % 100 == 0) return false;
    return year % 4 == 0;
}

fn is_valid_luhn(digits: []const u8) bool {
    if (digits.len == 0) return false;
    var sum: u32 = 0;
    const parity: usize = digits.len % 2;
    for (digits, 0..) |c, i| {
        if (c < '0' or c > '9') return false;
        var d: u32 = c - '0';
        if (i % 2 == parity) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 == 0;
}

fn is_balanced_parentheses(text: []const u8) bool {
    var depth: usize = 0;
    for (text) |c| {
        if (c == '(') {
            depth += 1;
        } else if (c == ')') {
            if (depth == 0) return false;
            depth -= 1;
        }
    }
    return depth == 0;
}

fn contains_only_digits(text: []const u8) bool {
    if (text.len == 0) return false;
    for (text) |c| {
        if (c < '0' or c > '9') return false;
    }
    return true;
}

fn is_valid_slug(text: []const u8) bool {
    if (text.len == 0 or text[0] == '-' or text[text.len - 1] == '-') return false;
    for (text) |c| {
        const is_lower = c >= 'a' and c <= 'z';
        const is_digit = c >= '0' and c <= '9';
        if (!is_lower and !is_digit and c != '-') return false;
    }
    return true;
}

fn is_valid_semver(version: []const u8) bool {
    var dots: usize = 0;
    var prev_dot = false;
    for (version, 0..) |c, i| {
        if (c == '.') {
            if (prev_dot or i == 0) return false;
            dots += 1;
            prev_dot = true;
        } else if (c < '0' or c > '9') {
            return false;
        } else {
            prev_dot = false;
        }
    }
    return dots == 2 and !prev_dot;
}

fn is_valid_percent(text: []const u8) bool {
    const value = std.fmt.parseInt(u8, text, 10) catch return false;
    return value <= 100;
}

fn is_ascii_printable(text: []const u8) bool {
    if (text.len == 0) return false;
    for (text) |c| {
        if (c < 0x20 or c > 0x7e) return false;
    }
    return true;
}

fn is_valid_domain_label(label: []const u8) bool {
    if (label.len == 0 or label[0] == '-' or label[label.len - 1] == '-') return false;
    for (label) |c| {
        const is_alnum = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9');
        if (!is_alnum and c != '-') return false;
    }
    return true;
}

fn is_valid_http_url(url: []const u8) bool {
    if (std.mem.startsWith(u8, url, "https://")) {
        return url.len > "https://".len;
    }
    if (std.mem.startsWith(u8, url, "http://")) {
        return url.len > "http://".len;
    }
    return false;
}

// Latitude and longitude must stay within their physical bounds.
fn is_valid_coordinates(lat: f64, lon: f64) bool {
    return lat >= -90.0 and lat <= 90.0 and lon >= -180.0 and lon <= 180.0;
}

fn is_valid_hex_str(text: []const u8) bool {
    if (text.len == 0 or text.len % 2 != 0) return false;
    for (text) |c| {
        const is_digit = c >= '0' and c <= '9';
        const is_letter = (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F');
        if (!is_digit and !is_letter) return false;
    }
    return true;
}

fn is_valid_identifier(name: []const u8) bool {
    if (name.len == 0) return false;
    const first = name[0];
    const is_letter = (first >= 'a' and first <= 'z') or (first >= 'A' and first <= 'Z');
    if (!is_letter and first != '_') return false;
    for (name[1..]) |c| {
        const is_alnum = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9');
        if (!is_alnum and c != '_') return false;
    }
    return true;
}

fn is_valid_hhmm(text: []const u8) bool {
    if (text.len != 5 or text[2] != ':') return false;
    const hour = std.fmt.parseInt(u32, text[0..2], 10) catch return false;
    const minute = std.fmt.parseInt(u32, text[3..5], 10) catch return false;
    return hour < 24 and minute < 60;
}
