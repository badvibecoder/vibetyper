package encoding

import "core:fmt"
import "core:strings"

// to_hex encodes bytes as lowercase hexadecimal text.
to_hex :: proc(data: []u8) -> string {
	digits := "0123456789abcdef"
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for byte in data {
		strings.write_byte(&b, digits[byte >> 4])
		strings.write_byte(&b, digits[byte & 0x0F])
	}
	return strings.clone(strings.to_string(b))
}

// from_hex decodes hexadecimal text back into bytes.
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
}

// to_base64 encodes bytes using the standard alphabet.
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
}

// base64_value maps one base64 character to its 6-bit value.
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
}

// from_base64 decodes standard base64 text into bytes.
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
}

// json_escape escapes a string for embedding in JSON.
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
}

// json_unescape reverses JSON escape sequences in a string.
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
}

// csv_escape quotes a field when it contains special characters.
csv_escape :: proc(field: string) -> string {
	needs_quotes := strings.contains(field, ",") || strings.contains(field, "\"") || strings.contains(field, "\n")
	if !needs_quotes {
		return field
	}
	return "\"" + strings.replace_all(field, "\"", "\"\"") + "\""
}

// xml_escape encodes the five XML entities.
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
}

// xml_unescape decodes the five standard XML entities.
xml_unescape :: proc(text: string) -> string {
	result := strings.replace_all(text, "&lt;", "<")
	result = strings.replace_all(result, "&gt;", ">")
	result = strings.replace_all(result, "&quot;", "\"")
	result = strings.replace_all(result, "&apos;", "'")
	result = strings.replace_all(result, "&amp;", "&")
	return result
}

// markdown_escape neutralises markdown punctuation.
markdown_escape :: proc(text: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in text {
		switch ch {
		case '\', '`', '*', '_', '{', '}', '[', ']', '(', ')', '#', '+', '-', '.', '!':
			strings.write_byte(&b, '\')
			strings.write_byte(&b, ch)
		case:
			strings.write_byte(&b, ch)
		}
	}
	return strings.clone(strings.to_string(b))
}

// regex_escape escapes metacharacters for use in a literal regex.
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
}

// run_length_encode compresses repeated bytes as count+byte pairs.
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
}

// run_length_decode reverses run-length encoded bytes.
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
}

// hamming_distance counts differing bits between two bytes.
hamming_distance :: proc(a, b: u8) -> int {
	xor := a ~ b
	count := 0
	for xor != 0 {
		count += int(xor & 1)
		xor >>= 1
	}
	return count
}

// xor_obfuscate scrambles bytes with a repeating key.
xor_obfuscate :: proc(data: []u8, key: []u8) -> []u8 {
	if len(key) == 0 {
		return data
	}
	result := make([]u8, len(data))
	for byte, i in data {
		result[i] = byte ~ key[i % len(key)]
	}
	return result
}

// xor_deobfuscate reverses xor_obfuscate (symmetric cipher).
xor_deobfuscate :: proc(data: []u8, key: []u8) -> []u8 {
	return xor_obfuscate(data, key)
}

// vigenere_encrypt shifts letters using a repeating keyword.
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
}

// vigenere_decrypt reverses a Vigenere-encrypted string.
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
}

// binary_encode renders bytes as a space-separated bit string.
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
}

// binary_decode parses a space-separated bit string back to bytes.
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
}

// rot47 applies the printable-ASCII rotation cipher.
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
}
