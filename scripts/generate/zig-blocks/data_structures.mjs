// vibetyper zig dictionary data — data structures.
// Each entry is ONE complete, balanced top-level Zig unit. The generator adds
// the std import at the top of each output file, so blocks may call std. freely.
// String.raw keeps backslash escapes literal.

export const blocks = [
  // LIFO stack of i32 values backed by a growable list.
  String.raw`const IntStack = struct {
    items: std.ArrayList(i32),

    fn init(a: std.mem.Allocator) IntStack {
        return .{ .items = std.ArrayList(i32).init(a) };
    }
    fn deinit(self: *IntStack) void { self.items.deinit(); }
    fn push(self: *IntStack, v: i32) !void { try self.items.append(v); }
    fn pop(self: *IntStack) ?i32 { return self.items.popOrNull(); }
    fn peek(self: IntStack) ?i32 {
        const n = self.items.items.len;
        return if (n == 0) null else self.items.items[n - 1];
    }
    fn is_empty(self: IntStack) bool { return self.items.items.len == 0; }
};`,

  String.raw`const IntQueue = struct {
    items: std.ArrayList(i32),

    fn init(a: std.mem.Allocator) IntQueue {
        return .{ .items = std.ArrayList(i32).init(a) };
    }
    fn deinit(self: *IntQueue) void { self.items.deinit(); }
    fn enqueue(self: *IntQueue, v: i32) !void { try self.items.append(v); }
    fn dequeue(self: *IntQueue) ?i32 {
        if (self.items.items.len == 0) return null;
        return self.items.orderedRemove(0);
    }
    fn len(self: IntQueue) usize { return self.items.items.len; }
};`,

  String.raw`const RingBuffer = struct {
    allocator: std.mem.Allocator,
    buf: []u8,
    head: usize, len: usize,

    fn init(a: std.mem.Allocator, n: usize) !RingBuffer {
        return .{ .allocator = a, .buf = try a.alloc(u8, n), .head = 0, .len = 0 };
    }
    fn deinit(self: *RingBuffer) void { self.allocator.free(self.buf); }
    fn is_full(self: RingBuffer) bool { return self.len == self.buf.len; }
    fn push(self: *RingBuffer, byte: u8) bool { if (self.len == self.buf.len) return false; self.buf[(self.head + self.len) % self.buf.len] = byte; self.len += 1; return true; }
    fn read(self: *RingBuffer) ?u8 { if (self.len == 0) return null; const b = self.buf[self.head]; self.head = (self.head + 1) % self.buf.len; self.len -= 1; return b; }
};`,

  String.raw`const Counter = struct {
    map: std.StringHashMap(usize),

    fn init(a: std.mem.Allocator) Counter { return .{ .map = std.StringHashMap(usize).init(a) }; }
    fn deinit(self: *Counter) void { self.map.deinit(); }
    fn inc(self: *Counter, key: []const u8) !void {
        const gop = try self.map.getOrPut(key);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += 1;
    }
    fn dec(self: *Counter, key: []const u8) void {
        if (self.map.getPtr(key)) |p| if (p.* > 0) p.* -= 1;
    }
    fn get(self: Counter, key: []const u8) usize { return self.map.get(key) orelse 0; }
};`,

  String.raw`const FrequencyTable = struct {
    counts: std.StringHashMap(usize),
    fn init(a: std.mem.Allocator) FrequencyTable { return .{ .counts = std.StringHashMap(usize).init(a) }; }
    fn deinit(self: *FrequencyTable) void { self.counts.deinit(); }
    fn add(self: *FrequencyTable, key: []const u8) !void {
        const gop = try self.counts.getOrPut(key);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += 1;
    }
    fn most_common(self: FrequencyTable) ?[]const u8 {
        var best: ?[]const u8 = null; var seen: usize = 0;
        var it = self.counts.iterator();
        while (it.next()) |e| { if (e.value_ptr.* > seen) { seen = e.value_ptr.*; best = e.key_ptr.*; } }
        return best;
    }
};`,

  String.raw`const RunningStats = struct {
    n: usize,
    mean: f64,
    m2: f64,
    fn init() RunningStats { return .{ .n = 0, .mean = 0.0, .m2 = 0.0 }; }
    fn add(self: *RunningStats, x: f64) void {
        self.n += 1;
        const delta = x - self.mean; self.mean += delta / @floatFromInt(self.n);
        self.m2 += delta * (x - self.mean);
    }
    fn variance(self: RunningStats) f64 {
        if (self.n < 2) return 0.0;
        return self.m2 / @floatFromInt(self.n - 1);
    }
    fn average(self: RunningStats) f64 { return self.mean; }
};`,

  String.raw`const SampleWindow = struct {
    allocator: std.mem.Allocator,
    buf: []f64,
    head: usize, count: usize, sum: f64,
    fn init(a: std.mem.Allocator, cap: usize) !SampleWindow {
        return .{ .allocator = a, .buf = try a.alloc(f64, cap), .head = 0, .count = 0, .sum = 0.0 };
    }
    fn deinit(self: *SampleWindow) void { self.allocator.free(self.buf); }
    fn push(self: *SampleWindow, x: f64) void {
        if (self.count == self.buf.len) self.sum -= self.buf[self.head] else self.count += 1;
        self.buf[self.head] = x;
        self.sum += x;
        self.head = (self.head + 1) % self.buf.len;
    }
    fn rolling_sum(self: SampleWindow) f64 { return self.sum; }
};`,

  String.raw`const TokenBucket = struct {
    capacity: f64, rate: f64, tokens: f64, last_refill: i64,
    fn init(capacity: f64, rate: f64) TokenBucket { return .{ .capacity = capacity, .rate = rate, .tokens = capacity, .last_refill = std.time.milliTimestamp() }; }
    fn refill(self: *TokenBucket) void {
        const now = std.time.milliTimestamp();
        const elapsed = @as(f64, @floatFromInt(now - self.last_refill)) / 1000.0;
        self.tokens = @min(self.capacity, self.tokens + elapsed * self.rate);
        self.last_refill = now;
    }
    fn try_take(self: *TokenBucket, n: f64) bool {
        self.refill();
        if (self.tokens < n) return false;
        self.tokens -= n;
        return true;
    }
};`,

  String.raw`const Histogram = struct {
    allocator: std.mem.Allocator,
    bins: []usize,
    fn init(a: std.mem.Allocator, bucket_count: usize) !Histogram {
        return .{ .allocator = a, .bins = try a.allocZeroed(usize, bucket_count) };
    }
    fn deinit(self: *Histogram) void { self.allocator.free(self.bins); }
    fn record(self: *Histogram, bucket: usize) bool {
        if (bucket >= self.bins.len) return false;
        self.bins[bucket] += 1;
        return true;
    }
    fn peak(self: Histogram) usize { var best: usize = 0; for (self.bins) |b| best = @max(best, b); return best; }
};`,

  String.raw`const Interval = struct {
    start: u32,
    end: u32,
    fn init(start: u32, end: u32) Interval { return .{ .start = start, .end = end }; }
    fn len(self: Interval) u32 { return self.end - self.start; }
    fn contains(self: Interval, point: u32) bool {
        return point >= self.start and point < self.end;
    }
    fn overlaps(self: Interval, other: Interval) bool {
        return self.start < other.end and other.start < self.end;
    }
};`,

  String.raw`const BitSet = struct {
    allocator: std.mem.Allocator,
    words: []u64,
    fn init(a: std.mem.Allocator, n_bits: usize) !BitSet {
        const words = try a.alloc(u64, (n_bits + 63) / 64);
        @memset(words, 0);
        return .{ .allocator = a, .words = words };
    }
    fn deinit(self: *BitSet) void { self.allocator.free(self.words); }
    fn set(self: *BitSet, bit: usize) bool { const w = bit / 64; if (w >= self.words.len) return false; self.words[w] |= @as(u64, 1) << @intCast(bit % 64); return true; }
    fn test(self: BitSet, bit: usize) bool { const w = bit / 64; return w < self.words.len and (self.words[w] & (@as(u64, 1) << @intCast(bit % 64))) != 0; }
    fn clear(self: *BitSet, bit: usize) void { const w = bit / 64; if (w < self.words.len) self.words[w] &= ~(@as(u64, 1) << @intCast(bit % 64)); }
    fn count(self: BitSet) usize { var total: usize = 0; for (self.words) |w| total += @popCount(w); return total; }
};`,

  String.raw`const Point2D = struct {
    x: f64,
    y: f64,
    fn init(x: f64, y: f64) Point2D { return .{ .x = x, .y = y }; }
    fn distance_to(self: Point2D, other: Point2D) f64 {
        const dx = self.x - other.x;
        const dy = self.y - other.y;
        return @sqrt(dx * dx + dy * dy);
    }
    fn lerp_to(self: Point2D, other: Point2D, t: f64) Point2D {
        return .{ .x = self.x + (other.x - self.x) * t, .y = self.y + (other.y - self.y) * t };
    }
};`,

  String.raw`const Rect = struct {
    x: f32,
    y: f32,
    w: f32,
    h: f32,
    fn init(x: f32, y: f32, w: f32, h: f32) Rect {
        return .{ .x = x, .y = y, .w = w, .h = h };
    }
    fn area(self: Rect) f32 { return self.w * self.h; }
    fn contains_point(self: Rect, px: f32, py: f32) bool {
        return px >= self.x and px < self.x + self.w and py >= self.y and py < self.y + self.h;
    }
};`,

  String.raw`const Range = struct {
    start: i64,
    end: i64,
    fn init(start: i64, end: i64) Range { return .{ .start = start, .end = end }; }
    fn len(self: Range) i64 { return self.end - self.start; }
    fn contains(self: Range, value: i64) bool {
        return value >= self.start and value < self.end;
    }
    fn intersection(self: Range, other: Range) ?Range {
        const lo = @max(self.start, other.start);
        const hi = @min(self.end, other.end);
        return if (lo < hi) Range.init(lo, hi) else null;
    }
};`,

  String.raw`const LookupTable = struct {
    map: std.StringHashMap(i32),
    default: i32,
    fn init(a: std.mem.Allocator, default: i32) LookupTable {
        return .{ .map = std.StringHashMap(i32).init(a), .default = default };
    }
    fn deinit(self: *LookupTable) void { self.map.deinit(); }
    fn set(self: *LookupTable, key: []const u8, value: i32) !void { try self.map.put(key, value); }
    fn get(self: LookupTable, key: []const u8) i32 { return self.map.get(key) orelse self.default; }
};`,

  String.raw`const SortedList = struct {
    items: std.ArrayList(i32),
    fn init(a: std.mem.Allocator) SortedList { return .{ .items = std.ArrayList(i32).init(a) }; }
    fn deinit(self: *SortedList) void { self.items.deinit(); }
    fn insert_sorted(self: *SortedList, value: i32) !void {
        var i: usize = 0; while (i < self.items.items.len and self.items.items[i] < value) : (i += 1) {}
        try self.items.insert(i, value);
    }
    fn find(self: SortedList, value: i32) ?usize {
        var lo: usize = 0; var hi: usize = self.items.items.len;
        while (lo < hi) {
            const mid = lo + (hi - lo) / 2; if (self.items.items[mid] == value) return mid; if (self.items.items[mid] < value) { lo = mid + 1; } else { hi = mid; }
        }
        return null;
    }
};`,

  String.raw`const RecentCounter = struct {
    timestamps: std.ArrayList(i64),
    fn init(a: std.mem.Allocator) RecentCounter { return .{ .timestamps = std.ArrayList(i64).init(a) }; }
    fn deinit(self: *RecentCounter) void { self.timestamps.deinit(); }
    fn prune(self: *RecentCounter, cutoff: i64) void {
        while (self.timestamps.items.len > 0 and self.timestamps.items[0] < cutoff) {
            _ = self.timestamps.orderedRemove(0);
        }
    }
    fn count_within(self: *RecentCounter, now: i64, window_ms: i64) usize {
        self.prune(now - window_ms);
        return self.timestamps.items.len;
    }
};`,

  String.raw`const Threshold = struct {
    last: f64,
    rising: bool, falling: bool,
    fn init(first: f64) Threshold { return .{ .last = first, .rising = false, .falling = false }; }
    fn update(self: *Threshold, value: f64) void {
        if (value > self.last) { self.rising = true; self.falling = false; }
        else if (value < self.last) { self.falling = true; self.rising = false; }
        self.last = value;
    }
    fn is_rising(self: Threshold) bool { return self.rising; }
    fn is_falling(self: Threshold) bool { return self.falling; }
};`,

  String.raw`const Accumulator = struct {
    sum: i64, count: usize, min: i64, max: i64,
    fn init() Accumulator { return .{ .sum = 0, .count = 0, .min = std.math.maxInt(i64), .max = std.math.minInt(i64) }; }
    fn add(self: *Accumulator, v: i64) void {
        self.sum += v;
        self.count += 1;
        self.min = @min(self.min, v);
        self.max = @max(self.max, v);
    }
    fn reset(self: *Accumulator) void { self.* = init(); }
    fn average(self: Accumulator) f64 {
        if (self.count == 0) return 0.0;
        return @as(f64, @floatFromInt(self.sum)) / @floatFromInt(self.count);
    }
};`,

  String.raw`const NameIndex = struct {
    allocator: std.mem.Allocator, names: std.ArrayList([]const u8), ids: std.StringHashMap(usize),
    fn init(a: std.mem.Allocator) NameIndex { return .{ .allocator = a, .names = std.ArrayList([]const u8).init(a), .ids = std.StringHashMap(usize).init(a) }; }
    fn deinit(self: *NameIndex) void { for (self.names.items) |name| self.allocator.free(name); self.names.deinit(); self.ids.deinit(); }
    fn register(self: *NameIndex, name: []const u8) !usize {
        const dup = try self.allocator.dupe(u8, name); const id = self.names.items.len;
        try self.names.append(dup);
        try self.ids.put(dup, id);
        return id;
    }
    fn lookup(self: NameIndex, name: []const u8) ?usize { return self.ids.get(name); }
};`,

  String.raw`const KeyValueStore = struct {
    map: std.StringHashMap([]const u8),
    fn init(a: std.mem.Allocator) KeyValueStore { return .{ .map = std.StringHashMap([]const u8).init(a) }; }
    fn deinit(self: *KeyValueStore) void { self.map.deinit(); }
    fn set(self: *KeyValueStore, a: std.mem.Allocator, key: []const u8, value: []const u8) !void {
        const dup = try a.dupe(u8, value);
        if (self.map.get(key)) |old| a.free(old);
        try self.map.put(key, dup);
    }
    fn get_or_default(self: KeyValueStore, key: []const u8, default: []const u8) []const u8 {
        return self.map.get(key) orelse default;
    }
};`,

  String.raw`const FrequencyMap = struct {
    counts: std.StringHashMap(usize),
    fn init(a: std.mem.Allocator) FrequencyMap { return .{ .counts = std.StringHashMap(usize).init(a) }; }
    fn deinit(self: *FrequencyMap) void { self.counts.deinit(); }
    fn add(self: *FrequencyMap, key: []const u8) !void {
        const gop = try self.counts.getOrPut(key);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += 1;
    }
    fn remove(self: *FrequencyMap, key: []const u8) void { if (self.counts.getPtr(key)) |p| { if (p.* > 0) p.* -= 1; if (p.* == 0) _ = self.counts.remove(key); } }
    fn top(self: FrequencyMap) usize { var best: usize = 0; var it = self.counts.iterator(); while (it.next()) |e| best = @max(best, e.value_ptr.*); return best; }
};`,
];
// total: 22
