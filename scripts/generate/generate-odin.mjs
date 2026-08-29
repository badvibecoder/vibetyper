// generate-odin.mjs
// Generates the Odin dictionary for vibetyper: a set of .odin files whose
// top-level procs/structs each become one typing block (brace-split mode).
//
// Run from anywhere:
//   node scripts/generate/generate-odin.mjs
//
// Every proc below is a complete, self-contained unit with real logic and
// idiomatic Odin syntax (proc ::, struct, slices, dynamic arrays, maps).
// NOTE: no `#`-directives and no backticks appear in the emitted code so the
// brace splitter in server/blockSplitter.js stays happy.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../dictionary/odin');
fs.mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------------------
// 1. string_utils.odin
// ---------------------------------------------------------------------------
const string_utils = [
  String.raw`// is_blank reports whether a string is empty or only whitespace.
is_blank :: proc(s: string) -> bool {
	for ch in s {
		if ch != ' ' && ch != '\t' && ch != '\r' && ch != '\n' {
			return false
		}
	}
	return true
}`,

  String.raw`// count_char counts occurrences of a specific byte in a string.
count_char :: proc(s: string, target: u8) -> int {
	count := 0
	for ch in s {
		if ch == target {
			count += 1
		}
	}
	return count
}`,

  String.raw`// reverse returns a new string with the bytes in reverse order.
reverse :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i := len(s) - 1; i >= 0; i -= 1 {
		strings.write_byte(&b, s[i])
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// to_upper_ascii converts ASCII letters to upper case in place.
to_upper_ascii :: proc(s: string) -> string {
	bytes := transmute([]u8)(s)
	for i in 0 ..< len(bytes) {
		if bytes[i] >= 'a' && bytes[i] <= 'z' {
			bytes[i] -= 32
		}
	}
	return s
}`,

  String.raw`// to_lower_ascii converts ASCII letters to lower case in place.
to_lower_ascii :: proc(s: string) -> string {
	bytes := transmute([]u8)(s)
	for i in 0 ..< len(bytes) {
		if bytes[i] >= 'A' && bytes[i] <= 'Z' {
			bytes[i] += 32
		}
	}
	return s
}`,

  String.raw`// trim_space strips leading and trailing whitespace.
trim_space :: proc(s: string) -> string {
	start := 0
	end := len(s)
	for start < end {
		ch := s[start]
		if ch != ' ' && ch != '\t' && ch != '\n' && ch != '\r' {
			break
		}
		start += 1
	}
	for end > start {
		ch := s[end - 1]
		if ch != ' ' && ch != '\t' && ch != '\n' && ch != '\r' {
			break
		}
		end -= 1
	}
	return s[start:end]
}`,

  String.raw`// split_csv splits a line into fields on commas, trimming each field.
split_csv :: proc(line: string) -> []string {
	fields := strings.split(line, ",")
	defer delete(fields)
	result := make([]string, len(fields))
	for field, i in fields {
		result[i] = strings.trim_space(field)
	}
	return result
}`,

  String.raw`// join_with joins parts with a separator, skipping empty parts.
join_with :: proc(parts: []string, sep: string) -> string {
	filtered := make([dynamic]string)
	defer delete(filtered)
	for part in parts {
		if len(part) > 0 {
			append(&filtered, part)
		}
	}
	return strings.join(filtered[:], sep)
}`,

  String.raw`// contains_any reports whether s contains any of the given substrings.
contains_any :: proc(s: string, needles: []string) -> bool {
	for needle in needles {
		if strings.contains(s, needle) {
			return true
		}
	}
	return false
}`,

  String.raw`// count_occurrences counts non-overlapping occurrences of a substring.
count_occurrences :: proc(s: string, sub: string) -> int {
	if len(sub) == 0 {
		return 0
	}
	count := 0
	pos := 0
	for {
		idx := strings.index(s[pos:], sub)
		if idx < 0 {
			break
		}
		count += 1
		pos += idx + len(sub)
	}
	return count
}`,

  String.raw`// first_word returns everything up to the first space.
first_word :: proc(s: string) -> string {
	for i in 0 ..< len(s) {
		if s[i] == ' ' {
			return s[:i]
		}
	}
	return s
}`,

  String.raw`// strip_prefix removes a leading prefix if present.
strip_prefix :: proc(s: string, prefix: string) -> string {
	if strings.has_prefix(s, prefix) {
		return s[len(prefix):]
	}
	return s
}`,

  String.raw`// replace_all replaces every occurrence of old with new.
replace_all :: proc(s, old, new: string) -> string {
	return strings.replace_all(s, old, new)
}`,

  String.raw`// is_digit_string reports whether every byte is an ASCII digit.
is_digit_string :: proc(s: string) -> bool {
	if len(s) == 0 {
		return false
	}
	for ch in s {
		if ch < '0' || ch > '9' {
			return false
		}
	}
	return true
}`,

  String.raw`// pad_left pads s on the left with pad up to total length.
pad_left :: proc(s: string, total: int, pad: u8) -> string {
	if len(s) >= total {
		return s
	}
	needed := total - len(s)
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i in 0 ..< needed {
		strings.write_byte(&b, pad)
	}
	strings.write_string(&b, s)
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// snake_to_camel converts snake_case to camelCase.
snake_to_camel :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	upper_next := false
	for ch in s {
		if ch == '_' {
			upper_next = true
			continue
		}
		if upper_next && ch >= 'a' && ch <= 'z' {
			strings.write_byte(&b, ch - 32)
		} else {
			strings.write_byte(&b, ch)
		}
		upper_next = false
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// camel_to_snake converts camelCase to snake_case.
camel_to_snake :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i in 0 ..< len(s) {
		ch := s[i]
		if ch >= 'A' && ch <= 'Z' && i > 0 {
			strings.write_byte(&b, '_')
			strings.write_byte(&b, ch + 32)
		} else {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// hash_djb2 computes a 32-bit hash of a string (DJB2 variant).
hash_djb2 :: proc(s: string) -> u32 {
	hash: u32 = 5381
	for ch in s {
		hash = (hash << 5) + hash + u32(ch)
	}
	return hash
}`,

  String.raw`// line_count counts the number of lines in a block of text.
line_count :: proc(text: string) -> int {
	if len(text) == 0 {
		return 0
	}
	count := 1
	for ch in text {
		if ch == '\n' {
			count += 1
		}
	}
	return count
}`,

  String.raw`// truncate shortens a string to max runes worth of bytes with an ellipsis.
truncate :: proc(s: string, max_bytes: int) -> string {
	if len(s) <= max_bytes {
		return s
	}
	if max_bytes <= 3 {
		return s[:max_bytes]
	}
	return s[:max_bytes - 3] + "..."
}`,

  String.raw`// extract_numbers pulls every digit run out of a string as integers.
extract_numbers :: proc(s: string) -> []int {
	result := make([dynamic]int)
	defer delete(result)
	current := 0
	in_number := false
	for ch in s {
		if ch >= '0' && ch <= '9' {
			current = current * 10 + int(ch - '0')
			in_number = true
		} else if in_number {
			append(&result, current)
			current = 0
			in_number = false
		}
	}
	if in_number {
		append(&result, current)
	}
	return result[:]
}`,

  String.raw`// last_path_segment returns the text after the final '/' or '\\'.
last_path_segment :: proc(s: string) -> string {
	for i := len(s) - 1; i >= 0; i -= 1 {
		if s[i] == '/' || s[i] == '\\' {
			return s[i + 1:]
		}
	}
	return s
}`,
];

// ---------------------------------------------------------------------------
// 2. math_utils.odin
// ---------------------------------------------------------------------------
const math_utils = [
  String.raw`// gcd computes the greatest common divisor via Euclid's algorithm.
gcd :: proc(a, b: int) -> int {
	x := abs(a)
	y := abs(b)
	for y != 0 {
		x, y = y, x % y
	}
	return x
}`,

  String.raw`// lcm computes the least common multiple of two integers.
lcm :: proc(a, b: int) -> int {
	if a == 0 || b == 0 {
		return 0
	}
	return abs(a / gcd(a, b) * b)
}`,

  String.raw`// is_prime checks primality with a 2,3 wheel and sqrt bound.
is_prime :: proc(n: int) -> bool {
	if n < 2 {
		return false
	}
	if n % 2 == 0 {
		return n == 2
	}
	if n % 3 == 0 {
		return n == 3
	}
	for d := 5; d * d <= n; d += 6 {
		if n % d == 0 || n % (d + 2) == 0 {
			return false
		}
	}
	return true
}`,

  String.raw`// fibonacci returns the n-th Fibonacci number iteratively.
fibonacci :: proc(n: int) -> i64 {
	if n <= 0 {
		return 0
	}
	a: i64 = 0
	b: i64 = 1
	for i in 1 ..< n {
		a, b = b, a + b
	}
	return b
}`,

  String.raw`// factorial computes n! with an overflow guard.
factorial :: proc(n: int) -> i64 {
	if n < 0 {
		return 0
	}
	result: i64 = 1
	for i := 2; i <= n; i += 1 {
		result *= i64(i)
	}
	return result
}`,

  String.raw`// binomial computes the binomial coefficient n choose k.
binomial :: proc(n, k: int) -> i64 {
	if k < 0 || k > n {
		return 0
	}
	k = min(k, n - k)
	result: i64 = 1
	for i in 0 ..< k {
		result = result * i64(n - i) / i64(i + 1)
	}
	return result
}`,

  String.raw`// mean computes the arithmetic mean of a slice.
mean :: proc(values: []f64) -> f64 {
	if len(values) == 0 {
		return 0
	}
	total := 0.0
	for v in values {
		total += v
	}
	return total / f64(len(values))
}`,

  String.raw`// median returns the middle value of a sorted-able slice.
median :: proc(values: []f64) -> f64 {
	if len(values) == 0 {
		return 0
	}
	sorted := make([]f64, len(values))
	defer delete(sorted)
	copy(sorted, values)
	sort.quick_sort(sorted[:])
	mid := len(sorted) / 2
	if len(sorted) % 2 == 1 {
		return sorted[mid]
	}
	return (sorted[mid - 1] + sorted[mid]) / 2
}`,

  String.raw`// variance computes the population variance of a slice.
variance :: proc(values: []f64) -> f64 {
	if len(values) < 2 {
		return 0
	}
	m := mean(values)
	sum := 0.0
	for v in values {
		d := v - m
		sum += d * d
	}
	return sum / f64(len(values))
}`,

  String.raw`// stddev computes the population standard deviation.
stddev :: proc(values: []f64) -> f64 {
	return math.sqrt(variance(values))
}`,

  String.raw`// clamp_angle wraps an angle in radians into [-pi, pi].
clamp_angle :: proc(angle: f64) -> f64 {
	tau := 2 * math.PI
	angle = math.mod(angle + math.PI, tau)
	if angle < 0 {
		angle += tau
	}
	return angle - math.PI
}`,

  String.raw`// radians_to_degrees converts radians to degrees.
radians_to_degrees :: proc(rad: f64) -> f64 {
	return rad * 180 / math.PI
}`,

  String.raw`// degrees_to_radians converts degrees to radians.
degrees_to_radians :: proc(deg: f64) -> f64 {
	return deg * math.PI / 180
}`,

  String.raw`// lerp linearly interpolates between a and b by t in [0, 1].
lerp :: proc(a, b, t: f64) -> f64 {
	return a + (b - a) * clamp(t, 0, 1)
}`,

  String.raw`// smoothstep eases t through a hermite curve in [0, 1].
smoothstep :: proc(t: f64) -> f64 {
	t = clamp(t, 0, 1)
	return t * t * (3 - 2 * t)
}`,

  String.raw`// remap_range rescales a value from one interval to another.
remap_range :: proc(value, from_lo, from_hi, to_lo, to_hi: f64) -> f64 {
	if from_hi == from_lo {
		return to_lo
	}
	t := (value - from_lo) / (from_hi - from_lo)
	return to_lo + t * (to_hi - to_lo)
}`,

  String.raw`// round_to rounds a value to a given number of decimal places.
round_to :: proc(value: f64, places: int) -> f64 {
	factor := math.pow(10, f64(places))
	return math.round(value * factor) / factor
}`,

  String.raw`// is_power_of_two checks whether an integer is a power of two.
is_power_of_two :: proc(n: int) -> bool {
	return n > 0 && (n & (n - 1)) == 0
}`,

  String.raw`// next_power_of_two rounds up to the smallest power of two >= n.
next_power_of_two :: proc(n: int) -> int {
	if n <= 1 {
		return 1
	}
	result := 1
	for result < n {
		result <<= 1
	}
	return result
}`,

  String.raw`// digit_sum adds up the decimal digits of a non-negative integer.
digit_sum :: proc(n: int) -> int {
	m := abs(n)
	sum := 0
	for m > 0 {
		sum += m % 10
		m /= 10
	}
	return sum
}`,

  String.raw`// collatz_steps counts the steps to reach 1 in the Collatz sequence.
collatz_steps :: proc(n: int) -> int {
	if n <= 1 {
		return 0
	}
	steps := 0
	m := n
	for m != 1 {
		if m % 2 == 0 {
			m /= 2
		} else {
			m = 3 * m + 1
		}
		steps += 1
	}
	return steps
}`,

  String.raw`// sigmoid maps a raw score into the (0, 1) range.
sigmoid :: proc(x: f64) -> f64 {
	return 1 / (1 + math.exp(-x))
}`,
];

