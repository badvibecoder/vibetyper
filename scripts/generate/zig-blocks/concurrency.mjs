// vibetyper zig dictionary data — concurrency & threads
export const blocks = [
  // Thread computes a value; join synchronizes before the result is read.
  String.raw`fn spawn_and_join(value: i64) i64 {
    const Worker = struct {
        fn compute(input: i64, out: *i64) void {
            out.* = input * input + input;
        }
    };
    var result: i64 = 0;
    const thread = std.Thread.spawn(.{}, Worker.compute, .{ value, &result }) catch return 0;
    thread.join();
    return result;
}`,

  String.raw`fn shared_mutex_counter(times: u32) u32 {
    const Worker = struct {
        fn bump(mutex: *std.Thread.Mutex, counter: *u32, n: u32) void {
            for (0..n) |_| {
                mutex.lock();
                counter.* += 1;
                mutex.unlock();
            }
        }
    };
    var counter: u32 = 0;
    var mutex = std.Thread.Mutex{};
    const t = std.Thread.spawn(.{}, Worker.bump, .{ &mutex, &counter, times }) catch return 0;
    t.join();
    return counter;
}`,

  String.raw`fn atomic_counter(times: u32) u32 {
    const Worker = struct {
        fn bump(counter: *std.atomic.Value(u32), n: u32) void {
            for (0..n) |_| _ = counter.fetchAdd(1, .monotonic);
        }
    };
    var counter = std.atomic.Value(u32).init(0);
    const t1 = std.Thread.spawn(.{}, Worker.bump, .{ &counter, times }) catch return 0;
    const t2 = std.Thread.spawn(.{}, Worker.bump, .{ &counter, times }) catch return 0;
    t1.join();
    t2.join();
    return counter.load(.monotonic);
}`,

  String.raw`const GuardedMap = struct {
    mutex: std.Thread.Mutex,
    map: std.StringHashMap(usize),
    fn init(allocator: std.mem.Allocator) GuardedMap {
        return .{ .mutex = .{}, .map = std.StringHashMap(usize).init(allocator) };
    }
    fn put(self: *GuardedMap, key: []const u8, value: usize) !void {
        self.mutex.lock(); defer self.mutex.unlock();
        try self.map.put(key, value);
    }
    fn get(self: *GuardedMap, key: []const u8) ?usize {
        self.mutex.lock(); defer self.mutex.unlock();
        return self.map.get(key);
    }
};`,

  String.raw`fn parallel_sum_halves(values: []const i64) i64 {
    const Worker = struct {
        fn sum(slice: []const i64, out: *i64) void {
            var total: i64 = 0;
            for (slice) |v| total += v;
            out.* = total;
        }
    };
    const mid = values.len / 2;
    var parts = [_]i64{ 0, 0 };
    const t1 = std.Thread.spawn(.{}, Worker.sum, .{ values[0..mid], &parts[0] }) catch return 0;
    const t2 = std.Thread.spawn(.{}, Worker.sum, .{ values[mid..], &parts[1] }) catch return 0;
    t1.join();
    t2.join();
    return parts[0] + parts[1];
}`,

  String.raw`fn parallel_apply_inplace(values: []i32) void {
    const Worker = struct {
        fn square(slice: []i32) void {
            for (slice) |*v| v.* = v.* * v.*;
        }
    };
    const mid = values.len / 2;
    const t1 = std.Thread.spawn(.{}, Worker.square, .{values[0..mid]}) catch return;
    const t2 = std.Thread.spawn(.{}, Worker.square, .{values[mid..]}) catch return;
    t1.join();
    t2.join();
}`,

  String.raw`fn results_by_slot(inputs: []const u64, out: []u64) void {
    const Worker = struct {
        fn fill(value: u64, slot: *u64) void {
            slot.* = value * 3 + 1;
        }
    };
    var handles: [8]std.Thread = undefined;
    const n = @min(inputs.len, out.len);
    for (inputs[0..n], 0..) |value, i| {
        handles[i] = std.Thread.spawn(.{}, Worker.fill, .{ value, &out[i] }) catch return;
    }
    for (handles[0..n]) |h| h.join();
}`,

  String.raw`const SharedQueue = struct {
    mutex: std.Thread.Mutex,
    cond: std.Thread.Condition,
    items: std.ArrayList(i64),

    fn push(self: *SharedQueue, value: i64) !void {
        self.mutex.lock(); defer self.mutex.unlock();
        try self.items.append(value);
        self.cond.signal();
    }
    fn pop(self: *SharedQueue) i64 {
        self.mutex.lock(); defer self.mutex.unlock();
        while (self.items.items.len == 0) self.cond.wait(&self.mutex);
        return self.items.orderedRemove(0);
    }
};`,

  String.raw`fn atomic_cas_max(shared: *std.atomic.Value(i64), candidate: i64) void {
    while (true) {
        const current = shared.load(.monotonic);
        if (candidate <= current) return;
        const swapped = shared.cmpxchgStrong(current, candidate, .monotonic, .monotonic);
        if (swapped == null) return;
    }
}`,

  String.raw`fn spawn_n_workers(count: u8) u8 {
    const Worker = struct {
        fn bump(counter: *std.atomic.Value(u8)) void {
            _ = counter.fetchAdd(1, .monotonic);
        }
    };
    var counter = std.atomic.Value(u8).init(0);
    var handles: [16]std.Thread = undefined;
    for (0..count) |i| {
        handles[i] = std.Thread.spawn(.{}, Worker.bump, .{ &counter }) catch return 0;
    }
    for (handles[0..count]) |h| h.join();
    return counter.load(.monotonic);
}`,

  String.raw`const Spinlock = struct {
    flag: std.atomic.Value(bool),

    fn init() Spinlock {
        return .{ .flag = std.atomic.Value(bool).init(false) };
    }

    fn acquire(self: *Spinlock) void {
        while (self.flag.testAndSet(.monotonic)) {}
    }

    fn release(self: *Spinlock) void {
        self.flag.store(false, .monotonic);
    }
};`,

  String.raw`fn concurrent_increment_many(threads: u32, increments: u32) bool {
    const Worker = struct {
        fn bump(counter: *std.atomic.Value(u32), n: u32) void {
            for (0..n) |_| _ = counter.fetchAdd(1, .monotonic);
        }
    };
    var counter = std.atomic.Value(u32).init(0);
    var handles: [8]std.Thread = undefined;
    for (0..threads) |i| {
        handles[i] = std.Thread.spawn(.{}, Worker.bump, .{ &counter, increments }) catch return false;
    }
    for (handles[0..threads]) |h| h.join();
    return counter.load(.monotonic) == threads * increments;
}`,

  String.raw`const TryLockGuard = struct {
    mutex: *std.Thread.Mutex,
    held: bool,

    fn acquire(mutex: *std.Thread.Mutex) TryLockGuard {
        return .{ .mutex = mutex, .held = mutex.tryLock() };
    }

    fn release(self: *TryLockGuard) void {
        if (self.held) self.mutex.unlock();
    }
};`,

  // Returns the actual elapsed time in milliseconds.
  String.raw`fn thread_sleep_ms(millis: u64) u64 {
    const start = std.time.milliTimestamp();
    std.time.sleep(millis * std.time.ns_per_ms);
    return @intCast(std.time.milliTimestamp() - start);
}`,

  String.raw`fn handshake_two_flags() bool {
    const Worker = struct {
        fn run(ready: *std.atomic.Value(bool), done: *std.atomic.Value(bool)) void {
            ready.store(true, .monotonic);
            var spins: u32 = 0;
            while (!done.load(.monotonic) and spins < 1000) : (spins += 1) {}
        }
    };
    var ready = std.atomic.Value(bool).init(false);
    var done = std.atomic.Value(bool).init(false);
    const thread = std.Thread.spawn(.{}, Worker.run, .{ &ready, &done }) catch return false;
    while (!ready.load(.monotonic)) {}
    done.store(true, .monotonic);
    thread.join();
    return true;
}`,

  String.raw`const SafeQueue = struct {
    mutex: std.Thread.Mutex,
    items: std.ArrayList(u8),

    fn push(self: *SafeQueue, value: u8) bool {
        self.mutex.lock(); defer self.mutex.unlock();
        self.items.append(value) catch return false;
        return true;
    }

    fn deinit(self: *SafeQueue) void {
        self.items.deinit();
    }
};`,

  String.raw`fn atomic_flag_done() bool {
    const Worker = struct {
        fn set_flag(flag: *std.atomic.Value(bool)) void {
            flag.store(true, .monotonic);
        }
    };
    var flag = std.atomic.Value(bool).init(false);
    const thread = std.Thread.spawn(.{}, Worker.set_flag, .{ &flag }) catch return false;
    var spins: u32 = 0;
    while (!flag.load(.monotonic) and spins < 100_000) : (spins += 1) {}
    thread.join();
    return flag.load(.monotonic);
}`,

  // Requires values.len > 1 so both halves are non-empty.
  String.raw`fn parallel_min_max_halves(values: []const f32) !struct { min: f32, max: f32 } {
    const Worker = struct {
        fn scan(slice: []const f32, out: *[2]f32) void {
            var lo = slice[0]; var hi = slice[0];
            for (slice[1..]) |v| { lo = @min(lo, v); hi = @max(hi, v); }
            out.* = .{ lo, hi };
        }
    };
    var best: [2][2]f32 = undefined;
    const t1 = try std.Thread.spawn(.{}, Worker.scan, .{ values[0 .. values.len / 2], &best[0] });
    const t2 = try std.Thread.spawn(.{}, Worker.scan, .{ values[values.len / 2 ..], &best[1] });
    t1.join();
    t2.join();
    return .{ .min = @min(best[0][0], best[1][0]), .max = @max(best[0][1], best[1][1]) };
}`,
];
// total: 18
