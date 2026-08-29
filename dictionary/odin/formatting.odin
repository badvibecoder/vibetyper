package formatting

import "core:fmt"
import "core:strconv"
import "core:strings"

// pad_number zero-pads an integer to a fixed width.
pad_number :: proc(value, width: int) -> string {
	text := strconv.itoa(value)
	if len(text) >= width {
		return text
	}
	return strings.repeat("0", width - len(text)) + text
}

// comma_separate inserts thousands separators into an integer string.
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
}

// format_percent renders a ratio as a percentage with one decimal.
format_percent :: proc(ratio: f64) -> string {
	return fmt.sprintf("%.1f%%", ratio * 100)
}

// format_bytes renders a byte count in human-readable units.
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
}

// format_duration renders milliseconds as "2m 05s" style text.
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
}

// align_right pads text on the left to a column width.
align_right :: proc(text: string, width: int) -> string {
	if len(text) >= width {
		return text
	}
	return strings.repeat(" ", width - len(text)) + text
}

// align_left pads text on the right to a column width.
align_left :: proc(text: string, width: int) -> string {
	if len(text) >= width {
		return text
	}
	return text + strings.repeat(" ", width - len(text))
}

// table_row formats cells into a fixed-width table row.
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
}

// pluralize appends an "s" unless the count is one.
pluralize :: proc(count: int, singular: string) -> string {
	if count == 1 {
		return fmt.sprintf("%d %s", count, singular)
	}
	return fmt.sprintf("%d %s", count, singular + "s")
}

// format_money renders cents as a currency string.
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
}

// truncate_middle keeps the head and tail of a long string.
truncate_middle :: proc(s: string, max_len: int) -> string {
	if len(s) <= max_len {
		return s
	}
	keep := (max_len - 1) / 2
	return s[:keep] + "..." + s[len(s) - keep:]
}

// wrap_brackets surrounds a value with a configurable pair.
wrap_brackets :: proc(value, open, close: string) -> string {
	return open + value + close
}

// prefix_lines prepends a marker to each line of text.
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
}

// format_key_value renders "key=value" pairs joined by spaces.
format_key_value :: proc(key, value: string) -> string {
	return fmt.sprintf("%s=%s", key, value)
}

// escape_html escapes the five HTML-significant characters.
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
}

// escape_shell_arg quotes an argument for POSIX shells.
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
}

// indent_block indents every line including the first.
indent_block :: proc(text: string, indent: int) -> string {
	pad := strings.repeat(" ", indent)
	return prefix_lines(text, pad)
}

// join_oxford joins items with commas and a final "and".
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
}

// pad_center centers text within a width using spaces.
pad_center :: proc(text: string, width: int) -> string {
	if len(text) >= width {
		return text
	}
	left := (width - len(text)) / 2
	right := width - len(text) - left
	return strings.repeat(" ", left) + text + strings.repeat(" ", right)
}

// format_number_table aligns a column of numbers right.
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
}

// pretty_size renders a byte count with SI grouping.
pretty_size :: proc(bytes: int) -> string {
	return fmt.sprintf("%s bytes", comma_separate(bytes))
}