// ---------------------------------------------------------------------------
// 3. collections.odin
// ---------------------------------------------------------------------------
const collections = [
  String.raw`// sum returns the total of a slice of integers.
sum :: proc(values: []int) -> int {
	total := 0
	for v in values {
		total += v
	}
	return total
}`,

  String.raw`// product multiplies every element of a slice together.
product :: proc(values: []int) -> int {
	total := 1
	for v in values {
		total *= v
	}
	return total
}`,

  String.raw`// min_index returns the index of the smallest element.
min_index :: proc(values: []f64) -> int {
	if len(values) == 0 {
		return -1
	}
	best := 0
	for i in 1 ..< len(values) {
		if values[i] < values[best] {
			best = i
		}
	}
	return best
}`,

  String.raw`// max_index returns the index of the largest element.
max_index :: proc(values: []f64) -> int {
	if len(values) == 0 {
		return -1
	}
	best := 0
	for i in 1 ..< len(values) {
		if values[i] > values[best] {
			best = i
		}
	}
	return best
}`,

  String.raw`// contains reports whether an integer slice holds a value.
contains :: proc(values: []int, target: int) -> bool {
	for v in values {
		if v == target {
			return true
		}
	}
	return false
}`,

  String.raw`// index_of finds the first position of a value, or -1.
index_of :: proc(values: []string, target: string) -> int {
	for v, i in values {
		if v == target {
			return i
		}
	}
	return -1
}`,

  String.raw`// count_where counts elements that satisfy a predicate via callback.
count_where :: proc(values: []int, predicate: proc(int) -> bool) -> int {
	count := 0
	for v in values {
		if predicate(v) {
			count += 1
		}
	}
	return count
}`,

  String.raw`// all reports whether every element satisfies the predicate.
all :: proc(values: []bool) -> bool {
	for v in values {
		if !v {
			return false
		}
	}
	return true
}`,

  String.raw`// any reports whether at least one element is true.
any :: proc(values: []bool) -> bool {
	for v in values {
		if v {
			return true
		}
	}
	return false
}`,

  String.raw`// reverse reverses a slice in place.
reverse :: proc(values: []int) {
	for i in 0 ..< len(values) / 2 {
		j := len(values) - 1 - i
		values[i], values[j] = values[j], values[i]
	}
}`,

  String.raw`// unique keeps only the first occurrence of each value.
unique :: proc(values: []string) -> []string {
	seen := make(map[string]bool)
	defer delete(seen)
	result := make([dynamic]string)
	defer delete(result)
	for v in values {
		if !seen[v] {
			seen[v] = true
			append(&result, v)
		}
	}
	return result[:]
}`,

  String.raw`// frequency counts how often each value appears.
frequency :: proc(values: []string) -> map[string]int {
	counts := make(map[string]int)
	for v in values {
		counts[v] += 1
	}
	return counts
}`,

  String.raw`// chunk splits a slice into fixed-size pieces.
chunk :: proc(values: []int, size: int) -> [][]int {
	if size <= 0 {
		return nil
	}
	result := make([][]int, 0, (len(values) + size - 1) / size)
	for start := 0; start < len(values); start += size {
		end := min(start + size, len(values))
		piece := make([]int, end - start)
		copy(piece, values[start:end])
		append(&result, piece)
	}
	return result
}`,

  String.raw`// rotate_left shifts elements left by k positions.
rotate_left :: proc(values: []int, k: int) {
	n := len(values)
	if n == 0 {
		return
	}
	shift := ((k % n) + n) % n
	if shift == 0 {
		return
	}
	slice.reverse(values[:shift])
	slice.reverse(values[shift:])
	slice.reverse(values)
}`,

  String.raw`// zip pairs two slices into a slice of struct pairs.
zip :: proc(keys: []string, values: []int) -> []Key_Value {
	n := min(len(keys), len(values))
	result := make([]Key_Value, n)
	for i in 0 ..< n {
		result[i] = Key_Value{key = keys[i], value = values[i]}
	}
	return result
}`,

  String.raw`// flatten concatenates a slice of slices into one slice.
flatten :: proc(rows: [][]int) -> []int {
	total := 0
	for row in rows {
		total += len(row)
	}
	result := make([]int, 0, total)
	for row in rows {
		for v in row {
			append(&result, v)
		}
	}
	return result
}`,

  String.raw`// slice_equal compares two integer slices element by element.
slice_equal :: proc(a, b: []int) -> bool {
	if len(a) != len(b) {
		return false
	}
	for i in 0 ..< len(a) {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}`,

  String.raw`// remove_at deletes the element at index, shifting the rest.
remove_at :: proc(values: ^[dynamic]int, index: int) -> bool {
	if index < 0 || index >= len(values^) {
		return false
	}
	ordered_remove(values, index)
	return true
}`,

  String.raw`// insert_at places a value at an index, shifting the rest right.
insert_at :: proc(values: ^[dynamic]int, index: int, value: int) {
	if index < 0 {
		index = 0
	}
	if index > len(values^) {
		index = len(values^)
	}
	append(values, 0)
	for i := len(values^) - 1; i > index; i -= 1 {
		values[i] = values[i - 1]
	}
	values[index] = value
}`,

  String.raw`// swap exchanges two elements of a slice by index.
swap :: proc(values: []int, i, j: int) -> bool {
	if i < 0 || j < 0 || i >= len(values) || j >= len(values) {
		return false
	}
	values[i], values[j] = values[j], values[i]
	return true
}`,

  String.raw`// fill sets every element of a slice to a fixed value.
fill :: proc(values: []f64, value: f64) {
	for i in 0 ..< len(values) {
		values[i] = value
	}
}`,

  String.raw`// take returns the first n elements, or all if n is too large.
take :: proc(values: []int, n: int) -> []int {
	if n >= len(values) {
		return values
	}
	return values[:n]
}`,
];

// ---------------------------------------------------------------------------
// 4. validation.odin
// ---------------------------------------------------------------------------
const validation = [
  String.raw`// is_email does a light structural email check.
is_email :: proc(s: string) -> bool {
	at := strings.index(s, "@")
	if at <= 0 {
		return false
	}
	domain := s[at + 1:]
	if len(domain) == 0 || strings.contains(domain, "@") {
		return false
	}
	return strings.contains(domain, ".")
}`,

  String.raw`// is_phone_number accepts 7-15 digits with optional +, -, spaces.
is_phone_number :: proc(s: string) -> bool {
	digits := 0
	for ch in s {
		if ch >= '0' && ch <= '9' {
			digits += 1
		} else if ch != '+' && ch != '-' && ch != ' ' && ch != '(' && ch != ')' {
			return false
		}
	}
	return digits >= 7 && digits <= 15
}`,

  String.raw`// is_url checks for a scheme://host shape.
is_url :: proc(s: string) -> bool {
	if !strings.has_prefix(s, "http://") && !strings.has_prefix(s, "https://") {
		return false
	}
	rest := s[strings.index(s, "://") + 3:]
	return len(rest) > 0 && !strings.contains(rest, " ")
}`,

  String.raw`// is_ipv4 validates a dotted-quad IPv4 address.
is_ipv4 :: proc(s: string) -> bool {
	parts := strings.split(s, ".")
	defer delete(parts)
	if len(parts) != 4 {
		return false
	}
	for part in parts {
		if len(part) == 0 || len(part) > 3 {
			return false
		}
		for ch in part {
			if ch < '0' || ch > '9' {
				return false
			}
		}
		value, ok := strconv.parse_int(part)
		if !ok || value < 0 || value > 255 {
			return false
		}
	}
	return true
}`,

  String.raw`// is_strong_password enforces length, case, digit and symbol rules.
is_strong_password :: proc(s: string) -> bool {
	if len(s) < 8 {
		return false
	}
	has_lower, has_upper, has_digit, has_symbol := false, false, false, false
	for ch in s {
		switch {
		case ch >= 'a' && ch <= 'z':
			has_lower = true
		case ch >= 'A' && ch <= 'Z':
			has_upper = true
		case ch >= '0' && ch <= '9':
			has_digit = true
		case:
			has_symbol = true
		}
	}
	return has_lower && has_upper && has_digit && has_symbol
}`,

  String.raw`// is_luhn_valid checks a card number with the Luhn checksum.
is_luhn_valid :: proc(number: string) -> bool {
	sum := 0
	for i in 0 ..< len(number) {
		ch := number[len(number) - 1 - i]
		if ch < '0' || ch > '9' {
			return false
		}
		digit := int(ch - '0')
		if i % 2 == 1 {
			digit *= 2
			if digit > 9 {
				digit -= 9
			}
		}
		sum += digit
	}
	return sum % 10 == 0
}`,

  String.raw`// is_date_iso validates a YYYY-MM-DD date string.
is_date_iso :: proc(s: string) -> bool {
	if len(s) != 10 || s[4] != '-' || s[7] != '-' {
		return false
	}
	year, ok1 := strconv.parse_int(s[0:4])
	month, ok2 := strconv.parse_int(s[5:7])
	day, ok3 := strconv.parse_int(s[8:10])
	if !ok1 || !ok2 || !ok3 {
		return false
	}
	if month < 1 || month > 12 || day < 1 {
		return false
	}
	days := days_in_month(year, month)
	return day <= days
}`,

  String.raw`// is_hex_color accepts #RGB or #RRGGBB form.
is_hex_color :: proc(s: string) -> bool {
	if len(s) != 4 && len(s) != 7 {
		return false
	}
	if s[0] != '#' {
		return false
	}
	for i in 1 ..< len(s) {
		ch := s[i]
		ok := (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F')
		if !ok {
			return false
		}
	}
	return true
}`,

  String.raw`// is_username enforces 3-20 chars, alphanumeric plus _ and -.
is_username :: proc(s: string) -> bool {
	if len(s) < 3 || len(s) > 20 {
		return false
	}
	for ch in s {
		alnum := (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')
		if !alnum && ch != '_' && ch != '-' {
			return false
		}
	}
	return true
}`,

  String.raw`// is_sorted checks that a slice is in non-decreasing order.
is_sorted :: proc(values: []f64) -> bool {
	for i in 1 ..< len(values) {
		if values[i] < values[i - 1] {
			return false
		}
	}
	return true
}`,

  String.raw`// is_in_range checks a value against inclusive bounds.
is_in_range :: proc(value, low, high: f64) -> bool {
	return value >= low && value <= high
}`,

  String.raw`// is_non_empty rejects strings that are blank after trimming.
is_non_empty :: proc(s: string) -> bool {
	return len(strings.trim_space(s)) > 0
}`,

  String.raw`// has_min_length checks the trimmed length against a floor.
has_min_length :: proc(s: string, minimum: int) -> bool {
	return len(s) >= minimum
}`,

  String.raw`// is_ascii verifies every byte fits in 7-bit ASCII.
is_ascii :: proc(s: string) -> bool {
	for ch in s {
		if ch > 127 {
			return false
		}
	}
	return true
}`,

  String.raw`// is_numeric_string accepts optional sign, digits and one decimal point.
is_numeric_string :: proc(s: string) -> bool {
	if len(s) == 0 {
		return false
	}
	start := 0
	if s[0] == '+' || s[0] == '-' {
		start = 1
	}
	seen_dot := false
	seen_digit := false
	for i in start ..< len(s) {
		ch := s[i]
		if ch == '.' && !seen_dot {
			seen_dot = true
		} else if ch >= '0' && ch <= '9' {
			seen_digit = true
		} else {
			return false
		}
	}
	return seen_digit
}`,

  String.raw`// is_boolean_string accepts true/false/yes/no/1/0.
is_boolean_string :: proc(s: string) -> bool {
	lower := strings.to_lower(strings.trim_space(s))
	switch lower {
	case "true", "false", "yes", "no", "1", "0":
		return true
	case:
		return false
	}
}`,

  String.raw`// is_one_of checks membership in a fixed set of choices.
is_one_of :: proc(value: string, choices: []string) -> bool {
	for choice in choices {
		if value == choice {
			return true
		}
	}
	return false
}`,

  String.raw`// is_valid_percent checks a value in the inclusive 0..100 range.
is_valid_percent :: proc(value: f64) -> bool {
	return value >= 0 && value <= 100
}`,

  String.raw`// is_valid_identifier checks a C-like identifier name.
is_valid_identifier :: proc(s: string) -> bool {
	if len(s) == 0 {
		return false
	}
	first := s[0]
	if !(first == '_' || (first >= 'a' && first <= 'z') || (first >= 'A' && first <= 'Z')) {
		return false
	}
	for i in 1 ..< len(s) {
		ch := s[i]
		ok := (ch == '_') || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')
		if !ok {
			return false
		}
	}
	return true
}`,

  String.raw`// is_zip_code matches a 5-digit or ZIP+4 postal code.
is_zip_code :: proc(s: string) -> bool {
	if len(s) == 5 {
		return is_digit_string(s)
	}
	if len(s) != 10 || s[5] != '-' {
		return false
	}
	return is_digit_string(s[0:5]) && is_digit_string(s[6:10])
}`,

  String.raw`// is_version_tag accepts dotted numeric versions like 1.2.3.
is_version_tag :: proc(s: string) -> bool {
	parts := strings.split(s, ".")
	defer delete(parts)
	if len(parts) < 2 {
		return false
	}
	for part in parts {
		if !is_digit_string(part) {
			return false
		}
	}
	return true
}`,
];

