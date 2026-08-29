// Data module for scripts/generate/generate-cpp.mjs.
// More domain models plus geometry and matrix helpers.

export default [
  {
    file: 'domain_models_2.cpp',
    topic: 'domain models and their methods',
    includes: ['<iomanip>', '<sstream>', '<string>', '<utility>', '<vector>'],
    units: [
      `// Song is a track in the music library.
class Song {
public:
    Song(std::string title, std::string artist, int durationSec);

    std::string minutes() const;
    void bump_play_count();
    int plays() const;

private:
    std::string title_;
    std::string artist_;
    int durationSec_;
    int playCount_ = 0;
};

Song::Song(std::string title, std::string artist, int durationSec)
    : title_(std::move(title)), artist_(std::move(artist)),
      durationSec_(durationSec) {}

std::string Song::minutes() const {
    std::ostringstream out;
    out << (durationSec_ / 60) << ":"
        << std::setw(2) << std::setfill('0') << (durationSec_ % 60);
    return out.str();
}

void Song::bump_play_count() {
    ++playCount_;
}

int Song::plays() const {
    return playCount_;
}`,

      `// Task is a unit of work on a project board.
class Task {
public:
    Task(int id, std::string title);

    void complete();
    bool is_done() const;
    std::string title() const;

private:
    int id_;
    std::string title_;
    bool done_ = false;
};

Task::Task(int id, std::string title) : id_(id), title_(std::move(title)) {}

void Task::complete() {
    done_ = true;
}

bool Task::is_done() const {
    return done_;
}

std::string Task::title() const {
    return title_;
}`,

      `// SensorReading is one sample from an environmental sensor.
struct SensorReading {
    std::string deviceId;
    double temperature = 0.0;
    double humidity = 0.0;
};

// heat_index approximates the perceived temperature from humidity.
double heat_index(const SensorReading& reading) {
    double t = reading.temperature;
    double h = reading.humidity;
    return -42.379 + 2.04901523 * t + 10.14333127 * h -
           0.22475541 * t * h - 0.00683783 * t * t -
           0.05481717 * h * h + 0.00122874 * t * t * h +
           0.00085282 * t * h * h - 0.00000199 * t * t * h * h;
}`,

      `// CartItem is one product line in a shopping cart.
struct CartItem {
    std::string productSku;
    int quantity = 0;
    long long unitPriceCents = 0;
};

// line_total is the price of the whole line.
long long line_total(const CartItem& item) {
    return item.unitPriceCents * item.quantity;
}`,

      `// Session is a logged-in browser session with an expiry.
class Session {
public:
    Session(std::string token, int userId, long long expiresAtSec);

    bool expired(long long nowSec) const;
    long long remaining_sec(long long nowSec) const;

private:
    std::string token_;
    int userId_;
    long long expiresAtSec_;
};

Session::Session(std::string token, int userId, long long expiresAtSec)
    : token_(std::move(token)), userId_(userId), expiresAtSec_(expiresAtSec) {}

bool Session::expired(long long nowSec) const {
    return nowSec >= expiresAtSec_;
}

long long Session::remaining_sec(long long nowSec) const {
    return expiresAtSec_ > nowSec ? expiresAtSec_ - nowSec : 0;
}`,

      `// Notification is a user-facing alert.
class Notification {
public:
    Notification(std::string id, std::string kind, std::string message);

    void mark_read();
    bool is_read() const;

private:
    std::string id_;
    std::string kind_;
    std::string message_;
    bool read_ = false;
};

Notification::Notification(std::string id, std::string kind, std::string message)
    : id_(std::move(id)), kind_(std::move(kind)), message_(std::move(message)) {}

void Notification::mark_read() {
    read_ = true;
}

bool Notification::is_read() const {
    return read_;
}`,

      `// Address is a postal address for shipping or billing.
struct Address {
    std::string street;
    std::string city;
    std::string state;
    std::string zip;
};

// to_single_line renders the address on one line.
std::string to_single_line(const Address& address) {
    std::ostringstream out;
    out << address.street << ", " << address.city << ", "
        << address.state << " " << address.zip;
    return out.str();
}`,

      `// Recipe is a set of ingredients and a procedure.
class Recipe {
public:
    Recipe(std::string name, int servings);

    void add_ingredient(std::string ingredient);
    size_t ingredient_count() const;
    std::string name() const;

private:
    std::string name_;
    int servings_;
    std::vector<std::string> ingredients_;
};

Recipe::Recipe(std::string name, int servings)
    : name_(std::move(name)), servings_(servings) {}

void Recipe::add_ingredient(std::string ingredient) {
    ingredients_.push_back(std::move(ingredient));
}

size_t Recipe::ingredient_count() const {
    return ingredients_.size();
}

std::string Recipe::name() const {
    return name_;
}`,

      `// Payment is a single charge against an order.
class Payment {
public:
    Payment(std::string id, std::string orderId, long long amountCents);

    bool refundable() const;
    long long amount() const;

private:
    std::string id_;
    std::string orderId_;
    long long amountCents_;
};

Payment::Payment(std::string id, std::string orderId, long long amountCents)
    : id_(std::move(id)), orderId_(std::move(orderId)),
      amountCents_(amountCents) {}

bool Payment::refundable() const {
    return amountCents_ > 0;
}

long long Payment::amount() const {
    return amountCents_;
}`,

      `// Event is a timestamped fact emitted by an application.
struct Event {
    std::string type;
    long long createdAtSec = 0;
};

// event_key returns a stable deduplication key for an event.
std::string event_key(const Event& event) {
    return event.type + "@" + std::to_string(event.createdAtSec);
}`,

      `// Message is a chat message between two users.
class Message {
public:
    Message(std::string id, int fromId, int toId, std::string body);

    bool is_reply() const;
    std::string body() const;

private:
    std::string id_;
    int fromId_;
    int toId_;
    std::string replyToId_;
    std::string body_;
};

Message::Message(std::string id, int fromId, int toId, std::string body)
    : id_(std::move(id)), fromId_(fromId), toId_(toId),
      body_(std::move(body)) {}

bool Message::is_reply() const {
    return !replyToId_.empty();
}

std::string Message::body() const {
    return body_;
}`,
    ],
  },

  {
    file: 'geometry_math.cpp',
    topic: 'geometry and matrix helpers',
    includes: ['<algorithm>', '<cmath>', '<vector>'],
    units: [
      `// Point is a 2D coordinate.
struct Point {
    double x = 0.0;
    double y = 0.0;
};

// point_distance returns the Euclidean distance between two points.
double point_distance(const Point& a, const Point& b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return std::sqrt(dx * dx + dy * dy);
}

// point_midpoint returns the point halfway between a and b.
Point point_midpoint(const Point& a, const Point& b) {
    return Point{(a.x + b.x) / 2.0, (a.y + b.y) / 2.0};
}`,

      `// Rect is an axis-aligned rectangle.
struct Rect {
    Point min;
    Point max;
};

// rect_contains reports whether p lies inside the rectangle, inclusive.
bool rect_contains(const Rect& rect, const Point& p) {
    return p.x >= rect.min.x && p.x <= rect.max.x &&
           p.y >= rect.min.y && p.y <= rect.max.y;
}

// rect_area is the rectangle's width times height.
double rect_area(const Rect& rect) {
    return (rect.max.x - rect.min.x) * (rect.max.y - rect.min.y);
}`,

      `// kPi is pi to enough digits for double precision.
constexpr double kPi = 3.14159265358979323846;

// Circle is defined by a center point and a radius.
struct Circle {
    Point center;
    double radius = 0.0;
};

// circle_area is pi times the radius squared.
double circle_area(const Circle& circle) {
    return kPi * circle.radius * circle.radius;
}

// circle_circumference is the distance around the circle.
double circle_circumference(const Circle& circle) {
    return 2.0 * kPi * circle.radius;
}`,

      `// Vec2 is a 2D vector.
struct Vec2 {
    double x = 0.0;
    double y = 0.0;
};

// vec_add returns the component-wise sum of two vectors.
Vec2 vec_add(const Vec2& a, const Vec2& b) {
    return Vec2{a.x + b.x, a.y + b.y};
}

// vec_dot returns the scalar product of two vectors.
double vec_dot(const Vec2& a, const Vec2& b) {
    return a.x * b.x + a.y * b.y;
}

// vec_length is the magnitude of the vector.
double vec_length(const Vec2& v) {
    return std::hypot(v.x, v.y);
}`,

      `// rotate_point rotates p around the origin by the given angle in radians.
Point rotate_point(const Point& p, double angle) {
    double cos = std::cos(angle);
    double sin = std::sin(angle);
    return Point{p.x * cos - p.y * sin, p.x * sin + p.y * cos};
}`,

      `// angle_between returns the unsigned angle in radians between two vectors.
double angle_between(const Vec2& a, const Vec2& b) {
    double denom = vec_length(a) * vec_length(b);
    if (denom == 0.0) {
        return 0.0;
    }
    return std::acos(vec_dot(a, b) / denom);
}`,

      `// polygon_area computes the signed area of a polygon with the shoelace
// formula.
double polygon_area(const std::vector<Point>& points) {
    if (points.size() < 3) {
        return 0.0;
    }
    double sum = 0.0;
    for (size_t i = 0; i < points.size(); ++i) {
        const Point& a = points[i];
        const Point& b = points[(i + 1) % points.size()];
        sum += a.x * b.y - b.x * a.y;
    }
    return sum / 2.0;
}`,

      `// distance_to_segment returns the shortest distance from p to the
// segment between a and b.
double distance_to_segment(const Point& p, const Point& a, const Point& b) {
    double dx = b.x - a.x;
    double dy = b.y - a.y;
    if (dx == 0.0 && dy == 0.0) {
        return point_distance(p, a);
    }
    double t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
    t = std::max(0.0, std::min(1.0, t));
    Point closest{a.x + t * dx, a.y + t * dy};
    return point_distance(p, closest);
}`,

      `// matrix_multiply multiplies two matrices when their dimensions agree.
std::vector<std::vector<double>> matrix_multiply(
    const std::vector<std::vector<double>>& a,
    const std::vector<std::vector<double>>& b) {
    std::vector<std::vector<double>> out;
    if (a.empty() || b.empty() || a.front().size() != b.size()) {
        return out;
    }
    size_t rows = a.size(), inner = b.size(), cols = b.front().size();
    out.assign(rows, std::vector<double>(cols, 0.0));
    for (size_t i = 0; i < rows; ++i) {
        for (size_t k = 0; k < inner; ++k) {
            for (size_t j = 0; j < cols; ++j) {
                out[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return out;
}`,

      `// matrix_scale multiplies every element of a matrix by factor.
std::vector<std::vector<double>> matrix_scale(
    const std::vector<std::vector<double>>& matrix, double factor) {
    std::vector<std::vector<double>> out;
    out.reserve(matrix.size());
    for (const auto& row : matrix) {
        std::vector<double> scaled;
        scaled.reserve(row.size());
        for (double v : row) {
            scaled.push_back(v * factor);
        }
        out.push_back(scaled);
    }
    return out;
}`,

      `// determinant_2x2 computes the determinant of a 2x2 matrix.
double determinant_2x2(const std::vector<std::vector<double>>& matrix) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}`,

      `// clamp_angle_deg normalizes an angle in degrees to [0, 360).
double clamp_angle_deg(double degrees) {
    degrees = std::fmod(degrees, 360.0);
    return degrees < 0.0 ? degrees + 360.0 : degrees;
}`,

      `// reflect_point mirrors p across the point center.
Point reflect_point(const Point& p, const Point& center) {
    return Point{2.0 * center.x - p.x, 2.0 * center.y - p.y};
}`,

      `// normalize_vector returns a unit vector with the same direction.
Vec2 normalize_vector(const Vec2& v) {
    double length = vec_length(v);
    if (length == 0.0) {
        return Vec2{0.0, 0.0};
    }
    return Vec2{v.x / length, v.y / length};
}`,
    ],
  },
];
