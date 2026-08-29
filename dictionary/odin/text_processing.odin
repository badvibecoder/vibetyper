package text_processing

import "core:strings"

// tokenize splits text into lowercase word tokens.
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
}

// word_frequency tallies tokens into a map.
word_frequency :: proc(text: string) -> map[string]int {
	counts := make(map[string]int)
	for word in tokenize(text) {
		counts[word] += 1
	}
	return counts
}

// strip_punctuation removes non-alphanumeric characters.
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
}

// count_sentences counts sentence-ending punctuation.
count_sentences :: proc(text: string) -> int {
	count := 0
	for ch in text {
		if ch == '.' || ch == '!' || ch == '?' {
			count += 1
		}
	}
	return count
}

// is_palindrome checks if text reads the same forward and backward.
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
}

// pig_latin converts a single word to Pig Latin.
pig_latin :: proc(word: string) -> string {
	if len(word) == 0 {
		return word
	}
	first := strings.to_lower(word[0:1])
	if first == "a" || first == "e" || first == "i" || first == "o" || first == "u" {
		return word + "way"
	}
	return word[1:] + word[0:1] + "ay"
}

// rot13 applies the classic Caesar cipher variant to ASCII letters.
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
}

// caesar_shift shifts letters by a fixed amount, wrapping at z/Z.
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
}

// extract_quoted pulls the first quoted substring out of text.
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
}

// remove_duplicate_words keeps the first occurrence of each word.
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
}

// longest_word finds the largest token in a string.
longest_word :: proc(text: string) -> string {
	best := ""
	for word in strings.fields(text) {
		if len(word) > len(best) {
			best = word
		}
	}
	return best
}

// shortest_word finds the smallest token in a string.
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
}

// average_word_length returns the mean token length.
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
}

// wrap_text breaks text into lines of at most width characters.
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
}

// indent_lines prefixes every line of text with a given string.
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
}

// normalize_spaces collapses runs of whitespace into single spaces.
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
}

// title_case capitalizes the first letter of each word.
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
}

// count_syllables estimates syllables with a vowel-run heuristic.
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
}

// redact keeps the first and last rune of each word, masking the middle.
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
}
