// Data module for scripts/generate/generate-go.mjs.
// Data processing/parsing and filesystem helpers.

export default [
  {
    file: 'data_processing.go',
    topic: 'data processing and parsing',
    imports: ['encoding/csv', 'encoding/json', 'fmt', 'math', 'sort', 'strconv', 'strings', 'time', 'unicode'],
    units: [
      `// parseCSVLine splits one CSV record into fields, honoring quoted fields.
func parseCSVLine(line string) ([]string, error) {
	r := csv.NewReader(strings.NewReader(line))
	r.FieldsPerRecord = -1
	record, err := r.Read()
	if err != nil {
		return nil, err
	}
	return record, nil
}`,

      `// parseKeyValuePairs parses "key=value" pairs separated by a delimiter,
// trimming whitespace around each part.
func parseKeyValuePairs(text, delimiter string) map[string]string {
	out := make(map[string]string)
	for _, part := range strings.Split(text, delimiter) {
		eq := strings.Index(part, "=")
		if eq <= 0 {
			continue
		}
		key := strings.TrimSpace(part[:eq])
		value := strings.TrimSpace(part[eq+1:])
		out[key] = value
	}
	return out
}`,

      `// toJSON serializes v as pretty-printed JSON for logging or storage.
func toJSON(v any) (string, error) {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return "", fmt.Errorf("marshal json: %w", err)
	}
	return string(data), nil
}`,

      `// fromJSON decodes a JSON document into a generic map.
func fromJSON(text string) (map[string]any, error) {
	var out map[string]any
	if err := json.Unmarshal([]byte(text), &out); err != nil {
		return nil, fmt.Errorf("parse json: %w", err)
	}
	return out, nil
}`,

      `// flattenJSONKeys turns nested JSON objects into dotted keys, so
// {"a": {"b": 1}} becomes {"a.b": 1}.
func flattenJSONKeys(m map[string]any) map[string]any {
	out := make(map[string]any)
	var walk func(prefix string, node map[string]any)
	walk = func(prefix string, node map[string]any) {
		for key, value := range node {
			full := key
			if prefix != "" {
				full = prefix + "." + key
			}
			if child, ok := value.(map[string]any); ok {
				walk(full, child)
			} else {
				out[full] = value
			}
		}
	}
	walk("", m)
	return out
}`,

      `// tokenize splits text into lowercase word tokens, dropping punctuation.
func tokenize(text string) []string {
	fields := strings.FieldsFunc(text, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsNumber(r)
	})
	for i, f := range fields {
		fields[i] = strings.ToLower(f)
	}
	return fields
}`,

      `// ngrams produces the sliding n-word sequences of a token slice.
func ngrams(tokens []string, n int) [][]string {
	if n <= 0 || len(tokens) < n {
		return nil
	}
	var out [][]string
	for i := 0; i+n <= len(tokens); i++ {
		out = append(out, append([]string(nil), tokens[i:i+n]...))
	}
	return out
}`,

      `// topKFrequent returns the k most common tokens, ordered by count and then
// alphabetically.
func topKFrequent(tokens []string, k int) []string {
	counts := make(map[string]int)
	for _, t := range tokens {
		counts[t]++
	}
	type pair struct {
		token string
		count int
	}
	pairs := make([]pair, 0, len(counts))
	for token, count := range counts {
		pairs = append(pairs, pair{token, count})
	}
	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].count != pairs[j].count {
			return pairs[i].count > pairs[j].count
		}
		return pairs[i].token < pairs[j].token
	})
	if k > len(pairs) {
		k = len(pairs)
	}
	out := make([]string, k)
	for i := 0; i < k; i++ {
		out[i] = pairs[i].token
	}
	return out
}`,

      `// movingAverage smooths values with a windowed mean of the given size.
func movingAverage(values []float64, window int) []float64 {
	if window <= 0 || len(values) == 0 {
		return []float64{}
	}
	out := make([]float64, 0, len(values))
	for i := range values {
		start := i - window + 1
		if start < 0 {
			start = 0
		}
		sum := 0.0
		for _, v := range values[start : i+1] {
			sum += v
		}
		out = append(out, sum/float64(i-start+1))
	}
	return out
}`,

      `// exponentialSmooth applies simple exponential smoothing with factor alpha.
func exponentialSmooth(values []float64, alpha float64) []float64 {
	if len(values) == 0 {
		return []float64{}
	}
	out := make([]float64, len(values))
	out[0] = values[0]
	for i := 1; i < len(values); i++ {
		out[i] = alpha*values[i] + (1-alpha)*out[i-1]
	}
	return out
}`,

      `// histogram buckets values into bins of the given width starting at zero.
func histogram(values []int, width int) map[int]int {
	if width <= 0 {
		return nil
	}
	bins := make(map[int]int)
	for _, v := range values {
		bins[v/width]++
	}
	return bins
}`,

      `// minMaxNormalize rescales values into the range [0, 1] using the observed
// minimum and maximum.
func minMaxNormalize(values []float64) []float64 {
	if len(values) == 0 {
		return []float64{}
	}
	lo, hi := values[0], values[0]
	for _, v := range values {
		if v < lo {
			lo = v
		}
		if v > hi {
			hi = v
		}
	}
	out := make([]float64, len(values))
	span := hi - lo
	for i, v := range values {
		if span == 0 {
			out[i] = 0
			continue
		}
		out[i] = (v - lo) / span
	}
	return out
}`,

      `// parseLogLine extracts the request path and status code from a common
// combined-format access log line.
func parseLogLine(line string) (path string, status int, ok bool) {
	quoted := strings.Split(line, "\\"")
	if len(quoted) < 3 {
		return "", 0, false
	}
	request := strings.Fields(quoted[1])
	if len(request) < 2 {
		return "", 0, false
	}
	fields := strings.Fields(quoted[2])
	if len(fields) < 2 {
		return "", 0, false
	}
	code, err := strconv.Atoi(fields[0])
	if err != nil {
		return "", 0, false
	}
	return request[1], code, true
}`,

      `// parseDurationMinutes converts strings like "90s" or "1h30m" into minutes.
func parseDurationMinutes(text string) (float64, error) {
	d, err := time.ParseDuration(text)
	if err != nil {
		return 0, fmt.Errorf("parse duration: %w", err)
	}
	return d.Minutes(), nil
}`,

      `// formatTimestamp renders a Unix timestamp as an ISO-8601 UTC string.
func formatTimestamp(unixSeconds int64) string {
	return time.Unix(unixSeconds, 0).UTC().Format(time.RFC3339)
}`,

      `// dedupeRecords removes records whose keyFor value was seen before, keeping
// the first occurrence of each.
func dedupeRecords[T any](records []T, keyFor func(T) string) []T {
	seen := make(map[string]bool)
	out := make([]T, 0, len(records))
	for _, record := range records {
		key := keyFor(record)
		if !seen[key] {
			seen[key] = true
			out = append(out, record)
		}
	}
	return out
}`,

      `// aggregateByKey sums the numeric amounts of records sharing a key.
func aggregateByKey(records map[string][]float64) map[string]float64 {
	totals := make(map[string]float64)
	for key, values := range records {
		for _, v := range values {
			totals[key] += v
		}
	}
	return totals
}`,

      `// parseINI parses a minimal INI document into section -> key -> value.
func parseINI(text string) map[string]map[string]string {
	out := make(map[string]map[string]string)
	current := "default"
	for _, line := range strings.Split(text, "\\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "#") {
			continue
		}
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			current = strings.Trim(line, "[]")
			if out[current] == nil {
				out[current] = make(map[string]string)
			}
			continue
		}
		eq := strings.Index(line, "=")
		if eq <= 0 {
			continue
		}
		if out[current] == nil {
			out[current] = make(map[string]string)
		}
		out[current][strings.TrimSpace(line[:eq])] = strings.TrimSpace(line[eq+1:])
	}
	return out
}`,

      `// transposeMatrix flips a rectangular matrix across its main diagonal.
func transposeMatrix(rows [][]float64) [][]float64 {
	if len(rows) == 0 {
		return nil
	}
	cols := len(rows[0])
	out := make([][]float64, cols)
	for c := 0; c < cols; c++ {
		out[c] = make([]float64, len(rows))
		for r := 0; r < len(rows); r++ {
			out[c][r] = rows[r][c]
		}
	}
	return out
}`,

      `// downsample keeps every stride-th sample, averaging the skipped window
// into each kept point when average is true.
func downsample(values []float64, stride int, average bool) []float64 {
	if stride <= 0 {
		return values
	}
	var out []float64
	for start := 0; start < len(values); start += stride {
		end := start + stride
		if end > len(values) {
			end = len(values)
		}
		if !average {
			out = append(out, values[start])
			continue
		}
		sum := 0.0
		for _, v := range values[start:end] {
			sum += v
		}
		out = append(out, sum/float64(end-start))
	}
	return out
}`,

      `// pearsonCorrelation measures the linear correlation between two paired
// series, returning a value in [-1, 1].
func pearsonCorrelation(x, y []float64) float64 {
	if len(x) != len(y) || len(x) < 2 {
		return 0
	}
	mx, my := mean(x), mean(y)
	var sxy, sxx, syy float64
	for i := range x {
		dx, dy := x[i]-mx, y[i]-my
		sxy += dx * dy
		sxx += dx * dx
		syy += dy * dy
	}
	if sxx == 0 || syy == 0 {
		return 0
	}
	return sxy / math.Sqrt(sxx*syy)
}`,

      `// rollingSum returns the sum of every window of size k, in order.
func rollingSum(values []int, k int) []int {
	if k <= 0 || len(values) < k {
		return nil
	}
	out := make([]int, 0, len(values)-k+1)
	window := 0
	for i := 0; i < k; i++ {
		window += values[i]
	}
	out = append(out, window)
	for i := k; i < len(values); i++ {
		window += values[i] - values[i-k]
		out = append(out, window)
	}
	return out
}`,

      `// parseCSVRecords reads every record from a multi-line CSV document.
func parseCSVRecords(text string) ([][]string, error) {
	r := csv.NewReader(strings.NewReader(text))
	r.FieldsPerRecord = -1
	records, err := r.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("parse csv: %w", err)
	}
	return records, nil
}`,

      `// zscoreNormalize standardizes values to mean 0 and standard deviation 1.
func zscoreNormalize(values []float64) []float64 {
	if len(values) < 2 {
		return append([]float64(nil), values...)
	}
	m := mean(values)
	s := stddev(values)
	out := make([]float64, len(values))
	for i, v := range values {
		if s == 0 {
			out[i] = 0
			continue
		}
		out[i] = (v - m) / s
	}
	return out
}`,
    ],
  },

  {
    file: 'filesystem_utils.go',
    topic: 'filesystem helpers',
    imports: ['bufio', 'crypto/sha256', 'encoding/hex', 'io', 'os', 'path/filepath', 'sort', 'strings', 'time'],
    units: [
      `// fileExists reports whether path refers to an existing file.
func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}`,

      `// isDirectory reports whether path refers to an existing directory.
func isDirectory(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}`,

      `// readLines reads a text file and returns its lines.
func readLines(path string) ([]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var lines []string
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return lines, nil
}`,

      `// writeLines writes each string as its own line to a file.
func writeLines(path string, lines []string) error {
	text := strings.Join(lines, "\\n")
	return os.WriteFile(path, []byte(text), 0o644)
}`,

      `// copyFile copies src to dst, preserving the source's permission bits.
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	info, err := in.Stat()
	if err != nil {
		return err
	}
	out, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, info.Mode())
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}`,

      `// appendLine adds one line to the end of a file, creating it if needed.
func appendLine(path, line string) error {
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.WriteString(line + "\\n")
	return err
}`,

      `// fileExtension returns the lowercase extension of a path, including the
// dot.
func fileExtension(path string) string {
	return strings.ToLower(filepath.Ext(path))
}`,

      `// fileStem returns the file name without its extension.
func fileStem(path string) string {
	base := filepath.Base(path)
	return strings.TrimSuffix(base, filepath.Ext(base))
}`,

      `// sha256Hex returns the hex-encoded SHA-256 digest of a file's contents.
func sha256Hex(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:]), nil
}`,

      `// listFiles returns every file under root whose extension is in exts.
func listFiles(root string, exts ...string) ([]string, error) {
	var out []string
	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		for _, ext := range exts {
			if strings.EqualFold(filepath.Ext(path), ext) {
				out = append(out, path)
				break
			}
		}
		return nil
	})
	return out, err
}`,

      `// touch creates an empty file at path if missing and updates its mtime.
func touch(path string) error {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	f.Close()
	now := time.Now()
	return os.Chtimes(path, now, now)
}`,

      `// atomicWrite writes data to a temp file in the same directory and renames
// it over target, so readers never see a partial file.
func atomicWrite(target string, data []byte) error {
	dir := filepath.Dir(target)
	tmp, err := os.CreateTemp(dir, ".write-*")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	defer os.Remove(tmpName)
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpName, target)
}`,

      `// tempFileName returns a unique file path under dir with the given prefix.
func tempFileName(dir, prefix string) (string, error) {
	f, err := os.CreateTemp(dir, prefix+"-*")
	if err != nil {
		return "", err
	}
	name := f.Name()
	f.Close()
	return name, nil
}`,

      `// ensureDir creates dir and any missing parents.
func ensureDir(dir string) error {
	return os.MkdirAll(dir, 0o755)
}`,

      `// fileSize returns the size of a file in bytes, or an error.
func fileSize(path string) (int64, error) {
	info, err := os.Stat(path)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}`,

      `// readFirstBytes returns up to n bytes from the start of a file.
func readFirstBytes(path string, n int) ([]byte, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	buf := make([]byte, n)
	count, err := io.ReadFull(f, buf)
	if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
		return nil, err
	}
	return buf[:count], nil
}`,

      `// findUpward searches for name starting at start and walking up through
// parent directories, returning the first match found.
func findUpward(start, name string) (string, bool) {
	dir := start
	for {
		candidate := filepath.Join(dir, name)
		if fileExists(candidate) {
			return candidate, true
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", false
		}
		dir = parent
	}
}`,

      `// removeIfExists deletes path, ignoring "not found" errors.
func removeIfExists(path string) error {
	err := os.Remove(path)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}`,

      `// dirNames lists the direct children of a directory, sorted.
func dirNames(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		names = append(names, entry.Name())
	}
	sort.Strings(names)
	return names, nil
}`,
    ],
  },
];