// ---------------------------------------------------------------------------
// 5. text_processing.odin
// ---------------------------------------------------------------------------
const text_processing = [
  String.raw`// tokenize splits text into lowercase word tokens.
tokenize :: proc(text: string) -> []string {
	result := make([dynamic]string)
	defer delete(result)
	start := -1
	for i in 0 ..= len(text) {
		at_end := i == len(text)
		ch: u8 = 0
		if !at_end {
			ch = text[i]
		}
		is_word := !at_end && ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9'))
		if is_word && start < 0 {
			start = i
		}
		if !is_word && start >= 0 {
			append(&result, strings.to_lower(text[start:i]))
			start = -1
		}
	}
	return result[:]
}`,

  String.raw`// word_frequency tallies tokens into a map.
word_frequency :: proc(text: string) -> map[string]int {
	counts := make(map[string]int)
	for word in tokenize(text) {
		counts[word] += 1
	}
	return counts
}`,

  String.raw`// strip_punctuation removes non-alphanumeric characters.
strip_punctuation :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		keep := (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == ' '
		if keep {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// count_sentences counts sentence-ending punctuation.
count_sentences :: proc(text: string) -> int {
	count := 0
	for ch in text {
		if ch == '.' || ch == '!' || ch == '?' {
			count += 1
		}
	}
	return count
}`,

  String.raw`// is_palindrome checks if text reads the same forward and backward.
is_palindrome :: proc(text: string) -> bool {
	clean := strings.to_lower(strip_punctuation(text))
	left := 0
	right := len(clean) - 1
	for left < right {
		if clean[left] != clean[right] {
			return false
		}
		left += 1
		right -= 1
	}
	return true
}`,

  String.raw`// pig_latin converts a single word to Pig Latin.
pig_latin :: proc(word: string) -> string {
	if len(word) == 0 {
		return word
	}
	first := strings.to_lower(word[0:1])
	if first == "a" || first == "e" || first == "i" || first == "o" || first == "u" {
		return word + "way"
	}
	return word[1:] + word[0:1] + "ay"
}`,

  String.raw`// rot13 applies the classic Caesar cipher variant to ASCII letters.
rot13 :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		if ch >= 'a' && ch <= 'z' {
			strings.write_byte(&b, 'a' + (ch - 'a' + 13) % 26)
		} else if ch >= 'A' && ch <= 'Z' {
			strings.write_byte(&b, 'A' + (ch - 'A' + 13) % 26)
		} else {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// caesar_shift shifts letters by a fixed amount, wrapping at z/Z.
caesar_shift :: proc(text: string, shift: int) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		if ch >= 'a' && ch <= 'z' {
			strings.write_byte(&b, u8('a' + ((ch - 'a' + shift) % 26 + 26) % 26))
		} else if ch >= 'A' && ch <= 'Z' {
			strings.write_byte(&b, u8('A' + ((ch - 'A' + shift) % 26 + 26) % 26))
		} else {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// extract_quoted pulls the first quoted substring out of text.
extract_quoted :: proc(text: string) -> (string, bool) {
	start := strings.index(text, "\"")
	if start < 0 {
		return "", false
	}
	end := strings.index(text[start + 1:], "\"")
	if end < 0 {
		return "", false
	}
	return text[start + 1:start + 1 + end], true
}`,

  String.raw`// remove_duplicate_words keeps the first occurrence of each word.
remove_duplicate_words :: proc(text: string) -> string {
	seen := make(map[string]bool)
	defer delete(seen)
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for word in strings.fields(text) {
		key := strings.to_lower(word)
		if !seen[key] {
			seen[key] = true
			strings.write_string(&b, word)
			strings.write_byte(&b, ' ')
		}
	}
	result := strings.trim_space(strings.to_string(b))
	return strings.clone(result)
}`,

  String.raw`// longest_word finds the largest token in a string.
longest_word :: proc(text: string) -> string {
	best := ""
	for word in strings.fields(text) {
		if len(word) > len(best) {
			best = word
		}
	}
	return best
}`,

  String.raw`// shortest_word finds the smallest token in a string.
shortest_word :: proc(text: string) -> string {
	best := ""
	first := true
	for word in strings.fields(text) {
		if first || len(word) < len(best) {
			best = word
			first = false
		}
	}
	return best
}`,

  String.raw`// average_word_length returns the mean token length.
average_word_length :: proc(text: string) -> f64 {
	words := strings.fields(text)
	if len(words) == 0 {
		return 0
	}
	total := 0
	for word in words {
		total += len(word)
	}
	return f64(total) / f64(len(words))
}`,

  String.raw`// wrap_text breaks text into lines of at most width characters.
wrap_text :: proc(text: string, width: int) -> []string {
	words := strings.fields(text)
	defer delete(words)
	lines := make([dynamic]string)
	defer delete(lines)
	current := strings.builder_make()
	defer strings.builder_destroy(&current)
	for word, i in words {
		if strings.builder_len(current) > 0 && strings.builder_len(current) + 1 + len(word) > width {
			append(&lines, strings.clone(strings.to_string(current)))
			strings.builder_reset(&current)
		}
		if strings.builder_len(current) > 0 {
			strings.write_byte(&current, ' ')
		}
		strings.write_string(&current, word)
	}
	if strings.builder_len(current) > 0 {
		append(&lines, strings.clone(strings.to_string(current)))
	}
	return lines[:]
}`,

  String.raw`// indent_lines prefixes every line of text with a given string.
indent_lines :: proc(text, indent: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for line, i in strings.split_lines(text) {
		if i > 0 {
			strings.write_byte(&b, '\n')
		}
		strings.write_string(&b, indent)
		strings.write_string(&b, line)
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// normalize_spaces collapses runs of whitespace into single spaces.
normalize_spaces :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	in_space := false
	for ch in text {
		is_space := ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r'
		if is_space {
			if !in_space {
				strings.write_byte(&b, ' ')
				in_space = true
			}
		} else {
			strings.write_byte(&b, ch)
			in_space = false
		}
	}
	return strings.clone(strings.trim_space(strings.to_string(b)))
}`,

  String.raw`// title_case capitalizes the first letter of each word.
title_case :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	capitalize := true
	for ch in text {
		if ch == ' ' {
			capitalize = true
			strings.write_byte(&b, ch)
		} else if capitalize && ch >= 'a' && ch <= 'z' {
			strings.write_byte(&b, ch - 32)
			capitalize = false
		} else {
			strings.write_byte(&b, ch)
			capitalize = false
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// count_syllables estimates syllables with a vowel-run heuristic.
count_syllables :: proc(word: string) -> int {
	lower := strings.to_lower(word)
	count := 0
	in_vowel := false
	for ch in lower {
		is_vowel := ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u'
		if is_vowel && !in_vowel {
			count += 1
		}
		in_vowel = is_vowel
	}
	if len(lower) > 1 && lower[len(lower) - 1] == 'e' && count > 1 {
		count -= 1
	}
	return max(count, 1)
}`,

  String.raw`// redact keeps the first and last rune of each word, masking the middle.
redact :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for word in strings.fields(text) {
		if strings.builder_len(b) > 0 {
			strings.write_byte(&b, ' ')
		}
		if len(word) <= 2 {
			strings.write_string(&b, word)
		} else {
			strings.write_byte(&b, word[0])
			for i in 1 ..< len(word) - 1 {
				strings.write_byte(&b, '*')
			}
			strings.write_byte(&b, word[len(word) - 1])
		}
	}
	return strings.clone(strings.to_string(b))
}`,
];

// ---------------------------------------------------------------------------
// 6. data_processing.odin
// ---------------------------------------------------------------------------
const data_processing = [
  String.raw`// parse_csv_line splits a CSV row honouring quoted fields.
parse_csv_line :: proc(line: string) -> []string {
	fields := make([dynamic]string)
	defer delete(fields)
	current := strings.builder_make()
	defer strings.builder_destroy(&current)
	in_quotes := false
	for i := 0; i < len(line); i += 1 {
		ch := line[i]
		if ch == '"' {
			if in_quotes && i + 1 < len(line) && line[i + 1] == '"' {
				strings.write_byte(&current, '"')
				i += 1
			} else {
				in_quotes = !in_quotes
			}
		} else if ch == ',' && !in_quotes {
			append(&fields, strings.clone(strings.to_string(current)))
			strings.builder_reset(&current)
		} else {
			strings.write_byte(&current, ch)
		}
	}
	append(&fields, strings.clone(strings.to_string(current)))
	return fields[:]
}`,

  String.raw`// parse_int_list converts "1,2,3" into a slice of ints.
parse_int_list :: proc(s: string) -> ([]int, bool) {
	parts := strings.split(s, ",")
	defer delete(parts)
	result := make([dynamic]int)
	defer delete(result)
	for part in parts {
		trimmed := strings.trim_space(part)
		value, ok := strconv.parse_int(trimmed)
		if !ok {
			return nil, false
		}
		append(&result, value)
	}
	return result[:], true
}`,

  String.raw`// filter_outliers drops values more than 3 stddevs from the mean.
filter_outliers :: proc(values: []f64) -> []f64 {
	if len(values) < 3 {
		return values
	}
	m := mean(values)
	sd := stddev(values)
	if sd == 0 {
		return values
	}
	result := make([dynamic]f64)
	defer delete(result)
	for v in values {
		if abs(v - m) <= 3 * sd {
			append(&result, v)
		}
	}
	return result[:]
}`,

  String.raw`// normalize_values scales a slice into the [0, 1] range.
normalize_values :: proc(values: []f64) -> []f64 {
	if len(values) == 0 {
		return values
	}
	lo := values[0]
	hi := values[0]
	for v in values {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	span := hi - lo
	if span == 0 {
		result := make([]f64, len(values))
		return result
	}
	result := make([]f64, len(values))
	for v, i in values {
		result[i] = (v - lo) / span
	}
	return result
}`,

  String.raw`// zscore transforms values into standard scores.
zscore :: proc(values: []f64) -> []f64 {
	m := mean(values)
	sd := stddev(values)
	result := make([]f64, len(values))
	if sd == 0 {
		return result
	}
	for v, i in values {
		result[i] = (v - m) / sd
	}
	return result
}`,

  String.raw`// bucketize maps values into n equal-width buckets and counts them.
bucketize :: proc(values: []f64, buckets: int) -> []int {
	if buckets <= 0 || len(values) == 0 {
		return nil
	}
	lo := values[0]
	hi := values[0]
	for v in values {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	counts := make([]int, buckets)
	width := (hi - lo) / f64(buckets)
	for v in values {
		index := int((v - lo) / width)
		index = clamp(index, 0, buckets - 1)
		counts[index] += 1
	}
	return counts
}`,

  String.raw`// running_average computes the cumulative average at each step.
running_average :: proc(values: []f64) -> []f64 {
	result := make([]f64, len(values))
	total := 0.0
	for v, i in values {
		total += v
		result[i] = total / f64(i + 1)
	}
	return result
}`,

  String.raw`// moving_average smooths a series with a sliding window.
moving_average :: proc(values: []f64, window: int) -> []f64 {
	if window <= 0 {
		return values
	}
	n := len(values)
	result := make([]f64, n)
	sum := 0.0
	for i in 0 ..< n {
		sum += values[i]
		if i >= window {
			sum -= values[i - window]
		}
		result[i] = sum / f64(min(i + 1, window))
	}
	return result
}`,

  String.raw`// delta computes the difference between consecutive values.
delta :: proc(values: []f64) -> []f64 {
	if len(values) < 2 {
		return nil
	}
	result := make([]f64, len(values) - 1)
	for i in 1 ..< len(values) {
		result[i - 1] = values[i] - values[i - 1]
	}
	return result
}`,

  String.raw`// cumulative_sum returns the running total at each index.
cumulative_sum :: proc(values: []int) -> []int {
	result := make([]int, len(values))
	total := 0
	for v, i in values {
		total += v
		result[i] = total
	}
	return result
}`,

  String.raw`// clamp_values restricts every value to [lo, hi].
clamp_values :: proc(values: []f64, lo, hi: f64) {
	for i in 0 ..< len(values) {
		values[i] = clamp(values[i], lo, hi)
	}
}`,

  String.raw`// dedupe_preserve_order removes repeats keeping first-seen order.
dedupe_preserve_order :: proc(values: []int) -> []int {
	seen := make(map[int]bool)
	defer delete(seen)
	result := make([dynamic]int)
	defer delete(result)
	for v in values {
		if !seen[v] {
			seen[v] = true
			append(&result, v)
		}
	}
	return result[:]
}`,

  String.raw`// partition splits values by a predicate into true and false groups.
partition :: proc(values: []int, predicate: proc(int) -> bool) -> ([]int, []int) {
	trues := make([dynamic]int)
	falses := make([dynamic]int)
	defer delete(trues)
	defer delete(falses)
	for v in values {
		if predicate(v) {
			append(&trues, v)
		} else {
			append(&falses, v)
		}
	}
	return trues[:], falses[:]
}`,

  String.raw`// histogram counts occurrences per exact value.
histogram :: proc(values: []string) -> map[string]int {
	counts := make(map[string]int)
	for v in values {
		counts[v] += 1
	}
	return counts
}`,

  String.raw`// min_max_scale normalizes each value between new_min and new_max.
min_max_scale :: proc(values: []f64, new_min, new_max: f64) -> []f64 {
	if len(values) == 0 {
		return values
	}
	lo := values[0]
	hi := values[0]
	for v in values {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	result := make([]f64, len(values))
	if hi == lo {
		for i in 0 ..< len(values) {
			result[i] = (new_min + new_max) / 2
		}
		return result
	}
	for v, i in values {
		result[i] = new_min + (v - lo) / (hi - lo) * (new_max - new_min)
	}
	return result
}`,

  String.raw`// detect_peaks finds indices that exceed both neighbours.
detect_peaks :: proc(values: []f64) -> []int {
	if len(values) < 3 {
		return nil
	}
	peaks := make([dynamic]int)
	defer delete(peaks)
	for i in 1 ..< len(values) - 1 {
		if values[i] > values[i - 1] && values[i] > values[i + 1] {
			append(&peaks, i)
		}
	}
	return peaks[:]
}`,

  String.raw`// group_consecutive groups identical values into (value, count) pairs.
group_consecutive :: proc(values: []string) -> []Run {
	if len(values) == 0 {
		return nil
	}
	runs := make([dynamic]Run)
	defer delete(runs)
	current := values[0]
	count := 1
	for i in 1 ..< len(values) {
		if values[i] == current {
			count += 1
		} else {
			append(&runs, Run{value = current, count = count})
			current = values[i]
			count = 1
		}
	}
	append(&runs, Run{value = current, count = count})
	return runs[:]
}`,

  String.raw`// cross_correlation measures similarity of two same-length series.
cross_correlation :: proc(a, b: []f64) -> f64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0
	}
	ma := mean(a)
	mb := mean(b)
	num := 0.0
	da := 0.0
	db := 0.0
	for i in 0 ..< len(a) {
		x := a[i] - ma
		y := b[i] - mb
		num += x * y
		da += x * x
		db += y * y
	}
	denom := math.sqrt(da * db)
	if denom == 0 {
		return 0
	}
	return num / denom
}`,

  String.raw`// pairwise_add combines two same-length slices element-wise.
pairwise_add :: proc(a, b: []f64) -> ([]f64, bool) {
	if len(a) != len(b) {
		return nil, false
	}
	result := make([]f64, len(a))
	for i in 0 ..< len(a) {
		result[i] = a[i] + b[i]
	}
	return result, true
}`,

  String.raw`// interleave merges two slices alternating their elements.
interleave :: proc(a, b: []int) -> []int {
	result := make([]int, 0, len(a) + len(b))
	n := max(len(a), len(b))
	for i in 0 ..< n {
		if i < len(a) {
			append(&result, a[i])
		}
		if i < len(b) {
			append(&result, b[i])
		}
	}
	return result
}`,

  String.raw`// windowed pulls every contiguous window of size k as sub-slices.
windowed :: proc(values: []int, size: int) -> [][]int {
	if size <= 0 || size > len(values) {
		return nil
	}
	result := make([][]int, 0, len(values) - size + 1)
	for start in 0 ..= len(values) - size {
		window := make([]int, size)
		copy(window, values[start:start + size])
		append(&result, window)
	}
	return result
}`,
];

