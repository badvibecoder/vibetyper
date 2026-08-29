// Data module for scripts/generate/generate-go.mjs.
// Concurrency utilities and domain models.

export default [
  {
    file: 'concurrency_utils.go',
    topic: 'concurrency utilities',
    imports: ['context', 'sync', 'time'],
    units: [
      `// Counter is a goroutine-safe integer counter.
type Counter struct {
	mu    sync.Mutex
	value int
}

// Increment adds one to the counter.
func (c *Counter) Increment() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value++
}

// Value returns the current count.
func (c *Counter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}`,

      `// workerPool processes jobs with n concurrent workers, returning results
// in completion order.
func workerPool(jobs []int, workers int, process func(int) int) []int {
	jobCh := make(chan int)
	resultCh := make(chan int, len(jobs))
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobCh {
				resultCh <- process(job)
			}
		}()
	}
	go func() {
		defer close(jobCh)
		for _, job := range jobs {
			jobCh <- job
		}
	}()
	go func() {
		wg.Wait()
		close(resultCh)
	}()
	var results []int
	for result := range resultCh {
		results = append(results, result)
	}
	return results
}`,

      `// runParallel executes each function in its own goroutine and returns the
// results in input order.
func runParallel(fns ...func() int) []int {
	results := make([]int, len(fns))
	var wg sync.WaitGroup
	for i, fn := range fns {
		wg.Add(1)
		go func(idx int, f func() int) {
			defer wg.Done()
			results[idx] = f()
		}(i, fn)
	}
	wg.Wait()
	return results
}`,

      `// fanIn merges several channels into a single output channel.
func fanIn(channels ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for _, ch := range channels {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}(ch)
	}
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}`,

      `// waitWithTimeout waits for the group with a deadline, reporting whether
// it finished in time.
func waitWithTimeout(wg *sync.WaitGroup, timeout time.Duration) bool {
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()
	select {
	case <-done:
		return true
	case <-time.After(timeout):
		return false
	}
}`,

      `// rateLimiter yields one token every interval, limiting how often the
// callback may run.
func rateLimiter(interval time.Duration, work func(int), total int) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	count := 0
	for range ticker.C {
		work(count)
		count++
		if count >= total {
			return
		}
	}
}`,

      `// SafeMap is a generic map protected by a read-write mutex.
type SafeMap[K comparable, V any] struct {
	mu sync.RWMutex
	m  map[K]V
}

// NewSafeMap creates an empty safe map.
func NewSafeMap[K comparable, V any]() *SafeMap[K, V] {
	return &SafeMap[K, V]{m: make(map[K]V)}
}

// Get returns the value stored for key.
func (s *SafeMap[K, V]) Get(key K) (V, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.m[key]
	return v, ok
}

// Set stores value under key.
func (s *SafeMap[K, V]) Set(key K, value V) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.m[key] = value
}`,

      `// runOnce wraps fn so it runs exactly once no matter how many goroutines
// call the result.
func runOnce(fn func()) func() {
	var once sync.Once
	return func() {
		once.Do(fn)
	}
}`,

      `// parallelSum adds a slice of integers across several goroutines.
func parallelSum(values []int, workers int) int {
	if len(values) == 0 {
		return 0
	}
	if workers < 1 {
		workers = 1
	}
	chunkSize := (len(values) + workers - 1) / workers
	sums := make(chan int, workers)
	var wg sync.WaitGroup
	for start := 0; start < len(values); start += chunkSize {
		end := start + chunkSize
		if end > len(values) {
			end = len(values)
		}
		wg.Add(1)
		go func(part []int) {
			defer wg.Done()
			total := 0
			for _, v := range part {
				total += v
			}
			sums <- total
		}(values[start:end])
	}
	go func() {
		wg.Wait()
		close(sums)
	}()
	total := 0
	for part := range sums {
		total += part
	}
	return total
}`,

      `// semaphore limits concurrent access to a resource using a buffered
// channel of tokens.
type semaphore struct {
	tokens chan struct{}
}

// newSemaphore creates a semaphore allowing at most n concurrent holders.
func newSemaphore(n int) *semaphore {
	return &semaphore{tokens: make(chan struct{}, n)}
}

// Acquire blocks until a token is available.
func (s *semaphore) Acquire() {
	s.tokens <- struct{}{}
}

// Release returns a token to the pool.
func (s *semaphore) Release() {
	<-s.tokens
}`,

      `// runWithTimeout runs fn and returns an error if it exceeds the timeout.
func runWithTimeout(timeout time.Duration, fn func() error) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	done := make(chan error, 1)
	go func() {
		done <- fn()
	}()
	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}`,

      `// pipeline connects a generator to a transformer through a channel and
// returns the collected output.
func pipeline(source []int, transform func(int) int) []int {
	in := make(chan int)
	out := make(chan int)
	go func() {
		defer close(in)
		for _, v := range source {
			in <- v
		}
	}()
	go func() {
		defer close(out)
		for v := range in {
			out <- transform(v)
		}
	}()
	var results []int
	for v := range out {
		results = append(results, v)
	}
	return results
}`,
    ],
  },

  {
    file: 'domain_models.go',
    topic: 'domain models and their methods',
    imports: ['errors', 'fmt', 'strings', 'time'],
    units: [
      `// User is a registered account in the system.
type User struct {
	ID        int
	Name      string
	Email     string
	CreatedAt time.Time
}

// DisplayName returns the name, falling back to the email prefix.
func (u User) DisplayName() string {
	if strings.TrimSpace(u.Name) != "" {
		return u.Name
	}
	at := strings.Index(u.Email, "@")
	if at > 0 {
		return u.Email[:at]
	}
	return "anonymous"
}`,

      `// Product is an item available for sale.
type Product struct {
	SKU        string
	Name       string
	PriceCents int64
	Stock      int
}

// TotalValue is the retail value of the current stock on hand.
func (p Product) TotalValue() int64 {
	return p.PriceCents * int64(p.Stock)
}

// Restock adds n units to the available stock.
func (p *Product) Restock(n int) {
	p.Stock += n
}`,

      `// OrderItem is one line of an order.
type OrderItem struct {
	SKU   string
	Qty   int
	Price int64
}

// Order is a customer's purchase, tracked through a lifecycle of statuses.
type Order struct {
	ID     string
	Items  []OrderItem
	Status string
}

// AddItem appends a line item to the order.
func (o *Order) AddItem(item OrderItem) {
	o.Items = append(o.Items, item)
}

// Subtotal sums the cost of every line item.
func (o Order) Subtotal() int64 {
	var total int64
	for _, item := range o.Items {
		total += item.Price * int64(item.Qty)
	}
	return total
}`,

      `// BankAccount tracks a balance in cents for one owner.
type BankAccount struct {
	Owner        string
	BalanceCents int64
}

// Deposit credits the account, rejecting negative amounts.
func (a *BankAccount) Deposit(amount int64) error {
	if amount <= 0 {
		return errors.New("deposit must be positive")
	}
	a.BalanceCents += amount
	return nil
}

// Withdraw debits the account, guarding against overdraft.
func (a *BankAccount) Withdraw(amount int64) error {
	if amount <= 0 {
		return errors.New("withdrawal must be positive")
	}
	if amount > a.BalanceCents {
		return errors.New("insufficient funds")
	}
	a.BalanceCents -= amount
	return nil
}`,

      `// Book is a published work in the library catalog.
type Book struct {
	Title  string
	Author string
	Pages  int
	ISBN   string
}

// Citation renders the book in a simple author-title format.
func (b Book) Citation() string {
	return fmt.Sprintf("%s. %s.", b.Author, b.Title)
}`,

      `// Vehicle records the basic facts of a car in a fleet.
type Vehicle struct {
	Make    string
	Model   string
	Year    int
	Mileage int
}

// Age computes how old the vehicle is relative to currentYear.
func (v Vehicle) Age(currentYear int) int {
	if currentYear < v.Year {
		return 0
	}
	return currentYear - v.Year
}

// Drive adds miles to the odometer.
func (v *Vehicle) Drive(miles int) {
	if miles > 0 {
		v.Mileage += miles
	}
}`,

      `// Employee is a member of staff with a salary in dollars per year.
type Employee struct {
	ID         int
	Name       string
	Department string
	Salary     int
}

// AnnualBonus computes a bonus as a percentage of salary.
func (e Employee) AnnualBonus(percent float64) int {
	return int(float64(e.Salary) * percent / 100)
}`,

      `// Student holds the course grades of one learner.
type Student struct {
	Name   string
	Grades []float64
}

// AddGrade appends a grade in the 0..100 range.
func (s *Student) AddGrade(grade float64) {
	if grade >= 0 && grade <= 100 {
		s.Grades = append(s.Grades, grade)
	}
}

// Average returns the mean of the recorded grades.
func (s Student) Average() float64 {
	if len(s.Grades) == 0 {
		return 0
	}
	sum := 0.0
	for _, g := range s.Grades {
		sum += g
	}
	return sum / float64(len(s.Grades))
}`,
    ],
  },
];
