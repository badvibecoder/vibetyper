// Data module for scripts/generate/generate-go.mjs.
// More domain models plus geometry and matrix helpers.

export default [
  {
    file: 'domain_models_2.go',
    topic: 'domain models and their methods',
    imports: ['fmt', 'strings', 'time'],
    units: [
      `// Song is a track in the music library.
type Song struct {
	Title       string
	Artist      string
	DurationSec int
	PlayCount   int
}

// Minutes renders the duration as "m:ss".
func (s Song) Minutes() string {
	return fmt.Sprintf("%d:%02d", s.DurationSec/60, s.DurationSec%60)
}

// BumpPlayCount records one more play.
func (s *Song) BumpPlayCount() {
	s.PlayCount++
}`,

      `// Task is a unit of work on a project board.
type Task struct {
	ID    int
	Title string
	Done  bool
	Due   time.Time
}

// Complete marks the task as finished.
func (t *Task) Complete() {
	t.Done = true
}

// Overdue reports whether the task is unfinished and past its due date.
func (t Task) Overdue(now time.Time) bool {
	return !t.Done && now.After(t.Due)
}`,

      `// SensorReading is one sample from an environmental sensor.
type SensorReading struct {
	DeviceID    string
	Temperature float64
	Humidity    float64
	TakenAt     time.Time
}

// HeatIndex approximates the perceived temperature from humidity.
func (r SensorReading) HeatIndex() float64 {
	t := r.Temperature
	h := r.Humidity
	return -42.379 + 2.04901523*t + 10.14333127*h -
		0.22475541*t*h - 0.00683783*t*t -
		0.05481717*h*h + 0.00122874*t*t*h +
		0.00085282*t*h*h - 0.00000199*t*t*h*h
}`,

      `// CartItem is one product line in a shopping cart.
type CartItem struct {
	ProductSKU     string
	Quantity       int
	UnitPriceCents int64
}

// LineTotal is the price of the whole line.
func (i CartItem) LineTotal() int64 {
	return i.UnitPriceCents * int64(i.Quantity)
}`,

      `// Session is a logged-in browser session with an expiry.
type Session struct {
	Token     string
	UserID    int
	ExpiresAt time.Time
}

// IsExpired reports whether the session has passed its expiry.
func (s Session) IsExpired(now time.Time) bool {
	return now.After(s.ExpiresAt)
}

// Remaining returns how long the session still has to live.
func (s Session) Remaining(now time.Time) time.Duration {
	return s.ExpiresAt.Sub(now)
}`,

      `// Notification is a user-facing alert.
type Notification struct {
	ID      string
	Kind    string
	Message string
	Read    bool
}

// MarkRead flags the notification as seen.
func (n *Notification) MarkRead() {
	n.Read = true
}`,

      `// Address is a postal address for shipping or billing.
type Address struct {
	Street string
	City   string
	State  string
	ZIP    string
}

// String renders the address on a single line.
func (a Address) String() string {
	return strings.Join([]string{a.Street, a.City, a.State, a.ZIP}, ", ")
}`,

      `// Recipe is a set of ingredients and a procedure.
type Recipe struct {
	Name        string
	Servings    int
	Ingredients []string
}

// IngredientCount reports how many ingredients the recipe lists.
func (r Recipe) IngredientCount() int {
	return len(r.Ingredients)
}

// ScaleServings returns a copy adjusted to feed n people.
func (r Recipe) ScaleServings(n int) Recipe {
	if n <= 0 {
		return r
	}
	factor := float64(n) / float64(r.Servings)
	scaled := r
	scaled.Servings = n
	scaled.Ingredients = make([]string, len(r.Ingredients))
	for i, ing := range r.Ingredients {
		scaled.Ingredients[i] = fmt.Sprintf("%s (x%.1f)", ing, factor)
	}
	return scaled
}`,

      `// Payment is a single charge against an order.
type Payment struct {
	ID          string
	OrderID     string
	AmountCents int64
	Method      string
}

// Refundable reports whether the payment can still be reversed.
func (p Payment) Refundable() bool {
	return p.AmountCents > 0
}`,

      `// Event is a timestamped fact emitted by an application.
type Event struct {
	Type      string
	Payload   map[string]any
	CreatedAt time.Time
}

// Key returns a stable deduplication key for the event.
func (e Event) Key() string {
	return e.Type + "@" + e.CreatedAt.Format(time.RFC3339Nano)
}`,

      `// Message is a chat message between two users.
type Message struct {
	ID         string
	FromID     int
	ToID       int
	ReplyToID  string
	Body       string
	SentAt     time.Time
}

// IsReply reports whether the message answers an earlier message.
func (m Message) IsReply() bool {
	return m.ReplyToID != ""
}`,
    ],
  },

  {
    file: 'geometry_math.go',
    topic: 'geometry and matrix helpers',
    imports: ['math'],
    units: [
      `// Point is a 2D coordinate.
type Point struct {
	X float64
	Y float64
}

// Distance returns the Euclidean distance to another point.
func (p Point) Distance(other Point) float64 {
	dx := p.X - other.X
	dy := p.Y - other.Y
	return math.Sqrt(dx*dx + dy*dy)
}

// Midpoint returns the point halfway between p and other.
func (p Point) Midpoint(other Point) Point {
	return Point{X: (p.X + other.X) / 2, Y: (p.Y + other.Y) / 2}
}`,

      `// Rect is an axis-aligned rectangle.
type Rect struct {
	Min Point
	Max Point
}

// Contains reports whether p lies inside the rectangle, inclusive.
func (r Rect) Contains(p Point) bool {
	return p.X >= r.Min.X && p.X <= r.Max.X && p.Y >= r.Min.Y && p.Y <= r.Max.Y
}

// Area is the rectangle's width times height.
func (r Rect) Area() float64 {
	return (r.Max.X - r.Min.X) * (r.Max.Y - r.Min.Y)
}`,

      `// Circle is defined by a center point and a radius.
type Circle struct {
	Center Point
	Radius float64
}

// Area is pi times the radius squared.
func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

// Circumference is the distance around the circle.
func (c Circle) Circumference() float64 {
	return 2 * math.Pi * c.Radius
}`,

      `// Vec2 is a 2D vector.
type Vec2 struct {
	X float64
	Y float64
}

// Add returns the component-wise sum of two vectors.
func (v Vec2) Add(other Vec2) Vec2 {
	return Vec2{X: v.X + other.X, Y: v.Y + other.Y}
}

// Dot returns the scalar product of two vectors.
func (v Vec2) Dot(other Vec2) float64 {
	return v.X*other.X + v.Y*other.Y
}

// Length is the magnitude of the vector.
func (v Vec2) Length() float64 {
	return math.Hypot(v.X, v.Y)
}`,

      `// rotatePoint rotates p around the origin by the given angle in radians.
func rotatePoint(p Point, angle float64) Point {
	cos := math.Cos(angle)
	sin := math.Sin(angle)
	return Point{
		X: p.X*cos - p.Y*sin,
		Y: p.X*sin + p.Y*cos,
	}
}`,

      `// angleBetween returns the unsigned angle in radians between two vectors.
func angleBetween(a, b Vec2) float64 {
	denom := a.Length() * b.Length()
	if denom == 0 {
		return 0
	}
	return math.Acos(a.Dot(b) / denom)
}`,

      `// polygonArea computes the signed area of a polygon using the shoelace
// formula; the absolute value is the usual area.
func polygonArea(points []Point) float64 {
	n := len(points)
	if n < 3 {
		return 0
	}
	sum := 0.0
	for i := 0; i < n; i++ {
		j := (i + 1) % n
		sum += points[i].X*points[j].Y - points[j].X*points[i].Y
	}
	return sum / 2
}`,

      `// distanceToSegment returns the shortest distance from p to the segment
// between a and b.
func distanceToSegment(p, a, b Point) float64 {
	dx, dy := b.X-a.X, b.Y-a.Y
	if dx == 0 && dy == 0 {
		return p.Distance(a)
	}
	t := ((p.X-a.X)*dx + (p.Y-a.Y)*dy) / (dx*dx + dy*dy)
	if t < 0 {
		t = 0
	}
	if t > 1 {
		t = 1
	}
	closest := Point{X: a.X + t*dx, Y: a.Y + t*dy}
	return p.Distance(closest)
}`,

      `// matrixMultiply multiplies two matrices, returning nil when the inner
// dimensions do not agree.
func matrixMultiply(a, b [][]float64) [][]float64 {
	if len(a) == 0 || len(b) == 0 || len(a[0]) != len(b) {
		return nil
	}
	rows, inner, cols := len(a), len(b), len(b[0])
	out := make([][]float64, rows)
	for i := 0; i < rows; i++ {
		out[i] = make([]float64, cols)
		for k := 0; k < inner; k++ {
			for j := 0; j < cols; j++ {
				out[i][j] += a[i][k] * b[k][j]
			}
		}
	}
	return out
}`,

      `// matrixScale multiplies every element of a matrix by factor.
func matrixScale(m [][]float64, factor float64) [][]float64 {
	out := make([][]float64, len(m))
	for i, row := range m {
		out[i] = make([]float64, len(row))
		for j, v := range row {
			out[i][j] = v * factor
		}
	}
	return out
}`,

      `// determinant2x2 computes the determinant of a 2x2 matrix.
func determinant2x2(m [][]float64) float64 {
	return m[0][0]*m[1][1] - m[0][1]*m[1][0]
}`,

      `// clampAngle normalizes an angle in degrees to [0, 360).
func clampAngle(deg float64) float64 {
	deg = math.Mod(deg, 360)
	if deg < 0 {
		deg += 360
	}
	return deg
}`,
    ],
  },
];