// ---------------------------------------------------------------------------
// 7. filesystem.odin
// ---------------------------------------------------------------------------
const filesystem = [
  String.raw`// file_exists reports whether a path refers to an existing file.
file_exists :: proc(path: string) -> bool {
	return os.exists(path) && os.is_file(path)
}`,

  String.raw`// read_text_file reads a whole file into a string.
read_text_file :: proc(path: string) -> (string, bool) {
	data, err := os.read_entire_file(path)
	if err != nil {
		return "", false
	}
	defer delete(data)
	return string(data), true
}`,

  String.raw`// write_text_file writes a string to a file, overwriting it.
write_text_file :: proc(path, content: string) -> bool {
	err := os.write_entire_file(path, transmute([]u8)content)
	return err == nil
}`,

  String.raw`// append_text adds a string to the end of a file.
append_text :: proc(path, content: string) -> bool {
	existing, ok := read_text_file(path)
	if !ok {
		existing = ""
	}
	err := os.write_entire_file(path, transmute([]u8)(existing + content))
	return err == nil
}`,

  String.raw`// read_lines splits a file into its lines without trailing newlines.
read_lines :: proc(path: string) -> ([]string, bool) {
	data, err := os.read_entire_file(path)
	if err != nil {
		return nil, false
	}
	defer delete(data)
	lines := strings.split_lines(string(data))
	return lines, true
}`,

  String.raw`// count_lines counts newline-separated lines in a file.
count_lines :: proc(path: string) -> (int, bool) {
	data, err := os.read_entire_file(path)
	if err != nil {
		return 0, false
	}
	defer delete(data)
	count := 1
	for b in data {
		if b == '\n' {
			count += 1
		}
	}
	return count, true
}`,

  String.raw`// getenv_default reads an environment variable with a fallback value.
getenv_default :: proc(name, fallback: string) -> string {
	value, ok := os.getenv(name)
	if !ok {
		return fallback
	}
	return value
}`,

  String.raw`// is_dir reports whether a path is a directory.
is_dir :: proc(path: string) -> bool {
	return os.is_directory(path)
}`,

  String.raw`// file_size returns the size of a file in bytes.
file_size :: proc(path: string) -> (i64, bool) {
	handle, err := os.open(path)
	if err != nil {
		return 0, false
	}
	defer os.close(handle)
	size, err2 := os.file_size(handle)
	if err2 != nil {
		return 0, false
	}
	return size, true
}`,

  String.raw`// remove_file deletes a file, ignoring missing files.
remove_file :: proc(path: string) -> bool {
	if !os.exists(path) {
		return true
	}
	return os.remove(path) == nil
}`,

  String.raw`// copy_file copies the bytes of one file to another.
copy_file :: proc(src, dst: string) -> bool {
	err := os.copy_file(dst, src)
	return err == nil
}`,

  String.raw`// rename_file moves a file from one path to another.
rename_file :: proc(from, to: string) -> bool {
	if !os.exists(from) {
		return false
	}
	return os.rename(from, to) == nil
}`,

  String.raw`// get_extension returns the extension including the dot.
get_extension :: proc(path: string) -> string {
	return filepath.ext(path)
}`,

  String.raw`// get_base_name returns the final path component.
get_base_name :: proc(path: string) -> string {
	return filepath.base(path)
}`,

  String.raw`// make_dirs creates a directory with standard permissions.
make_dirs :: proc(dir: string) -> bool {
	return os.make_directory(dir) == nil
}`,

  String.raw`// join_path joins path components with the platform separator.
join_path :: proc(parts: ..string) -> string {
	return filepath.join(parts[:]...)
}`,

  String.raw`// path_is_absolute checks for a leading slash.
path_is_absolute :: proc(path: string) -> bool {
	return len(path) > 0 && path[0] == '/'
}`,

  String.raw`// sanitize_filename replaces unsafe characters with underscores.
sanitize_filename :: proc(name: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in name {
		ok := (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '.' || ch == '-' || ch == '_'
		if ok {
			strings.write_byte(&b, ch)
		} else {
			strings.write_byte(&b, '_')
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// ensure_trailing_slash appends '/' if the path lacks one.
ensure_trailing_slash :: proc(dir: string) -> string {
	if len(dir) > 0 && dir[len(dir) - 1] == '/' {
		return dir
	}
	return dir + "/"
}`,

  String.raw`// file_extension_matches checks a path against a list of extensions.
file_extension_matches :: proc(path: string, extensions: []string) -> bool {
	ext := filepath.ext(path)
	for candidate in extensions {
		if ext == candidate {
			return true
		}
	}
	return false
}`,

  String.raw`// relative_path computes a path from base to target.
relative_path :: proc(base, target: string) -> string {
	if !strings.has_prefix(target, base) {
		return target
	}
	return strings.trim_prefix(target, base)
}`,

  String.raw`// path_depth counts the path segments in a slash-separated path.
path_depth :: proc(p: string) -> int {
	depth := 0
	for ch in p {
		if ch == '/' {
			depth += 1
		}
	}
	return depth
}`,
];

// ---------------------------------------------------------------------------
// 8. networking.odin
// ---------------------------------------------------------------------------
const networking = [
  String.raw`// is_valid_port checks a TCP/UDP port number.
is_valid_port :: proc(port: int) -> bool {
	return port >= 1 && port <= 65535
}`,

  String.raw`// split_host_port separates "host:port" into its parts.
split_host_port :: proc(address: string) -> (string, string) {
	idx := strings.last_index(address, ":")
	if idx < 0 {
		return address, ""
	}
	return address[:idx], address[idx + 1:]
}`,

  String.raw`// parse_url breaks a URL into scheme, host and path.
parse_url :: proc(url: string) -> (scheme, host, path: string) {
	scheme_end := strings.index(url, "://")
	if scheme_end < 0 {
		return "", "", url
	}
	scheme = url[:scheme_end]
	rest := url[scheme_end + 3:]
	path_start := strings.index(rest, "/")
	if path_start < 0 {
		return scheme, rest, "/"
	}
	return scheme, rest[:path_start], rest[path_start:]
}`,

  String.raw`// build_query_string encodes a parameter map into a query string.
build_query_string :: proc(params: map[string]string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	first := true
	for key, value in params {
		if !first {
			strings.write_byte(&b, '&')
		}
		first = false
		strings.write_string(&b, url_encode(key))
		strings.write_byte(&b, '=')
		strings.write_string(&b, url_encode(value))
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// parse_query_string turns a query string into a parameter map.
parse_query_string :: proc(query: string) -> map[string]string {
	params := make(map[string]string)
	parts := strings.split(query, "&")
	defer delete(parts)
	for part in parts {
		idx := strings.index(part, "=")
		if idx < 0 {
			continue
		}
		key := url_decode(part[:idx])
		value := url_decode(part[idx + 1:])
		params[key] = value
	}
	return params
}`,

  String.raw`// is_http_success classifies a status code as 2xx.
is_http_success :: proc(status: int) -> bool {
	return status >= 200 && status < 300
}`,

  String.raw`// http_status_text maps a status code to its standard reason phrase.
http_status_text :: proc(status: int) -> string {
	switch status {
	case 200:
		return "OK"
	case 201:
		return "Created"
	case 204:
		return "No Content"
	case 301:
		return "Moved Permanently"
	case 400:
		return "Bad Request"
	case 401:
		return "Unauthorized"
	case 403:
		return "Forbidden"
	case 404:
		return "Not Found"
	case 500:
		return "Internal Server Error"
	case 503:
		return "Service Unavailable"
	case:
		return "Unknown"
	}
}`,

  String.raw`// resolve_host looks up the first IP address for a hostname.
resolve_host :: proc(host: string) -> (string, bool) {
	ips, err := net.lookup_hostname(host)
	if err != nil || len(ips) == 0 {
		return "", false
	}
	return net.ip_to_string(ips[0]), true
}`,

  String.raw`// dial_tcp connects to a host and returns the socket.
dial_tcp :: proc(host: string, port: int) -> (net.Socket, bool) {
	sock, err := net.dial_tcp(host, port)
	if err != nil || !net.is_valid_socket(sock) {
		return {}, false
	}
	return sock, true
}`,

  String.raw`// send_line writes a line-terminated message over a socket.
send_line :: proc(sock: net.Socket, message: string) -> bool {
	data := transmute([]u8)(message + "\n")
	_, err := net.write(sock, data)
	return err == nil
}`,

  String.raw`// read_line reads bytes from a socket until a newline.
read_line :: proc(sock: net.Socket, buffer: []u8) -> (string, bool) {
	total := 0
	for total < len(buffer) {
		n, err := net.read(sock, buffer[total:total + 1])
		if err != nil || n == 0 {
			break
		}
		if buffer[total] == '\n' {
			return string(buffer[:total]), true
		}
		total += 1
	}
	return string(buffer[:total]), false
}`,

  String.raw`// close_socket releases a socket handle.
close_socket :: proc(sock: net.Socket) {
	if net.is_valid_socket(sock) {
		net.close(sock)
	}
}`,

  String.raw`// is_ipv6_placeholder validates a minimal IPv6 shape with colons.
is_ipv6_like :: proc(address: string) -> bool {
	return strings.contains(address, ":") && !strings.contains(address, ".")
}`,

  String.raw`// mask_ip hides the last octet of an IPv4 address.
mask_ip :: proc(address: string) -> string {
	idx := strings.last_index(address, ".")
	if idx < 0 {
		return address
	}
	return address[:idx] + ".0"
}`,

  String.raw`// default_port returns the standard port for a scheme.
default_port :: proc(scheme: string) -> int {
	switch strings.to_lower(scheme) {
	case "http":
		return 80
	case "https":
		return 443
	case "ftp":
		return 21
	case "ssh":
		return 22
	case "smtp":
		return 25
	case:
		return 0
	}
}`,

  String.raw`// backoff_delay computes an exponential backoff with jitter.
backoff_delay :: proc(attempt: int, base_ms: f64) -> f64 {
	delay := base_ms * math.pow(2, f64(attempt))
	return min(delay, 30_000)
}`,

  String.raw`// url_encode percent-encodes unsafe URL characters.
url_encode :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in s {
		safe := (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '-' || ch == '_' || ch == '.' || ch == '~'
		if safe {
			strings.write_byte(&b, ch)
		} else {
			strings.write_string(&b, fmt.sprintf("%%%02X", u32(ch)))
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// url_decode percent-decodes a URL-encoded string.
url_decode :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i := 0; i < len(s); i += 1 {
		if s[i] == '%' && i + 2 < len(s) {
			hi := hex_value(s[i + 1])
			lo := hex_value(s[i + 2])
			if hi >= 0 && lo >= 0 {
				strings.write_byte(&b, u8(hi * 16 + lo))
				i += 2
				continue
			}
		}
		strings.write_byte(&b, s[i])
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// hex_value converts one hex digit character to its value.
hex_value :: proc(ch: u8) -> int {
	if ch >= '0' && ch <= '9' {
		return int(ch - '0')
	}
	if ch >= 'a' && ch <= 'f' {
		return int(ch - 'a') + 10
	}
	if ch >= 'A' && ch <= 'F' {
		return int(ch - 'A') + 10
	}
	return -1
}`,

  String.raw`// extract_header parses one "Name: value" line.
extract_header :: proc(line: string) -> (name, value: string) {
	idx := strings.index(line, ":")
	if idx < 0 {
		return "", ""
	}
	return strings.trim_space(line[:idx]), strings.trim_space(line[idx + 1:])
}`,

  String.raw`// is_local_address checks for loopback or private IPv4 prefixes.
is_local_address :: proc(address: string) -> bool {
	if address == "127.0.0.1" || address == "localhost" {
		return true
	}
	return strings.has_prefix(address, "192.168.") || strings.has_prefix(address, "10.")
}`,
];

// ---------------------------------------------------------------------------
// Framework + first batch
// ---------------------------------------------------------------------------
const files = [
  { name: 'string_utils.odin', header: String.raw`package string_utils

import "core:strings"`, procs: string_utils },
  { name: 'math_utils.odin', header: String.raw`package math_utils

import "core:math"
import "core:sort"`, procs: math_utils },
  { name: 'collections.odin', header: String.raw`package collections

import "core:slice"

Key_Value :: struct {
	key:   string,
	value: int,
}`, procs: collections },
  { name: 'validation.odin', header: String.raw`package validation

import "core:strconv"
import "core:strings"`, procs: validation },
  { name: 'text_processing.odin', header: String.raw`package text_processing

import "core:strings"`, procs: text_processing },
  { name: 'data_processing.odin', header: String.raw`package data_processing

import "core:math"
import "core:strconv"
import "core:strings"

Run :: struct {
	value: string,
	count: int,
}`, procs: data_processing },
  { name: 'filesystem.odin', header: String.raw`package filesystem

import "core:os"
import "core:path/filepath"
import "core:strings"`, procs: filesystem },
  { name: 'networking.odin', header: String.raw`package networking

import "core:fmt"
import "core:math"
import "core:net"
import "core:strings"`, procs: networking },
];

