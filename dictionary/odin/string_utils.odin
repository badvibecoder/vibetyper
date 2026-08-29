package string_utils

import "core:strings"

// is_blank reports whether a string is empty or only whitespace.
is_blank :: proc(s: string) -> bool {
	for ch in s {
		if ch != ' ' && ch != '\t' && ch != '\r' && ch != '\n' {
			return false
		}
	}
	return true
}

// count_char counts occurrences of a specific byte in a string.
count_char :: proc(s: string, target: u8) -> int {
	count := 0
	for ch in s {
		if ch == target {
			count += 1
		}
	}
	return count
}

// reverse returns a new string with the bytes in reverse order.
reverse :: proc(s: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for i := len(s) - 1; i >= 0; i -= 1 {
		strings.write_byte(&b, s[i])
	}
	return strings.clone(strings.to_string(b))
}

// to_upper_ascii converts ASCII letters to upper case in place.
to_upper_ascii :: proc(s: string) -> string {
	bytes := transmute([]u8)(s)
	for i in 0 ..< len(bytes) {
		if bytes[i] >= 'a' && bytes[i] <= 'z' {
			bytes[i] -= 32
		}
	}
	return s
}

// to_lower_ascii converts ASCII letters to lower case in place.
to_lower_ascii :: proc(s: string) -> string {
	bytes := transmute([]u8)(s)
	for i in 0 ..< len(bytes) {
		if bytes[i] >= 'A' && bytes[i] <= 'Z' {
			bytes[i] += 32
		}
	}
	return s
}

// trim_space strips leading and trailing whitespace.
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
}

// split_csv splits a line into fields on commas, trimming each field.
split_csv :: proc(line: string) -> []string {
	fields := strings.split(line, ",")
	defer delete(fields)
	result := make([]string, len(fields))
	for field, i in fields {
		result[i] = strings.trim_space(field)
	}
	return result
}

// join_with joins parts with a separator, skipping empty parts.
join_with :: proc(parts: []string, sep: string) -> string {
	filtered := make([dynamic]string)
	defer delete(filtered)
	for part in parts {
		if len(part) > 0 {
			append(&filtered, part)
		}
	}
	return strings.join(filtered[:], sep)
}

// contains_any reports whether s contains any of the given substrings.
contains_any :: proc(s: string, needles: []string) -> bool {
	for needle in needles {
		if strings.contains(s, needle) {
			return true
		}
	}
	return false
}

// count_occurrences counts non-overlapping occurrences of a substring.
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
}

// first_word returns everything up to the first space.
first_word :: proc(s: string) -> string {
	for i in 0 ..< len(s) {
		if s[i] == ' ' {
			return s[:i]
		}
	}
	return s
}

// strip_prefix removes a leading prefix if present.
strip_prefix :: proc(s: string, prefix: string) -> string {
	if strings.has_prefix(s, prefix) {
		return s[len(prefix):]
	}
	return s
}

// replace_all replaces every occurrence of old with new.
replace_all :: proc(s, old, new: string) -> string {
	return strings.replace_all(s, old, new)
}

// is_digit_string reports whether every byte is an ASCII digit.
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
}

// pad_left pads s on the left with pad up to total length.
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
}

// snake_to_camel converts snake_case to camelCase.
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
}

// camel_to_snake converts camelCase to snake_case.
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
}

// hash_djb2 computes a 32-bit hash of a string (DJB2 variant).
hash_djb2 :: proc(s: string) -> u32 {
	hash: u32 = 5381
	for ch in s {
		hash = (hash << 5) + hash + u32(ch)
	}
	return hash
}

// line_count counts the number of lines in a block of text.
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
}

// truncate shortens a string to max runes worth of bytes with an ellipsis.
truncate :: proc(s: string, max_bytes: int) -> string {
	if len(s) <= max_bytes {
		return s
	}
	if max_bytes <= 3 {
		return s[:max_bytes]
	}
	return s[:max_bytes - 3] + "..."
}

// extract_numbers pulls every digit run out of a string as integers.
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
}

// last_path_segment returns the text after the final '/' or '\\'.
last_path_segment :: proc(s: string) -> string {
	for i := len(s) - 1; i >= 0; i -= 1 {
		if s[i] == '/' || s[i] == '\\' {
			return s[i + 1:]
		}
	}
	return s
}
