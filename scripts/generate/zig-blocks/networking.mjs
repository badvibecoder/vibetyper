// vibetyper zig dictionary data — networking & URL helpers
export const blocks = [
  String.raw`fn parse_host_port(text: []const u8) ?struct { host: []const u8, port: u16 } {
    const colon = std.mem.lastIndexOfScalar(u8, text, ':') orelse return null;
    const port_text = text[colon + 1 ..];
    const port = std.fmt.parseInt(u16, port_text, 10) catch return null;
    return .{ .host = text[0..colon], .port = port };
}`,

  String.raw`fn default_port_for_scheme(scheme: []const u8) u16 {
    if (std.mem.eql(u8, scheme, "http")) return 80;
    if (std.mem.eql(u8, scheme, "https")) return 443;
    if (std.mem.eql(u8, scheme, "ftp")) return 21;
    if (std.mem.eql(u8, scheme, "ssh")) return 22;
    return 0;
}`,

  String.raw`fn path_segments_alloc(allocator: std.mem.Allocator, path: []const u8) !std.ArrayList([]const u8) {
    var segments = std.ArrayList([]const u8).init(allocator);
    var it = std.mem.splitScalar(u8, path, '/');
    while (it.next()) |seg| {
        if (seg.len > 0) try segments.append(seg);
    }
    return segments;
}`,

  String.raw`fn find_query_param(query: []const u8, key: []const u8) ?[]const u8 {
    var it = std.mem.splitScalar(u8, query, '&');
    while (it.next()) |pair| {
        const eq = std.mem.indexOfScalar(u8, pair, '=') orelse continue;
        if (std.mem.eql(u8, pair[0..eq], key)) return pair[eq + 1 ..];
    }
    return null;
}`,

  String.raw`fn percent_encode_alloc(allocator: std.mem.Allocator, text: []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    const hex = "0123456789ABCDEF";
    for (text) |c| {
        const unreserved = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or
            (c >= '0' and c <= '9') or c == '-' or c == '_' or c == '.' or c == '~';
        if (unreserved) {
            try out.append(c);
        } else {
            try out.append('%');
            try out.append(hex[@as(usize, c >> 4)]);
            try out.append(hex[@as(usize, c & 0x0f)]);
        }
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn parse_status_line(line: []const u8) ?struct { code: u16, reason: []const u8 } {
    const first = std.mem.indexOfScalar(u8, line, ' ') orelse return null;
    const second = std.mem.indexOfScalarPos(u8, line, first + 1, ' ') orelse return null;
    const code = std.fmt.parseInt(u16, line[first + 1 .. second], 10) catch return null;
    return .{ .code = code, .reason = line[second + 1 ..] };
}`,

  String.raw`// Produces e.g. "GET /index.html HTTP/1.1".
fn build_request_line_alloc(allocator: std.mem.Allocator, method: []const u8, path: []const u8, version: []const u8) ![]u8 {
    return std.fmt.allocPrint(allocator, "{s} {s} {s}", .{ method, path, version });
}`,

  String.raw`fn is_valid_http_method(method: []const u8) bool {
    const known = [_][]const u8{ "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS" };
    for (known) |m| {
        if (std.mem.eql(u8, method, m)) return true;
    }
    return false;
}`,

  String.raw`// Renders the four octets in dotted-decimal form.
fn ipv4_to_string_alloc(allocator: std.mem.Allocator, octets: [4]u8) ![]u8 {
    return std.fmt.allocPrint(allocator, "{d}.{d}.{d}.{d}", .{ octets[0], octets[1], octets[2], octets[3] });
}`,

  String.raw`fn ipv4_from_string(text: []const u8) ?[4]u8 {
    var octets: [4]u8 = undefined;
    var it = std.mem.splitScalar(u8, text, '.');
    for (0..4) |i| {
        const part = it.next() orelse return null;
        if (part.len == 0 or part.len > 3) return null;
        const value = std.fmt.parseInt(u8, part, 10) catch return null;
        octets[i] = value;
    }
    if (it.next() != null) return null;
    return octets;
}`,

  String.raw`fn cidr_contains(ip: [4]u8, cidr: []const u8) bool {
    const slash = std.mem.indexOfScalar(u8, cidr, '/') orelse return false;
    const network = ipv4_from_string(cidr[0..slash]) orelse return false;
    const prefix = std.fmt.parseInt(u8, cidr[slash + 1 ..], 10) catch return false;
    if (prefix > 32) return false;
    const ip_bits = (@as(u32, ip[0]) << 24) | (@as(u32, ip[1]) << 16) | (@as(u32, ip[2]) << 8) | ip[3];
    const net_bits = (@as(u32, network[0]) << 24) | (@as(u32, network[1]) << 16) | (@as(u32, network[2]) << 8) | network[3];
    const mask: u32 = if (prefix == 0) 0 else @as(u32, 0xffffffff) << (32 - prefix);
    return (ip_bits & mask) == (net_bits & mask);
}`,

  String.raw`fn build_url_alloc(allocator: std.mem.Allocator, scheme: []const u8, host: []const u8, port: u16, path: []const u8) ![]u8 {
    if (port == 0) return std.fmt.allocPrint(allocator, "{s}://{s}{s}", .{ scheme, host, path });
    return std.fmt.allocPrint(allocator, "{s}://{s}:{d}{s}", .{ scheme, host, port, path });
}`,

  String.raw`fn extract_registered_domain(hostname: []const u8) ?struct { domain: []const u8, tld: []const u8 } {
    var it = std.mem.splitScalar(u8, hostname, '.');
    var tld: []const u8 = "";
    var domain: []const u8 = "";
    while (it.next()) |label| {
        domain = tld;
        tld = label;
    }
    if (tld.len == 0 or domain.len == 0) return null;
    return .{ .domain = domain, .tld = tld };
}`,

  String.raw`fn is_private_ipv4(ip: [4]u8) bool {
    if (ip[0] == 10) return true;
    if (ip[0] == 172 and ip[1] >= 16 and ip[1] <= 31) return true;
    if (ip[0] == 192 and ip[1] == 168) return true;
    if (ip[0] == 127) return true;
    if (ip[0] == 169 and ip[1] == 254) return true;
    return false;
}`,

  String.raw`fn mime_for_extension(ext: []const u8) []const u8 {
    if (std.mem.eql(u8, ext, "json")) return "application/json";
    if (std.mem.eql(u8, ext, "html")) return "text/html";
    if (std.mem.eql(u8, ext, "css")) return "text/css";
    if (std.mem.eql(u8, ext, "js")) return "application/javascript";
    if (std.mem.eql(u8, ext, "png")) return "image/png";
    if (std.mem.eql(u8, ext, "svg")) return "image/svg+xml";
    return "application/octet-stream";
}`,

  String.raw`fn parse_cookie_pair(pair: []const u8) ?struct { key: []const u8, value: []const u8 } {
    const eq = std.mem.indexOfScalar(u8, pair, '=') orelse return null;
    const key = pair[0..eq];
    if (key.len == 0) return null;
    return .{ .key = key, .value = pair[eq + 1 ..] };
}`,

  String.raw`fn build_query_string_alloc(allocator: std.mem.Allocator, pairs: []const struct { key: []const u8, value: []const u8 }) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    for (pairs, 0..) |p, i| {
        if (i > 0) try out.append('&');
        try out.appendSlice(p.key);
        try out.append('=');
        try out.appendSlice(p.value);
    }
    return out.toOwnedSlice();
}`,

  String.raw`fn sanitize_hostname_alloc(allocator: std.mem.Allocator, hostname: []const u8) ![]u8 {
    var out = std.ArrayList(u8).init(allocator);
    for (hostname) |c| {
        const ok = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or
            (c >= '0' and c <= '9') or c == '-' or c == '.';
        if (!ok) continue;
        try out.append(if (c >= 'A' and c <= 'Z') c + 32 else c);
    }
    return out.toOwnedSlice();
}`,
];
// total: 18