// ---------------------------------------------------------------------------
// 9. formatting.odin
// ---------------------------------------------------------------------------
const formatting = [
  String.raw`// pad_number zero-pads an integer to a fixed width.
pad_number :: proc(value, width: int) -> string {
	text := strconv.itoa(value)
	if len(text) >= width {
		return text
	}
	return strings.repeat("0", width - len(text)) + text
}`,

  String.raw`// comma_separate inserts thousands separators into an integer string.
comma_separate :: proc(value: int) -> string {
	negative := value < 0
	digits := strconv.itoa(abs(value))
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	if negative {
		strings.write_byte(&b, '-')
	}
	for i in 0 ..< len(digits) {
		if i > 0 && (len(digits) - i) % 3 == 0 {
			strings.write_byte(&b, ',')
		}
		strings.write_byte(&b, digits[i])
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// format_percent renders a ratio as a percentage with one decimal.
format_percent :: proc(ratio: f64) -> string {
	return fmt.sprintf("%.1f%%", ratio * 100)
}`,

  String.raw`// format_bytes renders a byte count in human-readable units.
format_bytes :: proc(bytes: i64) -> string {
	units := []string{"B", "KB", "MB", "GB", "TB"}
	value := f64(bytes)
	unit := 0
	for value >= 1024 && unit < len(units) - 1 {
		value /= 1024
		unit += 1
	}
	if unit == 0 {
		return fmt.sprintf("%d B", bytes)
	}
	return fmt.sprintf("%.1f %s", value, units[unit])
}`,

  String.raw`// format_duration renders milliseconds as "2m 05s" style text.
format_duration :: proc(ms: i64) -> string {
	total := ms / 1000
	hours := total / 3600
	minutes := (total % 3600) / 60
	seconds := total % 60
	if hours > 0 {
		return fmt.sprintf("%dh %02dm", hours, minutes)
	}
	if minutes > 0 {
		return fmt.sprintf("%dm %02ds", minutes, seconds)
	}
	return fmt.sprintf("%ds", seconds)
}`,

  String.raw`// align_right pads text on the left to a column width.
align_right :: proc(text: string, width: int) -> string {
	if len(text) >= width {
		return text
	}
	return strings.repeat(" ", width - len(text)) + text
}`,

  String.raw`// align_left pads text on the right to a column width.
align_left :: proc(text: string, width: int) -> string {
	if len(text) >= width {
		return text
	}
	return text + strings.repeat(" ", width - len(text))
}`,

  String.raw`// table_row formats cells into a fixed-width table row.
table_row :: proc(cells: []string, widths: []int) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for cell, i in cells {
		width := widths[min(i, len(widths) - 1)]
		if i > 0 {
			strings.write_byte(&b, ' ')
		}
		strings.write_string(&b, align_left(cell, width))
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// pluralize appends an "s" unless the count is one.
pluralize :: proc(count: int, singular: string) -> string {
	if count == 1 {
		return fmt.sprintf("%d %s", count, singular)
	}
	return fmt.sprintf("%d %s", count, singular + "s")
}`,

  String.raw`// format_money renders cents as a currency string.
format_money :: proc(cents: int) -> string {
	negative := cents < 0
	absolute := abs(cents)
	dollars := absolute / 100
	remainder := absolute % 100
	sign := ""
	if negative {
		sign = "-"
	}
	return fmt.sprintf("%s$%d.%02d", sign, dollars, remainder)
}`,

  String.raw`// truncate_middle keeps the head and tail of a long string.
truncate_middle :: proc(s: string, max_len: int) -> string {
	if len(s) <= max_len {
		return s
	}
	keep := (max_len - 1) / 2
	return s[:keep] + "..." + s[len(s) - keep:]
}`,

  String.raw`// wrap_brackets surrounds a value with a configurable pair.
wrap_brackets :: proc(value, open, close: string) -> string {
	return open + value + close
}`,

  String.raw`// prefix_lines prepends a marker to each line of text.
prefix_lines :: proc(text, marker: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for line, i in strings.split_lines(text) {
		if i > 0 {
			strings.write_byte(&b, '\n')
		}
		strings.write_string(&b, marker)
		strings.write_string(&b, line)
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// format_key_value renders "key=value" pairs joined by spaces.
format_key_value :: proc(key, value: string) -> string {
	return fmt.sprintf("%s=%s", key, value)
}`,

  String.raw`// escape_html escapes the five HTML-significant characters.
escape_html :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		switch ch {
		case '&':
			strings.write_string(&b, "&amp;")
		case '<':
			strings.write_string(&b, "&lt;")
		case '>':
			strings.write_string(&b, "&gt;")
		case '"':
			strings.write_string(&b, "&quot;")
		case '\'':
			strings.write_string(&b, "&#39;")
		case:
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// escape_shell_arg quotes an argument for POSIX shells.
escape_shell_arg :: proc(arg: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	strings.write_byte(&b, '\'')
	for ch in arg {
		if ch == '\'' {
			strings.write_string(&b, "'\\''")
		} else {
			strings.write_byte(&b, ch)
		}
	}
	strings.write_byte(&b, '\'')
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// indent_block indents every line including the first.
indent_block :: proc(text: string, indent: int) -> string {
	pad := strings.repeat(" ", indent)
	return prefix_lines(text, pad)
}`,

  String.raw`// join_oxford joins items with commas and a final "and".
join_oxford :: proc(items: []string) -> string {
	if len(items) == 0 {
		return ""
	}
	if len(items) == 1 {
		return items[0]
	}
	if len(items) == 2 {
		return fmt.sprintf("%s and %s", items[0], items[1])
	}
	return strings.join(items[:len(items) - 1], ", ") + ", and " + items[len(items) - 1]
}`,

  String.raw`// pad_center centers text within a width using spaces.
pad_center :: proc(text: string, width: int) -> string {
	if len(text) >= width {
		return text
	}
	left := (width - len(text)) / 2
	right := width - len(text) - left
	return strings.repeat(" ", left) + text + strings.repeat(" ", right)
}`,

  String.raw`// format_number_table aligns a column of numbers right.
format_number_table :: proc(numbers: []int) -> []string {
	if len(numbers) == 0 {
		return nil
	}
	width := 0
	for n in numbers {
		width = max(width, len(strconv.itoa(n)))
	}
	result := make([]string, len(numbers))
	for n, i in numbers {
		result[i] = align_right(strconv.itoa(n), width)
	}
	return result
}`,

  String.raw`// pretty_size renders a byte count with SI grouping.
pretty_size :: proc(bytes: int) -> string {
	return fmt.sprintf("%s bytes", comma_separate(bytes))
}`,
];

// ---------------------------------------------------------------------------
// 10. data_structures.odin
// ---------------------------------------------------------------------------
const data_structures = [
  String.raw`// stack_push places a value on top of a slice-backed stack.
stack_push :: proc(stack: ^[dynamic]int, value: int) {
	append(stack, value)
}`,

  String.raw`// stack_pop removes and returns the top value, if any.
stack_pop :: proc(stack: ^[dynamic]int) -> (int, bool) {
	if len(stack^) == 0 {
		return 0, false
	}
	top := stack[len(stack^) - 1]
	pop(stack)
	return top, true
}`,

  String.raw`// stack_peek returns the top value without removing it.
stack_peek :: proc(stack: ^[dynamic]int) -> (int, bool) {
	if len(stack^) == 0 {
		return 0, false
	}
	return stack[len(stack^) - 1], true
}`,

  String.raw`// stack_is_empty reports whether a stack has no elements.
stack_is_empty :: proc(stack: ^[dynamic]int) -> bool {
	return len(stack^) == 0
}`,

  String.raw`// queue_enqueue appends an item to a queue's backing slice.
queue_enqueue :: proc(queue: ^Queue, value: int) {
	append(&queue.items, value)
}`,

  String.raw`// queue_dequeue removes the oldest item from the queue.
queue_dequeue :: proc(queue: ^Queue) -> (int, bool) {
	if queue.head >= len(queue.items) {
		return 0, false
	}
	value := queue.items[queue.head]
	queue.head += 1
	if queue.head > 1024 && queue.head * 2 > len(queue.items) {
		queue.items = queue.items[queue.head:]
		queue.head = 0
	}
	return value, true
}`,

  String.raw`// queue_peek inspects the oldest item without removing it.
queue_peek :: proc(queue: ^Queue) -> (int, bool) {
	if queue.head >= len(queue.items) {
		return 0, false
	}
	return queue.items[queue.head], true
}`,

  String.raw`// list_append adds a node to the end of a singly linked list.
list_append :: proc(head: ^Node, value: int) -> ^Node {
	node := new(Node)
	node.value = value
	if head == nil {
		return node
	}
	current := head
	for current.next != nil {
		current = current.next
	}
	current.next = node
	return head
}`,

  String.raw`// list_find locates the first node holding a value.
list_find :: proc(head: ^Node, value: int) -> ^Node {
	current := head
	for current != nil {
		if current.value == value {
			return current
		}
		current = current.next
	}
	return nil
}`,

  String.raw`// list_remove deletes the first node holding a value.
list_remove :: proc(head: ^Node, value: int) -> ^Node {
	dummy := new(Node)
	dummy.next = head
	prev := dummy
	current := head
	for current != nil {
		if current.value == value {
			prev.next = current.next
			free(current)
			break
		}
		prev = current
		current = current.next
	}
	return dummy.next
}`,

  String.raw`// list_length counts the nodes in a linked list.
list_length :: proc(head: ^Node) -> int {
	count := 0
	for current := head; current != nil; current = current.next {
		count += 1
	}
	return count
}`,

  String.raw`// list_reverse reverses a linked list in place.
list_reverse :: proc(head: ^Node) -> ^Node {
	var prev: ^Node
	current := head
	for current != nil {
		next := current.next
		current.next = prev
		prev = current
		current = next
	}
	return prev
}`,

  String.raw`// tree_insert adds a value to a binary search tree.
tree_insert :: proc(root: ^TreeNode, value: int) -> ^TreeNode {
	if root == nil {
		node := new(TreeNode)
		node.value = value
		return node
	}
	if value < root.value {
		root.left = tree_insert(root.left, value)
	} else if value > root.value {
		root.right = tree_insert(root.right, value)
	}
	return root
}`,

  String.raw`// tree_search looks up a value in a binary search tree.
tree_search :: proc(root: ^TreeNode, value: int) -> ^TreeNode {
	current := root
	for current != nil {
		if value == current.value {
			return current
		}
		if value < current.value {
			current = current.left
		} else {
			current = current.right
		}
	}
	return nil
}`,

  String.raw`// tree_min returns the smallest value in the tree.
tree_min :: proc(root: ^TreeNode) -> (int, bool) {
	if root == nil {
		return 0, false
	}
	current := root
	for current.left != nil {
		current = current.left
	}
	return current.value, true
}`,

  String.raw`// tree_max returns the largest value in the tree.
tree_max :: proc(root: ^TreeNode) -> (int, bool) {
	if root == nil {
		return 0, false
	}
	current := root
	for current.right != nil {
		current = current.right
	}
	return current.value, true
}`,

  String.raw`// tree_height measures the longest root-to-leaf path.
tree_height :: proc(root: ^TreeNode) -> int {
	if root == nil {
		return 0
	}
	return 1 + max(tree_height(root.left), tree_height(root.right))
}`,

  String.raw`// tree_inorder collects values in sorted order.
tree_inorder :: proc(root: ^TreeNode) -> []int {
	result := make([dynamic]int)
	defer delete(result)
	collect_inorder(root, &result)
	return result[:]
}

// collect_inorder walks a tree in order, appending node values.
collect_inorder :: proc(root: ^TreeNode, result: ^[dynamic]int) {
	if root == nil {
		return
	}
	collect_inorder(root.left, result)
	append(result, root.value)
	collect_inorder(root.right, result)
}`,

  String.raw`// heap_push inserts a value into a binary min-heap.
heap_push :: proc(heap: ^[dynamic]int, value: int) {
	append(heap, value)
	i := len(heap^) - 1
	for i > 0 {
		parent := (i - 1) / 2
		if heap[parent] <= heap[i] {
			break
		}
		heap[parent], heap[i] = heap[i], heap[parent]
		i = parent
	}
}`,

  String.raw`// heap_pop removes the minimum value from a binary min-heap.
heap_pop :: proc(heap: ^[dynamic]int) -> (int, bool) {
	if len(heap^) == 0 {
		return 0, false
	}
	top := heap[0]
	last := pop(heap)
	if len(heap^) > 0 {
		heap[0] = last
		sift_down(heap, 0)
	}
	return top, true
}`,

  String.raw`// heap_peek returns the minimum without removing it.
heap_peek :: proc(heap: ^[dynamic]int) -> (int, bool) {
	if len(heap^) == 0 {
		return 0, false
	}
	return heap[0], true
}`,
];

