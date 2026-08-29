// vibetyper zig dictionary data — domain models
export const blocks = [
  String.raw`const User = struct {
    name: []const u8,
    email: []const u8,
    age: u8,

    fn is_adult(self: User) bool {
        return self.age >= 18;
    }

    fn display_name(self: User) []const u8 {
        if (self.name.len == 0) return self.email;
        return self.name;
    }
};`,

  String.raw`const Product = struct {
    name: []const u8,
    price_cents: u32,
    in_stock: bool,

    fn discounted_price(self: Product, percent: u32) u32 {
        return self.price_cents - self.price_cents * percent / 100;
    }
};`,

  String.raw`const OrderItem = struct {
    product_id: u64,
    quantity: u32,
    unit_price: u32,

    fn line_total(self: OrderItem) u32 {
        return self.quantity * self.unit_price;
    }
};`,

  String.raw`const Order = struct {
    id: u64,
    status: Status,
    items: std.ArrayList(OrderItem),
    const Status = enum { pending, shipped, delivered, cancelled };

    fn total_cents(self: Order) u32 {
        var total: u32 = 0;
        for (self.items.items) |item| total += item.line_total();
        return total;
    }
    fn item_count(self: Order) usize {
        return self.items.items.len;
    }
};`,

  String.raw`const Account = struct {
    balance: i64,

    fn deposit(self: *Account, amount: i64) !void {
        if (amount <= 0) return error.InvalidAmount;
        self.balance += amount;
    }

    fn withdraw(self: *Account, amount: i64) !void {
        if (amount <= 0) return error.InvalidAmount;
        if (amount > self.balance) return error.InsufficientFunds;
        self.balance -= amount;
    }
};`,

  String.raw`const Transaction = struct {
    kind: Kind,
    amount: i64,
    const Kind = enum {
        deposit,
        withdrawal,
        transfer,
    };
    fn label(self: Transaction) []const u8 {
        return switch (self.kind) {
            .deposit => "deposit",
            .withdrawal => "withdrawal",
            .transfer => "transfer",
        };
    }
};`,

  String.raw`const PaymentMethod = enum {
    card,
    bank_transfer,
    crypto,

    fn label(self: PaymentMethod) []const u8 {
        return @tagName(self);
    }

    fn is_instant(self: PaymentMethod) bool {
        return self != .bank_transfer;
    }
};`,

  String.raw`const HttpRequest = struct {
    method: []const u8,
    path: []const u8,
    headers: std.StringHashMap([]const u8),

    fn is_get(self: HttpRequest) bool {
        return std.mem.eql(u8, self.method, "GET");
    }

    fn content_length(self: HttpRequest) usize {
        const header = self.headers.get("content-length") orelse return 0;
        return std.fmt.parseInt(usize, header, 10) catch 0;
    }
};`,

  String.raw`const HttpResponse = struct {
    status: u16,
    body: []const u8,

    fn is_success(self: HttpResponse) bool {
        return self.status >= 200 and self.status < 300;
    }

    fn is_error(self: HttpResponse) bool {
        return self.status >= 400;
    }
};`,

  String.raw`const Metric = struct {
    name: []const u8,
    value: f64,
    labels: std.StringHashMap([]const u8),

    fn formatted(self: Metric, allocator: std.mem.Allocator) ![]u8 {
        return std.fmt.allocPrint(allocator, "{s} = {}", .{ self.name, self.value });
    }
};`,

  String.raw`const Event = struct {
    kind: []const u8,
    payload: []const u8,
    ts: i64,

    fn age_seconds(self: Event, now_ms: i64) i64 {
        return (now_ms - self.ts) / 1000;
    }
};`,

  String.raw`const TemperatureReading = struct {
    celsius: f64,

    const Unit = enum {
        celsius,
        fahrenheit,
    };

    fn to_fahrenheit(self: TemperatureReading) f64 {
        return self.celsius * 9.0 / 5.0 + 32.0;
    }
};`,

  String.raw`const Task = struct {
    id: u64,
    title: []const u8,
    done: bool,

    fn toggle(self: *Task) void {
        self.done = !self.done;
    }
};`,

  String.raw`const Project = struct {
    name: []const u8,
    tasks: std.ArrayList(Task),

    fn progress_percent(self: Project) u8 {
        if (self.tasks.items.len == 0) return 0;
        var done_count: usize = 0;
        for (self.tasks.items) |task| if (task.done) done_count += 1;
        return @intCast(done_count * 100 / self.tasks.items.len);
    }
    fn open_count(self: Project) usize {
        var open: usize = 0;
        for (self.tasks.items) |task| if (!task.done) open += 1;
        return open;
    }
};`,

  String.raw`const Session = struct {
    token: []const u8,
    user_id: u64,
    expires_at: i64,

    fn is_expired(self: Session, now_ms: i64) bool {
        return now_ms >= self.expires_at;
    }

    fn ttl_seconds(self: Session, now_ms: i64) i64 {
        return (self.expires_at - now_ms) / 1000;
    }
};`,

  String.raw`const LogEntry = struct {
    level: Level,
    message: []const u8,
    ts: i64,

    const Level = enum {
        debug,
        info,
        warn,
        error,
    };

    fn level_label(self: LogEntry) []const u8 {
        return @tagName(self.level);
    }
};`,

  String.raw`const Point3 = struct {
    x: f64,
    y: f64,
    z: f64,

    fn distance_to(self: Point3, other: Point3) f64 {
        const dx = self.x - other.x;
        const dy = self.y - other.y;
        const dz = self.z - other.z;
        return @sqrt(dx * dx + dy * dy + dz * dz);
    }
};`,

  String.raw`const Rectangle = struct {
    width: f32,
    height: f32,

    fn area(self: Rectangle) f32 {
        return self.width * self.height;
    }

    fn contains_point(self: Rectangle, x: f32, y: f32) bool {
        return x >= 0 and x <= self.width and y >= 0 and y <= self.height;
    }
};`,

  String.raw`const Player = struct {
    name: []const u8,
    elo: i32,
    games_played: u32,

    fn record_win(self: *Player) void {
        self.elo += 24; self.games_played += 1;
    }
    fn record_loss(self: *Player) void {
        self.elo -= 16; self.games_played += 1;
    }
    fn win_rate(self: Player, wins: u32) f64 {
        if (self.games_played == 0) return 0.0;
        return @as(f64, @floatFromInt(wins)) / @as(f64, @floatFromInt(self.games_played));
    }
};`,

  String.raw`const Config = struct {
    settings: std.StringHashMap([]const u8),

    fn get_str(self: Config, key: []const u8, fallback: []const u8) []const u8 {
        return self.settings.get(key) orelse fallback;
    }

    fn get_u64(self: Config, key: []const u8, fallback: u64) u64 {
        const raw = self.settings.get(key) orelse return fallback;
        return std.fmt.parseInt(u64, raw, 10) catch fallback;
    }
};`,

  String.raw`const Address = struct {
    street: []const u8,
    city: []const u8,
    zip: []const u8,
    country: []const u8,

    fn one_line(self: Address, allocator: std.mem.Allocator) ![]u8 {
        return std.fmt.allocPrint(allocator, "{s}, {s} {s} {s}", .{ self.street, self.city, self.zip, self.country });
    }
};`,

  String.raw`const Direction = enum {
    north,
    east,
    south,
    west,

    fn turn_left(self: Direction) Direction {
        const idx: u8 = @intFromEnum(self);
        return @enumFromInt((idx + 3) % 4);
    }

    fn turn_right(self: Direction) Direction {
        const idx: u8 = @intFromEnum(self);
        return @enumFromInt((idx + 1) % 4);
    }
};`,
];
// total: 22
