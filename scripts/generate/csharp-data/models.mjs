// C# model blocks — small records/classes, one per block.
export const models = [
`// Immutable point in 2D space with a distance helper.
public record Point(double X, double Y)
{
    public double DistanceTo(Point other)
    {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }
}`,
`// A book with title, author, and page count.
public record Book(string Title, string Author, int Pages)
{
    public bool IsLongRead => Pages > 400;
}`,
`// A user account with a locked flag and a display name.
public sealed class User
{
    public string Id { get; }
    public string Name { get; }
    public bool Locked { get; private set; }

    public User(string id, string name)
    {
        Id = id;
        Name = name;
    }

    public void Lock() => Locked = true;

    public string DisplayName => string.IsNullOrWhiteSpace(Name) ? "Anonymous" : Name;
}`,
`// One line item in a shopping order.
public record OrderItem(string Sku, int Quantity, double UnitPrice)
{
    public double LineTotal => Quantity * UnitPrice;
}`,
`// A simple bank account tracking a balance in cents.
public sealed class BankAccount
{
    public long BalanceCents { get; private set; }

    public void Deposit(long amountCents)
    {
        if (amountCents <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amountCents), "deposit must be positive");
        }
        BalanceCents += amountCents;
    }

    public bool Withdraw(long amountCents)
    {
        if (amountCents <= 0 || amountCents > BalanceCents)
        {
            return false;
        }
        BalanceCents -= amountCents;
        return true;
    }
}`,
`// A temperature reading with Celsius/Fahrenheit conversions.
public record Temperature(double Celsius)
{
    public double ToFahrenheit() => Celsius * 9.0 / 5.0 + 32;

    public bool IsFreezing => Celsius <= 0;
}`,
`// A shopping cart accumulating items and their totals.
public sealed class ShoppingCart
{
    private readonly Dictionary<string, int> items = new();

    public void Add(string sku, int quantity)
    {
        items[sku] = items.GetValueOrDefault(sku) + quantity;
    }

    public void Remove(string sku) => items.Remove(sku);

    public int ItemCount => items.Values.Sum();
}`,
`// A physical address with a compact single-line form.
public record Address(string Street, string City, string Zip)
{
    public string OneLine() => $"{Street}, {City} {Zip}";
}`,
`// Measures elapsed time between start and stop.
public sealed class Stopwatch
{
    private readonly System.Diagnostics.Stopwatch watch = new();
    private bool running;

    public void Start()
    {
        watch.Start();
        running = true;
    }

    public void Stop()
    {
        watch.Stop();
        running = false;
    }

    public double ElapsedSeconds => running ? watch.Elapsed.TotalSeconds : watch.Elapsed.TotalSeconds;
}`,
`// A movie with a runtime check helper.
public record Movie(string Title, int ReleaseYear, int RuntimeMinutes)
{
    public bool IsClassic => ReleaseYear < 1980;

    public string RuntimeLabel => $"{RuntimeMinutes / 60}h {RuntimeMinutes % 60}m";
}`,
`// A token bucket used to shape request rates.
public sealed class RateLimiter
{
    private readonly double capacity;
    private readonly double refillPerSecond;
    private double tokens;
    private DateTime lastRefill;

    public RateLimiter(double capacity, double refillPerSecond)
    {
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        tokens = capacity;
        lastRefill = DateTime.UtcNow;
    }

    public bool TryAcquire()
    {
        lock (this)
        {
            DateTime now = DateTime.UtcNow;
            double elapsed = (now - lastRefill).TotalSeconds;
            tokens = Math.Min(capacity, tokens + elapsed * refillPerSecond);
            lastRefill = now;
            if (tokens < 1)
            {
                return false;
            }
            tokens -= 1;
            return true;
        }
    }
}`,
`// A simple checklist item with a completion toggle.
public sealed class TodoItem
{
    public string Title { get; }
    public bool Done { get; private set; }

    public TodoItem(string title)
    {
        Title = title;
    }

    public void Toggle() => Done = !Done;

    public string Render() => (Done ? "[x] " : "[ ] ") + Title;
}`,
`// A product with a discount applied as a percentage.
public record Product(string Name, double Price, double DiscountPercent)
{
    public double DiscountedPrice => Price * (1 - DiscountPercent / 100);
}`,
`// An inclusive numeric range with membership and overlap tests.
public sealed class Range
{
    public int Low { get; }
    public int High { get; }

    public Range(int low, int high)
    {
        Low = Math.Min(low, high);
        High = Math.Max(low, high);
    }

    public bool Contains(int value) => value >= Low && value <= High;

    public bool Overlaps(Range other) => Low <= other.High && other.Low <= High;

    public int Length => High - Low;
}`,
`// An employee record with a seniority check.
public record Employee(string Name, string Department, int YearsOfService)
{
    public bool IsSenior => YearsOfService >= 5;
}`,
`// A small leveled logger that filters by severity.
public sealed class Logger
{
    private readonly string name;
    private readonly int level;

    public Logger(string name, int level)
    {
        this.name = name;
        this.level = level;
    }

    public void Log(int severity, string message)
    {
        if (severity >= level)
        {
            Console.WriteLine($"[{name}] {message}");
        }
    }
}`,
`// A geo point with a haversine distance to another point.
public record GeoPoint(double Latitude, double Longitude)
{
    public double DistanceKm(GeoPoint other)
    {
        double lat1 = ToRadians(Latitude);
        double lat2 = ToRadians(other.Latitude);
        double dLat = lat2 - lat1;
        double dLon = ToRadians(other.Longitude - Longitude);
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
            + Math.Cos(lat1) * Math.Cos(lat2) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return 6371.0 * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}`,
`// Tracks the high score and who set it.
public sealed class ScoreTracker
{
    public int HighScore { get; private set; }
    public string HighScoreHolder { get; private set; } = "";

    public void SubmitScore(string player, int score)
    {
        if (score > HighScore)
        {
            HighScore = score;
            HighScoreHolder = player;
        }
    }
}`,
`// An inbound request with a validation helper.
public record Request(string Path, string Method, Dictionary<string, string> Headers)
{
    public bool IsGet => Method.Equals("GET", StringComparison.OrdinalIgnoreCase);

    public string HeaderOr(string name, string fallback) =>
        Headers.GetValueOrDefault(name) ?? fallback;
}`,
`// A queue of pending work with size reporting.
public sealed class TaskQueue
{
    private readonly Queue<Action> queue = new();

    public void Enqueue(Action task) => queue.Enqueue(task);

    public Action? Dequeue() => queue.Count > 0 ? queue.Dequeue() : null;

    public int Pending => queue.Count;
}`,
];