// ---------------------------------------------------------------------------
// 11. algorithms.odin
// ---------------------------------------------------------------------------
const algorithms = [
  String.raw`// insertion_sort sorts a slice in place by insertion.
insertion_sort :: proc(values: []int) {
	for i in 1 ..< len(values) {
		key := values[i]
		j := i - 1
		for j >= 0 && values[j] > key {
			values[j + 1] = values[j]
			j -= 1
		}
		values[j + 1] = key
	}
}`,

  String.raw`// selection_sort repeatedly selects the smallest remaining element.
selection_sort :: proc(values: []int) {
	for i in 0 ..< len(values) {
		smallest := i
		for j := i + 1; j < len(values); j += 1 {
			if values[j] < values[smallest] {
				smallest = j
			}
		}
		values[i], values[smallest] = values[smallest], values[i]
	}
}`,

  String.raw`// bubble_sort bubbles the largest values to the end.
bubble_sort :: proc(values: []int) {
	n := len(values)
	for i in 0 ..< n {
		swapped := false
		for j in 0 ..< n - i - 1 {
			if values[j] > values[j + 1] {
				values[j], values[j + 1] = values[j + 1], values[j]
				swapped = true
			}
		}
		if !swapped {
			break
		}
	}
}`,

  String.raw`// merge merges two sorted slices into one sorted slice.
merge :: proc(left, right: []int) -> []int {
	result := make([]int, 0, len(left) + len(right))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			append(&result, left[i])
			i += 1
		} else {
			append(&result, right[j])
			j += 1
		}
	}
	for i < len(left) {
		append(&result, left[i])
		i += 1
	}
	for j < len(right) {
		append(&result, right[j])
		j += 1
	}
	return result
}`,

  String.raw`// merge_sort sorts a slice recursively by divide and conquer.
merge_sort :: proc(values: []int) -> []int {
	if len(values) <= 1 {
		return values
	}
	mid := len(values) / 2
	left := merge_sort(values[:mid])
	right := merge_sort(values[mid:])
	return merge(left, right)
}`,

  String.raw`// quick_sort_partition reorders around a pivot and returns its index.
quick_sort_partition :: proc(values: []int, lo, hi: int) -> int {
	pivot := values[hi]
	i := lo - 1
	for j := lo; j < hi; j += 1 {
		if values[j] <= pivot {
			i += 1
			values[i], values[j] = values[j], values[i]
		}
	}
	values[i + 1], values[hi] = values[hi], values[i + 1]
	return i + 1
}`,

  String.raw`// binary_search finds a value in a sorted slice in O(log n).
binary_search :: proc(values: []int, target: int) -> int {
	lo, hi := 0, len(values) - 1
	for lo <= hi {
		mid := lo + (hi - lo) / 2
		if values[mid] == target {
			return mid
		}
		if values[mid] < target {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return -1
}`,

  String.raw`// linear_search scans an unsorted slice for a value.
linear_search :: proc(values: []int, target: int) -> int {
	for v, i in values {
		if v == target {
			return i
		}
	}
	return -1
}`,

  String.raw`// two_sum finds indices of two values that add up to a target.
two_sum :: proc(values: []int, target: int) -> (int, int, bool) {
	seen := make(map[int]int)
	defer delete(seen)
	for v, i in values {
		needed := target - v
		if j, ok := seen[needed]; ok {
			return j, i, true
		}
		seen[v] = i
	}
	return 0, 0, false
}`,

  String.raw`// max_subarray finds the largest sum of a contiguous subarray.
max_subarray :: proc(values: []int) -> int {
	if len(values) == 0 {
		return 0
	}
	best := values[0]
	current := values[0]
	for i in 1 ..< len(values) {
		current = max(values[i], current + values[i])
		best = max(best, current)
	}
	return best
}`,

  String.raw`// longest_increasing_subsequence returns its length (O(n^2)).
longest_increasing_subsequence :: proc(values: []int) -> int {
	if len(values) == 0 {
		return 0
	}
	lengths := make([]int, len(values))
	defer delete(lengths)
	best := 1
	for i in 0 ..< len(values) {
		lengths[i] = 1
		for j in 0 ..< i {
			if values[j] < values[i] {
				lengths[i] = max(lengths[i], lengths[j] + 1)
			}
		}
		best = max(best, lengths[i])
	}
	return best
}`,

  String.raw`// knapsack_01 computes the maximum value under a weight limit.
knapsack_01 :: proc(weights, values: []int, capacity: int) -> int {
	n := len(weights)
	dp := make([]int, capacity + 1)
	defer delete(dp)
	for i in 0 ..< n {
		for w := capacity; w >= weights[i]; w -= 1 {
			dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
		}
	}
	return dp[capacity]
}`,

  String.raw`// edit_distance computes the Levenshtein distance of two strings.
edit_distance :: proc(a, b: string) -> int {
	n, m := len(a), len(b)
	prev := make([]int, m + 1)
	defer delete(prev)
	for j in 0 ..= m {
		prev[j] = j
	}
	for i in 1 ..= n {
		curr := make([]int, m + 1)
		defer delete(curr)
		curr[0] = i
		for j in 1 ..= m {
			cost := 1
			if a[i - 1] == b[j - 1] {
				cost = 0
			}
			curr[j] = min(min(prev[j] + 1, curr[j - 1] + 1), prev[j - 1] + cost)
		}
		prev = curr
	}
	return prev[m]
}`,

  String.raw`// longest_common_subsequence returns its length via DP table.
longest_common_subsequence :: proc(a, b: string) -> int {
	n, m := len(a), len(b)
	table := make([][]int, n + 1)
	defer delete(table)
	for i in 0 ..= n {
		table[i] = make([]int, m + 1)
	}
	for i in 1 ..= n {
		for j in 1 ..= m {
			if a[i - 1] == b[j - 1] {
				table[i][j] = table[i - 1][j - 1] + 1
			} else {
				table[i][j] = max(table[i - 1][j], table[i][j - 1])
			}
		}
	}
	return table[n][m]
}`,

  String.raw`// coin_change_min returns the fewest coins for a target amount.
coin_change_min :: proc(coins: []int, amount: int) -> int {
	inf := 1 << 30
	dp := make([]int, amount + 1)
	defer delete(dp)
	for i in 1 ..= amount {
		dp[i] = inf
	}
	for i in 1 ..= amount {
		for coin in coins {
			if coin <= i && dp[i - coin] + 1 < dp[i] {
				dp[i] = dp[i - coin] + 1
			}
		}
	}
	if dp[amount] == inf {
		return -1
	}
	return dp[amount]
}`,

  String.raw`// is_anagram checks whether two strings reuse the same letters.
is_anagram :: proc(a, b: string) -> bool {
	if len(a) != len(b) {
		return false
	}
	counts := make(map[u8]int)
	defer delete(counts)
	for ch in a {
		counts[ch] += 1
	}
	for ch in b {
		counts[ch] -= 1
		if counts[ch] < 0 {
			return false
		}
	}
	return true
}`,

  String.raw`// majority_element finds the value appearing more than n/2 times.
majority_element :: proc(values: []int) -> (int, bool) {
	candidate := 0
	balance := 0
	for v in values {
		if balance == 0 {
			candidate = v
		}
		if v == candidate {
			balance += 1
		} else {
			balance -= 1
		}
	}
	count := 0
	for v in values {
		if v == candidate {
			count += 1
		}
	}
	if count > len(values) / 2 {
		return candidate, true
	}
	return 0, false
}`,

  String.raw`// rotate_matrix_90 rotates a square matrix clockwise in place.
rotate_matrix_90 :: proc(matrix: [][]int) {
	n := len(matrix)
	for layer in 0 ..< n / 2 {
		for offset in layer ..< n - layer - 1 {
			top := matrix[layer][offset]
			matrix[layer][offset] = matrix[n - 1 - offset][layer]
			matrix[n - 1 - offset][layer] = matrix[n - 1 - layer][n - 1 - offset]
			matrix[n - 1 - layer][n - 1 - offset] = matrix[offset][n - 1 - layer]
			matrix[offset][n - 1 - layer] = top
		}
	}
}`,

  String.raw`// matrix_multiply multiplies two matrices with compatible dims.
matrix_multiply :: proc(a, b: [][]f64) -> ([][]f64, bool) {
	rows := len(a)
	inner := len(a[0])
	cols := len(b[0])
	if inner != len(b) {
		return nil, false
	}
	result := make([][]f64, rows)
	for i in 0 ..< rows {
		result[i] = make([]f64, cols)
		for j in 0 ..< cols {
			sum := 0.0
			for k in 0 ..< inner {
				sum += a[i][k] * b[k][j]
			}
			result[i][j] = sum
		}
	}
	return result, true
}`,

  String.raw`// sieve_of_eratosthenes returns primes up to and including limit.
sieve_of_eratosthenes :: proc(limit: int) -> []int {
	if limit < 2 {
		return nil
	}
	composite := make([]bool, limit + 1)
	defer delete(composite)
	for i := 2; i * i <= limit; i += 1 {
		if !composite[i] {
			for j := i * i; j <= limit; j += i {
				composite[j] = true
			}
		}
	}
	primes := make([dynamic]int)
	defer delete(primes)
	for i := 2; i <= limit; i += 1 {
		if !composite[i] {
			append(&primes, i)
		}
	}
	return primes[:]
}`,

  String.raw`// floyd_cycle detects a cycle in a functional graph of indices.
floyd_cycle :: proc(next: []int) -> bool {
	if len(next) < 2 {
		return false
	}
	slow, fast := 0, 0
	for step in 0 ..= len(next) {
		if slow >= len(next) || fast >= len(next) {
			return false
		}
		slow = next[slow]
		fast = next[fast]
		if fast >= len(next) {
			return false
		}
		fast = next[fast]
		if slow == fast {
			return true
		}
	}
	return false
}`,

  String.raw`// count_inversions counts pairs out of order (naive O(n^2)).
count_inversions :: proc(values: []int) -> int {
	count := 0
	for i in 0 ..< len(values) {
		for j := i + 1; j < len(values); j += 1 {
			if values[i] > values[j] {
				count += 1
			}
		}
	}
	return count
}`,
];

// ---------------------------------------------------------------------------
// 12. threading.odin
// ---------------------------------------------------------------------------
const threading = [
  String.raw`// spawn_worker starts a procedure on a new thread.
spawn_worker :: proc(worker: proc(), label: string) -> (^thread.Thread, bool) {
	t := thread.create(worker)
	if t == nil {
		return nil, false
	}
	t.name = label
	thread.start(t)
	return t, true
}`,

  String.raw`// join_worker waits for a worker thread to finish.
join_worker :: proc(t: ^thread.Thread) -> bool {
	if t == nil {
		return false
	}
	thread.join(t)
	return true
}`,

  String.raw`// release_worker cleans up a finished thread handle.
release_worker :: proc(t: ^thread.Thread) {
	if t != nil {
		thread.destroy(t)
	}
}`,

  String.raw`// mutex_counter_increment bumps a shared counter under a mutex.
mutex_counter_increment :: proc(mutex: ^sync.Mutex, counter: ^int) {
	sync.mutex_lock(mutex)
	counter^ += 1
	sync.mutex_unlock(mutex)
}`,

  String.raw`// mutex_counter_read reads a counter safely under a mutex.
mutex_counter_read :: proc(mutex: ^sync.Mutex, counter: ^int) -> int {
	sync.mutex_lock(mutex)
	value := counter^
	sync.mutex_unlock(mutex)
	return value
}`,

  String.raw`// atomic_counter_increment bumps a counter without a lock.
atomic_counter_increment :: proc(counter: ^int) {
	atomic.add(counter, 1)
}`,

  String.raw`// channel_send pushes a value into a thread channel.
channel_send :: proc(ch: channel.Chan(int), value: int) -> bool {
	ok := channel.send(ch, value)
	return ok
}`,

  String.raw`// channel_receive blocks until a value arrives from a channel.
channel_receive :: proc(ch: channel.Chan(int)) -> (int, bool) {
	value, ok := channel.recv(ch)
	return value, ok
}`,

  String.raw`// channel_try_receive polls a channel without blocking.
channel_try_receive :: proc(ch: channel.Chan(int)) -> (int, bool) {
	value, ok := channel.recv_non_blocking(ch)
	return value, ok
}`,

  String.raw`// worker_pool_run processes jobs across a fixed set of workers.
worker_pool_run :: proc(jobs: []int, worker_count: int) -> int {
	results := make([dynamic]int)
	defer delete(results)
	job_ch := channel.make(chan(int), 8)
	defer channel.destroy(job_ch)
	result_ch := channel.make(chan(int), 8)
	defer channel.destroy(result_ch)
	worker :: proc(data: rawptr) {
		ctx := cast(^Worker_Context)data
		for {
			job, ok := channel.recv(ctx.job_ch)
			if !ok {
				return
			}
			channel.send(ctx.result_ch, job * job)
		}
	}
	contexts := make([]Worker_Context, worker_count)
	defer delete(contexts)
	for i in 0 ..< worker_count {
		contexts[i] = Worker_Context{job_ch = job_ch, result_ch = result_ch}
		thread.create_and_start(worker, &contexts[i])
	}
	for job in jobs {
		channel.send(job_ch, job)
	}
	channel.close(job_ch)
	total := 0
	for i in 0 ..< len(jobs) {
		value, _ := channel.recv(result_ch)
		total += value
	}
	return total
}`,

  String.raw`// parallel_sum splits a slice and sums the halves in two threads.
parallel_sum :: proc(values: []int) -> int {
	if len(values) < 4096 {
		return sum(values)
	}
	mid := len(values) / 2
	left_result: int
	right_result: int
	half_sum :: proc(ctx: rawptr) {
		c := cast(^Half_Context)ctx
		c.result = sum(c.values)
	}
	ctx_left := Half_Context{values = values[:mid]}
	ctx_right := Half_Context{values = values[mid:]}
	t1 := thread.create_and_start(half_sum, &ctx_left)
	t2 := thread.create_and_start(half_sum, &ctx_right)
	thread.join(t1)
	thread.join(t2)
	return ctx_left.result + ctx_right.result
}`,

  String.raw`// once_run executes an initializer exactly once.
once_run :: proc(once: ^sync.Once, initializer: proc()) {
	sync.once_init(once, initializer)
}`,

  String.raw`// safe_cache_set stores a value under a mutex-protected map.
safe_cache_set :: proc(cache: ^Safe_Cache, key: string, value: int) {
	sync.mutex_lock(&cache.mutex)
	cache.entries[key] = value
	sync.mutex_unlock(&cache.mutex)
}`,

  String.raw`// safe_cache_get fetches a value from a thread-safe map.
safe_cache_get :: proc(cache: ^Safe_Cache, key: string) -> (int, bool) {
	sync.mutex_lock(&cache.mutex)
	defer sync.mutex_unlock(&cache.mutex)
	value, ok := cache.entries[key]
	return value, ok
}`,

  String.raw`// barrier_wait synchronizes a fixed group of threads.
barrier_wait :: proc(barrier: ^sync.Barrier) {
	sync.barrier_wait(barrier)
}`,

  String.raw`// run_after_ms sleeps the current thread for a duration.
run_after_ms :: proc(ms: f64) {
	thread.sleep(time.Duration(ms) * time.Millisecond)
}`,

  String.raw`// worker_counter_start spawns N threads that bump a shared counter.
worker_counter_start :: proc(mutex: ^sync.Mutex, counter: ^int, worker_count: int) -> [dynamic]^thread.Thread {
	workers := make([dynamic]^thread.Thread, worker_count)
	for i in 0 ..< worker_count {
		w := thread.create_and_start(
			proc(data: rawptr) {
				ctx := cast(^Counter_Context)data
				for j in 0 ..< 1000 {
					mutex_counter_increment(ctx.mutex, ctx.counter)
				}
			},
			&Counter_Context{mutex = mutex, counter = counter},
		)
		append(&workers, w)
	}
	return workers
}`,

  String.raw`// wait_all joins every thread in a slice.
wait_all :: proc(workers: []^thread.Thread) {
	for w in workers {
		thread.join(w)
	}
}`,

  String.raw`// semaphore_gate limits concurrent access to a resource.
semaphore_gate :: proc(sem: ^sync.Semaphore, run: proc()) {
	sync.semaphore_wait(sem)
	defer sync.semaphore_post(sem)
	run()
}`,

  String.raw`// current_thread_id returns a numeric id for the calling thread.
current_thread_id :: proc() -> u64 {
	return u64(uintptr(thread.current_thread()))
}`,

  String.raw`// is_main_thread detects the primary thread by saved id.
is_main_thread :: proc(main_id: u64) -> bool {
	return current_thread_id() == main_id
}`,
];

