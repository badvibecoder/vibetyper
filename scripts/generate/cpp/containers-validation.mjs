// Data module for scripts/generate/generate-cpp.mjs.
// Container classes and validation helpers.

export default [
  {
    file: 'containers_utils.cpp',
    topic: 'containers and collection helpers',
    includes: ['<deque>', '<list>', '<string>', '<unordered_map>', '<unordered_set>', '<vector>'],
    units: [
      `// Stack is a LIFO container of integers.
class Stack {
public:
    void push(int value);
    int pop();
    bool empty() const;
    size_t size() const;

private:
    std::vector<int> items_;
};

void Stack::push(int value) {
    items_.push_back(value);
}

int Stack::pop() {
    int top = items_.back();
    items_.pop_back();
    return top;
}

bool Stack::empty() const {
    return items_.empty();
}

size_t Stack::size() const {
    return items_.size();
}`,

      `// StringQueue is a FIFO queue of strings.
class StringQueue {
public:
    void enqueue(const std::string& value);
    std::string dequeue();
    bool empty() const;
    size_t size() const;

private:
    std::deque<std::string> items_;
};

void StringQueue::enqueue(const std::string& value) {
    items_.push_back(value);
}

std::string StringQueue::dequeue() {
    std::string front = items_.front();
    items_.pop_front();
    return front;
}

bool StringQueue::empty() const {
    return items_.empty();
}

size_t StringQueue::size() const {
    return items_.size();
}`,

      `// StringSet stores unique strings.
class StringSet {
public:
    void add(const std::string& value);
    bool has(const std::string& value) const;
    void remove(const std::string& value);
    size_t size() const;

private:
    std::unordered_set<std::string> items_;
};

void StringSet::add(const std::string& value) {
    items_.insert(value);
}

bool StringSet::has(const std::string& value) const {
    return items_.find(value) != items_.end();
}

void StringSet::remove(const std::string& value) {
    items_.erase(value);
}

size_t StringSet::size() const {
    return items_.size();
}`,

      `// RingBuffer is a fixed-capacity circular buffer of integers.
class RingBuffer {
public:
    explicit RingBuffer(size_t capacity);
    void write(int value);
    bool read(int& value);
    size_t size() const;

private:
    std::vector<int> data_;
    size_t head_ = 0;
    size_t count_ = 0;
};

RingBuffer::RingBuffer(size_t capacity) : data_(capacity) {}

void RingBuffer::write(int value) {
    if (data_.empty()) {
        return;
    }
    data_[(head_ + count_) % data_.size()] = value;
    if (count_ < data_.size()) {
        ++count_;
    } else {
        head_ = (head_ + 1) % data_.size();
    }
}

bool RingBuffer::read(int& value) {
    if (count_ == 0) {
        return false;
    }
    value = data_[head_];
    head_ = (head_ + 1) % data_.size();
    --count_;
    return true;
}

size_t RingBuffer::size() const {
    return count_;
}`,

      `// LRUCache evicts the least recently used entry when it reaches capacity.
class LRUCache {
public:
    explicit LRUCache(size_t capacity);
    bool get(const std::string& key, std::string& value);
    void put(const std::string& key, const std::string& value);

private:
    using Entry = std::pair<std::string, std::string>;
    std::list<Entry> order_;
    std::unordered_map<std::string, std::list<Entry>::iterator> lookup_;
    size_t capacity_;
};

LRUCache::LRUCache(size_t capacity) : capacity_(capacity) {}

bool LRUCache::get(const std::string& key, std::string& value) {
    auto it = lookup_.find(key);
    if (it == lookup_.end()) {
        return false;
    }
    order_.splice(order_.begin(), order_, it->second);
    value = it->second->second;
    return true;
}

void LRUCache::put(const std::string& key, const std::string& value) {
    auto it = lookup_.find(key);
    if (it != lookup_.end()) {
        it->second->second = value;
        order_.splice(order_.begin(), order_, it->second);
        return;
    }
    order_.emplace_front(key, value);
    lookup_[key] = order_.begin();
    if (order_.size() > capacity_) {
        lookup_.erase(order_.back().first);
        order_.pop_back();
    }
}`,

      `// frequency_map counts how often each string appears in a vector.
std::unordered_map<std::string, int> frequency_map(
    const std::vector<std::string>& items) {
    std::unordered_map<std::string, int> counts;
    for (const std::string& item : items) {
        counts[item]++;
    }
    return counts;
}`,

      `// chunk splits a vector into consecutive runs of at most size elements.
std::vector<std::vector<int>> chunk(const std::vector<int>& items, size_t size) {
    std::vector<std::vector<int>> out;
    if (size == 0) {
        return out;
    }
    for (size_t start = 0; start < items.size(); start += size) {
        size_t end = std::min(start + size, items.size());
        out.emplace_back(items.begin() + static_cast<long>(start),
                         items.begin() + static_cast<long>(end));
    }
    return out;
}`,

      `// unique_preserve_order removes duplicates, keeping first-seen order.
std::vector<std::string> unique_preserve_order(
    const std::vector<std::string>& items) {
    std::unordered_set<std::string> seen;
    std::vector<std::string> out;
    for (const std::string& item : items) {
        if (seen.insert(item).second) {
            out.push_back(item);
        }
    }
    return out;
}`,

      `// rotate_left shifts a vector left by k positions, wrapping around.
std::vector<int> rotate_left(const std::vector<int>& items, int k) {
    if (items.empty()) {
        return items;
    }
    k %= static_cast<int>(items.size());
    if (k < 0) {
        k += static_cast<int>(items.size());
    }
    std::vector<int> out;
    out.reserve(items.size());
    out.insert(out.end(), items.begin() + k, items.end());
    out.insert(out.end(), items.begin(), items.begin() + k);
    return out;
}`,

      `// min_value returns the smallest value in a vector.
template <typename T>
T min_value(const std::vector<T>& values) {
    if (values.empty()) {
        return T{};
    }
    T best = values.front();
    for (const T& v : values) {
        if (v < best) {
            best = v;
        }
    }
    return best;
}`,

      `// max_value returns the largest value in a vector.
template <typename T>
T max_value(const std::vector<T>& values) {
    if (values.empty()) {
        return T{};
    }
    T best = values.front();
    for (const T& v : values) {
        if (v > best) {
            best = v;
        }
    }
    return best;
}`,

      `// index_of returns the first index of target in items, or -1.
int index_of(const std::vector<std::string>& items, const std::string& target) {
    for (size_t i = 0; i < items.size(); ++i) {
        if (items[i] == target) {
            return static_cast<int>(i);
        }
    }
    return -1;
}`,

      `// merge_sorted merges two sorted vectors into one sorted vector.
std::vector<int> merge_sorted(const std::vector<int>& a,
                              const std::vector<int>& b) {
    std::vector<int> out;
    out.reserve(a.size() + b.size());
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) {
            out.push_back(a[i++]);
        } else {
            out.push_back(b[j++]);
        }
    }
    while (i < a.size()) {
        out.push_back(a[i++]);
    }
    while (j < b.size()) {
        out.push_back(b[j++]);
    }
    return out;
}`,
    ],
  },

  {
    file: 'validation_utils.cpp',
    topic: 'input validation helpers',
    includes: ['<cctype>', '<regex>', '<sstream>', '<string>', '<vector>'],
    units: [
      `// is_valid_email reports whether s looks like a plausible email address.
bool is_valid_email(const std::string& s) {
    static const std::regex pattern(
        R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_url reports whether s is an absolute http(s) URL.
bool is_valid_url(const std::string& s) {
    static const std::regex pattern(R"(^https?://[^\s/$.?#].[^\s]*$)");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_ipv4 reports whether s is a dotted-quad IPv4 address.
bool is_valid_ipv4(const std::string& s) {
    std::istringstream stream(s);
    int part;
    char dot;
    for (int i = 0; i < 4; ++i) {
        if (!(stream >> part) || part < 0 || part > 255) {
            return false;
        }
        if ((i < 3 && !(stream >> dot)) || (i < 3 && dot != '.')) {
            return false;
        }
    }
    return stream.eof();
}`,

      `// is_valid_port reports whether port is a valid TCP/UDP port number.
bool is_valid_port(int port) {
    return port >= 1 && port <= 65535;
}`,

      `// luhn_valid checks a card number against the Luhn checksum.
bool luhn_valid(const std::string& number) {
    int sum = 0;
    bool doubleDigit = false;
    for (int i = static_cast<int>(number.size()) - 1; i >= 0; --i) {
        int d = number[i] - '0';
        if (d < 0 || d > 9) {
            return false;
        }
        if (doubleDigit) {
            d *= 2;
            if (d > 9) {
                d -= 9;
            }
        }
        sum += d;
        doubleDigit = !doubleDigit;
    }
    return sum % 10 == 0;
}`,

      `// is_valid_hex_color reports whether s is a #RGB or #RRGGBB color.
bool is_valid_hex_color(const std::string& s) {
    static const std::regex pattern(R"(^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$)");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_uuid reports whether s is a canonical hyphenated UUID.
bool is_valid_uuid(const std::string& s) {
    static const std::regex pattern(
        R"(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_semver reports whether s looks like a semantic version.
bool is_valid_semver(const std::string& s) {
    static const std::regex pattern(
        R"(^v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$)");
    return std::regex_match(s, pattern);
}`,

      `// has_lowercase reports whether s contains a lowercase letter.
bool has_lowercase(const std::string& s) {
    for (char c : s) {
        if (std::islower(static_cast<unsigned char>(c))) {
            return true;
        }
    }
    return false;
}`,

      `// has_uppercase reports whether s contains an uppercase letter.
bool has_uppercase(const std::string& s) {
    for (char c : s) {
        if (std::isupper(static_cast<unsigned char>(c))) {
            return true;
        }
    }
    return false;
}`,

      `// has_digit reports whether s contains a decimal digit.
bool has_digit(const std::string& s) {
    for (char c : s) {
        if (std::isdigit(static_cast<unsigned char>(c))) {
            return true;
        }
    }
    return false;
}`,

      `// has_symbol reports whether s contains a non-alphanumeric symbol.
bool has_symbol(const std::string& s) {
    for (char c : s) {
        if (!std::isalnum(static_cast<unsigned char>(c)) &&
            !std::isspace(static_cast<unsigned char>(c))) {
            return true;
        }
    }
    return false;
}`,

      `// is_strong_password requires at least 8 characters and three character
// classes.
bool is_strong_password(const std::string& s) {
    if (s.size() < 8) {
        return false;
    }
    int classes = 0;
    if (has_lowercase(s)) ++classes;
    if (has_uppercase(s)) ++classes;
    if (has_digit(s)) ++classes;
    if (has_symbol(s)) ++classes;
    return classes >= 3;
}`,

      `// is_balanced_brackets verifies that (), [] and {} pairs are nested
// correctly.
bool is_balanced_brackets(const std::string& text) {
    std::vector<char> stack;
    for (char c : text) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push_back(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.empty()) {
                return false;
            }
            char open = stack.back();
            if ((c == ')' && open != '(') ||
                (c == ']' && open != '[') ||
                (c == '}' && open != '{')) {
                return false;
            }
            stack.pop_back();
        }
    }
    return stack.empty();
}`,

      `// is_valid_isbn13 validates a 13-digit ISBN via its checksum digit.
bool is_valid_isbn13(const std::string& isbn) {
    std::vector<int> digits;
    for (char c : isbn) {
        if (c == '-') {
            continue;
        }
        if (c < '0' || c > '9') {
            return false;
        }
        digits.push_back(c - '0');
    }
    if (digits.size() != 13) {
        return false;
    }
    int sum = 0;
    for (size_t i = 0; i < digits.size(); ++i) {
        sum += (i % 2 == 0) ? digits[i] : digits[i] * 3;
    }
    return sum % 10 == 0;
}`,

      `// is_valid_slug reports whether s is a lowercase hyphen-separated slug.
bool is_valid_slug(const std::string& s) {
    static const std::regex pattern(R"(^[a-z0-9]+(?:-[a-z0-9]+)*$)");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_hostname reports whether s is a well-formed DNS hostname.
bool is_valid_hostname(const std::string& s) {
    if (s.size() > 253) {
        return false;
    }
    static const std::regex pattern(
        R"(^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$)");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_phone accepts common international phone formats.
bool is_valid_phone(const std::string& s) {
    static const std::regex pattern(R"(^\+?[0-9][0-9\s().-]{6,19}$)");
    return std::regex_match(s, pattern);
}`,

      `// is_all_digits reports whether every character of s is a digit.
bool is_all_digits(const std::string& s) {
    if (s.empty()) {
        return false;
    }
    for (char c : s) {
        if (!std::isdigit(static_cast<unsigned char>(c))) {
            return false;
        }
    }
    return true;
}`,

      `// is_valid_mac reports whether s is a colon-separated MAC address.
bool is_valid_mac(const std::string& s) {
    static const std::regex pattern(
        R"(^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$)");
    return std::regex_match(s, pattern);
}`,

      `// is_valid_zip reports whether s is a US ZIP or ZIP+4 code.
bool is_valid_zip(const std::string& s) {
    static const std::regex pattern(R"(^\d{5}(-\d{4})?$)");
    return std::regex_match(s, pattern);
}`,
    ],
  },
];
