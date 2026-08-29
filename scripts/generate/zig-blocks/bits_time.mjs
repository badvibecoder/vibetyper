// vibetyper zig dictionary data — hashing, encoding & time
export const blocks = [
  String.raw`fn djb2_hash(text: []const u8) u32 {
    var hash: u32 = 5381;
    for (text) |c| {
        hash = hash *% 33 +% c;
    }
    return hash;
}`,

  String.raw`fn simple_checksum(text: []const u8) u8 {
    var sum: u8 = 0;
    for (text) |c| {
        sum +%= c;
    }
    return sum;
}`,

  String.raw`fn xor_encrypt_inplace(buf: []u8, key: u8) void {
    for (buf) |*b| {
        b.* ^= key;
    }
}`,

  String.raw`fn base36_encode_alloc(allocator: std.mem.Allocator, value: u64) ![]u8 {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    var digits: [16]u8 = undefined;
    var n = value;
    var count: usize = 0;
    while (true) {
        digits[count] = alphabet[@as(usize, @intCast(n % 36))];
        count += 1;
        n /= 36;
        if (n == 0) break;
    }
    const out = try allocator.alloc(u8, count);
    for (0..count) |i| out[i] = digits[count - 1 - i];
    return out;
}`,

  String.raw`fn xor_checksum_bytes(text: []const u8) u8 {
    var acc: u8 = 0;
    for (text) |c| {
        acc ^= c;
    }
    return acc;
}`,

  String.raw`fn constant_time_eq(left: []const u8, right: []const u8) bool {
    if (left.len != right.len) return false;
    var diff: u8 = 0;
    for (left, 0..) |c, i| {
        diff |= c ^ right[i];
    }
    return diff == 0;
}`,

  String.raw`fn session_token_alloc(allocator: std.mem.Allocator, seed: u64) ![]u8 {
    const hex = "0123456789abcdef";
    var state = seed *% 6364136223846793005 +% 1442695040888963407;
    const out = try allocator.alloc(u8, 16);
    for (0..8) |i| {
        const byte: u8 = @truncate(state >> @as(u6, @intCast(56 - i * 8)));
        out[i * 2] = hex[@as(usize, byte >> 4)];
        out[i * 2 + 1] = hex[@as(usize, byte & 0xf)];
    }
    return out;
}`,

  String.raw`fn unix_to_date_parts(days: i64) struct { year: i32, month: u32, day: u32 } {
    const z = days + 719468;
    const era = @divFloor(z, 146097);
    const doe = z - era * 146097;
    const yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    const y = yoe + era * 400;
    const doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    const mp = (5 * doy + 2) / 153;
    const d = doy - (153 * mp + 2) / 5 + 1;
    const m = if (mp < 10) mp + 3 else mp - 9;
    return .{
        .year = @intCast(y + if (m <= 2) 1 else 0),
        .month = @intCast(m),
        .day = @intCast(d),
    };
}`,

  String.raw`fn days_from_civil(year: i32, month: u32, day: u32) i64 {
    const shift: i32 = if (month <= 2) 1 else 0;
    const y: i64 = @as(i64, year) - shift;
    const era: i64 = @divFloor(y, 400);
    const yoe: i64 = y - era * 400;
    const mp: i64 = if (month > 2) month - 3 else month + 9;
    const doy: i64 = (153 * mp + 2) / 5 + day - 1;
    const doe: i64 = 365 * yoe + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + doe - 719468;
}`,

  String.raw`fn day_of_week_sakamoto(year: u32, month: u32, day: u32) u32 {
    const t = [_]u32{ 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4 };
    const y: u32 = if (month < 3) year - 1 else year;
    return (y + y / 4 - y / 100 + y / 400 + t[month - 1] + day) % 7;
}`,

  String.raw`fn days_in_month(year: u32, month: u32) u32 {
    const lengths = [_]u32{ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    if (month < 1 or month > 12) return 0;
    if (month == 2) {
        const leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0;
        return if (leap) 29 else 28;
    }
    return lengths[month - 1];
}`,

  String.raw`fn month_name(month: u32) []const u8 {
    const names = [_][]const u8{ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };
    if (month == 0 or month > 12) return "unknown";
    return names[month - 1];
}`,

  String.raw`fn ms_since_epoch() i64 {
    const now = std.time.milliTimestamp();
    return now;
}`,

  String.raw`fn seconds_to_hms(total: u64) struct { hours: u64, minutes: u64, seconds: u64 } {
    return .{
        .hours = total / 3600,
        .minutes = total % 3600 / 60,
        .seconds = total % 60,
    };
}`,

  String.raw`fn parse_hhmm_to_minutes(text: []const u8) ?u32 {
    if (text.len != 5 or text[2] != ':') return null;
    const h = std.fmt.parseInt(u32, text[0..2], 10) catch return null;
    const m = std.fmt.parseInt(u32, text[3..5], 10) catch return null;
    if (h > 23 or m > 59) return null;
    return h * 60 + m;
}`,

  String.raw`fn is_weekend_ts(unix_seconds: i64) bool {
    const days = @divFloor(unix_seconds, 86400);
    const dow = @mod(days + 4, 7);
    return dow == 0 or dow == 6;
}`,

  String.raw`fn elapsed_seconds_between(start: i64, end: i64) u64 {
    if (end <= start) return 0;
    return @intCast(end - start);
}`,

  String.raw`fn round_ts_to_minute(unix_seconds: i64) i64 {
    const rem = @mod(unix_seconds, 60);
    const rounded = unix_seconds - rem;
    return if (rem >= 30) rounded + 60 else rounded;
}`,

  String.raw`fn hours_between_ts(start: i64, end: i64) f64 {
    const seconds = @as(f64, @floatFromInt(end - start));
    return seconds / 3600.0;
}`,

  String.raw`fn time_of_day_label(hour: u32) []const u8 {
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
}`,
];
// total: 20
