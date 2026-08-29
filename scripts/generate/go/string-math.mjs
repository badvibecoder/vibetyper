// Data module for scripts/generate/generate-go.mjs.
// Hand-written, realistic Go units grouped by output file.

export default [
  {
    file: 'string_utils.go',
    topic: 'string utilities',
    imports: ['fmt', 'regexp', 'sort', 'strconv', 'strings', 'unicode', 'unicode/utf8'],
    units: [
      `// slugify converts arbitrary text into a lowercase, hyphen-separated slug
// suitable for URLs and filenames.
func slugify(text string) string {
	text = strings.ToLower(strings.TrimSpace(text))
	var b strings.Builder
	lastDash := false
	for _, r := range text {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			lastDash = false
		default:
			if !lastDash && b.Len() > 0 {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}`,

      `// camelCase converts space-, underscore- or dash-separated words into
// lowerCamelCase.
func camelCase(text string) string {
	words := strings.FieldsFunc(text, func(r rune) bool {
		return r == ' ' || r == '_' || r == '-'
	})
	var b strings.Builder
	for i, w := range words {
		if i == 0 {
			b.WriteString(strings.ToLower(w))
			continue
		}
		b.WriteString(strings.ToUpper(w[:1]))
		b.WriteString(strings.ToLower(w[1:]))
	}
	return b.String()
}`,

      `// pascalCase converts words into UpperCamelCase, e.g. "user profile"
// becomes "UserProfile".
func pascalCase(text string) string {
	words := strings.Fields(text)
	var b strings.Builder
	for _, w := range words {
		b.WriteString(strings.ToUpper(w[:1]))
		b.WriteString(strings.ToLower(w[1:]))
	}
	return b.String()
}`,

      `// snakeCase converts any mixed-separator text into snake_case, inserting
// underscores between words and before capitals.
func snakeCase(text string) string {
	var b strings.Builder
	prevUpper := false
	for _, r := range text {
		upper := unicode.IsUpper(r)
		if r == ' ' || r == '-' || r == '_' {
			if b.Len() > 0 && !strings.HasSuffix(b.String(), "_") {
				b.WriteByte('_')
			}
			prevUpper = false
			continue
		}
		if upper && b.Len() > 0 && !prevUpper {
			b.WriteByte('_')
		}
		b.WriteRune(unicode.ToLower(r))
		prevUpper = upper
	}
	return b.String()
}`,

      `// truncateWords cuts text at a word boundary so the result is at most max
// bytes long, appending an ellipsis when anything was removed.
func truncateWords(text string, max int) string {
	if len(text) <= max {
		return text
	}
	cut := text[:max]
	if i := strings.LastIndex(cut, " "); i > 0 {
		cut = cut[:i]
	}
	return strings.TrimSpace(cut) + "..."
}`,

      `// padLeft pads a string on the left with the given fill character until it
// reaches the requested width in runes.
func padLeft(text string, width int, fill rune) string {
	missing := width - utf8.RuneCountInString(text)
	if missing <= 0 {
		return text
	}
	return strings.Repeat(string(fill), missing) + text
}`,

      `// padRight appends a fill character until the string reaches the requested
// width in runes.
func padRight(text string, width int, fill rune) string {
	missing := width - utf8.RuneCountInString(text)
	if missing <= 0 {
		return text
	}
	return text + strings.Repeat(string(fill), missing)
}`,

      `// levenshtein computes the edit distance between two strings using the
// classic dynamic-programming row optimization.
func levenshtein(a, b string) int {
	ar, br := []rune(a), []rune(b)
	prev := make([]int, len(br)+1)
	curr := make([]int, len(br)+1)
	for j := range prev {
		prev[j] = j
	}
	for i, ca := range ar {
		curr[0] = i + 1
		for j, cb := range br {
			cost := 0
			if ca != cb {
				cost = 1
			}
			curr[j+1] = min3(prev[j+1]+1, curr[j]+1, prev[j]+cost)
		}
		prev, curr = curr, prev
	}
	return prev[len(br)]
}

// min3 returns the smallest of three integers.
func min3(a, b, c int) int {
	if b < a {
		a = b
	}
	if c < a {
		a = c
	}
	return a
}`,

      `// isAnagram reports whether two strings contain exactly the same runes.
func isAnagram(a, b string) bool {
	if len(a) != len(b) {
		return false
	}
	counts := make(map[rune]int)
	for _, r := range a {
		counts[r]++
	}
	for _, r := range b {
		counts[r]--
		if counts[r] < 0 {
			return false
		}
	}
	return true
}`,

      `// reverseRunes returns a new string with the runes in reverse order,
// preserving multi-byte characters.
func reverseRunes(text string) string {
	runes := []rune(text)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}`,

      `// countWords returns the number of whitespace-separated words in text.
func countWords(text string) int {
	return len(strings.Fields(text))
}`,

      `// initials extracts the first letter of every word, useful for building
// avatar labels from a full name.
func initials(fullName string) string {
	words := strings.Fields(fullName)
	if len(words) == 0 {
		return "?"
	}
	var b strings.Builder
	for _, w := range words {
		r, _ := utf8.DecodeRuneInString(w)
		b.WriteRune(unicode.ToUpper(r))
	}
	return b.String()
}`,

      `var htmlTagRe = regexp.MustCompile("<[^>]*>")

// stripHTMLTags removes every HTML tag from a document, leaving the text.
func stripHTMLTags(html string) string {
	return htmlTagRe.ReplaceAllString(html, "")
}`,

      `// sanitizeFilename replaces characters that are unsafe in filenames with
// underscores and collapses whitespace runs.
func sanitizeFilename(name string) string {
	name = strings.Map(func(r rune) rune {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9',
			r == '-', r == '_', r == '.', r == ' ':
			return r
		}
		return '_'
	}, name)
	return strings.Join(strings.Fields(name), " ")
}`,

      `// replaceLast replaces the final occurrence of old in text, if present.
func replaceLast(text, old, replacement string) string {
	i := strings.LastIndex(text, old)
	if i == -1 {
		return text
	}
	return text[:i] + replacement + text[i+len(old):]
}`,

      `// splitCamelCase inserts a space before each capital letter, so
// "maxConnections" becomes "max Connections".
func splitCamelCase(text string) string {
	var b strings.Builder
	for i, r := range text {
		if unicode.IsUpper(r) && i > 0 {
			b.WriteByte(' ')
		}
		b.WriteRune(r)
	}
	return b.String()
}`,

      `// extractNumbers pulls every integer literal out of a string, in order.
func extractNumbers(text string) []int {
	var nums []int
	var current strings.Builder
	flush := func() {
		if current.Len() > 0 {
			if n, err := strconv.Atoi(current.String()); err == nil {
				nums = append(nums, n)
			}
			current.Reset()
		}
	}
	for _, r := range text {
		if r >= '0' && r <= '9' {
			current.WriteRune(r)
		} else {
			flush()
		}
	}
	flush()
	return nums
}`,

      `// commonPrefix returns the longest prefix shared by every string in a slice.
func commonPrefix(words []string) string {
	if len(words) == 0 {
		return ""
	}
	prefix := words[0]
	for _, w := range words[1:] {
		for !strings.HasPrefix(w, prefix) {
			prefix = prefix[:len(prefix)-1]
			if prefix == "" {
				return ""
			}
		}
	}
	return prefix
}`,

      `// titleCase capitalizes the first letter of every word while lowercasing the
// rest, e.g. "the QUICK fox" becomes "The Quick Fox".
func titleCase(text string) string {
	words := strings.Fields(text)
	for i, w := range words {
		r, size := utf8.DecodeRuneInString(w)
		words[i] = string(unicode.ToUpper(r)) + strings.ToLower(w[size:])
	}
	return strings.Join(words, " ")
}`,

      `// indentLines prepends the given prefix to every line of a block of text.
func indentLines(text, prefix string) string {
	return prefix + strings.ReplaceAll(text, "\\n", "\\n"+prefix)
}`,

      `// wrapText breaks text into lines of at most width characters, preserving
// whole words where possible.
func wrapText(text string, width int) []string {
	words := strings.Fields(text)
	if len(words) == 0 {
		return nil
	}
	var lines []string
	line := words[0]
	for _, w := range words[1:] {
		if len(line)+1+len(w) > width {
			lines = append(lines, line)
			line = w
		} else {
			line += " " + w
		}
	}
	return append(lines, line)
}`,

      `// joinNonEmpty joins items with a separator, skipping blank entries.
func joinNonEmpty(items []string, sep string) string {
	var kept []string
	for _, item := range items {
		if strings.TrimSpace(item) != "" {
			kept = append(kept, item)
		}
	}
	return strings.Join(kept, sep)
}`,

      `// humanizeKey turns a snake_case or dash-separated key into readable title
// text, e.g. "billing_address" becomes "Billing Address".
func humanizeKey(key string) string {
	key = strings.ReplaceAll(key, "_", " ")
	key = strings.ReplaceAll(key, "-", " ")
	var b strings.Builder
	prevSpace := true
	for _, r := range key {
		if r == ' ' {
			b.WriteByte(' ')
			prevSpace = true
			continue
		}
		if prevSpace {
			b.WriteRune(unicode.ToUpper(r))
			prevSpace = false
		} else {
			b.WriteRune(unicode.ToLower(r))
		}
	}
	return strings.TrimSpace(b.String())
}`,

      `// uniqueLines returns the lines of text in first-seen order, dropping
// duplicates.
func uniqueLines(text string) []string {
	seen := make(map[string]bool)
	var out []string
	for _, line := range strings.Split(text, "\\n") {
		line = strings.TrimRight(line, "\\r")
		if !seen[line] {
			seen[line] = true
			out = append(out, line)
		}
	}
	return out
}`,

      `// caesarShift rotates every ASCII letter by shift positions, wrapping around
// the alphabet and leaving all other characters untouched.
func caesarShift(text string, shift int) string {
	shift = ((shift % 26) + 26) % 26
	var b strings.Builder
	for _, r := range text {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteRune('a' + (r-'a'+rune(shift))%26)
		case r >= 'A' && r <= 'Z':
			b.WriteRune('A' + (r-'A'+rune(shift))%26)
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}`,

      `// maskMiddle hides the middle of a string, keeping only the first and last
// few characters, e.g. for account numbers and API tokens.
func maskMiddle(text string, keepStart, keepEnd int) string {
	runes := []rune(text)
	if len(runes) <= keepStart+keepEnd {
		return strings.Repeat("*", len(runes))
	}
	var b strings.Builder
	b.WriteString(string(runes[:keepStart]))
	b.WriteString(strings.Repeat("*", len(runes)-keepStart-keepEnd))
	b.WriteString(string(runes[len(runes)-keepEnd:]))
	return b.String()
}`,

      `// normalizeWhitespace collapses runs of whitespace into single spaces and
// trims the ends, handy when parsing pasted input.
func normalizeWhitespace(text string) string {
	return strings.Join(strings.Fields(text), " ")
}`,

      `var emailRe = regexp.MustCompile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")

// extractEmails finds every email address embedded in a blob of text.
func extractEmails(text string) []string {
	return emailRe.FindAllString(text, -1)
}`,

      `// formatPhone renders a 10-digit US phone number as (555) 123-4567.
func formatPhone(digits string) string {
	digits = strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' {
			return r
		}
		return -1
	}, digits)
	if len(digits) != 10 {
		return digits
	}
	return fmt.Sprintf("(%s) %s-%s", digits[:3], digits[3:6], digits[6:])
}`,

      `// sortedLines returns the non-empty lines of text sorted lexicographically.
func sortedLines(text string) []string {
	var lines []string
	for _, line := range strings.Split(text, "\\n") {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
			lines = append(lines, trimmed)
		}
	}
	sort.Strings(lines)
	return lines
}`,
    ],
  },

  {
    file: 'math_numeric.go',
    topic: 'math and numeric helpers',
    imports: ['math', 'math/rand', 'sort', 'strconv', 'strings'],
    units: [
      `// gcd returns the greatest common divisor of two integers using Euclid's
// algorithm.
func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	if a < 0 {
		return -a
	}
	return a
}`,

      `// lcm returns the least common multiple of two positive integers.
func lcm(a, b int) int {
	if a == 0 || b == 0 {
		return 0
	}
	return a / gcd(a, b) * b
}`,

      `// isPrime reports whether n is prime using trial division up to the square
// root of n.
func isPrime(n int) bool {
	if n < 2 {
		return false
	}
	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	return true
}`,

      `// primesUpTo returns every prime less than or equal to limit using the
// sieve of Eratosthenes.
func primesUpTo(limit int) []int {
	composite := make([]bool, limit+1)
	var primes []int
	for i := 2; i <= limit; i++ {
		if composite[i] {
			continue
		}
		primes = append(primes, i)
		for j := i * i; j <= limit; j += i {
			composite[j] = true
		}
	}
	return primes
}`,

      `// nthFibonacci returns the n-th Fibonacci number, 0-indexed.
func nthFibonacci(n int) int {
	if n < 2 {
		return n
	}
	a, b := 0, 1
	for i := 2; i <= n; i++ {
		a, b = b, a+b
	}
	return b
}`,

      `// factorial computes n! iteratively and returns 1 for n <= 1.
func factorial(n int) int {
	result := 1
	for i := 2; i <= n; i++ {
		result *= i
	}
	return result
}`,

      `// binomial computes C(n, k) with a multiplicative formula that avoids huge
// intermediate factorials.
func binomial(n, k int) int {
	if k < 0 || k > n {
		return 0
	}
	if k > n-k {
		k = n - k
	}
	result := 1
	for i := 1; i <= k; i++ {
		result = result * (n - k + i) / i
	}
	return result
}`,

      `// mean returns the arithmetic average of a slice of floats.
func mean(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}`,

      `// median returns the middle value of a sorted copy of values, or the average
// of the two middle values when the length is even.
func median(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sorted := append([]float64(nil), values...)
	sort.Float64s(sorted)
	mid := len(sorted) / 2
	if len(sorted)%2 == 1 {
		return sorted[mid]
	}
	return (sorted[mid-1] + sorted[mid]) / 2
}`,

      `// mode returns the most frequent value in a slice, using the first
// occurrence to break ties.
func mode(values []int) int {
	counts := make(map[int]int)
	best, bestCount := 0, 0
	for _, v := range values {
		counts[v]++
		if counts[v] > bestCount {
			best, bestCount = v, counts[v]
		}
	}
	return best
}`,

      `// variance computes the population variance of a sample of floats.
func variance(values []float64) float64 {
	if len(values) < 2 {
		return 0
	}
	m := mean(values)
	sum := 0.0
	for _, v := range values {
		diff := v - m
		sum += diff * diff
	}
	return sum / float64(len(values))
}`,

      `// stddev returns the population standard deviation of values.
func stddev(values []float64) float64 {
	return math.Sqrt(variance(values))
}`,

      `// clamp restricts value to the inclusive range [lo, hi].
func clamp(value, lo, hi int) int {
	if value < lo {
		return lo
	}
	if value > hi {
		return hi
	}
	return value
}`,

      `// lerp linearly interpolates between a and b by the factor t in [0, 1].
func lerp(a, b, t float64) float64 {
	return a + (b-a)*t
}`,

      `// roundTo rounds value to the nearest multiple of 10^-places.
func roundTo(value float64, places int) float64 {
	factor := math.Pow10(places)
	return math.Round(value*factor) / factor
}`,

      `// isPerfectSquare reports whether n is the square of an integer.
func isPerfectSquare(n int) bool {
	if n < 0 {
		return false
	}
	root := int(math.Sqrt(float64(n)))
	return root*root == n
}`,

      `// sumDigits adds up the decimal digits of a non-negative integer.
func sumDigits(n int) int {
	sum := 0
	for n > 0 {
		sum += n % 10
		n /= 10
	}
	return sum
}`,

      `// reverseNumber reverses the decimal digits of an integer, preserving sign.
func reverseNumber(n int) int {
	reversed := 0
	for n != 0 {
		reversed = reversed*10 + n%10
		n /= 10
	}
	return reversed
}`,

      `// isPalindromeNumber reports whether n reads the same forward and backward.
func isPalindromeNumber(n int) bool {
	if n < 0 {
		return false
	}
	return n == reverseNumber(n)
}`,

      `// primeFactors decomposes n into its prime factors in ascending order.
func primeFactors(n int) []int {
	var factors []int
	for d := 2; d*d <= n; d++ {
		for n%d == 0 {
			factors = append(factors, d)
			n /= d
		}
	}
	if n > 1 {
		factors = append(factors, n)
	}
	return factors
}`,

      `// nextPowerOfTwo returns the smallest power of two >= n, useful when sizing
// buffers and hash tables.
func nextPowerOfTwo(n int) int {
	p := 1
	for p < n {
		p <<= 1
	}
	return p
}`,

      `// collatzSteps counts how many steps n takes to reach 1 under the Collatz
// rule.
func collatzSteps(n int) int {
	steps := 0
	for n != 1 {
		if n%2 == 0 {
			n /= 2
		} else {
			n = 3*n + 1
		}
		steps++
	}
	return steps
}`,

      `// intToRoman converts an integer in [1, 3999] to Roman numerals.
func intToRoman(n int) string {
	values := []int{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
	symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}
	var b strings.Builder
	for i, v := range values {
		for n >= v {
			b.WriteString(symbols[i])
			n -= v
		}
	}
	return b.String()
}`,

      `// romanToInt parses a Roman numeral string into an integer.
func romanToInt(roman string) int {
	values := map[rune]int{'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
	total := 0
	prev := 0
	for _, r := range roman {
		v := values[r]
		if v > prev {
			total += v - 2*prev
		} else {
			total += v
		}
		prev = v
	}
	return total
}`,

      `// toBase renders n as a string in the given base (2..36).
func toBase(n, base int) string {
	return strconv.FormatInt(int64(n), base)
}`,

      `// fromBase parses a string written in the given base (2..36).
func fromBase(s string, base int) (int, error) {
	v, err := strconv.ParseInt(s, base, 64)
	return int(v), err
}`,

      `// randIntRange returns a random integer in [lo, hi] inclusive.
func randIntRange(lo, hi int) int {
	if hi <= lo {
		return lo
	}
	return lo + rand.Intn(hi-lo+1)
}`,

      `// percentageOf computes what fraction of total value represents, as a
// percent rounded to one decimal place.
func percentageOf(value, total float64) float64 {
	if total == 0 {
		return 0
	}
	return roundTo(value/total*100, 1)
}`,

      `// digitCount returns the number of decimal digits in a non-negative integer.
func digitCount(n int) int {
	if n == 0 {
		return 1
	}
	count := 0
	for n > 0 {
		count++
		n /= 10
	}
	return count
}`,

      `// isPerfectNumber reports whether n equals the sum of its proper divisors.
func isPerfectNumber(n int) bool {
	if n < 2 {
		return false
	}
	sum := 1
	for d := 2; d*d <= n; d++ {
		if n%d == 0 {
			sum += d
			if d != n/d {
				sum += n / d
			}
		}
	}
	return sum == n
}`,
    ],
  },
];
