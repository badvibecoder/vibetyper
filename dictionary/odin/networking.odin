package networking

import "core:fmt"
import "core:math"
import "core:net"
import "core:strings"

// is_valid_port checks a TCP/UDP port number.
is_valid_port :: proc(port: int) -> bool {
	return port >= 1 && port <= 65535
}

// split_host_port separates "host:port" into its parts.
split_host_port :: proc(address: string) -> (string, string) {
	idx := strings.last_index(address, ":")
	if idx < 0 {
		return address, ""
	}
	return address[:idx], address[idx + 1:]
}

// parse_url breaks a URL into scheme, host and path.
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
}

// build_query_string encodes a parameter map into a query string.
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
}

// parse_query_string turns a query string into a parameter map.
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
}

// is_http_success classifies a status code as 2xx.
is_http_success :: proc(status: int) -> bool {
	return status >= 200 && status < 300
}

// http_status_text maps a status code to its standard reason phrase.
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
}

// resolve_host looks up the first IP address for a hostname.
resolve_host :: proc(host: string) -> (string, bool) {
	ips, err := net.lookup_hostname(host)
	if err != nil || len(ips) == 0 {
		return "", false
	}
	return net.ip_to_string(ips[0]), true
}

// dial_tcp connects to a host and returns the socket.
dial_tcp :: proc(host: string, port: int) -> (net.Socket, bool) {
	sock, err := net.dial_tcp(host, port)
	if err != nil || !net.is_valid_socket(sock) {
		return {}, false
	}
	return sock, true
}

// send_line writes a line-terminated message over a socket.
send_line :: proc(sock: net.Socket, message: string) -> bool {
	data := transmute([]u8)(message + "\n")
	_, err := net.write(sock, data)
	return err == nil
}

// read_line reads bytes from a socket until a newline.
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
}

// close_socket releases a socket handle.
close_socket :: proc(sock: net.Socket) {
	if net.is_valid_socket(sock) {
		net.close(sock)
	}
}

// is_ipv6_placeholder validates a minimal IPv6 shape with colons.
is_ipv6_like :: proc(address: string) -> bool {
	return strings.contains(address, ":") && !strings.contains(address, ".")
}

// mask_ip hides the last octet of an IPv4 address.
mask_ip :: proc(address: string) -> string {
	idx := strings.last_index(address, ".")
	if idx < 0 {
		return address
	}
	return address[:idx] + ".0"
}

// default_port returns the standard port for a scheme.
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
}

// backoff_delay computes an exponential backoff with jitter.
backoff_delay :: proc(attempt: int, base_ms: f64) -> f64 {
	delay := base_ms * math.pow(2, f64(attempt))
	return min(delay, 30_000)
}

// url_encode percent-encodes unsafe URL characters.
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
}

// url_decode percent-decodes a URL-encoded string.
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
}

// hex_value converts one hex digit character to its value.
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
}

// extract_header parses one "Name: value" line.
extract_header :: proc(line: string) -> (name, value: string) {
	idx := strings.index(line, ":")
	if idx < 0 {
		return "", ""
	}
	return strings.trim_space(line[:idx]), strings.trim_space(line[idx + 1:])
}

// is_local_address checks for loopback or private IPv4 prefixes.
is_local_address :: proc(address: string) -> bool {
	if address == "127.0.0.1" || address == "localhost" {
		return true
	}
	return strings.has_prefix(address, "192.168.") || strings.has_prefix(address, "10.")
}
