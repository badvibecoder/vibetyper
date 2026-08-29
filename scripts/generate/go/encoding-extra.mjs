// Data module for scripts/generate/generate-go.mjs.
// Encoding/decoding helpers and miscellaneous utilities.

export default [
  {
    file: 'encoding_utils.go',
    topic: 'encoding and decoding helpers',
    imports: ['bytes', 'encoding/base64', 'encoding/hex', 'encoding/json', 'errors', 'fmt', 'strconv', 'strings', 'unicode/utf8'],
    units: [
      `// base64Encode encodes bytes as a standard base64 string.
func base64Encode(data []byte) string {
	return base64.StdEncoding.EncodeToString(data)
}`,

      `// base64Decode decodes a standard base64 string back into bytes.
func base64Decode(encoded string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(encoded)
}`,

      `// hexEncode renders bytes as lowercase hexadecimal text.
func hexEncode(data []byte) string {
	return hex.EncodeToString(data)
}`,

      `// hexDecode parses a hexadecimal string into bytes.
func hexDecode(text string) ([]byte, error) {
	return hex.DecodeString(text)
}`,

      `// rot13Text applies ROT13, the classic letter-substitution cipher, to a
// string.
func rot13Text(text string) string {
	var b strings.Builder
	for _, r := range text {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteRune('a' + (r-'a'+13)%26)
		case r >= 'A' && r <= 'Z':
			b.WriteRune('A' + (r-'A'+13)%26)
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}`,

      `// urlSafeBase64 encodes bytes with the URL-safe alphabet, omitting
// padding.
func urlSafeBase64(data []byte) string {
	return base64.RawURLEncoding.EncodeToString(data)
}`,

      `// jsonValid reports whether text is well-formed JSON.
func jsonValid(text string) bool {
	return json.Valid([]byte(text))
}`,

      `// jsonCompact strips insignificant whitespace from a JSON document.
func jsonCompact(text string) (string, error) {
	var buf bytes.Buffer
	if err := json.Compact(&buf, []byte(text)); err != nil {
		return "", fmt.Errorf("compact json: %w", err)
	}
	return buf.String(), nil
}`,

      `// runeCount returns the number of runes in a string.
func runeCount(text string) int {
	return utf8.RuneCountInString(text)
}`,

      `// xorBytes applies a repeating key to data, returning the result.
func xorBytes(data, key []byte) []byte {
	out := make([]byte, len(data))
	if len(key) == 0 {
		copy(out, data)
		return out
	}
	for i, b := range data {
		out[i] = b ^ key[i%len(key)]
	}
	return out
}`,

      `// reverseBytes returns a copy of data with the byte order flipped.
func reverseBytes(data []byte) []byte {
	out := make([]byte, len(data))
	for i, b := range data {
		out[len(data)-1-i] = b
	}
	return out
}`,

      `// toBinaryString renders an integer as a binary string without a sign.
func toBinaryString(n int) string {
	if n < 0 {
		n = -n
	}
	return strconv.FormatInt(int64(n), 2)
}`,

      `// parseHex interprets text as a base-16 integer.
func parseHex(text string) (int, error) {
	v, err := strconv.ParseUint(text, 16, 64)
	return int(v), err
}`,

      `// quoteText wraps text in double quotes with escapes, safe to embed in
// Go source or JSON.
func quoteText(text string) string {
	return strconv.Quote(text)
}`,

      `// unquoteText removes quotes and decodes escapes from a quoted string.
func unquoteText(text string) (string, error) {
	return strconv.Unquote(text)
}`,

      `// hammingDistance counts the positions where two equal-length byte
// slices differ.
func hammingDistance(a, b []byte) (int, error) {
	if len(a) != len(b) {
		return 0, errors.New("lengths differ")
	}
	distance := 0
	for i := range a {
		if a[i] != b[i] {
			distance++
		}
	}
	return distance, nil
}`,

      `// runLengthEncode compresses repeated runs of a character, so "aaabbc"
// becomes "a3b2c1".
func runLengthEncode(text string) string {
	if text == "" {
		return ""
	}
	var b strings.Builder
	run := rune(0)
	count := 0
	for _, r := range text {
		if r != run && count > 0 {
			b.WriteRune(run)
			b.WriteString(strconv.Itoa(count))
			count = 0
		}
		run = r
		count++
	}
	b.WriteRune(run)
	b.WriteString(strconv.Itoa(count))
	return b.String()
}`,

      `// runLengthDecode reverses runLengthEncode, expanding "a3b2c1" back to
// "aaabbc".
func runLengthDecode(encoded string) string {
	var b strings.Builder
	i := 0
	for i < len(encoded) {
		r := rune(encoded[i])
		i++
		start := i
		for i < len(encoded) && encoded[i] >= '0' && encoded[i] <= '9' {
			i++
		}
		if start == i {
			b.WriteRune(r)
			continue
		}
		count, _ := strconv.Atoi(encoded[start:i])
		for j := 0; j < count; j++ {
			b.WriteRune(r)
		}
	}
	return b.String()
}`,

      `// soundex computes the four-character Soundex code of a name, encoding
// similar-sounding names identically.
func soundex(name string) string {
	upper := strings.ToUpper(name)
	if upper == "" {
		return ""
	}
	code := string(upper[0])
	last := soundexCode(upper[0])
	for i := 1; i < len(upper) && len(code) < 4; i++ {
		c := soundexCode(upper[i])
		if c != 0 && c != last {
			code += strconv.Itoa(c)
		}
		if c != 0 {
			last = c
		}
	}
	return (code + "000")[:4]
}

// soundexCode maps an uppercase letter to its Soundex digit, or 0 for
// vowels and H/W.
func soundexCode(r byte) int {
	switch r {
	case 'B', 'F', 'P', 'V':
		return 1
	case 'C', 'G', 'J', 'K', 'Q', 'S', 'X', 'Z':
		return 2
	case 'D', 'T':
		return 3
	case 'L':
		return 4
	case 'M', 'N':
		return 5
	case 'R':
		return 6
	default:
		return 0
	}
}`,
    ],
  },

  {
    file: 'extra_utils.go',
    topic: 'miscellaneous utilities',
    imports: ['fmt', 'math', 'math/rand', 'sort', 'strconv', 'strings', 'time'],
    units: [
      `// isLeapYear reports whether the given year has a February 29th.
func isLeapYear(year int) bool {
	return year%4 == 0 && (year%100 != 0 || year%400 == 0)
}`,

      `// daysInMonth returns the number of days in a month (1-12) of a year.
func daysInMonth(year, month int) int {
	switch month {
	case 2:
		if isLeapYear(year) {
			return 29
		}
		return 28
	case 4, 6, 9, 11:
		return 30
	default:
		return 31
	}
}`,

      `// popcount counts the set bits in an unsigned integer.
func popcount(n uint) int {
	count := 0
	for n > 0 {
		n &= n - 1
		count++
	}
	return count
}`,

      `// isPowerOfTwo reports whether n is a positive power of two.
func isPowerOfTwo(n int) bool {
	return n > 0 && n&(n-1) == 0
}`,

      `// signum returns -1, 0 or 1 according to the sign of n.
func signum(n int) int {
	switch {
	case n < 0:
		return -1
	case n > 0:
		return 1
	default:
		return 0
	}
}`,

      `// gcdArray returns the greatest common divisor of every value in a
// slice.
func gcdArray(values []int) int {
	if len(values) == 0 {
		return 0
	}
	result := values[0]
	for _, v := range values[1:] {
		result = gcd(result, v)
	}
	return result
}`,

      `// celsiusToFahrenheit converts a temperature from Celsius to Fahrenheit.
func celsiusToFahrenheit(c float64) float64 {
	return c*9/5 + 32
}`,

      `// fahrenheitToCelsius converts a temperature from Fahrenheit to Celsius.
func fahrenheitToCelsius(f float64) float64 {
	return (f - 32) * 5 / 9
}`,

      `// kilometersToMiles converts a distance from kilometers to miles.
func kilometersToMiles(km float64) float64 {
	return km * 0.621371
}`,

      `// milesToKilometers converts a distance from miles to kilometers.
func milesToKilometers(mi float64) float64 {
	return mi / 0.621371
}`,

      `// paginate returns the slice of items for one page given a size and
// offset.
func paginate(items []string, offset, limit int) []string {
	if offset < 0 {
		offset = 0
	}
	if limit < 0 {
		limit = 0
	}
	if offset >= len(items) {
		return nil
	}
	end := offset + limit
	if limit == 0 || end > len(items) {
		end = len(items)
	}
	return items[offset:end]
}`,

      `// dedupeInts removes duplicate integers, preserving first-seen order.
func dedupeInts(values []int) []int {
	seen := make(map[int]bool)
	var out []int
	for _, v := range values {
		if !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	return out
}`,

      `// sortDescending sorts a slice of integers in descending order in place.
func sortDescending(values []int) {
	sort.Slice(values, func(i, j int) bool {
		return values[i] > values[j]
	})
}`,

      `// containsInt reports whether target appears in values.
func containsInt(values []int, target int) bool {
	for _, v := range values {
		if v == target {
			return true
		}
	}
	return false
}`,

      `// trimFloatZeros formats a float with up to maxDecimals decimals,
// removing trailing zeros, e.g. 3.50 -> "3.5".
func trimFloatZeros(value float64, maxDecimals int) string {
	s := strconv.FormatFloat(value, 'f', maxDecimals, 64)
	s = strings.TrimRight(s, "0")
	return strings.TrimRight(s, ".")
}`,

      `// timeUntil returns how long remains until a future time.
func timeUntil(t time.Time) time.Duration {
	return time.Until(t)
}`,

      `// parseBoolStrict interprets common yes/no spellings as a boolean.
func parseBoolStrict(text string) (bool, bool) {
	switch strings.ToLower(strings.TrimSpace(text)) {
	case "true", "yes", "y", "1", "on":
		return true, true
	case "false", "no", "n", "0", "off":
		return false, true
	default:
		return false, false
	}
}`,

      `// randomChoice picks a random element of items.
func randomChoice(items []string) string {
	if len(items) == 0 {
		return ""
	}
	return items[rand.Intn(len(items))]
}`,

      `// secondsToClock renders a count of seconds as HH:MM:SS.
func secondsToClock(total int) string {
	h := total / 3600
	m := (total % 3600) / 60
	s := total % 60
	return fmt.Sprintf("%02d:%02d:%02d", h, m, s)
}`,

      `// isSortedAsc reports whether values are in non-decreasing order.
func isSortedAsc(values []int) bool {
	for i := 1; i < len(values); i++ {
		if values[i] < values[i-1] {
			return false
		}
	}
	return true
}`,

      `// intPow raises base to the power exp using exponentiation by squaring.
func intPow(base, exp int) int {
	result := 1
	for exp > 0 {
		if exp%2 == 1 {
			result *= base
		}
		base *= base
		exp /= 2
	}
	return result
}`,

      `// clampFloat restricts value to the inclusive range [lo, hi].
func clampFloat(value, lo, hi float64) float64 {
	if value < lo {
		return lo
	}
	if value > hi {
		return hi
	}
	return value
}`,

      `// roundToInt rounds a float to the nearest integer, half away from zero.
func roundToInt(value float64) int {
	return int(math.Floor(value + 0.5))
}`,
    ],
  },
];
