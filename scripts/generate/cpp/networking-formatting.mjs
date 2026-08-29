// Data module for scripts/generate/generate-cpp.mjs.
// Networking helpers and text/number formatting.

export default [
  {
    file: 'networking_utils.cpp',
    topic: 'networking and URL helpers',
    includes: ['<cctype>', '<cstdint>', '<map>', '<sstream>', '<string>', '<vector>'],
    units: [
      `// trim_copy returns text with surrounding spaces and tabs removed.
std::string trim_copy(const std::string& text) {
    size_t start = text.find_first_not_of(" \\t");
    if (start == std::string::npos) {
        return "";
    }
    size_t end = text.find_last_not_of(" \\t");
    return text.substr(start, end - start + 1);
}`,

      `// UrlParts holds the components of a parsed URL.
struct UrlParts {
    std::string scheme;
    std::string host;
    std::string path;
    std::string query;
};

// parse_url splits a raw URL into scheme, host, path and query.
UrlParts parse_url(const std::string& raw) {
    UrlParts parts;
    size_t pos = 0;
    size_t schemeEnd = raw.find("://");
    if (schemeEnd != std::string::npos) {
        parts.scheme = raw.substr(0, schemeEnd);
        pos = schemeEnd + 3;
    }
    size_t queryStart = raw.find('?', pos);
    size_t pathStart = raw.find('/', pos);
    size_t hostEnd = raw.size();
    if (queryStart != std::string::npos && queryStart < hostEnd) {
        hostEnd = queryStart;
    }
    if (pathStart != std::string::npos && pathStart < hostEnd) {
        hostEnd = pathStart;
    }
    parts.host = raw.substr(pos, hostEnd - pos);
    if (pathStart != std::string::npos) {
        size_t pathEnd = raw.size();
        if (queryStart != std::string::npos && queryStart < pathEnd) {
            pathEnd = queryStart;
        }
        parts.path = raw.substr(pathStart, pathEnd - pathStart);
    }
    if (queryStart != std::string::npos) {
        parts.query = raw.substr(queryStart + 1);
    }
    return parts;
}`,

      `// base64_encode encodes bytes as standard base64 text.
std::string base64_encode(const std::string& data) {
    static const char table[] =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string out;
    out.reserve(((data.size() + 2) / 3) * 4);
    size_t i = 0;
    while (i + 3 <= data.size()) {
        uint32_t n = (static_cast<unsigned char>(data[i]) << 16) |
                     (static_cast<unsigned char>(data[i + 1]) << 8) |
                     static_cast<unsigned char>(data[i + 2]);
        out.push_back(table[(n >> 18) & 63]);
        out.push_back(table[(n >> 12) & 63]);
        out.push_back(table[(n >> 6) & 63]);
        out.push_back(table[n & 63]);
        i += 3;
    }
    size_t left = data.size() - i;
    if (left == 1) {
        uint32_t n = static_cast<unsigned char>(data[i]) << 16;
        out.push_back(table[(n >> 18) & 63]);
        out.push_back(table[(n >> 12) & 63]);
        out += "==";
    } else if (left == 2) {
        uint32_t n = (static_cast<unsigned char>(data[i]) << 16) |
                     (static_cast<unsigned char>(data[i + 1]) << 8);
        out.push_back(table[(n >> 18) & 63]);
        out.push_back(table[(n >> 12) & 63]);
        out.push_back(table[(n >> 6) & 63]);
        out.push_back('=');
    }
    return out;
}`,

      `// base64_decode decodes standard base64 text back into bytes, returning
// false on invalid input.
bool base64_decode(const std::string& text, std::string& out) {
    static const std::string alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    out.clear();
    uint32_t buffer = 0;
    int bits = 0;
    for (char c : text) {
        if (c == '=') {
            break;
        }
        size_t value = alphabet.find(c);
        if (value == std::string::npos) {
            return false;
        }
        buffer = (buffer << 6) | static_cast<uint32_t>(value);
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out.push_back(static_cast<char>((buffer >> bits) & 0xFF));
        }
    }
    return true;
}`,

      `// basic_auth_header builds the Authorization value for HTTP Basic auth.
std::string basic_auth_header(const std::string& username,
                              const std::string& password) {
    return "Basic " + base64_encode(username + ":" + password);
}`,

      `// url_encode percent-encodes characters that are unsafe in URLs.
std::string url_encode(const std::string& value) {
    static const char hexDigits[] = "0123456789ABCDEF";
    std::string out;
    for (unsigned char c : value) {
        if (std::isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            out.push_back(static_cast<char>(c));
        } else {
            out.push_back('%');
            out.push_back(hexDigits[c >> 4]);
            out.push_back(hexDigits[c & 15]);
        }
    }
    return out;
}`,

      `// parse_query_string parses a raw query string into key -> value pairs.
std::map<std::string, std::string> parse_query_string(
    const std::string& query) {
    std::map<std::string, std::string> out;
    std::istringstream stream(query);
    std::string pair;
    while (std::getline(stream, pair, '&')) {
        size_t eq = pair.find('=');
        if (eq == std::string::npos) {
            continue;
        }
        out[pair.substr(0, eq)] = pair.substr(eq + 1);
    }
    return out;
}`,

      `// build_query_string renders a parameter map as an encoded query string.
std::string build_query_string(
    const std::map<std::string, std::string>& params) {
    std::string out;
    for (const auto& entry : params) {
        if (!out.empty()) {
            out.push_back('&');
        }
        out += url_encode(entry.first);
        out.push_back('=');
        out += url_encode(entry.second);
    }
    return out;
}`,

      `// split_host_port separates "host:port" into its parts.
bool split_host_port(const std::string& address, std::string& host,
                     std::string& port) {
    size_t colon = address.rfind(':');
    if (colon == std::string::npos) {
        host = address;
        port = "";
        return true;
    }
    host = address.substr(0, colon);
    port = address.substr(colon + 1);
    return !host.empty() && !port.empty();
}`,

      `// parse_cookies converts a raw Cookie header into a name -> value map.
std::map<std::string, std::string> parse_cookies(const std::string& header) {
    std::map<std::string, std::string> out;
    size_t pos = 0;
    while (pos <= header.size()) {
        size_t next = header.find(';', pos);
        if (next == std::string::npos) {
            next = header.size();
        }
        std::string part = header.substr(pos, next - pos);
        size_t eq = part.find('=');
        if (eq != std::string::npos) {
            out[trim_copy(part.substr(0, eq))] =
                trim_copy(part.substr(eq + 1));
        }
        pos = next + 1;
    }
    return out;
}`,

      `// ipv4_to_uint32 packs a dotted-quad IPv4 address into a 32-bit integer.
bool ipv4_to_uint32(const std::string& address, uint32_t& out) {
    std::istringstream stream(address);
    uint32_t value = 0;
    for (int i = 0; i < 4; ++i) {
        unsigned part;
        char dot;
        if (!(stream >> part) || part > 255) {
            return false;
        }
        value = (value << 8) | part;
        if (i < 3 && (!(stream >> dot) || dot != '.')) {
            return false;
        }
    }
    if (!stream.eof()) {
        return false;
    }
    out = value;
    return true;
}`,

      `// ipv4_in_cidr reports whether address falls inside the CIDR range.
bool ipv4_in_cidr(const std::string& address, const std::string& cidr) {
    size_t slash = cidr.find('/');
    if (slash == std::string::npos) {
        return false;
    }
    uint32_t ip, network;
    if (!ipv4_to_uint32(address, ip) ||
        !ipv4_to_uint32(cidr.substr(0, slash), network)) {
        return false;
    }
    int prefix = std::stoi(cidr.substr(slash + 1));
    uint32_t mask = 0;
    if (prefix >= 32) {
        mask = 0xFFFFFFFFu;
    } else if (prefix > 0) {
        mask = ~0u << (32 - prefix);
    }
    return (ip & mask) == (network & mask);
}`,

      `// is_private_ipv4 reports whether an address belongs to a private range.
bool is_private_ipv4(const std::string& address) {
    uint32_t ip;
    if (!ipv4_to_uint32(address, ip)) {
        return false;
    }
    if ((ip >> 24) == 10) return true;                    // 10/8
    if ((ip >> 20) == (172 << 4) + 1) return true;        // 172.16/12
    if ((ip >> 16) == (192 << 8) + 168) return true;      // 192.168/16
    if ((ip >> 24) == 127) return true;                   // loopback
    return false;
}`,

      `// default_port returns the conventional port for common URL schemes.
std::string default_port(const std::string& scheme) {
    if (scheme == "http") return "80";
    if (scheme == "https") return "443";
    if (scheme == "ftp") return "21";
    if (scheme == "ssh") return "22";
    if (scheme == "smtp") return "25";
    return "";
}`,

      `// redact_url strips the query string and fragment from a URL for
// logging.
std::string redact_url(const std::string& raw) {
    size_t end = raw.size();
    size_t query = raw.find('?');
    size_t fragment = raw.find('#');
    if (query != std::string::npos && query < end) end = query;
    if (fragment != std::string::npos && fragment < end) end = fragment;
    return raw.substr(0, end);
}`,

      `// headers_to_map parses "Key: value" header lines into a map.
std::map<std::string, std::string> headers_to_map(
    const std::vector<std::string>& lines) {
    std::map<std::string, std::string> out;
    for (const std::string& line : lines) {
        size_t colon = line.find(':');
        if (colon == std::string::npos) {
            continue;
        }
        out[trim_copy(line.substr(0, colon))] =
            trim_copy(line.substr(colon + 1));
    }
    return out;
}`,

      `// http_status_text maps common HTTP status codes to their reason phrases.
const char* http_status_text(int code) {
    switch (code) {
    case 200: return "OK";
    case 201: return "Created";
    case 204: return "No Content";
    case 301: return "Moved Permanently";
    case 304: return "Not Modified";
    case 400: return "Bad Request";
    case 401: return "Unauthorized";
    case 403: return "Forbidden";
    case 404: return "Not Found";
    case 409: return "Conflict";
    case 422: return "Unprocessable Entity";
    case 429: return "Too Many Requests";
    case 500: return "Internal Server Error";
    case 502: return "Bad Gateway";
    case 503: return "Service Unavailable";
    default: return "";
    }
}`,

      `// checksum8 sums the bytes of data, returning the low 8 bits.
unsigned char checksum8(const std::string& data) {
    unsigned int sum = 0;
    for (unsigned char c : data) {
        sum += c;
    }
    return static_cast<unsigned char>(sum & 0xFF);
}`,

      `// RequestLine is the first line of an HTTP request.
struct RequestLine {
    std::string method;
    std::string target;
    std::string version;
};

// parse_http_request_line parses "GET /path HTTP/1.1".
bool parse_http_request_line(const std::string& line, RequestLine& out) {
    std::istringstream stream(line);
    return static_cast<bool>(stream >> out.method >> out.target >> out.version);
}`,
    ],
  },

  {
    file: 'formatting_utils.cpp',
    topic: 'number, size and text formatting',
    includes: ['<algorithm>', '<cctype>', '<iomanip>', '<sstream>', '<string>', '<vector>'],
    units: [
      `// comma_separate inserts thousands separators into an integer.
std::string comma_separate(long long n) {
    bool negative = n < 0;
    std::string digits = std::to_string(negative ? -n : n);
    std::string out;
    int count = 0;
    for (int i = static_cast<int>(digits.size()) - 1; i >= 0; --i) {
        out.push_back(digits[i]);
        if (++count % 3 == 0 && i > 0) {
            out.push_back(',');
        }
    }
    std::reverse(out.begin(), out.end());
    return negative ? "-" + out : out;
}`,

      `// percent_string renders a fraction as a percentage with fixed decimals.
std::string percent_string(double value, int decimals) {
    std::ostringstream out;
    out << std::fixed << std::setprecision(decimals) << (value * 100.0) << "%";
    return out.str();
}`,

      `// human_bytes renders a byte count as a compact human-readable size.
std::string human_bytes(long long bytes) {
    const char* units[] = {"B", "KiB", "MiB", "GiB", "TiB"};
    double value = static_cast<double>(bytes);
    int unit = 0;
    while (value >= 1024.0 && unit < 4) {
        value /= 1024.0;
        ++unit;
    }
    std::ostringstream out;
    out << std::fixed << std::setprecision(unit == 0 ? 0 : 1) << value << " "
        << units[unit];
    return out.str();
}`,

      `// human_duration renders seconds as "2h 5m" style text.
std::string human_duration(long long seconds) {
    std::ostringstream out;
    if (seconds < 60) {
        out << seconds << "s";
        return out.str();
    }
    long long minutes = seconds / 60;
    if (minutes < 60) {
        out << minutes << "m " << (seconds % 60) << "s";
        return out.str();
    }
    long long hours = minutes / 60;
    if (hours < 24) {
        out << hours << "h " << (minutes % 60) << "m";
        return out.str();
    }
    out << (hours / 24) << "d " << (hours % 24) << "h";
    return out.str();
}`,

      `// pluralize appends an "s" unless count is exactly one.
std::string pluralize(size_t count, const std::string& singular) {
    return count == 1 ? singular : singular + "s";
}`,

      `// ordinal_suffix returns the ordinal form of a number, e.g. 3 -> "3rd".
std::string ordinal_suffix(int n) {
    int mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) {
        return std::to_string(n) + "th";
    }
    switch (n % 10) {
    case 1: return std::to_string(n) + "st";
    case 2: return std::to_string(n) + "nd";
    case 3: return std::to_string(n) + "rd";
    default: return std::to_string(n) + "th";
    }
}`,

      `// join_with_and renders a list in prose form: "a, b and c".
std::string join_with_and(const std::vector<std::string>& items) {
    if (items.empty()) {
        return "";
    }
    if (items.size() == 1) {
        return items.front();
    }
    std::string out;
    for (size_t i = 0; i + 1 < items.size(); ++i) {
        if (i > 0) {
            out += ", ";
        }
        out += items[i];
    }
    out += " and " + items.back();
    return out;
}`,

      `// format_money renders a dollar amount given in cents.
std::string format_money(long long cents) {
    bool negative = cents < 0;
    long long abs = negative ? -cents : cents;
    std::string dollars = comma_separate(abs / 100);
    long long remainder = abs % 100;
    std::ostringstream out;
    if (negative) {
        out << "-";
    }
    out << dollars << "." << std::setw(2) << std::setfill('0') << remainder;
    return out.str();
}`,

      `// truncate_middle keeps the start and end of a long string.
std::string truncate_middle(const std::string& text, size_t maxLength) {
    if (text.size() <= maxLength || maxLength <= 3) {
        return text;
    }
    size_t keep = (maxLength - 3) / 2;
    return text.substr(0, keep) + "..." +
           text.substr(text.size() - keep);
}`,

      `// format_ratio renders a ratio in reduced form, e.g. 8:4 -> "2:1".
std::string format_ratio(int a, int b) {
    int x = a < 0 ? -a : a;
    int y = b < 0 ? -b : b;
    while (y != 0) {
        int t = x % y;
        x = y;
        y = t;
    }
    if (x == 0) {
        return "0:0";
    }
    return std::to_string(a / x) + ":" + std::to_string(b / x);
}`,

      `// pad_number zero-pads an integer to at least width digits.
std::string pad_number(int n, int width) {
    std::ostringstream out;
    out << std::setw(width) << std::setfill('0') << n;
    return out.str();
}`,

      `// relative_time renders a seconds-ago value as "5m ago".
std::string relative_time(long long secondsAgo) {
    if (secondsAgo < 60) {
        return "just now";
    }
    if (secondsAgo < 3600) {
        return std::to_string(secondsAgo / 60) + "m ago";
    }
    if (secondsAgo < 86400) {
        return std::to_string(secondsAgo / 3600) + "h ago";
    }
    return std::to_string(secondsAgo / 86400) + "d ago";
}`,

      `// format_float renders a double with up to maxDecimals, dropping
// trailing zeros, e.g. 3.50 -> "3.5".
std::string format_float(double value, int maxDecimals) {
    std::ostringstream out;
    out << std::fixed << std::setprecision(maxDecimals) << value;
    std::string text = out.str();
    while (!text.empty() && text.back() == '0') {
        text.pop_back();
    }
    if (!text.empty() && text.back() == '.') {
        text.pop_back();
    }
    return text;
}`,

      `// upper_first capitalizes the first letter of a string.
std::string upper_first(const std::string& text) {
    if (text.empty()) {
        return text;
    }
    std::string out = text;
    out[0] = static_cast<char>(
        std::toupper(static_cast<unsigned char>(out[0])));
    return out;
}`,

      `// bytes_per_second renders a transfer rate from bytes and elapsed
// seconds.
std::string bytes_per_second(long long bytes, double seconds) {
    if (seconds <= 0.0) {
        return "0 B/s";
    }
    return human_bytes(static_cast<long long>(bytes / seconds)) + "/s";
}`,

      `// signed_number renders a double with an explicit sign and fixed
// decimals.
std::string signed_number(double value, int decimals) {
    std::ostringstream out;
    out << std::showpos << std::fixed << std::setprecision(decimals) << value;
    return out.str();
}`,

      `// percent_change reports the relative change from oldValue to newValue.
std::string percent_change(double oldValue, double newValue) {
    if (oldValue == 0.0) {
        return "n/a";
    }
    double change = (newValue - oldValue) / oldValue * 100.0;
    std::ostringstream out;
    out << std::showpos << std::fixed << std::setprecision(1) << change << "%";
    return out.str();
}`,

      `// size_with_unit appends a K/M/G/T suffix to a count.
std::string size_with_unit(long long count) {
    const char* suffixes[] = {"", "K", "M", "G", "T"};
    double value = static_cast<double>(count);
    int index = 0;
    while (value >= 1000.0 && index < 4) {
        value /= 1000.0;
        ++index;
    }
    std::ostringstream out;
    out << std::fixed << std::setprecision(index == 0 ? 0 : 1) << value
        << suffixes[index];
    return out.str();
}`,

      `// format_table_row pads cells to their column widths and joins them.
std::string format_table_row(const std::vector<std::string>& cells,
                             const std::vector<size_t>& widths) {
    std::string out;
    for (size_t i = 0; i < cells.size(); ++i) {
        if (i > 0) {
            out += "  ";
        }
        std::string cell = cells[i];
        if (i < widths.size() && cell.size() < widths[i]) {
            cell.append(widths[i] - cell.size(), ' ');
        }
        out += cell;
    }
    return out;
}`,
    ],
  },
];
