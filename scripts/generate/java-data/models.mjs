// Java model blocks — small records/classes, one per block.
export const models = [
`// Immutable point in 2D space with a distance helper.
public record Point(double x, double y) {
    public double distanceTo(Point other) {
        double dx = x - other.x;
        double dy = y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}`,
`// A book with title, author, and page count.
public record Book(String title, String author, int pages) {
    public boolean isLongRead() {
        return pages > 400;
    }
}`,
`// A user account with a locked flag and a display name.
public class User {
    private final String id;
    private final String name;
    private boolean locked;

    public User(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public void lock() {
        this.locked = true;
    }

    public boolean isLocked() {
        return locked;
    }

    public String displayName() {
        return name == null || name.isBlank() ? "Anonymous" : name;
    }
}`,
`// One line item in a shopping order.
public record OrderItem(String sku, int quantity, double unitPrice) {
    public double lineTotal() {
        return quantity * unitPrice;
    }
}`,
`// A simple bank account tracking a balance in cents.
public class BankAccount {
    private long balanceCents;

    public void deposit(long amountCents) {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("deposit must be positive");
        }
        balanceCents += amountCents;
    }

    public boolean withdraw(long amountCents) {
        if (amountCents <= 0 || amountCents > balanceCents) {
            return false;
        }
        balanceCents -= amountCents;
        return true;
    }

    public long balance() {
        return balanceCents;
    }
}`,
`// A temperature reading with Celsius/Fahrenheit conversions.
public record Temperature(double celsius) {
    public double toFahrenheit() {
        return celsius * 9.0 / 5.0 + 32;
    }

    public boolean isFreezing() {
        return celsius <= 0;
    }
}`,
`// A shopping cart accumulating items and their totals.
public class ShoppingCart {
    private final Map<String, Integer> items = new LinkedHashMap<>();

    public void add(String sku, int quantity) {
        items.merge(sku, quantity, Integer::sum);
    }

    public void remove(String sku) {
        items.remove(sku);
    }

    public int itemCount() {
        return items.values().stream().mapToInt(Integer::intValue).sum();
    }
}`,
`// A physical address with a compact single-line form.
public record Address(String street, String city, String zip) {
    public String oneLine() {
        return street + ", " + city + " " + zip;
    }
}`,
`// Measures elapsed time between start and stop.
public class Stopwatch {
    private long startNanos;
    private long elapsedNanos;
    private boolean running;

    public void start() {
        startNanos = System.nanoTime();
        running = true;
    }

    public void stop() {
        if (running) {
            elapsedNanos += System.nanoTime() - startNanos;
            running = false;
        }
    }

    public double elapsedSeconds() {
        long total = running ? elapsedNanos + System.nanoTime() - startNanos : elapsedNanos;
        return total / 1_000_000_000.0;
    }
}`,
`// A movie with a runtime check helper.
public record Movie(String title, int releaseYear, int runtimeMinutes) {
    public boolean isClassic() {
        return releaseYear < 1980;
    }

    public String runtimeLabel() {
        return runtimeMinutes / 60 + "h " + runtimeMinutes % 60 + "m";
    }
}`,
`// A token bucket used to shape request rates.
public class RateLimiter {
    private final double capacity;
    private final double refillPerSecond;
    private double tokens;
    private long lastRefill;

    public RateLimiter(double capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        this.tokens = capacity;
        this.lastRefill = System.nanoTime();
    }

    public synchronized boolean tryAcquire() {
        long now = System.nanoTime();
        double elapsed = (now - lastRefill) / 1_000_000_000.0;
        tokens = Math.min(capacity, tokens + elapsed * refillPerSecond);
        lastRefill = now;
        if (tokens < 1) {
            return false;
        }
        tokens -= 1;
        return true;
    }
}`,
`// A simple checklist item with a completion toggle.
public class TodoItem {
    private final String title;
    private boolean done;

    public TodoItem(String title) {
        this.title = title;
    }

    public void toggle() {
        done = !done;
    }

    public String render() {
        return (done ? "[x] " : "[ ] ") + title;
    }
}`,
`// A product with a discount applied as a percentage.
public record Product(String name, double price, double discountPercent) {
    public double discountedPrice() {
        return price * (1 - discountPercent / 100);
    }
}`,
`// An inclusive numeric range with membership and overlap tests.
public class Range {
    private final int low;
    private final int high;

    public Range(int low, int high) {
        this.low = Math.min(low, high);
        this.high = Math.max(low, high);
    }

    public boolean contains(int value) {
        return value >= low && value <= high;
    }

    public boolean overlaps(Range other) {
        return this.low <= other.high && other.low <= this.high;
    }

    public int length() {
        return high - low;
    }
}`,
`// An employee record with a seniority check.
public record Employee(String name, String department, int yearsOfService) {
    public boolean isSenior() {
        return yearsOfService >= 5;
    }
}`,
`// A small leveled logger that filters by severity.
public class Logger {
    private final String name;
    private final int level;

    public Logger(String name, int level) {
        this.name = name;
        this.level = level;
    }

    public void log(int severity, String message) {
        if (severity >= level) {
            System.out.println("[" + name + "] " + message);
        }
    }
}`,
`// A geo point with a haversine distance to another point.
public record GeoPoint(double latitude, double longitude) {
    public double distanceKm(GeoPoint other) {
        double lat1 = Math.toRadians(latitude);
        double lat2 = Math.toRadians(other.latitude);
        double dLat = lat2 - lat1;
        double dLon = Math.toRadians(other.longitude - longitude);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 6371.0 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}`,
`// Tracks the high score and who set it.
public class ScoreTracker {
    private int highScore;
    private String highScoreHolder = "";

    public void submitScore(String player, int score) {
        if (score > highScore) {
            highScore = score;
            highScoreHolder = player;
        }
    }

    public int currentHighScore() {
        return highScore;
    }
}`,
`// An inbound request with a validation helper.
public record Request(String path, String method, Map<String, String> headers) {
    public boolean isGet() {
        return "GET".equalsIgnoreCase(method);
    }

    public String headerOr(String name, String fallback) {
        return headers.getOrDefault(name, fallback);
    }
}`,
`// A queue of pending work with size reporting.
public class TaskQueue {
    private final java.util.ArrayDeque<Runnable> queue = new java.util.ArrayDeque<>();

    public void enqueue(Runnable task) {
        queue.addLast(task);
    }

    public Runnable dequeue() {
        return queue.pollFirst();
    }

    public int pending() {
        return queue.size();
    }
}`,
];
