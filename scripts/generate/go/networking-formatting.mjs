// Data module for scripts/generate/generate-go.mjs.
// Networking helpers and text/number formatting.

export default [
  {
    file: 'networking_utils.go',
    topic: 'networking and URL helpers',
    imports: ['encoding/base64', 'encoding/json', 'fmt', 'io', 'net', 'net/http', 'net/url', 'strings', 'time'],
    units: [
      `// parseURLParts splits a URL into its scheme, host, path and query string.
func parseURLParts(raw string) (scheme, host, path, query string, err error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", "", "", "", err
	}
	return u.Scheme, u.Host, u.Path, u.RawQuery, nil
}`,

      `// queryParams parses a raw query string into a multimap of values.
func queryParams(rawQuery string) (map[string][]string, error) {
	values, err := url.ParseQuery(rawQuery)
	if err != nil {
		return nil, err
	}
	return values, nil
}`,

      `// buildQueryString renders a parameter map as an encoded query string.
func buildQueryString(params map[string]string) string {
	values := url.Values{}
	for key, value := range params {
		values.Set(key, value)
	}
	return values.Encode()
}`,

      `// httpGetWithTimeout fetches a URL with a client-level timeout, returning
// the response body and status code.
func httpGetWithTimeout(target string, timeout time.Duration) (string, int, error) {
	client := &http.Client{Timeout: timeout}
	resp, err := client.Get(target)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", resp.StatusCode, err
	}
	return string(body), resp.StatusCode, nil
}`,

      `// retryRequest retries fn up to attempts times, waiting an exponentially
// growing backoff between failures. fn reports success as its first result.
func retryRequest(attempts int, backoff time.Duration, fn func() (bool, error)) error {
	var err error
	for i := 0; i < attempts; i++ {
		var ok bool
		ok, err = fn()
		if ok {
			return nil
		}
		if i < attempts-1 {
			time.Sleep(backoff)
			backoff *= 2
		}
	}
	if err == nil {
		err = fmt.Errorf("operation failed after %d attempts", attempts)
	}
	return err
}`,

      `// basicAuthHeader builds the Authorization header value for HTTP Basic
// auth.
func basicAuthHeader(username, password string) string {
	joined := username + ":" + password
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(joined))
}`,

      `// splitHostPort separates "host:port" into its parts, defaulting the port
// when missing.
func splitHostPort(address string, defaultPort string) (string, string, error) {
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		if strings.Count(address, ":") == 0 {
			return address, defaultPort, nil
		}
		return "", "", err
	}
	return host, port, nil
}`,

      `// parseCookies converts a raw Cookie header into a name -> value map.
func parseCookies(header string) map[string]string {
	out := make(map[string]string)
	for _, part := range strings.Split(header, ";") {
		part = strings.TrimSpace(part)
		eq := strings.Index(part, "=")
		if eq <= 0 {
			continue
		}
		out[strings.TrimSpace(part[:eq])] = strings.TrimSpace(part[eq+1:])
	}
	return out
}`,

      `// ipInCIDR reports whether address falls inside the given CIDR range.
func ipInCIDR(address, cidr string) bool {
	ip := net.ParseIP(address)
	_, network, err := net.ParseCIDR(cidr)
	if err != nil {
		return false
	}
	return network.Contains(ip)
}`,

      `// defaultPort returns the conventional port for common URL schemes.
func defaultPort(scheme string) string {
	switch scheme {
	case "http":
		return "80"
	case "https":
		return "443"
	case "ftp":
		return "21"
	case "ssh":
		return "22"
	case "smtp":
		return "25"
	default:
		return ""
	}
}`,

      `// isReachable reports whether a TCP connection can be established to the
// address within the timeout.
func isReachable(address string, timeout time.Duration) bool {
	conn, err := net.DialTimeout("tcp", address, timeout)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}`,

      `// normalizeURL ensures a URL has a scheme and a lowercase host.
func normalizeURL(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	if u.Scheme == "" {
		u.Scheme = "http"
	}
	u.Host = strings.ToLower(u.Host)
	return u.String()
}`,

      `// queryValue returns the first value of key in a URL's query string.
func queryValue(raw, key string) (string, bool) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", false
	}
	values, err := url.ParseQuery(u.RawQuery)
	if err != nil {
		return "", false
	}
	if len(values[key]) == 0 {
		return "", false
	}
	return values[key][0], true
}`,

      `// httpStatusText maps common HTTP status codes to their reason phrases.
func httpStatusText(code int) string {
	switch code {
	case 200:
		return "OK"
	case 201:
		return "Created"
	case 204:
		return "No Content"
	case 301:
		return "Moved Permanently"
	case 304:
		return "Not Modified"
	case 400:
		return "Bad Request"
	case 401:
		return "Unauthorized"
	case 403:
		return "Forbidden"
	case 404:
		return "Not Found"
	case 409:
		return "Conflict"
	case 422:
		return "Unprocessable Entity"
	case 429:
		return "Too Many Requests"
	case 500:
		return "Internal Server Error"
	case 502:
		return "Bad Gateway"
	case 503:
		return "Service Unavailable"
	default:
		return ""
	}
}`,

      `// urlEncode percent-encodes a string for safe use in URLs.
func urlEncode(value string) string {
	return url.QueryEscape(value)
}`,

      `// redactURL strips the query string and fragment from a URL for safe
// logging.
func redactURL(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	u.RawQuery = ""
	u.Fragment = ""
	return u.String()
}`,

      `// headersToMap parses "Key: value" header lines into a map.
func headersToMap(lines []string) map[string]string {
	out := make(map[string]string)
	for _, line := range lines {
		colon := strings.Index(line, ":")
		if colon <= 0 {
			continue
		}
		key := strings.TrimSpace(line[:colon])
		value := strings.TrimSpace(line[colon+1:])
		out[key] = value
	}
	return out
}`,

      `// lookupHost resolves host to its IP addresses.
func lookupHost(host string) ([]string, error) {
	addrs, err := net.LookupHost(host)
	if err != nil {
		return nil, err
	}
	return addrs, nil
}`,

      `// isHTTPS reports whether a raw URL uses the https scheme.
func isHTTPS(raw string) bool {
	u, err := url.Parse(raw)
	return err == nil && u.Scheme == "https"
}`,

      `// fetchJSON performs a GET request and decodes the JSON response body.
func fetchJSON(target string, timeout time.Duration, out any) error {
	client := &http.Client{Timeout: timeout}
	resp, err := client.Get(target)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GET %s: status %d", target, resp.StatusCode)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}`,
    ],
  },

  {
    file: 'formatting_utils.go',
    topic: 'number, size and text formatting',
    imports: ['fmt', 'strconv', 'strings', 'time', 'unicode', 'unicode/utf8'],
    units: [
      `// commaSeparate inserts thousands separators into an integer string.
func commaSeparate(n int) string {
	negative := n < 0
	digits := strconv.Itoa(absInt(n))
	var b strings.Builder
	for i, d := range digits {
		if i > 0 && (len(digits)-i)%3 == 0 {
			b.WriteByte(',')
		}
		b.WriteRune(d)
	}
	out := b.String()
	if negative {
		return "-" + out
	}
	return out
}

// absInt returns the absolute value of n.
func absInt(n int) int {
	if n < 0 {
		return -n
	}
	return n
}`,

      `// percentString renders a fraction as a percentage with the given number
// of decimals.
func percentString(value float64, decimals int) string {
	return strconv.FormatFloat(value*100, 'f', decimals, 64) + "%"
}`,

      `// humanBytes renders a byte count as a compact human-readable size.
func humanBytes(n int64) string {
	const unit = 1024
	if n < unit {
		return fmt.Sprintf("%d B", n)
	}
	div, exp := int64(unit), 0
	for m := n / unit; m >= unit; m /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %ciB", float64(n)/float64(div), "KMGTPE"[exp])
}`,

      `// humanDuration renders a duration in seconds as "2h 5m" style text.
func humanDuration(seconds int64) string {
	if seconds < 60 {
		return fmt.Sprintf("%ds", seconds)
	}
	minutes := seconds / 60
	if minutes < 60 {
		return fmt.Sprintf("%dm %ds", minutes, seconds%60)
	}
	hours := minutes / 60
	if hours < 24 {
		return fmt.Sprintf("%dh %dm", hours, minutes%60)
	}
	days := hours / 24
	return fmt.Sprintf("%dd %dh", days, hours%24)
}`,

      `// padNumber zero-pads an integer to at least width digits.
func padNumber(n, width int) string {
	return fmt.Sprintf("%0*d", width, n)
}`,

      `// pluralize appends an "s" unless count is exactly one.
func pluralize(count int, singular string) string {
	if count == 1 {
		return singular
	}
	return singular + "s"
}`,

      `// ordinalSuffix returns the ordinal form of a number, e.g. 3 -> "3rd".
func ordinalSuffix(n int) string {
	suffix := "th"
	switch n % 100 {
	case 11, 12, 13:
	case 1:
		suffix = "st"
	case 2:
		suffix = "nd"
	case 3:
		suffix = "rd"
	}
	return strconv.Itoa(n) + suffix
}`,

      `// joinWithAnd renders a list in prose form: "a, b and c".
func joinWithAnd(items []string) string {
	switch len(items) {
	case 0:
		return ""
	case 1:
		return items[0]
	case 2:
		return items[0] + " and " + items[1]
	}
	return strings.Join(items[:len(items)-1], ", ") + " and " + items[len(items)-1]
}`,

      `// formatMoney renders a dollar amount given in cents with two decimals
// and thousands separators.
func formatMoney(cents int64) string {
	negative := cents < 0
	abs := cents
	if negative {
		abs = -cents
	}
	dollars := commaSeparate(int(abs / 100))
	remainder := abs % 100
	out := fmt.Sprintf("%s.%02d", dollars, remainder)
	if negative {
		out = "-" + out
	}
	return out
}`,

      `// truncateMiddle keeps the start and end of a long string, e.g. for file
// paths in a constrained UI.
func truncateMiddle(text string, max int) string {
	runes := []rune(text)
	if len(runes) <= max {
		return text
	}
	keep := (max - 3) / 2
	return string(runes[:keep]) + "..." + string(runes[len(runes)-keep:])
}`,

      `// durationBetween returns the elapsed time between two Unix timestamps
// as a human-readable span.
func durationBetween(start, end int64) string {
	if end < start {
		end, start = start, end
	}
	return humanDuration(end - start)
}`,

      `// formatRatio renders a ratio in reduced form, e.g. 8:4 -> "2:1".
func formatRatio(a, b int) string {
	g := gcd(a, b)
	if g == 0 {
		return "0:0"
	}
	return strconv.Itoa(a/g) + ":" + strconv.Itoa(b/g)
}`,

      `// tableRow pads cells to the given widths, separating them with two
// spaces.
func tableRow(cells []string, widths []int) string {
	var b strings.Builder
	for i, cell := range cells {
		if i > 0 {
			b.WriteString("  ")
		}
		if i < len(widths) {
			b.WriteString(padRight(cell, widths[i], ' '))
		} else {
			b.WriteString(cell)
		}
	}
	return b.String()
}`,

      `// timeAgo renders a timestamp relative to now, e.g. "5m ago".
func timeAgo(t time.Time) string {
	elapsed := time.Since(t)
	switch {
	case elapsed < time.Minute:
		return "just now"
	case elapsed < time.Hour:
		return fmt.Sprintf("%dm ago", int(elapsed.Minutes()))
	case elapsed < 24*time.Hour:
		return fmt.Sprintf("%dh ago", int(elapsed.Hours()))
	default:
		return fmt.Sprintf("%dd ago", int(elapsed.Hours()/24))
	}
}`,

      `// signedFloat formats a float with an explicit sign and fixed decimals.
func signedFloat(value float64, decimals int) string {
	return strconv.FormatFloat(value, '+', decimals, 64)
}`,

      `// upperFirst capitalizes the first rune of a string.
func upperFirst(text string) string {
	if text == "" {
		return ""
	}
	r, size := utf8.DecodeRuneInString(text)
	return string(unicode.ToUpper(r)) + text[size:]
}`,

      `// bytesPerSecond renders a transfer rate, e.g. "12.4 MiB/s".
func bytesPerSecond(n int64, elapsed time.Duration) string {
	if elapsed <= 0 {
		return "0 B/s"
	}
	perSecond := float64(n) / elapsed.Seconds()
	return humanBytes(int64(perSecond)) + "/s"
}`,

      `// intList renders integers as a compact comma-separated list.
func intList(values []int) string {
	parts := make([]string, len(values))
	for i, v := range values {
		parts[i] = strconv.Itoa(v)
	}
	return strings.Join(parts, ", ")
}`,
    ],
  },
];
