// vibetyper zig dictionary data — filesystem helpers
export const blocks = [
  String.raw`fn read_file_alloc(allocator: std.mem.Allocator, path: []const u8) ![]u8 {
    const max_bytes = 16 * 1024 * 1024;
    return std.fs.cwd().readFileAlloc(allocator, path, max_bytes);
}`,

  String.raw`fn write_file(path: []const u8, contents: []const u8) !void {
    var file = try std.fs.cwd().createFile(path, .{});
    defer file.close();
    try file.writeAll(contents);
}`,

  String.raw`fn file_size(path: []const u8) !u64 {
    const stat = try std.fs.cwd().statFile(path);
    return stat.size;
}`,

  String.raw`fn is_directory(path: []const u8) !bool {
    const stat = try std.fs.cwd().statFile(path);
    return stat.kind == .directory;
}`,

  String.raw`fn list_dir_names_alloc(allocator: std.mem.Allocator, dir_path: []const u8) !std.ArrayList([]const u8) {
    var dir = try std.fs.cwd().openDir(dir_path, .{ .iterate = true });
    defer dir.close();
    var names = std.ArrayList([]const u8).init(allocator);
    errdefer names.deinit();
    var it = dir.iterate();
    while (try it.next()) |entry| {
        try names.append(try allocator.dupe(u8, entry.name));
    }
    return names;
}`,

  String.raw`fn count_files_in_dir(dir_path: []const u8) !usize {
    var dir = try std.fs.cwd().openDir(dir_path, .{ .iterate = true });
    defer dir.close();
    var count: usize = 0;
    var it = dir.iterate();
    while (try it.next()) |entry| {
        if (entry.kind == .file) count += 1;
    }
    return count;
}`,

  String.raw`fn append_to_file(path: []const u8, contents: []const u8) !void {
    var file = try std.fs.cwd().createFile(path, .{ .truncate = false });
    defer file.close();
    try file.seekFromEnd(0);
    try file.writeAll(contents);
}`,

  String.raw`fn extension_of(name: []const u8) ?[]const u8 {
    const dot = std.mem.lastIndexOfScalar(u8, name, '.') orelse return null;
    return name[dot + 1 ..];
}`,

  String.raw`fn base_name(path: []const u8) []const u8 {
    const slash = std.mem.lastIndexOfScalar(u8, path, '/') orelse return path;
    return path[slash + 1 ..];
}`,

  String.raw`fn join_paths_alloc(allocator: std.mem.Allocator, parts: []const []const u8) ![]u8 {
    if (parts.len == 0) return allocator.dupe(u8, ".");
    return std.fs.path.join(allocator, parts);
}`,

  String.raw`// makePath creates missing parents and tolerates an existing directory.
fn ensure_dir(path: []const u8) !void {
    try std.fs.cwd().makePath(path);
}`,

  String.raw`fn copy_file(src: []const u8, dest: []const u8) !void {
    const cwd = std.fs.cwd();
    try cwd.copyFile(src, cwd, dest, .{});
}`,

  String.raw`fn remove_file_if_exists(path: []const u8) !void {
    std.fs.cwd().deleteFile(path) catch |err| switch (err) {
        error.FileNotFound => return,
        else => return err,
    };
}`,

  String.raw`fn stem_of(name: []const u8) []const u8 {
    const dot = std.mem.lastIndexOfScalar(u8, name, '.') orelse return name;
    return name[0..dot];
}`,

  String.raw`fn read_first_bytes(path: []const u8, buf: []u8) !usize {
    var file = try std.fs.cwd().openFile(path, .{});
    defer file.close();
    return file.read(buf);
}`,

  String.raw`fn touch_file(path: []const u8) !void {
    var file = try std.fs.cwd().createFile(path, .{ .truncate = false });
    file.close();
}`,

  String.raw`fn modified_epoch_ms(path: []const u8) !i128 {
    const stat = try std.fs.cwd().statFile(path);
    return stat.mtime;
}`,

  String.raw`// "." and ".." are navigation entries, not hidden files.
fn is_hidden_path(name: []const u8) bool {
    return name.len > 1 and name[0] == '.';
}`,

  String.raw`fn normalize_slashes_alloc(allocator: std.mem.Allocator, path: []const u8) ![]u8 {
    const out = try allocator.dupe(u8, path);
    for (out) |*c| {
        if (c.* == '\\') c.* = '/';
    }
    return out;
}`,

  String.raw`fn sort_names_alloc(allocator: std.mem.Allocator, names: []const []const u8) !std.ArrayList([]const u8) {
    var sorted = std.ArrayList([]const u8).init(allocator);
    errdefer sorted.deinit();
    for (names) |n| try sorted.append(try allocator.dupe(u8, n));
    var i: usize = 1;
    while (i < sorted.items.len) : (i += 1) {
        const key = sorted.items[i];
        var j = i;
        while (j > 0 and std.mem.order(u8, sorted.items[j - 1], key) == .gt) : (j -= 1) {
            sorted.items[j] = sorted.items[j - 1];
        }
        sorted.items[j] = key;
    }
    return sorted;
}`,
];
// total: 20
