package validation

import "core:strconv"
import "core:strings"

// is_email does a light structural email check.
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
}

// is_phone_number accepts 7-15 digits with optional +, -, spaces.
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
}

// is_url checks for a scheme://host shape.
is_url :: proc(s: string) -> bool {
	if !strings.has_prefix(s, "http://") && !strings.has_prefix(s, "https://") {
		return false
	}
	rest := s[strings.index(s, "://") + 3:]
	return len(rest) > 0 && !strings.contains(rest, " ")
}

// is_ipv4 validates a dotted-quad IPv4 address.
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
}

// is_strong_password enforces length, case, digit and symbol rules.
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
}

// is_luhn_valid checks a card number with the Luhn checksum.
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
}

// is_date_iso validates a YYYY-MM-DD date string.
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
}

// is_hex_color accepts #RGB or #RRGGBB form.
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
}

// is_username enforces 3-20 chars, alphanumeric plus _ and -.
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
}

// is_sorted checks that a slice is in non-decreasing order.
is_sorted :: proc(values: []f64) -> bool {
	for i in 1 ..< len(values) {
		if values[i] < values[i - 1] {
			return false
		}
	}
	return true
}

// is_in_range checks a value against inclusive bounds.
is_in_range :: proc(value, low, high: f64) -> bool {
	return value >= low && value <= high
}

// is_non_empty rejects strings that are blank after trimming.
is_non_empty :: proc(s: string) -> bool {
	return len(strings.trim_space(s)) > 0
}

// has_min_length checks the trimmed length against a floor.
has_min_length :: proc(s: string, minimum: int) -> bool {
	return len(s) >= minimum
}

// is_ascii verifies every byte fits in 7-bit ASCII.
is_ascii :: proc(s: string) -> bool {
	for ch in s {
		if ch > 127 {
			return false
		}
	}
	return true
}

// is_numeric_string accepts optional sign, digits and one decimal point.
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
}

// is_boolean_string accepts true/false/yes/no/1/0.
is_boolean_string :: proc(s: string) -> bool {
	lower := strings.to_lower(strings.trim_space(s))
	switch lower {
	case "true", "false", "yes", "no", "1", "0":
		return true
	case:
		return false
	}
}

// is_one_of checks membership in a fixed set of choices.
is_one_of :: proc(value: string, choices: []string) -> bool {
	for choice in choices {
		if value == choice {
			return true
		}
	}
	return false
}

// is_valid_percent checks a value in the inclusive 0..100 range.
is_valid_percent :: proc(value: f64) -> bool {
	return value >= 0 && value <= 100
}

// is_valid_identifier checks a C-like identifier name.
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
}

// is_zip_code matches a 5-digit or ZIP+4 postal code.
is_zip_code :: proc(s: string) -> bool {
	if len(s) == 5 {
		return is_digit_string(s)
	}
	if len(s) != 10 || s[5] != '-' {
		return false
	}
	return is_digit_string(s[0:5]) && is_digit_string(s[6:10])
}

// is_version_tag accepts dotted numeric versions like 1.2.3.
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
}
