// Data module for scripts/generate/generate-go.mjs.
// Collections containers/helpers and input validation.

export default [
  {
    file: 'collections_utils.go',
    topic: 'collections, containers and slice helpers',
    imports: ['container/list', 'fmt', 'math/rand', 'sort'],
    units: [
      `// Stack is a LIFO container of integers backed by a slice.
type Stack struct {
	items []int
}

// Push adds a value to the top of the stack.
func (s *Stack) Push(v int) {
	s.items = append(s.items, v)
}

// Pop removes and returns the top value, reporting whether one existed.
func (s *Stack) Pop() (int, bool) {
	if len(s.items) == 0 {
		return 0, false
	}
	top := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return top, true
}

// Peek returns the top value without removing it.
func (s *Stack) Peek() (int, bool) {
	if len(s.items) == 0 {
		return 0, false
	}
	return s.items[len(s.items)-1], true
}

// String renders the stack contents for debugging.
func (s *Stack) String() string {
	return fmt.Sprintf("%v", s.items)
}`,

      `// StringQueue is a FIFO queue of strings backed by a slice.
type StringQueue struct {
	items []string
}

// Enqueue appends a value to the back of the queue.
func (q *StringQueue) Enqueue(v string) {
	q.items = append(q.items, v)
}

// Dequeue removes and returns the front value, reporting whether one existed.
func (q *StringQueue) Dequeue() (string, bool) {
	if len(q.items) == 0 {
		return "", false
	}
	front := q.items[0]
	q.items = q.items[1:]
	return front, true
}

// Len reports how many values are waiting in the queue.
func (q *StringQueue) Len() int {
	return len(q.items)
}`,

      `// StringSet is a set of unique strings backed by a map.
type StringSet struct {
	m map[string]struct{}
}

// NewStringSet builds a set seeded with the given items.
func NewStringSet(items ...string) *StringSet {
	s := &StringSet{m: make(map[string]struct{})}
	for _, item := range items {
		s.Add(item)
	}
	return s
}

// Add inserts an item into the set.
func (s *StringSet) Add(item string) {
	s.m[item] = struct{}{}
}

// Has reports whether the set contains item.
func (s *StringSet) Has(item string) bool {
	_, ok := s.m[item]
	return ok
}

// Items returns the set contents in sorted order.
func (s *StringSet) Items() []string {
	out := make([]string, 0, len(s.m))
	for item := range s.m {
		out = append(out, item)
	}
	sort.Strings(out)
	return out
}`,

      `// RingBuffer is a fixed-capacity circular buffer of integers.
type RingBuffer struct {
	data []int
	head int
	size int
}

// NewRingBuffer creates a ring buffer holding at most capacity values.
func NewRingBuffer(capacity int) *RingBuffer {
	return &RingBuffer{data: make([]int, capacity)}
}

// Write adds a value, overwriting the oldest value when full.
func (r *RingBuffer) Write(v int) {
	if len(r.data) == 0 {
		return
	}
	r.data[(r.head+r.size)%len(r.data)] = v
	if r.size < len(r.data) {
		r.size++
	} else {
		r.head = (r.head + 1) % len(r.data)
	}
}

// Read removes and returns the oldest value, reporting whether one existed.
func (r *RingBuffer) Read() (int, bool) {
	if r.size == 0 {
		return 0, false
	}
	v := r.data[r.head]
	r.head = (r.head + 1) % len(r.data)
	r.size--
	return v, true
}`,

      `// lruEntry pairs a cache key with its value inside the LRU list.
type lruEntry struct {
	key   string
	value string
}

// LRUCache is a fixed-capacity map with an eviction policy that drops the
// least recently used entry when the cache fills up.
type LRUCache struct {
	capacity int
	items    map[string]*list.Element
	order    *list.List
}

// NewLRUCache creates an LRU cache that holds at most capacity entries.
func NewLRUCache(capacity int) *LRUCache {
	return &LRUCache{
		capacity: capacity,
		items:    make(map[string]*list.Element),
		order:    list.New(),
	}
}

// Get returns the value for key, marking it as recently used.
func (c *LRUCache) Get(key string) (string, bool) {
	el, ok := c.items[key]
	if !ok {
		return "", false
	}
	c.order.MoveToFront(el)
	return el.Value.(*lruEntry).value, true
}

// Put inserts or updates key and evicts the least recently used entry when
// the cache is at capacity.
func (c *LRUCache) Put(key, value string) {
	if el, ok := c.items[key]; ok {
		el.Value.(*lruEntry).value = value
		c.order.MoveToFront(el)
		return
	}
	el := c.order.PushFront(&lruEntry{key: key, value: value})
	c.items[key] = el
	if c.order.Len() > c.capacity {
		oldest := c.order.Back()
		c.order.Remove(oldest)
		delete(c.items, oldest.Value.(*lruEntry).key)
	}
}`,

      `// frequencyMap counts how often each string appears in a slice.
func frequencyMap(items []string) map[string]int {
	counts := make(map[string]int)
	for _, item := range items {
		counts[item]++
	}
	return counts
}`,

      `// groupBy buckets items by the key returned by keyFor.
func groupBy(items []string, keyFor func(string) string) map[string][]string {
	groups := make(map[string][]string)
	for _, item := range items {
		key := keyFor(item)
		groups[key] = append(groups[key], item)
	}
	return groups
}`,

      `// chunk splits a slice into consecutive runs of at most size elements.
func chunk(items []int, size int) [][]int {
	if size <= 0 {
		return nil
	}
	var out [][]int
	for start := 0; start < len(items); start += size {
		end := start + size
		if end > len(items) {
			end = len(items)
		}
		out = append(out, items[start:end])
	}
	return out
}`,

      `// uniqueStrings removes duplicates while preserving first-seen order.
func uniqueStrings(items []string) []string {
	seen := make(map[string]bool)
	var out []string
	for _, item := range items {
		if !seen[item] {
			seen[item] = true
			out = append(out, item)
		}
	}
	return out
}`,

      `// flattenInts concatenates a slice of slices into one flat slice.
func flattenInts(rows [][]int) []int {
	var out []int
	for _, row := range rows {
		out = append(out, row...)
	}
	return out
}`,

      `// zipStrings pairs elements of a and b by index, stopping at the shorter
// slice.
func zipStrings(a, b []string) [][2]string {
	n := len(a)
	if len(b) < n {
		n = len(b)
	}
	pairs := make([][2]string, 0, n)
	for i := 0; i < n; i++ {
		pairs = append(pairs, [2]string{a[i], b[i]})
	}
	return pairs
}`,

      `// differenceStrings returns the elements of a that are not in b.
func differenceStrings(a, b []string) []string {
	inB := make(map[string]bool)
	for _, item := range b {
		inB[item] = true
	}
	var out []string
	for _, item := range a {
		if !inB[item] {
			out = append(out, item)
		}
	}
	return out
}`,

      `// intersectionStrings returns elements present in both slices, in the
// first-seen order of a.
func intersectionStrings(a, b []string) []string {
	inB := make(map[string]bool)
	for _, item := range b {
		inB[item] = true
	}
	seen := make(map[string]bool)
	var out []string
	for _, item := range a {
		if inB[item] && !seen[item] {
			seen[item] = true
			out = append(out, item)
		}
	}
	return out
}`,

      `// partitionInts splits values into those passing and failing pred.
func partitionInts(values []int, pred func(int) bool) (passing, failing []int) {
	for _, v := range values {
		if pred(v) {
			passing = append(passing, v)
		} else {
			failing = append(failing, v)
		}
	}
	return passing, failing
}`,

      `// rotateLeft shifts the elements of a slice left by k positions, wrapping
// around, and returns a new slice.
func rotateLeft(items []int, k int) []int {
	if len(items) == 0 {
		return items
	}
	k %= len(items)
	out := make([]int, 0, len(items))
	out = append(out, items[k:]...)
	out = append(out, items[:k]...)
	return out
}`,

      `// minValue returns the smallest value in a slice, or 0 when empty.
func minValue(values []int) int {
	if len(values) == 0 {
		return 0
	}
	best := values[0]
	for _, v := range values[1:] {
		if v < best {
			best = v
		}
	}
	return best
}`,

      `// maxValue returns the largest value in a slice, or 0 when empty.
func maxValue(values []int) int {
	if len(values) == 0 {
		return 0
	}
	best := values[0]
	for _, v := range values[1:] {
		if v > best {
			best = v
		}
	}
	return best
}`,

      `// indexOfString returns the first index of target in items, or -1.
func indexOfString(items []string, target string) int {
	for i, item := range items {
		if item == target {
			return i
		}
	}
	return -1
}`,

      `// shuffle returns a randomly permuted copy of items.
func shuffle(items []int) []int {
	out := append([]int(nil), items...)
	for i := len(out) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		out[i], out[j] = out[j], out[i]
	}
	return out
}`,
    ],
  },

  {
    file: 'validation_utils.go',
    topic: 'input validation helpers',
    imports: ['encoding/base64', 'net', 'net/url', 'regexp', 'unicode'],
    units: [
      `var emailCheckRe = regexp.MustCompile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$")

// isValidEmail reports whether s looks like a plausible email address.
func isValidEmail(s string) bool {
	if len(s) > 254 {
		return false
	}
	return emailCheckRe.MatchString(s)
}`,

      `// isValidURL reports whether s parses as an absolute http(s) URL.
func isValidURL(s string) bool {
	u, err := url.Parse(s)
	if err != nil {
		return false
	}
	return u.IsAbs() && (u.Scheme == "http" || u.Scheme == "https")
}`,

      `// isValidIP reports whether s is a valid IPv4 or IPv6 address.
func isValidIP(s string) bool {
	return net.ParseIP(s) != nil
}`,

      `// isPrivateIP reports whether s is a private, loopback or link-local
// address.
func isPrivateIP(s string) bool {
	ip := net.ParseIP(s)
	if ip == nil {
		return false
	}
	return ip.IsPrivate() || ip.IsLoopback() || ip.IsLinkLocalUnicast()
}`,

      `// isValidPort reports whether port is a valid TCP/UDP port number.
func isValidPort(port int) bool {
	return port >= 1 && port <= 65535
}`,

      `var hostnameRe = regexp.MustCompile("^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\\\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")

// isValidHostname reports whether s is a well-formed DNS hostname.
func isValidHostname(s string) bool {
	return len(s) <= 253 && hostnameRe.MatchString(s)
}`,

      `// luhnValid checks a card number (or any numeric string) against the Luhn
// checksum used by most payment cards.
func luhnValid(number string) bool {
	sum := 0
	double := false
	for i := len(number) - 1; i >= 0; i-- {
		d := int(number[i] - '0')
		if d < 0 || d > 9 {
			return false
		}
		if double {
			d *= 2
			if d > 9 {
				d -= 9
			}
		}
		sum += d
		double = !double
	}
	return sum%10 == 0
}`,

      `var hexColorRe = regexp.MustCompile("^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

// isValidHexColor reports whether s is a #RGB or #RRGGBB color.
func isValidHexColor(s string) bool {
	return hexColorRe.MatchString(s)
}`,

      `var uuidRe = regexp.MustCompile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")

// isValidUUID reports whether s is a canonical hyphenated UUID.
func isValidUUID(s string) bool {
	return uuidRe.MatchString(s)
}`,

      `var semverRe = regexp.MustCompile("^v?\\\\d+\\\\.\\\\d+\\\\.\\\\d+(-[0-9A-Za-z.-]+)?(\\\\+[0-9A-Za-z.-]+)?$")

// isValidSemver reports whether s looks like a semantic version string.
func isValidSemver(s string) bool {
	return semverRe.MatchString(s)
}`,

      `var slugRe = regexp.MustCompile("^[a-z0-9]+(?:-[a-z0-9]+)*$")

// isValidSlug reports whether s is a lowercase hyphen-separated slug.
func isValidSlug(s string) bool {
	return slugRe.MatchString(s)
}`,

      `// isValidISBN13 validates a 13-digit ISBN using its checksum digit.
func isValidISBN13(isbn string) bool {
	digits := make([]int, 0, 13)
	for _, r := range isbn {
		if r == '-' {
			continue
		}
		if r < '0' || r > '9' {
			return false
		}
		digits = append(digits, int(r-'0'))
	}
	if len(digits) != 13 {
		return false
	}
	sum := 0
	for i, d := range digits {
		if i%2 == 0 {
			sum += d
		} else {
			sum += d * 3
		}
	}
	return sum%10 == 0
}`,

      `// isValidISBN10 validates a 10-digit ISBN, accepting an X check digit.
func isValidISBN10(isbn string) bool {
	digits := make([]int, 0, 10)
	for _, r := range isbn {
		if r == '-' {
			continue
		}
		if r == 'X' || r == 'x' {
			if len(digits) != 9 {
				return false
			}
			digits = append(digits, 10)
			continue
		}
		if r < '0' || r > '9' {
			return false
		}
		digits = append(digits, int(r-'0'))
	}
	if len(digits) != 10 {
		return false
	}
	sum := 0
	for i, d := range digits {
		sum += d * (10 - i)
	}
	return sum%11 == 0
}`,

      `// isStrongPassword requires at least 8 characters and three of the four
// character classes.
func isStrongPassword(s string) bool {
	if len(s) < 8 {
		return false
	}
	classes := 0
	for _, check := range []func(string) bool{hasLowercase, hasUppercase, hasDigit, hasSymbol} {
		if check(s) {
			classes++
		}
	}
	return classes >= 3
}`,

      `// hasLowercase reports whether s contains at least one lowercase letter.
func hasLowercase(s string) bool {
	for _, r := range s {
		if unicode.IsLower(r) {
			return true
		}
	}
	return false
}`,

      `// hasUppercase reports whether s contains at least one uppercase letter.
func hasUppercase(s string) bool {
	for _, r := range s {
		if unicode.IsUpper(r) {
			return true
		}
	}
	return false
}`,

      `// hasDigit reports whether s contains at least one decimal digit.
func hasDigit(s string) bool {
	for _, r := range s {
		if unicode.IsDigit(r) {
			return true
		}
	}
	return false
}`,

      `// hasSymbol reports whether s contains at least one non-alphanumeric symbol.
func hasSymbol(s string) bool {
	for _, r := range s {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && !unicode.IsSpace(r) {
			return true
		}
	}
	return false
}`,

      `// isBalancedBrackets verifies that (), [] and {} pairs are correctly
// nested.
func isBalancedBrackets(text string) bool {
	var stack []rune
	pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
	for _, r := range text {
		switch r {
		case '(', '[', '{':
			stack = append(stack, r)
		case ')', ']', '}':
			if len(stack) == 0 || stack[len(stack)-1] != pairs[r] {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 0
}`,

      `// isValidBase64 reports whether s decodes as standard base64.
func isValidBase64(s string) bool {
	_, err := base64.StdEncoding.DecodeString(s)
	return err == nil
}`,

      `var phoneRe = regexp.MustCompile("^\\\\+?[0-9][0-9\\\\s().-]{6,19}$")

// isValidPhoneNumber accepts common international phone formats.
func isValidPhoneNumber(s string) bool {
	return phoneRe.MatchString(s)
}`,

      `// isAllDigits reports whether every rune in s is a decimal digit.
func isAllDigits(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}`,
    ],
  },
];