// ---------------------------------------------------------------------------
// 13. models.odin
// ---------------------------------------------------------------------------
const models = [
  String.raw`// User models a registered account holder.
User :: struct {
	id:        int,
	name:      string,
	email:     string,
	role:      string,
	is_active: bool,
}`,

  String.raw`// new_user builds a User with sane defaults.
new_user :: proc(name, email, role: string) -> User {
	return User {
		id        = 0,
		name      = name,
		email     = email,
		role      = role,
		is_active = true,
	}
}`,

  String.raw`// validate_user checks the invariants of a User record.
validate_user :: proc(user: User) -> (bool, string) {
	if len(user.name) < 2 {
		return false, "name too short"
	}
	if !is_email(user.email) {
		return false, "invalid email"
	}
	if user.role != "admin" && user.role != "editor" && user.role != "viewer" {
		return false, "unknown role"
	}
	return true, ""
}`,

  String.raw`// Order records a customer purchase with line item count.
Order :: struct {
	id:         int,
	customer:   string,
	item_count: int,
	total_cents: int,
	status:     string,
}`,

  String.raw`// new_order creates an Order in the pending state.
new_order :: proc(customer: string) -> Order {
	return Order {
		id          = 0,
		customer    = customer,
		item_count  = 0,
		total_cents = 0,
		status      = "pending",
	}
}`,

  String.raw`// validate_order ensures an Order is shippable.
validate_order :: proc(order: Order) -> (bool, string) {
	if order.item_count < 1 {
		return false, "empty order"
	}
	if order.total_cents <= 0 {
		return false, "zero total"
	}
	if order.status != "pending" && order.status != "paid" && order.status != "shipped" {
		return false, "bad status"
	}
	return true, ""
}`,

  String.raw`// Product describes an item in the catalog.
Product :: struct {
	sku:         string,
	name:        string,
	price_cents: int,
	stock:       int,
	weight_g:    int,
}`,

  String.raw`// new_product creates a Product with zero stock.
new_product :: proc(sku, name: string, price_cents: int) -> Product {
	return Product {
		sku         = sku,
		name        = name,
		price_cents = price_cents,
		stock       = 0,
		weight_g    = 0,
	}
}`,

  String.raw`// validate_product checks catalog invariants for a Product.
validate_product :: proc(product: Product) -> (bool, string) {
	if len(product.sku) < 3 {
		return false, "sku too short"
	}
	if product.price_cents <= 0 {
		return false, "price must be positive"
	}
	if product.stock < 0 || product.weight_g < 0 {
		return false, "negative quantity"
	}
	return true, ""
}`,

  String.raw`// Invoice aggregates billed line amounts for an order.
Invoice :: struct {
	number:       string,
	order_id:     int,
	subtotal:     int,
	tax:          int,
	total:        int,
	is_paid:      bool,
}`,

  String.raw`// new_invoice computes tax and total for a subtotal.
new_invoice :: proc(number: string, order_id, subtotal: int, tax_rate: f64) -> Invoice {
	tax := int(f64(subtotal) * tax_rate)
	return Invoice {
		number   = number,
		order_id = order_id,
		subtotal = subtotal,
		tax      = tax,
		total    = subtotal + tax,
		is_paid  = false,
	}
}`,

  String.raw`// validate_invoice checks that an invoice balances.
validate_invoice :: proc(invoice: Invoice) -> (bool, string) {
	if invoice.total != invoice.subtotal + invoice.tax {
		return false, "total does not balance"
	}
	if invoice.subtotal < 0 || invoice.tax < 0 {
		return false, "negative amount"
	}
	return true, ""
}`,

  String.raw`// Account holds a balance and a daily transaction limit.
Account :: struct {
	id:        int,
	owner:     string,
	balance:   int,
	limit:     int,
	currency:  string,
}`,

  String.raw`// new_account opens an account with an opening deposit.
new_account :: proc(owner: string, opening_balance: int) -> Account {
	return Account {
		id       = 0,
		owner    = owner,
		balance  = opening_balance,
		limit    = 1_000_00,
		currency = "USD",
	}
}`,

  String.raw`// validate_account ensures account fields are coherent.
validate_account :: proc(account: Account) -> (bool, string) {
	if len(account.owner) == 0 {
		return false, "owner required"
	}
	if account.balance < 0 {
		return false, "negative balance"
	}
	if account.limit < 0 {
		return false, "negative limit"
	}
	return true, ""
}`,

  String.raw`// Booking reserves a resource for a time window.
Booking :: struct {
	id:          int,
	resource:    string,
	date:        string,
	start_hour:  int,
	end_hour:    int,
	status:      string,
}`,

  String.raw`// new_booking creates a pending reservation.
new_booking :: proc(resource, date: string, start_hour, end_hour: int) -> Booking {
	return Booking {
		id         = 0,
		resource   = resource,
		date       = date,
		start_hour = start_hour,
		end_hour   = end_hour,
		status     = "pending",
	}
}`,

  String.raw`// validate_booking checks that a booking window is sane.
validate_booking :: proc(booking: Booking) -> (bool, string) {
	if booking.end_hour <= booking.start_hour {
		return false, "window must end after it starts"
	}
	if booking.start_hour < 0 || booking.end_hour > 24 {
		return false, "hour out of range"
	}
	if len(booking.date) != 10 {
		return false, "invalid date"
	}
	return true, ""
}`,

  String.raw`// Task represents a unit of work with priority and effort.
Task :: struct {
	id:          int,
	title:       string,
	priority:    int,
	estimate:    int,
	status:      string,
	assignee:    string,
}`,

  String.raw`// new_task creates a backlog task with default priority.
new_task :: proc(title, assignee: string) -> Task {
	return Task {
		id       = 0,
		title    = title,
		priority = 3,
		estimate = 1,
		status   = "backlog",
		assignee = assignee,
	}
}`,

  String.raw`// validate_task checks that a task can be scheduled.
validate_task :: proc(task: Task) -> (bool, string) {
	if len(task.title) == 0 {
		return false, "title required"
	}
	if task.priority < 1 || task.priority > 5 {
		return false, "priority must be 1..5"
	}
	if task.estimate < 1 {
		return false, "estimate must be positive"
	}
	return true, ""
}`,
];

// ---------------------------------------------------------------------------
// 14. time_utils.odin
// ---------------------------------------------------------------------------
const time_utils = [
  String.raw`// unix_now returns the current Unix timestamp in seconds.
unix_now :: proc() -> i64 {
	return time.time_to_unix(time.now())
}`,

  String.raw`// to_iso_date formats a Time as YYYY-MM-DD.
to_iso_date :: proc(t: time.Time) -> string {
	return fmt.sprintf("%04d-%02d-%02d", t.year, t.month, t.day)
}`,

  String.raw`// is_leap_year checks the Gregorian leap-year rule.
is_leap_year :: proc(year: int) -> bool {
	if year % 400 == 0 {
		return true
	}
	if year % 100 == 0 {
		return false
	}
	return year % 4 == 0
}`,

  String.raw`// days_in_month returns the day count for a month and year.
days_in_month :: proc(year, month: int) -> int {
	switch month {
	case 1, 3, 5, 7, 8, 10, 12:
		return 31
	case 4, 6, 9, 11:
		return 30
	case 2:
		if is_leap_year(year) {
			return 29
		}
		return 28
	case:
		return 0
	}
}`,

  String.raw`// day_of_week returns 0 for Monday .. 6 for Sunday (Zeller-free).
day_of_week :: proc(year, month, day: int) -> int {
	// Sakamoto's algorithm.
	y := year
	if month < 3 {
		y -= 1
	}
	t := []int{0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4}
	return (y + y / 4 - y / 100 + y / 400 + t[month - 1] + day) % 7
}`,

  String.raw`// add_days shifts a Time forward by a number of days.
add_days :: proc(t: time.Time, days: int) -> time.Time {
	return time.time_add(t, time.Duration(days) * 24 * time.Hour)
}`,

  String.raw`// diff_days returns the whole days between two times.
diff_days :: proc(later, earlier: time.Time) -> int {
	delta := time.diff(earlier, later)
	return int(delta / (24 * time.Hour))
}`,

  String.raw`// format_hhmm renders a Time as HH:MM.
format_hhmm :: proc(t: time.Time) -> string {
	return fmt.sprintf("%02d:%02d", t.hour, t.minute)
}`,

  String.raw`// seconds_to_hhmmss splits a duration into clock text.
seconds_to_hhmmss :: proc(total: int) -> string {
	hours := total / 3600
	minutes := (total % 3600) / 60
	seconds := total % 60
	return fmt.sprintf("%02d:%02d:%02d", hours, minutes, seconds)
}`,

  String.raw`// month_name returns the English name of a month number.
month_name :: proc(month: int) -> string {
	names := []string{"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"}
	if month < 1 || month > 12 {
		return ""
	}
	return names[month - 1]
}`,

  String.raw`// is_weekend reports Saturday or Sunday by weekday number.
is_weekend :: proc(year, month, day: int) -> bool {
	weekday := day_of_week(year, month, day)
	return weekday == 5 || weekday == 6
}`,

  String.raw`// start_of_day zeroes the clock fields of a Time.
start_of_day :: proc(t: time.Time) -> time.Time {
	t.hour = 0
	t.minute = 0
	t.second = 0
	t.nanosecond = 0
	return t
}`,

  String.raw`// end_of_day sets a Time to 23:59:59.
end_of_day :: proc(t: time.Time) -> time.Time {
	t.hour = 23
	t.minute = 59
	t.second = 59
	t.nanosecond = 0
	return t
}`,

  String.raw`// age_from_birthdate computes whole years since a birth date.
age_from_birthdate :: proc(birth_year, birth_month, birth_day: int) -> int {
	now := time.now()
	age := now.year - birth_year
	if now.month < birth_month || (now.month == birth_month && now.day < birth_day) {
		age -= 1
	}
	return age
}`,

  String.raw`// unix_to_date_parts breaks a timestamp into calendar fields.
unix_to_date_parts :: proc(seconds: i64) -> (year, month, day, hour, minute: int) {
	t := time.unix_to_time(seconds)
	return t.year, t.month, t.day, t.hour, t.minute
}`,

  String.raw`// seconds_until_deadline measures remaining time from now.
seconds_until_deadline :: proc(deadline: time.Time) -> i64 {
	return max(i64(time.diff(time.now(), deadline) / time.Second), 0)
}`,

  String.raw`// next_weekday advances a date to the next given weekday.
next_weekday :: proc(year, month, day, target: int) -> (int, int, int) {
	current := day_of_week(year, month, day)
	delta := (target - current + 7) % 7
	if delta == 0 {
		delta = 7
	}
	t := time.Time{year = year, month = month, day = day}
	t = add_days(t, delta)
	return t.year, t.month, t.day
}`,

  String.raw`// minutes_since_midnight converts a clock to minutes.
minutes_since_midnight :: proc(hour, minute: int) -> int {
	return hour * 60 + minute
}`,

  String.raw`// iso_to_unix parses "YYYY-MM-DD" into a Unix timestamp.
iso_to_unix :: proc(iso: string) -> (i64, bool) {
	if len(iso) != 10 {
		return 0, false
	}
	year, ok1 := strconv.parse_int(iso[0:4])
	month, ok2 := strconv.parse_int(iso[5:7])
	day, ok3 := strconv.parse_int(iso[8:10])
	if !ok1 || !ok2 || !ok3 {
		return 0, false
	}
	if month < 1 || month > 12 || day < 1 || day > days_in_month(year, month) {
		return 0, false
	}
	t := time.Time{year = year, month = month, day = day}
	return time.time_to_unix(t), true
}`,

  String.raw`// relative_label describes how long ago a time was.
relative_label :: proc(t: time.Time) -> string {
	seconds := i64(time.diff(t, time.now()) / time.Second)
	switch {
	case seconds < 60:
		return "just now"
	case seconds < 3600:
		return fmt.sprintf("%dm ago", seconds / 60)
	case seconds < 86400:
		return fmt.sprintf("%dh ago", seconds / 3600)
	case:
		return fmt.sprintf("%dd ago", seconds / 86400)
	}
}`,

  String.raw`// hours_between returns the fractional hours between two times.
hours_between :: proc(from, to: time.Time) -> f64 {
	delta := time.diff(from, to)
	return f64(delta) / f64(time.Hour)
}`,
];

// ---------------------------------------------------------------------------
// 15. geometry.odin
// ---------------------------------------------------------------------------
const geometry = [
  String.raw`// Vec2 is a 2D vector.
Vec2 :: struct {
	x: f64,
	y: f64,
}`,

  String.raw`// Vec3 is a 3D vector.
Vec3 :: struct {
	x: f64,
	y: f64,
	z: f64,
}`,

  String.raw`// Rect is an axis-aligned rectangle.
Rect :: struct {
	x:      f64,
	y:      f64,
	width:  f64,
	height: f64,
}`,

  String.raw`// vec2_add sums two 2D vectors component-wise.
vec2_add :: proc(a, b: Vec2) -> Vec2 {
	return Vec2{a.x + b.x, a.y + b.y}
}`,

  String.raw`// vec2_sub subtracts b from a component-wise.
vec2_sub :: proc(a, b: Vec2) -> Vec2 {
	return Vec2{a.x - b.x, a.y - b.y}
}`,

  String.raw`// vec2_dot computes the dot product of two 2D vectors.
vec2_dot :: proc(a, b: Vec2) -> f64 {
	return a.x * b.x + a.y * b.y
}`,

  String.raw`// vec2_length returns the Euclidean magnitude.
vec2_length :: proc(v: Vec2) -> f64 {
	return math.sqrt(v.x * v.x + v.y * v.y)
}`,

  String.raw`// vec2_normalize returns a unit vector, or zero for the zero vector.
vec2_normalize :: proc(v: Vec2) -> Vec2 {
	length := vec2_length(v)
	if length == 0 {
		return Vec2{}
	}
	return Vec2{v.x / length, v.y / length}
}`,

  String.raw`// vec2_scale multiplies a vector by a scalar.
vec2_scale :: proc(v: Vec2, factor: f64) -> Vec2 {
	return Vec2{v.x * factor, v.y * factor}
}`,

  String.raw`// vec3_dot computes the dot product of two 3D vectors.
vec3_dot :: proc(a, b: Vec3) -> f64 {
	return a.x * b.x + a.y * b.y + a.z * b.z
}`,

  String.raw`// vec3_cross computes the cross product of two 3D vectors.
vec3_cross :: proc(a, b: Vec3) -> Vec3 {
	return Vec3 {
		a.y * b.z - a.z * b.y,
		a.z * b.x - a.x * b.z,
		a.x * b.y - a.y * b.x,
	}
}`,

  String.raw`// distance_2d measures the straight-line distance between points.
distance_2d :: proc(a, b: Vec2) -> f64 {
	dx := a.x - b.x
	dy := a.y - b.y
	return math.sqrt(dx * dx + dy * dy)
}`,

  String.raw`// midpoint_2d averages two points.
midpoint_2d :: proc(a, b: Vec2) -> Vec2 {
	return Vec2{(a.x + b.x) / 2, (a.y + b.y) / 2}
}`,

  String.raw`// rect_contains tests whether a point lies inside a rectangle.
rect_contains :: proc(r: Rect, p: Vec2) -> bool {
	return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
}`,

  String.raw`// circle_area computes the area of a circle by radius.
circle_area :: proc(radius: f64) -> f64 {
	return math.PI * radius * radius
}`,

  String.raw`// circle_contains tests point membership in a circle.
circle_contains :: proc(cx, cy, radius: f64, p: Vec2) -> bool {
	dx := p.x - cx
	dy := p.y - cy
	return dx * dx + dy * dy <= radius * radius
}`,

  String.raw`// triangle_area_heron computes area from three side lengths.
triangle_area_heron :: proc(a, b, c: f64) -> f64 {
	s := (a + b + c) / 2
	return math.sqrt(max(s * (s - a) * (s - b) * (s - c), 0))
}`,

  String.raw`// polygon_area computes the signed area via the shoelace formula.
polygon_area :: proc(points: []Vec2) -> f64 {
	sum := 0.0
	n := len(points)
	if n < 3 {
		return 0
	}
	for i in 0 ..< n {
		j := (i + 1) % n
		sum += points[i].x * points[j].y - points[j].x * points[i].y
	}
	return abs(sum) / 2
}`,

  String.raw`// centroid_2d averages a set of points into one.
centroid_2d :: proc(points: []Vec2) -> Vec2 {
	if len(points) == 0 {
		return Vec2{}
	}
	total := Vec2{}
	for p in points {
		total.x += p.x
		total.y += p.y
	}
	return Vec2{total.x / f64(len(points)), total.y / f64(len(points))}
}`,

  String.raw`// reflect mirrors a vector across a unit normal.
reflect :: proc(v, normal: Vec2) -> Vec2 {
	dot := vec2_dot(v, normal)
	return Vec2{v.x - 2 * dot * normal.x, v.y - 2 * dot * normal.y}
}`,

  String.raw`// project yields the scalar projection of a onto b.
project :: proc(a, b: Vec2) -> f64 {
	length_b := vec2_length(b)
	if length_b == 0 {
		return 0
	}
	return vec2_dot(a, b) / length_b
}`,

  String.raw`// angle_between returns the angle between two vectors in radians.
angle_between :: proc(a, b: Vec2) -> f64 {
	length_a := vec2_length(a)
	length_b := vec2_length(b)
	if length_a == 0 || length_b == 0 {
		return 0
	}
	cosine := clamp(vec2_dot(a, b) / (length_a * length_b), -1, 1)
	return math.acos(cosine)
}`,
];

