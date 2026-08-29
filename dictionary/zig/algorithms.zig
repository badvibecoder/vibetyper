const std = @import("std");

// vibetyper Zig dictionary — algorithms

fn binary_search(sorted: []const i32, target: i32) ?usize {
    var lo: usize = 0;
    var hi: usize = sorted.len;
    while (lo < hi) {
        const mid = lo + (hi - lo) / 2;
        if (sorted[mid] == target) return mid;
        if (sorted[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return null;
}

fn insertion_sort(values: []i32) void {
    var i: usize = 1;
    while (i < values.len) : (i += 1) {
        const key = values[i];
        var j = i;
        while (j > 0 and values[j - 1] > key) : (j -= 1) {
            values[j] = values[j - 1];
        }
        values[j] = key;
    }
}

fn selection_sort(values: []i32) void {
    var i: usize = 0;
    while (i < values.len) : (i += 1) {
        var best = i;
        var j = i + 1;
        while (j < values.len) : (j += 1) {
            if (values[j] < values[best]) best = j;
        }
        const tmp = values[i];
        values[i] = values[best];
        values[best] = tmp;
    }
}

fn merge_sort_alloc(allocator: std.mem.Allocator, values: []const i32) ![]i32 {
    if (values.len <= 1) return allocator.dupe(i32, values);
    const mid = values.len / 2;
    const left = try merge_sort_alloc(allocator, values[0..mid]);
    defer allocator.free(left);
    const right = try merge_sort_alloc(allocator, values[mid..]);
    defer allocator.free(right);
    const out = try allocator.alloc(i32, values.len);
    var i: usize = 0; var j: usize = 0; var k: usize = 0;
    while (i < left.len and j < right.len) : (k += 1) {
        if (left[i] <= right[j]) { out[k] = left[i]; i += 1; } else { out[k] = right[j]; j += 1; }
    }
    @memcpy(out[k..], left[i..]);
    @memcpy(out[k + left.len - i ..], right[j..]);
    return out;
}

fn quick_sort(values: []i32) void {
    if (values.len <= 1) return;
    const pivot = values[values.len - 1];
    var i: usize = 0;
    var j: usize = 0;
    while (j < values.len - 1) : (j += 1) {
        if (values[j] <= pivot) {
            std.mem.swap(i32, &values[i], &values[j]);
            i += 1;
        }
    }
    std.mem.swap(i32, &values[i], &values[values.len - 1]);
    quick_sort(values[0..i]);
    quick_sort(values[i + 1 ..]);
}

fn counting_sort_alloc(allocator: std.mem.Allocator, values: []const u32, max_value: u32) ![]u32 {
    const counts = try allocator.alloc(usize, max_value + 1);
    defer allocator.free(counts);
    @memset(counts, 0);
    for (values) |v| counts[v] += 1;
    var out = std.ArrayList(u32).init(allocator);
    for (counts, 0..) |c, v| {
        var n = c;
        while (n > 0) : (n -= 1) try out.append(@intCast(v));
    }
    return out.toOwnedSlice();
}

fn bfs_can_reach(allocator: std.mem.Allocator, graph: []const []const usize, start: usize, goal: usize) !bool {
    var queue = std.ArrayList(usize).init(allocator); defer queue.deinit();
    const visited = try allocator.alloc(bool, graph.len); defer allocator.free(visited);
    @memset(visited, false);
    visited[start] = true; try queue.append(start);
    var head: usize = 0;
    while (head < queue.items.len) : (head += 1) {
        const node = queue.items[head];
        if (node == goal) return true;
        for (graph[node]) |next| if (!visited[next]) {
            visited[next] = true;
            try queue.append(next);
        };
    }
    return false;
}

fn dfs_has_cycle(allocator: std.mem.Allocator, graph: []const []const usize) !bool {
    const state = try allocator.alloc(u8, graph.len); defer allocator.free(state);
    @memset(state, 0);
    const Visit = struct {
        fn run(graph: []const []const usize, state: []u8, node: usize) bool {
            state[node] = 1;
            for (graph[node]) |next| {
                if (state[next] == 1) return true; if (state[next] == 0 and run(graph, state, next)) return true;
            }
            state[node] = 2;
            return false;
        }
    };
    for (graph, 0..) |_, root| if (state[root] == 0 and Visit.run(graph, state, root)) return true;
    return false;
}

fn connected_components(allocator: std.mem.Allocator, graph: []const []const usize) !usize {
    const visited = try allocator.alloc(bool, graph.len); defer allocator.free(visited);
    @memset(visited, false);
    const Flood = struct {
        fn fill(graph: []const []const usize, visited: []bool, node: usize) void {
            visited[node] = true;
            for (graph[node]) |next| if (!visited[next]) fill(graph, visited, next);
        }
    };
    var components: usize = 0;
    for (graph, 0..) |_, node| if (!visited[node]) {
        components += 1;
        Flood.fill(graph, visited, node);
    };
    return components;
}

fn dijkstra_shortest(allocator: std.mem.Allocator, graph: []const []const u64, start: usize) ![]u64 {
    const dist = try allocator.alloc(u64, graph.len); const visited = try allocator.alloc(bool, graph.len);
    @memset(dist, std.math.maxInt(u64));
    @memset(visited, false);
    dist[start] = 0;
    var done: usize = 0;
    while (done < graph.len) {
        var best: ?usize = null;
        for (graph, 0..) |_, node| if (!visited[node] and (best == null or dist[node] < dist[best.?])) best = node;
        if (best == null) break;
        visited[best.?] = true;
        done += 1;
        for (graph[best.?], 0..) |weight, next| if (dist[best.?] + weight < dist[next]) dist[next] = dist[best.?] + weight;
    }
    return dist;
}

fn knapsack_01(allocator: std.mem.Allocator, weights: []const u64, values: []const u64, capacity: usize) !u64 {
    const dp = try allocator.alloc([]u64, weights.len + 1);
    defer { for (dp) |row| allocator.free(row); allocator.free(dp); }
    for (dp, 0..) |_, i| dp[i] = try allocator.alloc(u64, capacity + 1);
    @memset(dp[0], 0);
    for (1..dp.len) |i| {
        const w = @as(usize, @intCast(weights[i - 1]));
        for (0..=capacity) |c| {
            dp[i][c] = dp[i - 1][c];
            if (c >= w) dp[i][c] = @max(dp[i][c], dp[i - 1][c - w] + values[i - 1]);
        }
    }
    return dp[weights.len][capacity];
}

fn coin_change_min(allocator: std.mem.Allocator, coins: []const u32, amount: usize) !?usize {
    const dp = try allocator.alloc(?usize, amount + 1);
    defer allocator.free(dp);
    @memset(dp, null);
    dp[0] = 0;
    for (1..=amount) |a| {
        for (coins) |coin| {
            const c = @as(usize, @intCast(coin));
            if (c <= a and dp[a - c] != null) {
                const candidate = dp[a - c].? + 1;
                if (dp[a] == null or candidate < dp[a].?) dp[a] = candidate;
            }
        }
    }
    return dp[amount];
}

fn lcs_length(allocator: std.mem.Allocator, a: []const u8, b: []const u8) !usize {
    const dp = try allocator.alloc([]usize, a.len + 1);
    defer allocator.free(dp);
    for (dp, 0..) |_, i| dp[i] = try allocator.alloc(usize, b.len + 1);
    for (dp) |row| @memset(row, 0);
    for (1..=a.len) |i| {
        for (1..=b.len) |j| {
            dp[i][j] = if (a[i - 1] == b[j - 1]) dp[i - 1][j - 1] + 1 else @max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[a.len][b.len];
}

fn lis_length(allocator: std.mem.Allocator, values: []const i32) !usize {
    if (values.len == 0) return 0;
    const dp = try allocator.alloc(usize, values.len);
    defer allocator.free(dp);
    @memset(dp, 1);
    var best: usize = 1;
    for (1..values.len) |i| {
        for (0..i) |j| {
            if (values[j] < values[i]) dp[i] = @max(dp[i], dp[j] + 1);
        }
        best = @max(best, dp[i]);
    }
    return best;
}

fn kadane_max_subarray(values: []const i32) i32 {
    var best = values[0];
    var current = values[0];
    for (values[1..]) |v| {
        current = @max(v, current + v);
        best = @max(best, current);
    }
    return best;
}

fn two_sum_sorted(sorted: []const i32, target: i32) ?struct { i: usize, j: usize } {
    var lo: usize = 0;
    var hi: usize = sorted.len - 1;
    while (lo < hi) {
        const sum = sorted[lo] + sorted[hi];
        if (sum == target) return .{ .i = lo, .j = hi };
        if (sum < target) { lo += 1; } else { hi -= 1; }
    }
    return null;
}

fn pair_with_sum(allocator: std.mem.Allocator, values: []const i32, target: i32) !?struct { i: usize, j: usize } {
    var seen = std.StringHashMap(usize).init(allocator);
    defer seen.deinit();
    var buf: [32]u8 = undefined;
    for (values, 0..) |v, i| {
        const want = try std.fmt.bufPrint(&buf, "{d}", .{target - v});
        if (seen.get(want)) |j| return .{ .i = j, .j = i };
        const key = try std.fmt.bufPrint(&buf, "{d}", .{v});
        try seen.put(key, i);
    }
    return null;
}

fn next_permutation(values: []i32) bool {
    var i = values.len - 1;
    while (i > 0 and values[i - 1] >= values[i]) i -= 1;
    if (i == 0) {
        std.mem.reverse(i32, values);
        return false;
    }
    var j = values.len - 1;
    while (values[j] <= values[i - 1]) j -= 1;
    std.mem.swap(i32, &values[i - 1], &values[j]);
    std.mem.reverse(i32, values[i..]);
    return true;
}

fn rotate_matrix_90(allocator: std.mem.Allocator, matrix: []const []const i32) ![][]i32 {
    const n = matrix.len;
    const out = try allocator.alloc([]i32, n);
    for (out, 0..) |_, i| out[i] = try allocator.alloc(i32, n);
    for (matrix, 0..) |row, r| {
        for (row, 0..) |v, c| {
            out[c][n - 1 - r] = v;
        }
    }
    return out;
}

fn spiral_order_alloc(allocator: std.mem.Allocator, matrix: []const []const i32) !std.ArrayList(i32) {
    var result = std.ArrayList(i32).init(allocator);
    if (matrix.len == 0) return result;
    const rows = matrix.len;
    const cols = matrix[0].len;
    var top: usize = 0; var bottom = rows - 1; var left: usize = 0; var right = cols - 1;
    while (top <= bottom and left <= right) {
        for (left..=right) |c| try result.append(matrix[top][c]);
        for (top + 1..=bottom) |r| try result.append(matrix[r][right]);
        if (top < bottom) for (left..=right) |c| try result.append(matrix[bottom][right + left - c]);
        if (left < right) for (top + 1..bottom) |r| try result.append(matrix[right + top - r][left]);
        top += 1; bottom -= 1; left += 1; right -= 1;
    }
    return result;
}

fn matrix_multiply_alloc(allocator: std.mem.Allocator, a: []const []const f64, b: []const []const f64) ![][]f64 {
    const m = a.len;
    const n = b.len;
    const p = b[0].len;
    const out = try allocator.alloc([]f64, m);
    for (out, 0..) |_, i| out[i] = try allocator.alloc(f64, p);
    for (out) |row| @memset(row, 0);
    for (0..m) |i| {
        for (0..n) |k| {
            const ak = a[i][k];
            for (0..p) |j| out[i][j] += ak * b[k][j];
        }
    }
    return out;
}

fn binary_search_rotated(values: []const i32, target: i32) ?usize {
    var lo: usize = 0;
    var hi: usize = values.len;
    while (lo < hi) {
        const mid = lo + (hi - lo) / 2;
        if (values[mid] == target) return mid;
        if (values[lo] <= values[mid]) {
            if (target >= values[lo] and target < values[mid]) { hi = mid; } else { lo = mid + 1; }
        } else {
            if (target > values[mid] and target <= values[hi - 1]) { lo = mid + 1; } else { hi = mid; }
        }
    }
    return null;
}

fn fibonacci_memoized(n: usize, memo: []?u64) u64 {
    if (memo[n]) |cached| return cached;
    const result = if (n < 2) @as(u64, @intCast(n)) else fibonacci_memoized(n - 1, memo) + fibonacci_memoized(n - 2, memo);
    memo[n] = result;
    return result;
}

fn partition_lomuto(values: []i32, lo: usize, hi: usize) usize {
    const pivot = values[hi];
    var i = lo;
    var j = lo;
    while (j < hi) : (j += 1) {
        if (values[j] < pivot) {
            std.mem.swap(i32, &values[i], &values[j]);
            i += 1;
        }
    }
    std.mem.swap(i32, &values[i], &values[hi]);
    return i;
}
