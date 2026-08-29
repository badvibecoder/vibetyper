// Data module for scripts/generate/generate-cpp.mjs.
// Hand-written, realistic C++ units grouped by output file.

export default [
  {
    file: 'string_utils.cpp',
    topic: 'string utilities',
    includes: ['<algorithm>', '<cctype>', '<sstream>', '<string>', '<unordered_map>', '<vector>'],
    units: [
      `// to_lower returns a lowercase copy of the input string.
std::string to_lower(std::string text) {
    std::transform(text.begin(), text.end(), text.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return text;
}`,

      `// to_upper returns an uppercase copy of the input string.
std::string to_upper(std::string text) {
    std::transform(text.begin(), text.end(), text.begin(),
                   [](unsigned char c) { return std::toupper(c); });
    return text;
}`,

      `// swapcase flips the case of every letter in text.
std::string swapcase(const std::string& text) {
    std::string out = text;
    for (char& c : out) {
        unsigned char u = static_cast<unsigned char>(c);
        if (std::islower(u)) {
            c = static_cast<char>(std::toupper(u));
        } else if (std::isupper(u)) {
            c = static_cast<char>(std::tolower(u));
        }
    }
    return out;
}`,

      `// trim removes leading and trailing whitespace from a string.
std::string trim(const std::string& text) {
    size_t start = text.find_first_not_of(" \\t\\r\\n");
    if (start == std::string::npos) {
        return "";
    }
    size_t end = text.find_last_not_of(" \\t\\r\\n");
    return text.substr(start, end - start + 1);
}`,

      `// split breaks text into pieces on the given delimiter.
std::vector<std::string> split(const std::string& text, char delimiter) {
    std::vector<std::string> parts;
    std::stringstream stream(text);
    std::string piece;
    while (std::getline(stream, piece, delimiter)) {
        parts.push_back(piece);
    }
    return parts;
}`,

      `// join concatenates items with a separator between them.
std::string join(const std::vector<std::string>& items, const std::string& separator) {
    std::ostringstream out;
    for (size_t i = 0; i < items.size(); ++i) {
        if (i > 0) {
            out << separator;
        }
        out << items[i];
    }
    return out.str();
}`,

      `// replace_all swaps every occurrence of from for to in text.
std::string replace_all(std::string text, const std::string& from, const std::string& to) {
    if (from.empty()) {
        return text;
    }
    size_t pos = 0;
    while ((pos = text.find(from, pos)) != std::string::npos) {
        text.replace(pos, from.size(), to);
        pos += to.size();
    }
    return text;
}`,

      `// starts_with reports whether text begins with the given prefix.
bool starts_with(const std::string& text, const std::string& prefix) {
    return text.size() >= prefix.size() &&
           text.compare(0, prefix.size(), prefix) == 0;
}`,

      `// ends_with reports whether text ends with the given suffix.
bool ends_with(const std::string& text, const std::string& suffix) {
    return text.size() >= suffix.size() &&
           text.compare(text.size() - suffix.size(), suffix.size(), suffix) == 0;
}`,

      `// is_blank reports whether text is empty or only whitespace.
bool is_blank(const std::string& text) {
    for (char c : text) {
        if (!std::isspace(static_cast<unsigned char>(c))) {
            return false;
        }
    }
    return true;
}`,

      `// count_occurrences counts how often needle appears in text.
size_t count_occurrences(const std::string& text, const std::string& needle) {
    size_t count = 0;
    size_t pos = 0;
    while ((pos = text.find(needle, pos)) != std::string::npos) {
        ++count;
        pos += needle.size();
    }
    return count;
}`,

      `// is_anagram reports whether two strings use exactly the same letters.
bool is_anagram(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) {
        return false;
    }
    std::unordered_map<char, int> counts;
    for (char c : a) {
        counts[c]++;
    }
    for (char c : b) {
        if (--counts[c] < 0) {
            return false;
        }
    }
    return true;
}`,

      `// word_count returns the number of whitespace-separated words in text.
size_t word_count(const std::string& text) {
    std::istringstream stream(text);
    std::string word;
    size_t count = 0;
    while (stream >> word) {
        ++count;
    }
    return count;
}`,

      `// to_title_case capitalizes the first letter of every word.
std::string to_title_case(const std::string& text) {
    std::string out = text;
    bool newWord = true;
    for (char& c : out) {
        if (std::isspace(static_cast<unsigned char>(c))) {
            newWord = true;
        } else if (newWord) {
            c = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
            newWord = false;
        } else {
            c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        }
    }
    return out;
}`,

      `// truncate cuts text at a word boundary and appends an ellipsis.
std::string truncate(const std::string& text, size_t maxLength) {
    if (text.size() <= maxLength) {
        return text;
    }
    size_t cut = text.find_last_of(' ', maxLength);
    if (cut == std::string::npos || cut == 0) {
        cut = maxLength;
    }
    return text.substr(0, cut) + "...";
}`,

      `// pad_left prepends fill characters until text reaches width.
std::string pad_left(const std::string& text, size_t width, char fill) {
    if (text.size() >= width) {
        return text;
    }
    return std::string(width - text.size(), fill) + text;
}`,

      `// pad_right appends fill characters until text reaches width.
std::string pad_right(const std::string& text, size_t width, char fill) {
    if (text.size() >= width) {
        return text;
    }
    return text + std::string(width - text.size(), fill);
}`,

      `// extract_digits pulls every integer literal out of a string.
std::vector<int> extract_digits(const std::string& text) {
    std::vector<int> numbers;
    for (size_t i = 0; i < text.size();) {
        if (!std::isdigit(static_cast<unsigned char>(text[i]))) {
            ++i;
            continue;
        }
        size_t start = i;
        while (i < text.size() && std::isdigit(static_cast<unsigned char>(text[i]))) {
            ++i;
        }
        numbers.push_back(std::stoi(text.substr(start, i - start)));
    }
    return numbers;
}`,

      `// camel_to_snake converts "maxConnections" to "max_connections".
std::string camel_to_snake(const std::string& text) {
    std::string out;
    for (char c : text) {
        if (std::isupper(static_cast<unsigned char>(c))) {
            if (!out.empty()) {
                out.push_back('_');
            }
            out.push_back(static_cast<char>(std::tolower(static_cast<unsigned char>(c))));
        } else {
            out.push_back(c);
        }
    }
    return out;
}`,

      `// snake_to_camel converts "max_connections" to "maxConnections".
std::string snake_to_camel(const std::string& text) {
    std::string out;
    bool upperNext = false;
    for (char c : text) {
        if (c == '_') {
            upperNext = true;
        } else if (upperNext) {
            out.push_back(static_cast<char>(std::toupper(static_cast<unsigned char>(c))));
            upperNext = false;
        } else {
            out.push_back(c);
        }
    }
    return out;
}`,

      `// common_prefix returns the longest prefix shared by all given strings.
std::string common_prefix(const std::vector<std::string>& words) {
    if (words.empty()) {
        return "";
    }
    std::string prefix = words.front();
    for (size_t i = 1; i < words.size() && !prefix.empty(); ++i) {
        size_t len = 0;
        while (len < prefix.size() && len < words[i].size() &&
               prefix[len] == words[i][len]) {
            ++len;
        }
        prefix.resize(len);
    }
    return prefix;
}`,

      `// mask_middle hides the middle of a string, keeping the ends visible.
std::string mask_middle(const std::string& text, size_t keepStart, size_t keepEnd) {
    if (text.size() <= keepStart + keepEnd) {
        return std::string(text.size(), '*');
    }
    return text.substr(0, keepStart) +
           std::string(text.size() - keepStart - keepEnd, '*') +
           text.substr(text.size() - keepEnd);
}`,

      `// slugify converts arbitrary text into a lowercase hyphen-separated slug.
std::string slugify(const std::string& text) {
    std::string slug;
    bool lastDash = false;
    for (unsigned char c : text) {
        if (std::isalnum(c)) {
            slug.push_back(static_cast<char>(std::tolower(c)));
            lastDash = false;
        } else if (!lastDash && !slug.empty()) {
            slug.push_back('-');
            lastDash = true;
        }
    }
    while (!slug.empty() && slug.back() == '-') {
        slug.pop_back();
    }
    return slug;
}`,

      `// levenshtein_distance computes the edit distance between two strings
// using a two-row dynamic programming table.
int levenshtein_distance(const std::string& a, const std::string& b) {
    std::vector<int> prev(b.size() + 1), curr(b.size() + 1);
    for (size_t j = 0; j <= b.size(); ++j) {
        prev[j] = static_cast<int>(j);
    }
    for (size_t i = 1; i <= a.size(); ++i) {
        curr[0] = static_cast<int>(i);
        for (size_t j = 1; j <= b.size(); ++j) {
            int cost = (a[i - 1] == b[j - 1]) ? 0 : 1;
            curr[j] = std::min({prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost});
        }
        std::swap(prev, curr);
    }
    return prev[b.size()];
}`,
    ],
  },

  {
    file: 'math_numeric.cpp',
    topic: 'math and numeric helpers',
    includes: ['<algorithm>', '<cmath>', '<string>', '<unordered_map>', '<utility>', '<vector>'],
    units: [
      `// gcd_of returns the greatest common divisor of two integers.
int gcd_of(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a < 0 ? -a : a;
}`,

      `// lcm_of returns the least common multiple of two positive integers.
long long lcm_of(int a, int b) {
    if (a == 0 || b == 0) {
        return 0;
    }
    return static_cast<long long>(a) / gcd_of(a, b) * b;
}`,

      `// is_prime reports whether n is a prime number via trial division.
bool is_prime(int n) {
    if (n < 2) {
        return false;
    }
    for (int d = 2; d * d <= n; ++d) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}`,

      `// sieve_of_eratosthenes marks composite numbers up to limit.
std::vector<bool> sieve_of_eratosthenes(int limit) {
    std::vector<bool> composite(limit + 1, false);
    for (int i = 2; i * i <= limit; ++i) {
        if (!composite[i]) {
            for (int j = i * i; j <= limit; j += i) {
                composite[j] = true;
            }
        }
    }
    return composite;
}`,

      `// nth_fibonacci returns the n-th Fibonacci number, 0-indexed.
long long nth_fibonacci(int n) {
    if (n < 2) {
        return n;
    }
    long long a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        long long next = a + b;
        a = b;
        b = next;
    }
    return b;
}`,

      `// factorial_iterative computes n! with a simple loop.
long long factorial_iterative(int n) {
    long long result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}`,

      `// binomial_coefficient computes C(n, k) without overflowing intermediate
// factorials.
long long binomial_coefficient(int n, int k) {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k > n - k) {
        k = n - k;
    }
    long long result = 1;
    for (int i = 1; i <= k; ++i) {
        result = result * (n - k + i) / i;
    }
    return result;
}`,

      `// mean_of returns the arithmetic average of a vector of doubles.
double mean_of(const std::vector<double>& values) {
    if (values.empty()) {
        return 0.0;
    }
    double sum = 0.0;
    for (double v : values) {
        sum += v;
    }
    return sum / static_cast<double>(values.size());
}`,

      `// median_of returns the middle value of a sorted copy of values.
double median_of(std::vector<double> values) {
    if (values.empty()) {
        return 0.0;
    }
    std::sort(values.begin(), values.end());
    size_t mid = values.size() / 2;
    if (values.size() % 2 == 1) {
        return values[mid];
    }
    return (values[mid - 1] + values[mid]) / 2.0;
}`,

      `// mode_of returns the most frequent value, first occurrence wins ties.
int mode_of(const std::vector<int>& values) {
    std::unordered_map<int, int> counts;
    int best = 0, bestCount = 0;
    for (int v : values) {
        int c = ++counts[v];
        if (c > bestCount) {
            best = v;
            bestCount = c;
        }
    }
    return best;
}`,

      `// variance_of computes the population variance of a sample.
double variance_of(const std::vector<double>& values) {
    if (values.size() < 2) {
        return 0.0;
    }
    double m = mean_of(values);
    double sum = 0.0;
    for (double v : values) {
        double diff = v - m;
        sum += diff * diff;
    }
    return sum / static_cast<double>(values.size());
}`,

      `// stddev_of returns the population standard deviation of values.
double stddev_of(const std::vector<double>& values) {
    return std::sqrt(variance_of(values));
}`,

      `// clamp_value restricts value to the inclusive range [lo, hi].
int clamp_value(int value, int lo, int hi) {
    return std::max(lo, std::min(hi, value));
}`,

      `// lerp linearly interpolates between a and b by the factor t.
double lerp(double a, double b, double t) {
    return a + (b - a) * t;
}`,

      `// round_to rounds value to the nearest multiple of 10^-places.
double round_to(double value, int places) {
    double factor = std::pow(10.0, places);
    return std::round(value * factor) / factor;
}`,

      `// is_perfect_square reports whether n is the square of an integer.
bool is_perfect_square(int n) {
    if (n < 0) {
        return false;
    }
    int root = static_cast<int>(std::sqrt(static_cast<double>(n)));
    return root * root == n;
}`,

      `// sum_digits adds up the decimal digits of a non-negative integer.
int sum_digits(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}`,

      `// reverse_number reverses the decimal digits of an integer.
int reverse_number(int n) {
    int reversed = 0;
    while (n != 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    return reversed;
}`,

      `// is_palindrome_number reports whether n reads the same both ways.
bool is_palindrome_number(int n) {
    if (n < 0) {
        return false;
    }
    return n == reverse_number(n);
}`,

      `// prime_factors decomposes n into its prime factors in ascending order.
std::vector<int> prime_factors(int n) {
    std::vector<int> factors;
    for (int d = 2; d * d <= n; ++d) {
        while (n % d == 0) {
            factors.push_back(d);
            n /= d;
        }
    }
    if (n > 1) {
        factors.push_back(n);
    }
    return factors;
}`,

      `// next_power_of_two returns the smallest power of two >= n.
int next_power_of_two(int n) {
    int p = 1;
    while (p < n) {
        p <<= 1;
    }
    return p;
}`,

      `// collatz_steps counts the steps for n to reach 1 under the Collatz rule.
int collatz_steps(int n) {
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {
            n /= 2;
        } else {
            n = 3 * n + 1;
        }
        ++steps;
    }
    return steps;
}`,

      `// int_to_roman converts an integer in [1, 3999] to Roman numerals.
std::string int_to_roman(int n) {
    const std::vector<std::pair<int, std::string>> table = {
        {1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"},
        {100, "C"}, {90, "XC"}, {50, "L"}, {40, "XL"},
        {10, "X"}, {9, "IX"}, {5, "V"}, {4, "IV"}, {1, "I"}};
    std::string out;
    for (const auto& entry : table) {
        while (n >= entry.first) {
            out += entry.second;
            n -= entry.first;
        }
    }
    return out;
}`,

      `// roman_to_int parses a Roman numeral string into an integer.
int roman_to_int(const std::string& roman) {
    std::unordered_map<char, int> values = {
        {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
        {'C', 100}, {'D', 500}, {'M', 1000}};
    int total = 0;
    int prev = 0;
    for (char c : roman) {
        int v = values[c];
        total += (v > prev) ? v - 2 * prev : v;
        prev = v;
    }
    return total;
}`,

      `// is_perfect_number reports whether n equals the sum of its proper
// divisors.
bool is_perfect_number(int n) {
    if (n < 2) {
        return false;
    }
    int sum = 1;
    for (int d = 2; d * d <= n; ++d) {
        if (n % d == 0) {
            sum += d;
            if (d != n / d) {
                sum += n / d;
            }
        }
    }
    return sum == n;
}`,

      `// digit_count returns how many decimal digits a non-negative integer has.
int digit_count(int n) {
    if (n == 0) {
        return 1;
    }
    int count = 0;
    while (n > 0) {
        ++count;
        n /= 10;
    }
    return count;
}`,
    ],
  },
];