// ---------------------------------------------------------------------------
// 16. encoding.odin
// ---------------------------------------------------------------------------
const encoding = [
  String.raw`// to_hex encodes bytes as lowercase hexadecimal text.
to_hex :: proc(data: []u8) -> string {
	digits := "0123456789abcdef"
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for byte in data {
		strings.write_byte(&b, digits[byte >> 4])
		strings.write_byte(&b, digits[byte & 0x0F])
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// from_hex decodes hexadecimal text back into bytes.
from_hex :: proc(hex: string) -> ([]u8, bool) {
	if len(hex) % 2 != 0 {
		return nil, false
	}
	result := make([]u8, len(hex) / 2)
	for i in 0 ..< len(hex) / 2 {
		hi := hex_value(hex[i * 2])
		lo := hex_value(hex[i * 2 + 1])
		if hi < 0 || lo < 0 {
			return nil, false
		}
		result[i] = u8(hi * 16 + lo)
	}
	return result, true
}`,

  String.raw`// to_base64 encodes bytes using the standard alphabet.
to_base64 :: proc(data: []u8) -> string {
	alphabet := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i := 0; i < len(data); i += 3 {
		chunk := u32(data[i]) << 16
		bytes := 1
		if i + 1 < len(data) {
			chunk |= u32(data[i + 1]) << 8
			bytes = 2
		}
		if i + 2 < len(data) {
			chunk |= u32(data[i + 2])
			bytes = 3
		}
		strings.write_byte(&b, alphabet[(chunk >> 18) & 0x3F])
		strings.write_byte(&b, alphabet[(chunk >> 12) & 0x3F])
		if bytes >= 2 {
			strings.write_byte(&b, alphabet[(chunk >> 6) & 0x3F])
		} else {
			strings.write_byte(&b, '=')
		}
		if bytes >= 3 {
			strings.write_byte(&b, alphabet[chunk & 0x3F])
		} else {
			strings.write_byte(&b, '=')
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// base64_value maps one base64 character to its 6-bit value.
base64_value :: proc(ch: u8) -> int {
	if ch >= 'A' && ch <= 'Z' {
		return int(ch - 'A')
	}
	if ch >= 'a' && ch <= 'z' {
		return int(ch - 'a') + 26
	}
	if ch >= '0' && ch <= '9' {
		return int(ch - '0') + 52
	}
	if ch == '+' {
		return 62
	}
	if ch == '/' {
		return 63
	}
	return -1
}`,

  String.raw`// from_base64 decodes standard base64 text into bytes.
from_base64 :: proc(text: string) -> ([]u8, bool) {
	result := make([dynamic]u8)
	defer delete(result)
	buffer: u32 = 0
	bits := 0
	for ch in text {
		if ch == '=' || ch == '\n' || ch == '\r' {
			continue
		}
		value := base64_value(ch)
		if value < 0 {
			return nil, false
		}
		buffer = (buffer << 6) | u32(value)
		bits += 6
		if bits >= 8 {
			bits -= 8
			append(&result, u8((buffer >> bits) & 0xFF))
		}
	}
	return result[:], true
}`,

  String.raw`// json_escape escapes a string for embedding in JSON.
json_escape :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in s {
		switch ch {
		case '"':
			strings.write_string(&b, "\\\"")
		case '\\':
			strings.write_string(&b, "\\\\")
		case '\n':
			strings.write_string(&b, "\\n")
		case '\t':
			strings.write_string(&b, "\\t")
		case '\r':
			strings.write_string(&b, "\\r")
		case:
			if ch < 0x20 {
				strings.write_string(&b, fmt.sprintf("\\u%04x", u32(ch)))
			} else {
				strings.write_byte(&b, ch)
			}
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// json_unescape reverses JSON escape sequences in a string.
json_unescape :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i := 0; i < len(s); i += 1 {
		if s[i] == '\\' && i + 1 < len(s) {
			i += 1
			switch s[i] {
			case 'n':
				strings.write_byte(&b, '\n')
			case 't':
				strings.write_byte(&b, '\t')
			case 'r':
				strings.write_byte(&b, '\r')
			case '"':
				strings.write_byte(&b, '"')
			case '\\':
				strings.write_byte(&b, '\\')
			case:
				strings.write_byte(&b, '\\')
				strings.write_byte(&b, s[i])
			}
		} else {
			strings.write_byte(&b, s[i])
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// csv_escape quotes a field when it contains special characters.
csv_escape :: proc(field: string) -> string {
	needs_quotes := strings.contains(field, ",") || strings.contains(field, "\"") || strings.contains(field, "\n")
	if !needs_quotes {
		return field
	}
	return "\"" + strings.replace_all(field, "\"", "\"\"") + "\""
}`,

  String.raw`// xml_escape encodes the five XML entities.
xml_escape :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		switch ch {
		case '&':
			strings.write_string(&b, "&amp;")
		case '<':
			strings.write_string(&b, "&lt;")
		case '>':
			strings.write_string(&b, "&gt;")
		case '"':
			strings.write_string(&b, "&quot;")
		case '\'':
			strings.write_string(&b, "&apos;")
		case:
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// xml_unescape decodes the five standard XML entities.
xml_unescape :: proc(text: string) -> string {
	result := strings.replace_all(text, "&lt;", "<")
	result = strings.replace_all(result, "&gt;", ">")
	result = strings.replace_all(result, "&quot;", "\"")
	result = strings.replace_all(result, "&apos;", "'")
	result = strings.replace_all(result, "&amp;", "&")
	return result
}`,

  `// markdown_escape neutralises markdown punctuation.
markdown_escape :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		switch ch {
		case '\\', '\`', '*', '_', '{', '}', '[', ']', '(', ')', '#', '+', '-', '.', '!':
			strings.write_byte(&b, '\\')
			strings.write_byte(&b, ch)
		case:
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// regex_escape escapes metacharacters for use in a literal regex.
regex_escape :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		if strings.contains(".^$*+?()[]{}|\\", string(rune(ch))) {
			strings.write_byte(&b, '\\')
		}
		strings.write_byte(&b, ch)
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// run_length_encode compresses repeated bytes as count+byte pairs.
run_length_encode :: proc(data: []u8) -> []u8 {
	result := make([dynamic]u8)
	defer delete(result)
	i := 0
	for i < len(data) {
		j := i
		for j < len(data) && j - i < 255 && data[j] == data[i] {
			j += 1
		}
		append(&result, u8(j - i))
		append(&result, data[i])
		i = j
	}
	return result[:]
}`,

  String.raw`// run_length_decode reverses run-length encoded bytes.
run_length_decode :: proc(data: []u8) -> ([]u8, bool) {
	result := make([dynamic]u8)
	defer delete(result)
	i := 0
	for i < len(data) {
		count := int(data[i])
		if i + 1 >= len(data) {
			return nil, false
		}
		for j in 0 ..< count {
			append(&result, data[i + 1])
		}
		i += 2
	}
	return result[:], true
}`,

  String.raw`// hamming_distance counts differing bits between two bytes.
hamming_distance :: proc(a, b: u8) -> int {
	xor := a ~ b
	count := 0
	for xor != 0 {
		count += int(xor & 1)
		xor >>= 1
	}
	return count
}`,

  String.raw`// xor_obfuscate scrambles bytes with a repeating key.
xor_obfuscate :: proc(data: []u8, key: []u8) -> []u8 {
	if len(key) == 0 {
		return data
	}
	result := make([]u8, len(data))
	for byte, i in data {
		result[i] = byte ~ key[i % len(key)]
	}
	return result
}`,

  String.raw`// xor_deobfuscate reverses xor_obfuscate (symmetric cipher).
xor_deobfuscate :: proc(data: []u8, key: []u8) -> []u8 {
	return xor_obfuscate(data, key)
}`,

  String.raw`// vigenere_encrypt shifts letters using a repeating keyword.
vigenere_encrypt :: proc(plain, key: string) -> string {
	if len(key) == 0 {
		return plain
	}
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	key_index := 0
	for ch in plain {
		if ch >= 'a' && ch <= 'z' {
			shift := key[key_index % len(key)] - 'a'
			strings.write_byte(&b, 'a' + (ch - 'a' + shift) % 26)
			key_index += 1
		} else {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// vigenere_decrypt reverses a Vigenere-encrypted string.
vigenere_decrypt :: proc(cipher, key: string) -> string {
	if len(key) == 0 {
		return cipher
	}
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	key_index := 0
	for ch in cipher {
		if ch >= 'a' && ch <= 'z' {
			shift := key[key_index % len(key)] - 'a'
			strings.write_byte(&b, 'a' + (ch - 'a' - shift + 26) % 26)
			key_index += 1
		} else {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// binary_encode renders bytes as a space-separated bit string.
binary_encode :: proc(data: []u8) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for byte, i in data {
		if i > 0 {
			strings.write_byte(&b, ' ')
		}
		for bit := 7; bit >= 0; bit -= 1 {
			strings.write_byte(&b, '0' + ((byte >> u8(bit)) & 1))
		}
	}
	return strings.clone(strings.to_string(b))
}`,

  String.raw`// binary_decode parses a space-separated bit string back to bytes.
binary_decode :: proc(text: string) -> ([]u8, bool) {
	parts := strings.fields(text)
	result := make([]u8, len(parts))
	for part, i in parts {
		if len(part) != 8 {
			return nil, false
		}
		value: u8 = 0
		for j in 0 ..< 8 {
			if part[j] != '0' && part[j] != '1' {
				return nil, false
			}
			value = value << 1 | (part[j] - '0')
		}
		result[i] = value
	}
	return result, true
}`,

  String.raw`// rot47 applies the printable-ASCII rotation cipher.
rot47 :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		if ch >= 33 && ch <= 126 {
			strings.write_byte(&b, 33 + (ch - 33 + 47) % 94)
		} else {
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}`,
];

files.push(
  { name: 'formatting.odin', header: String.raw`package formatting

import "core:fmt"
import "core:strconv"
import "core:strings"`, procs: formatting },
  { name: 'data_structures.odin', header: String.raw`package data_structures

Queue :: struct {
	items: [dynamic]int,
	head:  int,
}

Node :: struct {
	value: int,
	next:  ^Node,
}

TreeNode :: struct {
	value: int,
	left:  ^TreeNode,
	right: ^TreeNode,
}`, procs: data_structures },
  { name: 'algorithms.odin', header: String.raw`package algorithms`, procs: algorithms },
  { name: 'threading.odin', header: String.raw`package threading

import "core:sync"
import "core:sync/atomic"
import "core:thread"
import "core:thread/channel"
import "core:time"

Worker_Context :: struct {
	job_ch:    channel.Chan(int),
	result_ch: channel.Chan(int),
}

Half_Context :: struct {
	values: []int,
	result: int,
}

Counter_Context :: struct {
	mutex:   ^sync.Mutex,
	counter: ^int,
}

Safe_Cache :: struct {
	mutex:   sync.Mutex,
	entries: map[string]int,
}`, procs: threading },
  { name: 'models.odin', header: String.raw`package models`, procs: models },
  { name: 'time_utils.odin', header: String.raw`package time_utils

import "core:fmt"
import "core:strconv"
import "core:time"`, procs: time_utils },
  { name: 'geometry.odin', header: String.raw`package geometry

import "core:math"`, procs: geometry },
  { name: 'encoding.odin', header: String.raw`package encoding

import "core:fmt"
import "core:strings"`, procs: encoding },
);

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------
let total = 0;
for (const f of files) {
  const body = f.procs.join('\n\n');
  const source = `${f.header}\n\n${body}\n`;
  fs.writeFileSync(path.join(outDir, f.name), source);
  total += f.procs.length;
  console.log(`${f.name}: ${f.procs.length} procs`);
}
console.log(`Wrote ${files.length} Odin files, ${total} procs total -> ${outDir}`);
