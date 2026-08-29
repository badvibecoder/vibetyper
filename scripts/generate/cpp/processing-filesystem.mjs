// Data module for scripts/generate/generate-cpp.mjs.
// Data processing and filesystem helpers.

export default [
  {
    file: 'data_processing.cpp',
    topic: 'data processing and parsing',
    includes: ['<algorithm>', '<cctype>', '<cmath>', '<map>', '<sstream>', '<string>', '<unordered_map>', '<utility>', '<vector>'],
    units: [
      `// parse_csv_line splits one CSV record into fields, honoring quoted
// fields and doubled quotes inside them.
std::vector<std::string> parse_csv_line(const std::string& line) {
    std::vector<std::string> fields;
    std::string field;
    bool inQuotes = false;
    for (size_t i = 0; i < line.size(); ++i) {
        char c = line[i];
        if (inQuotes) {
            if (c == '"' && i + 1 < line.size() && line[i + 1] == '"') {
                field.push_back('"');
                ++i;
            } else if (c == '"') {
                inQuotes = false;
            } else {
                field.push_back(c);
            }
        } else if (c == '"') {
            inQuotes = true;
        } else if (c == ',') {
            fields.push_back(field);
            field.clear();
        } else {
            field.push_back(c);
        }
    }
    fields.push_back(field);
    return fields;
}`,

      `// strip_whitespace removes leading and trailing spaces and tabs.
std::string strip_whitespace(const std::string& text) {
    size_t start = text.find_first_not_of(" \\t");
    if (start == std::string::npos) {
        return "";
    }
    size_t end = text.find_last_not_of(" \\t");
    return text.substr(start, end - start + 1);
}`,

      `// parse_key_value parses "key=value" pairs separated by a delimiter.
std::map<std::string, std::string> parse_key_value(const std::string& text,
                                                   char delimiter) {
    std::map<std::string, std::string> out;
    size_t pos = 0;
    while (pos <= text.size()) {
        size_t next = text.find(delimiter, pos);
        if (next == std::string::npos) {
            next = text.size();
        }
        std::string part = text.substr(pos, next - pos);
        size_t eq = part.find('=');
        if (eq != std::string::npos && eq > 0) {
            out[strip_whitespace(part.substr(0, eq))] =
                strip_whitespace(part.substr(eq + 1));
        }
        pos = next + 1;
    }
    return out;
}`,

      `// parse_int_list parses a comma-separated list of integers.
std::vector<int> parse_int_list(const std::string& text) {
    std::vector<int> out;
    std::istringstream stream(text);
    std::string piece;
    while (std::getline(stream, piece, ',')) {
        piece = strip_whitespace(piece);
        if (!piece.empty()) {
            out.push_back(std::stoi(piece));
        }
    }
    return out;
}`,

      `// tokenize splits text into lowercase word tokens, dropping punctuation.
std::vector<std::string> tokenize(const std::string& text) {
    std::vector<std::string> tokens;
    std::string token;
    for (char c : text) {
        if (std::isalnum(static_cast<unsigned char>(c))) {
            token.push_back(
                static_cast<char>(std::tolower(static_cast<unsigned char>(c))));
        } else if (!token.empty()) {
            tokens.push_back(token);
            token.clear();
        }
    }
    if (!token.empty()) {
        tokens.push_back(token);
    }
    return tokens;
}`,

      `// ngrams produces the sliding n-word sequences of a token vector.
std::vector<std::vector<std::string>> ngrams(
    const std::vector<std::string>& tokens, size_t n) {
    std::vector<std::vector<std::string>> out;
    if (n == 0 || tokens.size() < n) {
        return out;
    }
    for (size_t i = 0; i + n <= tokens.size(); ++i) {
        out.emplace_back(tokens.begin() + static_cast<long>(i),
                         tokens.begin() + static_cast<long>(i + n));
    }
    return out;
}`,

      `// top_k_frequent returns the k most common tokens, ordered by count and
// then alphabetically.
std::vector<std::string> top_k_frequent(const std::vector<std::string>& tokens,
                                        size_t k) {
    std::unordered_map<std::string, int> counts;
    for (const std::string& t : tokens) {
        counts[t]++;
    }
    std::vector<std::pair<std::string, int>> pairs(counts.begin(), counts.end());
    std::sort(pairs.begin(), pairs.end(),
              [](const auto& a, const auto& b) {
                  if (a.second != b.second) {
                      return a.second > b.second;
                  }
                  return a.first < b.first;
              });
    std::vector<std::string> out;
    for (size_t i = 0; i < pairs.size() && i < k; ++i) {
        out.push_back(pairs[i].first);
    }
    return out;
}`,

      `// moving_average smooths values with a windowed mean of the given size.
std::vector<double> moving_average(const std::vector<double>& values,
                                   size_t window) {
    std::vector<double> out;
    if (window == 0 || values.empty()) {
        return out;
    }
    for (size_t i = 0; i < values.size(); ++i) {
        size_t start = i + 1 >= window ? i + 1 - window : 0;
        double sum = 0.0;
        for (size_t j = start; j <= i; ++j) {
            sum += values[j];
        }
        out.push_back(sum / static_cast<double>(i - start + 1));
    }
    return out;
}`,

      `// exponential_smooth applies simple exponential smoothing with factor
// alpha.
std::vector<double> exponential_smooth(const std::vector<double>& values,
                                       double alpha) {
    std::vector<double> out;
    if (values.empty()) {
        return out;
    }
    out.reserve(values.size());
    out.push_back(values.front());
    for (size_t i = 1; i < values.size(); ++i) {
        out.push_back(alpha * values[i] + (1.0 - alpha) * out.back());
    }
    return out;
}`,

      `// histogram buckets values into bins of the given width starting at zero.
std::map<int, int> histogram(const std::vector<int>& values, int width) {
    std::map<int, int> bins;
    if (width <= 0) {
        return bins;
    }
    for (int v : values) {
        bins[v / width]++;
    }
    return bins;
}`,

      `// min_max_normalize rescales values into the range [0, 1].
std::vector<double> min_max_normalize(const std::vector<double>& values) {
    std::vector<double> out;
    if (values.empty()) {
        return out;
    }
    double lo = values.front(), hi = values.front();
    for (double v : values) {
        lo = std::min(lo, v);
        hi = std::max(hi, v);
    }
    double span = hi - lo;
    out.reserve(values.size());
    for (double v : values) {
        out.push_back(span == 0.0 ? 0.0 : (v - lo) / span);
    }
    return out;
}`,

      `// zscore_normalize standardizes values to mean 0 and standard deviation
// 1.
std::vector<double> zscore_normalize(const std::vector<double>& values) {
    std::vector<double> out;
    if (values.size() < 2) {
        return values;
    }
    double sum = 0.0;
    for (double v : values) {
        sum += v;
    }
    double mean = sum / static_cast<double>(values.size());
    double sq = 0.0;
    for (double v : values) {
        double d = v - mean;
        sq += d * d;
    }
    double sigma = std::sqrt(sq / static_cast<double>(values.size()));
    out.reserve(values.size());
    for (double v : values) {
        out.push_back(sigma == 0.0 ? 0.0 : (v - mean) / sigma);
    }
    return out;
}`,

      `// parse_duration_seconds converts "1h30m" style durations to seconds.
long long parse_duration_seconds(const std::string& text) {
    long long total = 0;
    long long current = 0;
    bool hasUnit = false;
    for (char c : text) {
        if (std::isdigit(static_cast<unsigned char>(c))) {
            current = current * 10 + (c - '0');
            hasUnit = false;
            continue;
        }
        switch (c) {
        case 's': total += current; break;
        case 'm': total += current * 60; break;
        case 'h': total += current * 3600; break;
        case 'd': total += current * 86400; break;
        default: return -1;
        }
        current = 0;
        hasUnit = true;
    }
    return hasUnit ? total : -1;
}`,

      `// LogEntry is one parsed line of a combined-format access log.
struct LogEntry {
    std::string path;
    int status = 0;
    int bytes = 0;
};

// parse_log_line extracts the request line fields from an access log line.
LogEntry parse_log_line(const std::string& line) {
    LogEntry entry;
    size_t firstQuote = line.find('"');
    size_t secondQuote = line.find('"', firstQuote + 1);
    if (firstQuote == std::string::npos || secondQuote == std::string::npos) {
        return entry;
    }
    std::istringstream request(line.substr(firstQuote + 1,
                                           secondQuote - firstQuote - 1));
    std::string method;
    request >> method >> entry.path;
    std::istringstream tail(line.substr(secondQuote + 1));
    tail >> entry.status >> entry.bytes;
    return entry;
}`,

      `// transpose_matrix flips a rectangular matrix across its main diagonal.
std::vector<std::vector<double>> transpose_matrix(
    const std::vector<std::vector<double>>& rows) {
    std::vector<std::vector<double>> out;
    if (rows.empty()) {
        return out;
    }
    out.assign(rows.front().size(), std::vector<double>(rows.size()));
    for (size_t r = 0; r < rows.size(); ++r) {
        for (size_t c = 0; c < rows[r].size(); ++c) {
            out[c][r] = rows[r][c];
        }
    }
    return out;
}`,

      `// rolling_sum returns the sum of every window of size k, in order.
std::vector<int> rolling_sum(const std::vector<int>& values, size_t k) {
    std::vector<int> out;
    if (k == 0 || values.size() < k) {
        return out;
    }
    int window = 0;
    for (size_t i = 0; i < k; ++i) {
        window += values[i];
    }
    out.push_back(window);
    for (size_t i = k; i < values.size(); ++i) {
        window += values[i] - values[i - k];
        out.push_back(window);
    }
    return out;
}`,

      `// downsample keeps every stride-th sample, averaging each window when
// average is true.
std::vector<double> downsample(const std::vector<double>& values,
                               size_t stride, bool average) {
    std::vector<double> out;
    if (stride == 0) {
        return values;
    }
    for (size_t start = 0; start < values.size(); start += stride) {
        size_t end = std::min(start + stride, values.size());
        if (!average) {
            out.push_back(values[start]);
            continue;
        }
        double sum = 0.0;
        for (size_t i = start; i < end; ++i) {
            sum += values[i];
        }
        out.push_back(sum / static_cast<double>(end - start));
    }
    return out;
}`,

      `// pearson_correlation measures the linear correlation of two paired
// series.
double pearson_correlation(const std::vector<double>& x,
                           const std::vector<double>& y) {
    if (x.size() != y.size() || x.size() < 2) {
        return 0.0;
    }
    double mx = 0.0, my = 0.0;
    for (size_t i = 0; i < x.size(); ++i) {
        mx += x[i];
        my += y[i];
    }
    mx /= static_cast<double>(x.size());
    my /= static_cast<double>(y.size());
    double sxy = 0.0, sxx = 0.0, syy = 0.0;
    for (size_t i = 0; i < x.size(); ++i) {
        double dx = x[i] - mx;
        double dy = y[i] - my;
        sxy += dx * dy;
        sxx += dx * dx;
        syy += dy * dy;
    }
    if (sxx == 0.0 || syy == 0.0) {
        return 0.0;
    }
    return sxy / std::sqrt(sxx * syy);
}`,

      `// csv_escape quotes a field when it contains a comma, quote or newline.
std::string csv_escape(const std::string& field) {
    if (field.find_first_of(",\\"\\n") == std::string::npos) {
        return field;
    }
    std::string escaped;
    for (char c : field) {
        if (c == '"') {
            escaped += "\\"\\"";
        } else {
            escaped.push_back(c);
        }
    }
    return "\\"" + escaped + "\\"";
}`,

      `// aggregate_sum sums the amounts of records sharing a key.
std::map<std::string, double> aggregate_sum(
    const std::map<std::string, std::vector<double>>& records) {
    std::map<std::string, double> totals;
    for (const auto& entry : records) {
        for (double v : entry.second) {
            totals[entry.first] += v;
        }
    }
    return totals;
}`,
    ],
  },

  {
    file: 'filesystem_utils.cpp',
    topic: 'filesystem helpers',
    includes: ['<algorithm>', '<cctype>', '<chrono>', '<filesystem>', '<fstream>', '<string>', '<vector>'],
    units: [
      `// file_exists reports whether path refers to an existing regular file.
bool file_exists(const std::string& path) {
    std::error_code ec;
    return std::filesystem::is_regular_file(path, ec) && !ec;
}`,

      `// is_directory reports whether path refers to an existing directory.
bool is_directory(const std::string& path) {
    std::error_code ec;
    return std::filesystem::is_directory(path, ec) && !ec;
}`,

      `// read_lines reads a text file and returns its lines.
std::vector<std::string> read_lines(const std::string& path) {
    std::vector<std::string> lines;
    std::ifstream input(path);
    std::string line;
    while (std::getline(input, line)) {
        lines.push_back(line);
    }
    return lines;
}`,

      `// write_lines writes each string as its own line to a file.
bool write_lines(const std::string& path,
                 const std::vector<std::string>& lines) {
    std::ofstream output(path, std::ios::trunc);
    if (!output) {
        return false;
    }
    for (const std::string& line : lines) {
        output << line << '\\n';
    }
    return output.good();
}`,

      `// copy_file copies src to dst, overwriting an existing destination.
bool copy_file(const std::string& src, const std::string& dst) {
    std::error_code ec;
    std::filesystem::copy_file(src, dst,
                               std::filesystem::copy_options::overwrite_existing,
                               ec);
    return !ec;
}`,

      `// append_line adds one line to the end of a file, creating it if needed.
bool append_line(const std::string& path, const std::string& line) {
    std::ofstream output(path, std::ios::app);
    if (!output) {
        return false;
    }
    output << line << '\\n';
    return output.good();
}`,

      `// file_extension returns the lowercase extension of a path including
// the dot.
std::string file_extension(const std::string& path) {
    std::string ext = std::filesystem::path(path).extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return ext;
}`,

      `// file_stem returns the file name without its extension.
std::string file_stem(const std::string& path) {
    return std::filesystem::path(path).stem().string();
}`,

      `// file_size returns the size of a file in bytes, or -1 on error.
long long file_size(const std::string& path) {
    std::error_code ec;
    auto size = std::filesystem::file_size(path, ec);
    return ec ? -1 : static_cast<long long>(size);
}`,

      `// list_files returns every file under root whose extension matches
// exts.
std::vector<std::string> list_files(const std::string& root,
                                    const std::vector<std::string>& exts) {
    std::vector<std::string> out;
    std::error_code ec;
    for (const auto& entry :
         std::filesystem::recursive_directory_iterator(root, ec)) {
        if (ec || entry.is_directory()) {
            continue;
        }
        std::string ext = entry.path().extension().string();
        for (const std::string& wanted : exts) {
            if (ext == wanted) {
                out.push_back(entry.path().string());
                break;
            }
        }
    }
    return out;
}`,

      `// ensure_dir creates dir and any missing parents.
bool ensure_dir(const std::string& dir) {
    std::error_code ec;
    std::filesystem::create_directories(dir, ec);
    return !ec;
}`,

      `// remove_if_exists deletes path, ignoring "not found" errors.
bool remove_if_exists(const std::string& path) {
    std::error_code ec;
    std::filesystem::remove(path, ec);
    return !ec || ec == std::errc::no_such_file_or_directory;
}`,

      `// find_upward searches for name from start up through parent
// directories.
std::string find_upward(const std::string& start, const std::string& name) {
    std::filesystem::path dir(start);
    while (!dir.empty()) {
        std::filesystem::path candidate = dir / name;
        std::error_code ec;
        if (std::filesystem::is_regular_file(candidate, ec) && !ec) {
            return candidate.string();
        }
        std::filesystem::path parent = dir.parent_path();
        if (parent == dir) {
            break;
        }
        dir = parent;
    }
    return "";
}`,

      `// touch_file creates an empty file at path if missing.
bool touch_file(const std::string& path) {
    std::ofstream output(path, std::ios::app);
    return output.good();
}`,

      `// directory_of returns the parent directory of path.
std::string directory_of(const std::string& path) {
    return std::filesystem::path(path).parent_path().string();
}`,

      `// is_hidden reports whether the file name starts with a dot.
bool is_hidden(const std::string& path) {
    std::string name = std::filesystem::path(path).filename().string();
    return !name.empty() && name.front() == '.';
}`,

      `// rename_file moves path to newName, failing when the target exists.
bool rename_file(const std::string& path, const std::string& newName) {
    std::error_code ec;
    std::filesystem::rename(path, newName, ec);
    return !ec;
}`,

      `// last_modified returns the modification time of a file as a string.
std::string last_modified(const std::string& path) {
    std::error_code ec;
    auto time = std::filesystem::last_write_time(path, ec);
    if (ec) {
        return "";
    }
    auto seconds = std::chrono::duration_cast<std::chrono::seconds>(
                       time.time_since_epoch())
                       .count();
    return std::to_string(seconds);
}`,

      `// count_files reports how many regular files live under root.
size_t count_files(const std::string& root) {
    std::error_code ec;
    size_t count = 0;
    for (const auto& entry :
         std::filesystem::recursive_directory_iterator(root, ec)) {
        if (!ec && entry.is_regular_file()) {
            ++count;
        }
    }
    return count;
}`,
    ],
  },
];
