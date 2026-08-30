// generate-c.mjs
// Expands the C typing dictionary for vibetyper by writing a broad set of
// realistic, self-contained C units (functions and struct typedefs) across
// many topic files under dictionary/c/.
//
// Every "unit" is exactly ONE complete, balanced top-level braced block — what
// the braces-mode splitter in server/blockSplitter.js turns into a typing
// block. `#include` lines at the top of each file group into a single small
// header block, which is fine. Each unit is authored as a String.raw template
// literal so backslash escapes in C string/char literals stay literal.
//
// Run: node scripts/generate/generate-c.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../dictionary/c');

// Each entry: file name, human topic label, the #include lines for the file,
// and the list of balanced top-level units.
const FILES = [
  {
    file: 'string_utils.c',
    topic: 'string manipulation and parsing',
    includes: ['<ctype.h>', '<errno.h>', '<stdbool.h>', '<stddef.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`// str_reverse reverses a NUL-terminated string in place.
void str_reverse(char *s) {
    size_t len = strlen(s);
    for (size_t i = 0; i < len / 2; i++) {
        char tmp = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = tmp;
    }
}`,

      String.raw`// str_count_char counts occurrences of needle within haystack.
size_t str_count_char(const char *haystack, char needle) {
    size_t count = 0;
    for (const char *p = haystack; *p != '\0'; p++) {
        if (*p == needle) count++;
    }
    return count;
}`,

      String.raw`// str_trim removes leading and trailing whitespace in place and
// returns a pointer to the trimmed start of the string.
char *str_trim(char *s) {
    while (isspace((unsigned char)*s)) s++;
    char *end = s + strlen(s) - 1;
    while (end >= s && isspace((unsigned char)*end)) *end-- = '\0';
    return s;
}`,

      String.raw`// str_to_upper converts every ASCII letter in s to uppercase in place.
void str_to_upper(char *s) {
    for (char *p = s; *p != '\0'; p++) {
        if (*p >= 'a' && *p <= 'z') *p = (char)(*p - 'a' + 'A');
    }
}`,

      String.raw`// str_to_lower converts every ASCII letter in s to lowercase in place.
void str_to_lower(char *s) {
    for (char *p = s; *p != '\0'; p++) {
        if (*p >= 'A' && *p <= 'Z') *p = (char)(*p - 'A' + 'a');
    }
}`,

      String.raw`// str_starts_with reports whether s begins with prefix.
bool str_starts_with(const char *s, const char *prefix) {
    while (*prefix != '\0') {
        if (*s++ != *prefix++) return false;
    }
    return true;
}`,

      String.raw`// str_ends_with reports whether s ends with suffix.
bool str_ends_with(const char *s, const char *suffix) {
    size_t slen = strlen(s);
    size_t xlen = strlen(suffix);
    if (xlen > slen) return false;
    return strcmp(s + slen - xlen, suffix) == 0;
}`,

      String.raw`// str_find_last returns a pointer to the last occurrence of c, or NULL.
char *str_find_last(const char *s, char c) {
    const char *last = NULL;
    for (const char *p = s; *p != '\0'; p++) {
        if (*p == c) last = p;
    }
    return (char *)last;
}`,

      String.raw`// str_count_words counts whitespace-delimited words in s.
size_t str_count_words(const char *s) {
    size_t words = 0;
    bool in_word = false;
    for (const char *p = s; *p != '\0'; p++) {
        bool ws = isspace((unsigned char)*p);
        if (!ws && !in_word) { words++; in_word = true; }
        else if (ws) in_word = false;
    }
    return words;
}`,

      String.raw`// str_replace_char replaces every old byte with new, returning the count.
size_t str_replace_char(char *s, char old_c, char new_c) {
    size_t replaced = 0;
    for (char *p = s; *p != '\0'; p++) {
        if (*p == old_c) { *p = new_c; replaced++; }
    }
    return replaced;
}`,

      String.raw`// str_duplicate returns a heap copy of s, or NULL on allocation failure.
char *str_duplicate(const char *s) {
    size_t len = strlen(s) + 1;
    char *copy = malloc(len);
    if (copy == NULL) return NULL;
    memcpy(copy, s, len);
    return copy;
}`,

      String.raw`// str_concat joins two strings into a single heap allocation.
char *str_concat(const char *a, const char *b) {
    size_t la = strlen(a), lb = strlen(b);
    char *joined = malloc(la + lb + 1);
    if (joined == NULL) return NULL;
    memcpy(joined, a, la);
    memcpy(joined + la, b, lb + 1);
    return joined;
}`,

      String.raw`// str_join concatenates an array of strings with sep between them.
char *str_join(const char **parts, size_t count, const char *sep) {
    size_t sep_len = strlen(sep);
    size_t total = 1;
    for (size_t i = 0; i < count; i++) total += strlen(parts[i]) + (i ? sep_len : 0);
    char *out = malloc(total);
    if (out == NULL) return NULL;
    out[0] = '\0';
    for (size_t i = 0; i < count; i++) {
        if (i) strcat(out, sep);
        strcat(out, parts[i]);
    }
    return out;
}`,

      String.raw`// str_repeat returns a heap string with s repeated times times.
char *str_repeat(const char *s, size_t times) {
    size_t len = strlen(s);
    char *out = malloc(len * times + 1);
    if (out == NULL) return NULL;
    for (size_t i = 0; i < times; i++) memcpy(out + i * len, s, len);
    out[len * times] = '\0';
    return out;
}`,

      String.raw`// str_chop strips a single trailing newline or CR/LF pair in place.
void str_chop(char *line) {
    size_t len = strlen(line);
    while (len > 0 && (line[len - 1] == '\n' || line[len - 1] == '\r')) {
        line[--len] = '\0';
    }
}`,

      String.raw`// str_pad_left returns s left-padded with fill to at least width chars.
char *str_pad_left(const char *s, size_t width, char fill) {
    size_t len = strlen(s);
    size_t size = len > width ? len + 1 : width + 1;
    char *out = malloc(size);
    if (out == NULL) return NULL;
    size_t pad = len < width ? width - len : 0;
    for (size_t i = 0; i < pad; i++) out[i] = fill;
    memcpy(out + pad, s, len + 1);
    return out;
}`,

      String.raw`// str_cmp_ignore_case compares two strings without regard to case.
int str_cmp_ignore_case(const char *a, const char *b) {
    while (*a != '\0' && *b != '\0') {
        int ca = tolower((unsigned char)*a);
        int cb = tolower((unsigned char)*b);
        if (ca != cb) return ca - cb;
        a++;
        b++;
    }
    return tolower((unsigned char)*a) - tolower((unsigned char)*b);
}`,

      String.raw`// str_is_palindrome reports whether s reads the same forward and backward.
bool str_is_palindrome(const char *s) {
    size_t len = strlen(s);
    for (size_t i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) return false;
    }
    return true;
}`,

      String.raw`// str_remove deletes the first occurrence of sub from s in place.
bool str_remove(char *s, const char *sub) {
    char *found = strstr(s, sub);
    if (found == NULL) return false;
    char *tail = found + strlen(sub);
    memmove(found, tail, strlen(tail) + 1);
    return true;
}`,

      String.raw`// str_to_long parses a base-10 integer, reporting success via *ok.
long str_to_long(const char *s, bool *ok) {
    char *end = NULL;
    errno = 0;
    long value = strtol(s, &end, 10);
    *ok = errno == 0 && end != s && *end == '\0';
    return value;
}`,
    ],
  },

  {
    file: 'math_numeric.c',
    topic: 'math and numeric utilities',
    includes: ['<math.h>', '<stdbool.h>', '<stddef.h>', '<stdint.h>', '<stdlib.h>'],
    units: [
      String.raw`// math_gcd returns the greatest common divisor of a and b (Euclid).
int math_gcd(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a < 0 ? -a : a;
}`,

      String.raw`// math_lcm returns the least common multiple of a and b.
int math_lcm(int a, int b) {
    int g = math_gcd(a, b);
    return g == 0 ? 0 : (a / g) * b;
}`,

      String.raw`// math_factorial returns n! as a 64-bit value (overflow is caller's concern).
uint64_t math_factorial(unsigned int n) {
    uint64_t result = 1;
    for (unsigned int i = 2; i <= n; i++) result *= i;
    return result;
}`,

      String.raw`// math_fibonacci returns the nth Fibonacci number, F(0) = 0.
uint64_t math_fibonacci(unsigned int n) {
    uint64_t a = 0, b = 1;
    for (unsigned int i = 0; i < n; i++) {
        uint64_t next = a + b;
        a = b;
        b = next;
    }
    return a;
}`,

      String.raw`// math_is_prime tests primality with trial division by odd factors.
bool math_is_prime(uint64_t n) {
    if (n < 2) return false;
    if (n % 2 == 0) return n == 2;
    for (uint64_t d = 3; d * d <= n; d += 2) {
        if (n % d == 0) return false;
    }
    return true;
}`,

      String.raw`// math_next_prime returns the smallest prime greater than n.
uint64_t math_next_prime(uint64_t n) {
    uint64_t candidate = n < 2 ? 2 : n + 1;
    if (candidate > 2 && candidate % 2 == 0) candidate++;
    while (!math_is_prime(candidate)) candidate += 2;
    return candidate;
}`,

      String.raw`// math_isqrt returns floor(sqrt(n)) using Newton's method.
uint64_t math_isqrt(uint64_t n) {
    if (n < 2) return n;
    uint64_t x = n, y = (x + 1) / 2;
    while (y < x) {
        x = y;
        y = (y + n / y) / 2;
    }
    return x;
}`,

      String.raw`// math_pow_int raises base to exp using exponentiation by squaring.
int64_t math_pow_int(int64_t base, unsigned int exp) {
    int64_t result = 1;
    while (exp > 0) {
        if (exp & 1u) result *= base;
        base *= base;
        exp >>= 1u;
    }
    return result;
}`,

      String.raw`// math_is_perfect_square reports whether n is an exact square.
bool math_is_perfect_square(uint64_t n) {
    uint64_t r = math_isqrt(n);
    return r * r == n;
}`,

      String.raw`// math_sum_digits sums the decimal digits of n.
unsigned int math_sum_digits(uint64_t n) {
    unsigned int sum = 0;
    while (n > 0) {
        sum += (unsigned int)(n % 10);
        n /= 10;
    }
    return sum;
}`,

      String.raw`// math_reverse_digits reverses the decimal digits of n.
uint64_t math_reverse_digits(uint64_t n) {
    uint64_t reversed = 0;
    while (n > 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    return reversed;
}`,

      String.raw`// math_count_digits counts the decimal digits of n.
unsigned int math_count_digits(uint64_t n) {
    unsigned int count = n == 0 ? 1 : 0;
    while (n > 0) {
        count++;
        n /= 10;
    }
    return count;
}`,

      String.raw`// math_is_armstrong reports whether n equals the sum of its digits
// each raised to the power of the digit count.
bool math_is_armstrong(uint64_t n) {
    unsigned int digits = math_count_digits(n);
    uint64_t sum = 0, rest = n;
    while (rest > 0) {
        unsigned int d = (unsigned int)(rest % 10);
        sum += (uint64_t)math_pow_int(d, digits);
        rest /= 10;
    }
    return sum == n;
}`,

      String.raw`// math_is_palindrome_number reports whether n reads the same reversed.
bool math_is_palindrome_number(uint64_t n) {
    return n == math_reverse_digits(n);
}`,

      String.raw`// math_random_range returns a uniform integer in [min, max].
int math_random_range(int min, int max) {
    if (min > max) {
        int t = min;
        min = max;
        max = t;
    }
    return min + rand() % (max - min + 1);
}`,

      String.raw`// math_clamp constrains value to the inclusive range [low, high].
int math_clamp(int value, int low, int high) {
    if (value < low) return low;
    if (value > high) return high;
    return value;
}`,

      String.raw`// math_lerp linearly interpolates between a and b by t in [0, 1].
double math_lerp(double a, double b, double t) {
    return a + (b - a) * t;
}`,

      String.raw`// math_solve_quadratic solves ax^2 + bx + c = 0, storing up to two real
// roots in roots and returning the number of real roots found.
int math_solve_quadratic(double a, double b, double c, double roots[2]) {
    if (a == 0.0) {
        if (b == 0.0) return 0;
        roots[0] = -c / b;
        return 1;
    }
    double disc = b * b - 4.0 * a * c;
    if (disc < 0.0) return 0;
    if (disc == 0.0) {
        roots[0] = -b / (2.0 * a);
        return 1;
    }
    double s = sqrt(disc);
    roots[0] = (-b - s) / (2.0 * a);
    roots[1] = (-b + s) / (2.0 * a);
    return 2;
}`,

      String.raw`// math_sieve_count_primes counts primes <= limit with a byte sieve.
size_t math_sieve_count_primes(uint64_t limit) {
    if (limit < 2) return 0;
    unsigned char *composite = calloc((size_t)limit + 1, 1);
    if (composite == NULL) return 0;
    size_t count = 0;
    for (uint64_t i = 2; i <= limit; i++) {
        if (!composite[i]) {
            count++;
            for (uint64_t j = i * i; j <= limit; j += i) composite[j] = 1;
        }
    }
    free(composite);
    return count;
}`,

      String.raw`// math_round_to_nearest rounds value to the nearest multiple of step.
long math_round_to_nearest(long value, long step) {
    if (step <= 0) return value;
    long remainder = value % step;
    if (remainder * 2 >= step) return value + (step - remainder);
    return value - remainder;
}`,
    ],
  },

  {
    file: 'arrays_collections.c',
    topic: 'array and collection helpers',
    includes: ['<limits.h>', '<stdbool.h>', '<stddef.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`// array_sum returns the sum of every element in values.
long array_sum(const int *values, size_t count) {
    long total = 0;
    for (size_t i = 0; i < count; i++) total += values[i];
    return total;
}`,

      String.raw`// array_min returns the smallest element, or 0 for an empty array.
int array_min(const int *values, size_t count) {
    if (count == 0) return 0;
    int best = values[0];
    for (size_t i = 1; i < count; i++) {
        if (values[i] < best) best = values[i];
    }
    return best;
}`,

      String.raw`// array_max returns the largest element, or 0 for an empty array.
int array_max(const int *values, size_t count) {
    if (count == 0) return 0;
    int best = values[0];
    for (size_t i = 1; i < count; i++) {
        if (values[i] > best) best = values[i];
    }
    return best;
}`,

      String.raw`// array_average returns the arithmetic mean, or 0.0 for an empty array.
double array_average(const int *values, size_t count) {
    if (count == 0) return 0.0;
    return (double)array_sum(values, count) / (double)count;
}`,

      String.raw`// array_reverse reverses the element order in place.
void array_reverse(int *values, size_t count) {
    for (size_t i = 0; i < count / 2; i++) {
        int tmp = values[i];
        values[i] = values[count - 1 - i];
        values[count - 1 - i] = tmp;
    }
}`,

      String.raw`// array_rotate_left shifts every element steps positions to the left.
void array_rotate_left(int *values, size_t count, size_t steps) {
    if (count == 0) return;
    steps %= count;
    for (size_t s = 0; s < steps; s++) {
        int first = values[0];
        for (size_t i = 0; i + 1 < count; i++) values[i] = values[i + 1];
        values[count - 1] = first;
    }
}`,

      String.raw`// array_shuffle permutes values in place with the Fisher-Yates method.
void array_shuffle(int *values, size_t count) {
    for (size_t i = count; i > 1; i--) {
        size_t j = (size_t)rand() % i;
        int tmp = values[i - 1];
        values[i - 1] = values[j];
        values[j] = tmp;
    }
}`,

      String.raw`// array_find returns the index of the first match, or (size_t)-1 if absent.
size_t array_find(const int *values, size_t count, int target) {
    for (size_t i = 0; i < count; i++) {
        if (values[i] == target) return i;
    }
    return (size_t)-1;
}`,

      String.raw`// array_contains reports whether target appears anywhere in values.
bool array_contains(const int *values, size_t count, int target) {
    return array_find(values, count, target) != (size_t)-1;
}`,

      String.raw`// array_unique_count counts distinct values using quadratic scan.
size_t array_unique_count(const int *values, size_t count) {
    size_t distinct = 0;
    for (size_t i = 0; i < count; i++) {
        bool seen = false;
        for (size_t j = 0; j < i; j++) {
            if (values[j] == values[i]) { seen = true; break; }
        }
        if (!seen) distinct++;
    }
    return distinct;
}`,

      String.raw`// array_copy returns a heap copy of values, or NULL on failure.
int *array_copy(const int *src, size_t count) {
    int *copy = malloc(count * sizeof(int));
    if (copy == NULL) return NULL;
    memcpy(copy, src, count * sizeof(int));
    return copy;
}`,

      String.raw`// array_swap_elements exchanges elements at indices i and j (if valid).
void array_swap_elements(int *values, size_t i, size_t j, size_t count) {
    if (i >= count || j >= count) return;
    int tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
}`,

      String.raw`// array_running_sum writes cumulative prefix sums into out.
void array_running_sum(const int *values, size_t count, long *out) {
    long total = 0;
    for (size_t i = 0; i < count; i++) {
        total += values[i];
        out[i] = total;
    }
}`,

      String.raw`// array_second_largest returns the second largest distinct value, or the
// largest value when fewer than two distinct values exist.
int array_second_largest(const int *values, size_t count) {
    int largest = array_max(values, count);
    int second = INT_MIN;
    for (size_t i = 0; i < count; i++) {
        if (values[i] != largest && values[i] > second) second = values[i];
    }
    return second == INT_MIN ? largest : second;
}`,

      String.raw`// array_majority_element returns an element appearing more than count/2
// times (Boyer-Moore voting), or INT_MIN when there is none.
int array_majority_element(const int *values, size_t count) {
    int candidate = 0;
    int votes = 0;
    for (size_t i = 0; i < count; i++) {
        if (votes == 0) candidate = values[i];
        votes += values[i] == candidate ? 1 : -1;
    }
    size_t tally = 0;
    for (size_t i = 0; i < count; i++) {
        if (values[i] == candidate) tally++;
    }
    return tally > count / 2 ? candidate : INT_MIN;
}`,

      String.raw`// array_merge_sorted merges two sorted arrays into a new allocation.
int *array_merge_sorted(const int *a, size_t na, const int *b, size_t nb, size_t *out_count) {
    int *merged = malloc((na + nb) * sizeof(int));
    if (merged == NULL) return NULL;
    size_t i = 0, j = 0, k = 0;
    while (i < na && j < nb) merged[k++] = a[i] <= b[j] ? a[i++] : b[j++];
    while (i < na) merged[k++] = a[i++];
    while (j < nb) merged[k++] = b[j++];
    *out_count = k;
    return merged;
}`,

      String.raw`// array_remove_duplicates removes duplicate values in place, preserving
// first-occurrence order, and returns the new length.
size_t array_remove_duplicates(int *values, size_t count) {
    if (count < 2) return count;
    size_t write = 1;
    for (size_t read = 1; read < count; read++) {
        bool seen = false;
        for (size_t j = 0; j < write; j++) {
            if (values[j] == values[read]) { seen = true; break; }
        }
        if (!seen) values[write++] = values[read];
    }
    return write;
}`,

      String.raw`// array_clamp_all clamps every element into [low, high] in place.
void array_clamp_all(int *values, size_t count, int low, int high) {
    for (size_t i = 0; i < count; i++) {
        if (values[i] < low) values[i] = low;
        else if (values[i] > high) values[i] = high;
    }
}`,

      String.raw`// array_partition rearranges values so elements < pivot precede the rest,
// returning the boundary index (Lomuto scheme).
size_t array_partition(int *values, size_t count, int pivot) {
    size_t boundary = 0;
    for (size_t i = 0; i < count; i++) {
        if (values[i] < pivot) {
            int tmp = values[boundary];
            values[boundary] = values[i];
            values[i] = tmp;
            boundary++;
        }
    }
    return boundary;
}`,

      String.raw`// array_dot_product returns the dot product of two equal-length arrays.
long array_dot_product(const int *a, const int *b, size_t count) {
    long total = 0;
    for (size_t i = 0; i < count; i++) total += (long)a[i] * b[i];
    return total;
}`,
    ],
  },

  {
    file: 'validation.c',
    topic: 'input validation',
    includes: ['<ctype.h>', '<stdbool.h>', '<stddef.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`// val_is_digits reports whether s is non-empty and all decimal digits.
bool val_is_digits(const char *s) {
    if (*s == '\0') return false;
    for (const char *p = s; *p != '\0'; p++) {
        if (!isdigit((unsigned char)*p)) return false;
    }
    return true;
}`,

      String.raw`// val_is_alpha reports whether s is non-empty and all letters.
bool val_is_alpha(const char *s) {
    if (*s == '\0') return false;
    for (const char *p = s; *p != '\0'; p++) {
        if (!isalpha((unsigned char)*p)) return false;
    }
    return true;
}`,

      String.raw`// val_is_alnum reports whether s is non-empty letters and digits.
bool val_is_alnum(const char *s) {
    if (*s == '\0') return false;
    for (const char *p = s; *p != '\0'; p++) {
        if (!isalnum((unsigned char)*p)) return false;
    }
    return true;
}`,

      String.raw`// val_is_hex_string reports whether s is non-empty hexadecimal digits.
bool val_is_hex_string(const char *s) {
    if (*s == '\0') return false;
    for (const char *p = s; *p != '\0'; p++) {
        if (!isxdigit((unsigned char)*p)) return false;
    }
    return true;
}`,

      String.raw`// val_is_valid_ipv4 checks a dotted-quad address like "192.168.0.1".
bool val_is_valid_ipv4(const char *s) {
    int octets = 0, digits = 0, value = 0;
    for (const char *p = s; *p != '\0'; p++) {
        if (isdigit((unsigned char)*p)) {
            if (++digits > 3) return false;
            value = value * 10 + (*p - '0');
        } else if (*p == '.') {
            if (digits == 0 || value > 255) return false;
            octets++;
            digits = 0;
            value = 0;
        } else {
            return false;
        }
    }
    return octets == 3 && digits > 0 && value <= 255;
}`,

      String.raw`// val_is_valid_email applies a pragmatic shape check to an address.
bool val_is_valid_email(const char *s) {
    const char *at = strchr(s, '@');
    if (at == NULL || at == s) return false;
    const char *dot = strchr(at + 1, '.');
    if (dot == NULL || dot == at + 1 || dot[1] == '\0') return false;
    for (const char *p = s; *p != '\0'; p++) {
        unsigned char c = (unsigned char)*p;
        if (!(isalnum(c) || c == '@' || c == '.' || c == '_' || c == '-' || c == '+')) {
            return false;
        }
    }
    return true;
}`,

      String.raw`// val_is_valid_username enforces 3-20 chars of letters, digits, '_' and '-',
// with the first character a letter.
bool val_is_valid_username(const char *s) {
    size_t len = strlen(s);
    if (len < 3 || len > 20 || !isalpha((unsigned char)s[0])) return false;
    for (const char *p = s; *p != '\0'; p++) {
        unsigned char c = (unsigned char)*p;
        if (!(isalnum(c) || c == '_' || c == '-')) return false;
    }
    return true;
}`,

      String.raw`// val_is_strong_password requires at least 8 chars from four classes.
bool val_is_strong_password(const char *s) {
    size_t len = strlen(s);
    if (len < 8) return false;
    bool has_upper = false, has_lower = false, has_digit = false, has_symbol = false;
    for (const char *p = s; *p != '\0'; p++) {
        unsigned char c = (unsigned char)*p;
        if (isupper(c)) has_upper = true;
        else if (islower(c)) has_lower = true;
        else if (isdigit(c)) has_digit = true;
        else has_symbol = true;
    }
    return has_upper && has_lower && has_digit && has_symbol;
}`,

      String.raw`// val_is_valid_luhn verifies a numeric string against the Luhn checksum.
bool val_is_valid_luhn(const char *digits) {
    int sum = 0;
    bool alternate = false;
    size_t len = strlen(digits);
    for (size_t i = len; i-- > 0;) {
        int d = digits[i] - '0';
        if (alternate) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        alternate = !alternate;
    }
    return sum % 10 == 0;
}`,

      String.raw`// val_is_valid_credit_card checks digit-ness, length, and the Luhn sum.
bool val_is_valid_credit_card(const char *number) {
    if (!val_is_digits(number)) return false;
    size_t len = strlen(number);
    return len >= 13 && len <= 19 && val_is_valid_luhn(number);
}`,

      String.raw`// val_is_valid_isbn10 verifies a 10-digit ISBN including an 'X' check.
bool val_is_valid_isbn10(const char *isbn) {
    if (strlen(isbn) != 10) return false;
    int sum = 0;
    for (int i = 0; i < 10; i++) {
        int weight = 10 - i;
        char c = isbn[i];
        if (c == 'X' || c == 'x') sum += 10 * weight;
        else if (isdigit((unsigned char)c)) sum += (c - '0') * weight;
        else return false;
    }
    return sum % 11 == 0;
}`,

      String.raw`// val_is_valid_isbn13 verifies a 13-digit ISBN with alternating weights.
bool val_is_valid_isbn13(const char *isbn) {
    if (strlen(isbn) != 13 || !val_is_digits(isbn)) return false;
    int sum = 0;
    for (int i = 0; i < 13; i++) {
        int digit = isbn[i] - '0';
        sum += (i % 2 == 0) ? digit : digit * 3;
    }
    return sum % 10 == 0;
}`,

      String.raw`// val_is_leap_year reports whether year is a Gregorian leap year.
bool val_is_leap_year(int year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}`,

      String.raw`// val_is_valid_date checks a calendar date for month and day ranges.
bool val_is_valid_date(int year, int month, int day) {
    if (month < 1 || month > 12 || day < 1) return false;
    static const int days[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    int limit = days[month - 1];
    if (month == 2 && val_is_leap_year(year)) limit = 29;
    return day <= limit;
}`,

      String.raw`// val_in_range reports whether value falls within [low, high].
bool val_in_range(int value, int low, int high) {
    return value >= low && value <= high;
}`,

      String.raw`// val_is_valid_port checks that s is a number in the TCP port range 1-65535.
bool val_is_valid_port(const char *s) {
    if (!val_is_digits(s)) return false;
    long port = strtol(s, NULL, 10);
    return port >= 1 && port <= 65535;
}`,

      String.raw`// val_is_valid_hex_color accepts "#RGB" or "#RRGGBB" (case-insensitive).
bool val_is_valid_hex_color(const char *s) {
    if (s[0] != '#') return false;
    size_t len = strlen(s + 1);
    return (len == 3 || len == 6) && val_is_hex_string(s + 1);
}`,

      String.raw`// val_is_valid_mac_address checks six hex pairs joined by ':' or '-'.
bool val_is_valid_mac_address(const char *s) {
    int groups = 0, digits = 0;
    for (const char *p = s; *p != '\0'; p++) {
        if (isxdigit((unsigned char)*p)) {
            if (++digits > 2) return false;
        } else if (*p == ':' || *p == '-') {
            if (digits != 2) return false;
            groups++;
            digits = 0;
        } else {
            return false;
        }
    }
    return groups == 5 && digits == 2;
}`,
    ],
  },

  {
    file: 'data_processing.c',
    topic: 'data processing and statistics',
    includes: ['<math.h>', '<stdbool.h>', '<stddef.h>', '<stdio.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`// dp_strdup returns a heap copy of s, or NULL on failure.
char *dp_strdup(const char *s) {
    size_t len = strlen(s) + 1;
    char *copy = malloc(len);
    if (copy == NULL) return NULL;
    memcpy(copy, s, len);
    return copy;
}`,

      String.raw`// dp_count_lines counts newline characters in a text buffer.
size_t dp_count_lines(const char *text) {
    size_t lines = 0;
    for (const char *p = text; *p != '\0'; p++) {
        if (*p == '\n') lines++;
    }
    return lines;
}`,

      String.raw`// dp_csv_field_count counts the fields in one CSV line, honoring quotes.
size_t dp_csv_field_count(const char *line) {
    size_t fields = 0;
    bool in_quotes = false, in_field = false;
    for (const char *p = line; *p != '\0'; p++) {
        if (*p == '"') { in_quotes = !in_quotes; in_field = true; }
        else if (*p == ',' && !in_quotes) { fields++; in_field = false; }
        else if (*p != '\r' && *p != '\n') in_field = true;
    }
    return in_field ? fields + 1 : fields;
}`,

      String.raw`// dp_split_csv_row splits one CSV line into freshly allocated fields and
// returns the count (caller frees each field and the array).
size_t dp_split_csv_row(const char *line, char ***fields_out) {
    size_t capacity = 8, count = 0;
    char **fields = calloc(capacity, sizeof(char *));
    if (fields == NULL) return 0;
    const char *p = line;
    while (*p != '\0') {
        char field[1024];
        size_t len = 0;
        bool quoted = *p == '"';
        if (quoted) p++;
        while (*p != '\0' && !(quoted ? *p == '"' : *p == ',')) {
            if (len + 1 < sizeof(field)) field[len++] = *p;
            p++;
        }
        if (quoted && *p == '"') p++;
        field[len] = '\0';
        if (count == capacity) {
            capacity *= 2;
            char **grown = realloc(fields, capacity * sizeof(char *));
            if (grown == NULL) { free(fields); return 0; }
            fields = grown;
        }
        fields[count++] = dp_strdup(field);
        if (*p == ',') p++;
    }
    *fields_out = fields;
    return count;
}`,

      String.raw`// dp_sum returns the total of values.
double dp_sum(const double *values, size_t count) {
    double total = 0.0;
    for (size_t i = 0; i < count; i++) total += values[i];
    return total;
}`,

      String.raw`// dp_mean returns the arithmetic mean, or 0.0 for an empty sample.
double dp_mean(const double *values, size_t count) {
    return count == 0 ? 0.0 : dp_sum(values, count) / (double)count;
}`,

      String.raw`// dp_sort_doubles sorts values ascending with insertion sort.
void dp_sort_doubles(double *values, size_t count) {
    for (size_t i = 1; i < count; i++) {
        double key = values[i];
        size_t j = i;
        while (j > 0 && values[j - 1] > key) {
            values[j] = values[j - 1];
            j--;
        }
        values[j] = key;
    }
}`,

      String.raw`// dp_median returns the median of a sorted copy of values.
double dp_median(const double *values, size_t count) {
    if (count == 0) return 0.0;
    double *sorted = malloc(count * sizeof(double));
    if (sorted == NULL) return 0.0;
    memcpy(sorted, values, count * sizeof(double));
    dp_sort_doubles(sorted, count);
    double median = count % 2 == 1
        ? sorted[count / 2]
        : (sorted[count / 2 - 1] + sorted[count / 2]) / 2.0;
    free(sorted);
    return median;
}`,

      String.raw`// dp_standard_deviation returns the population standard deviation.
double dp_standard_deviation(const double *values, size_t count) {
    if (count == 0) return 0.0;
    double mean = dp_mean(values, count);
    double sum_sq = 0.0;
    for (size_t i = 0; i < count; i++) {
        double diff = values[i] - mean;
        sum_sq += diff * diff;
    }
    return sqrt(sum_sq / (double)count);
}`,

      String.raw`// dp_min_max reports the smallest and largest values via out parameters.
void dp_min_max(const double *values, size_t count, double *min_out, double *max_out) {
    if (count == 0) { *min_out = *max_out = 0.0; return; }
    double min = values[0], max = values[0];
    for (size_t i = 1; i < count; i++) {
        if (values[i] < min) min = values[i];
        if (values[i] > max) max = values[i];
    }
    *min_out = min;
    *max_out = max;
}`,

      String.raw`// dp_histogram buckets values into n_bins over the range [min, max].
void dp_histogram(const double *values, size_t count, double min, double max, size_t n_bins, size_t *bins) {
    for (size_t b = 0; b < n_bins; b++) bins[b] = 0;
    if (count == 0 || max <= min) return;
    for (size_t i = 0; i < count; i++) {
        double t = (values[i] - min) / (max - min);
        size_t b = t < 0.0 ? 0 : t >= 1.0 ? n_bins - 1 : (size_t)(t * n_bins);
        bins[b]++;
    }
}`,

      String.raw`// dp_moving_average writes a trailing-window average into out.
void dp_moving_average(const double *values, size_t count, size_t window, double *out) {
    for (size_t i = 0; i < count; i++) {
        size_t start = i >= window ? i - window + 1 : 0;
        double total = 0.0;
        for (size_t j = start; j <= i; j++) total += values[j];
        out[i] = total / (double)(i - start + 1);
    }
}`,

      String.raw`// dp_normalize rescales values into [0, 1] in place.
void dp_normalize(double *values, size_t count) {
    if (count == 0) return;
    double min, max;
    dp_min_max(values, count, &min, &max);
    double span = max - min;
    for (size_t i = 0; i < count; i++) {
        values[i] = span == 0.0 ? 0.5 : (values[i] - min) / span;
    }
}`,

      String.raw`// dp_frequency_count counts values within epsilon of a target.
size_t dp_frequency_count(const double *values, size_t count, double target, double epsilon) {
    size_t hits = 0;
    for (size_t i = 0; i < count; i++) {
        if (fabs(values[i] - target) <= epsilon) hits++;
    }
    return hits;
}`,

      String.raw`// dp_parse_key_value splits "key=value" on the first '=' into two buffers.
bool dp_parse_key_value(const char *line, char *key, char *value, size_t cap) {
    const char *eq = strchr(line, '=');
    if (eq == NULL || eq == line) return false;
    size_t key_len = (size_t)(eq - line);
    if (key_len + 1 > cap) return false;
    memcpy(key, line, key_len);
    key[key_len] = '\0';
    snprintf(value, cap, "%s", eq + 1);
    return true;
}`,

      String.raw`// dp_zscore writes standard scores (z-scores) of values into out.
void dp_zscore(const double *values, size_t count, double *out) {
    double mean = dp_mean(values, count);
    double sd = dp_standard_deviation(values, count);
    for (size_t i = 0; i < count; i++) {
        out[i] = sd == 0.0 ? 0.0 : (values[i] - mean) / sd;
    }
}`,

      String.raw`// dp_json_escape copies s into out, escaping quotes and backslashes.
size_t dp_json_escape(const char *s, char *out, size_t cap) {
    size_t w = 0;
    for (const char *p = s; *p != '\0' && w + 2 < cap; p++) {
        if (*p == '"' || *p == '\\') out[w++] = '\\';
        out[w++] = *p;
    }
    out[w] = '\0';
    return w;
}`,

      String.raw`// dp_weighted_mean returns the mean of values weighted by weights.
double dp_weighted_mean(const double *values, const double *weights, size_t count) {
    double total = 0.0, weight_sum = 0.0;
    for (size_t i = 0; i < count; i++) {
        total += values[i] * weights[i];
        weight_sum += weights[i];
    }
    return weight_sum == 0.0 ? 0.0 : total / weight_sum;
}`,
    ],
  },

  {
    file: 'filesystem.c',
    topic: 'filesystem and file I/O helpers',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdio.h>', '<stdlib.h>', '<string.h>', '<sys/stat.h>', '<unistd.h>'],
    units: [
      String.raw`// fs_file_exists reports whether a path is readable.
bool fs_file_exists(const char *path) {
    FILE *fp = fopen(path, "rb");
    if (fp == NULL) return false;
    fclose(fp);
    return true;
}`,

      String.raw`// fs_file_size returns the size of a file in bytes, or -1 on error.
long fs_file_size(const char *path) {
    struct stat info;
    if (stat(path, &info) != 0) return -1;
    return (long)info.st_size;
}`,

      String.raw`// fs_read_file loads an entire file into a NUL-terminated heap buffer.
char *fs_read_file(const char *path, size_t *size_out) {
    FILE *fp = fopen(path, "rb");
    if (fp == NULL) return NULL;
    fseek(fp, 0, SEEK_END);
    long length = ftell(fp);
    fseek(fp, 0, SEEK_SET);
    char *buf = malloc((size_t)length + 1);
    if (buf == NULL) { fclose(fp); return NULL; }
    size_t got = fread(buf, 1, (size_t)length, fp);
    buf[got] = '\0';
    fclose(fp);
    if (size_out) *size_out = got;
    return buf;
}`,

      String.raw`// fs_write_file writes size bytes of data to path, returning success.
bool fs_write_file(const char *path, const void *data, size_t size) {
    FILE *fp = fopen(path, "wb");
    if (fp == NULL) return false;
    size_t written = fwrite(data, 1, size, fp);
    fclose(fp);
    return written == size;
}`,

      String.raw`// fs_count_lines returns the number of newline characters in a file.
long fs_count_lines(const char *path) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) return -1;
    long lines = 0;
    int ch;
    while ((ch = fgetc(fp)) != EOF) {
        if (ch == '\n') lines++;
    }
    fclose(fp);
    return lines;
}`,

      String.raw`// fs_copy_file copies src to dst using a fixed-size buffer.
bool fs_copy_file(const char *src, const char *dst) {
    FILE *in = fopen(src, "rb");
    if (in == NULL) return false;
    FILE *out = fopen(dst, "wb");
    if (out == NULL) { fclose(in); return false; }
    char buf[4096];
    size_t n;
    while ((n = fread(buf, 1, sizeof(buf), in)) > 0) {
        if (fwrite(buf, 1, n, out) != n) { fclose(in); fclose(out); return false; }
    }
    fclose(in);
    fclose(out);
    return true;
}`,

      String.raw`// fs_append_line appends line plus a newline to the end of a file.
bool fs_append_line(const char *path, const char *line) {
    FILE *fp = fopen(path, "a");
    if (fp == NULL) return false;
    int ok = fprintf(fp, "%s\n", line) >= 0;
    fclose(fp);
    return ok;
}`,

      String.raw`// fs_read_first_line reads the first line (without its newline) into buf.
bool fs_read_first_line(const char *path, char *buf, size_t cap) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL || fgets(buf, (int)cap, fp) == NULL) {
        if (fp) fclose(fp);
        return false;
    }
    fclose(fp);
    size_t len = strlen(buf);
    while (len > 0 && (buf[len - 1] == '\n' || buf[len - 1] == '\r')) buf[--len] = '\0';
    return true;
}`,

      String.raw`// fs_get_basename returns the final path component after the last '/'.
const char *fs_get_basename(const char *path) {
    const char *slash = strrchr(path, '/');
    return slash == NULL ? path : slash + 1;
}`,

      String.raw`// fs_get_extension returns the suffix after the last '.', or "".
const char *fs_get_extension(const char *path) {
    const char *base = fs_get_basename(path);
    const char *dot = strrchr(base, '.');
    return dot == NULL || dot == base ? "" : dot + 1;
}`,

      String.raw`// fs_get_directory copies the directory portion of path into dir.
bool fs_get_directory(const char *path, char *dir, size_t cap) {
    const char *slash = strrchr(path, '/');
    if (slash == NULL) { dir[0] = '.'; dir[1] = '\0'; return false; }
    size_t len = (size_t)(slash - path);
    if (len == 0) len = 1;
    if (len + 1 > cap) return false;
    memcpy(dir, path, len);
    dir[len] = '\0';
    return true;
}`,

      String.raw`// fs_path_join concatenates dir and name with a single '/'.
char *fs_path_join(const char *dir, const char *name) {
    size_t dlen = strlen(dir);
    bool needs_slash = dlen > 0 && dir[dlen - 1] != '/';
    char *joined = malloc(dlen + (needs_slash ? 1 : 0) + strlen(name) + 1);
    if (joined == NULL) return NULL;
    memcpy(joined, dir, dlen);
    size_t pos = dlen;
    if (needs_slash) joined[pos++] = '/';
    strcpy(joined + pos, name);
    return joined;
}`,

      String.raw`// fs_is_directory reports whether path names a directory.
bool fs_is_directory(const char *path) {
    struct stat info;
    return stat(path, &info) == 0 && S_ISDIR(info.st_mode);
}`,

      String.raw`// fs_remove_file deletes a file, returning true on success.
bool fs_remove_file(const char *path) {
    return remove(path) == 0;
}`,

      String.raw`// fs_count_words counts whitespace-delimited words in a text file.
long fs_count_words(const char *path) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) return -1;
    long words = 0;
    bool in_word = false;
    int ch;
    while ((ch = fgetc(fp)) != EOF) {
        bool ws = ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r';
        if (!ws && !in_word) { words++; in_word = true; }
        else if (ws) in_word = false;
    }
    fclose(fp);
    return words;
}`,

      String.raw`// fs_files_identical compares two files byte by byte.
bool fs_files_identical(const char *a, const char *b) {
    FILE *fa = fopen(a, "rb");
    FILE *fb = fopen(b, "rb");
    if (fa == NULL || fb == NULL) {
        if (fa) fclose(fa);
        if (fb) fclose(fb);
        return false;
    }
    int ca, cb;
    do {
        ca = fgetc(fa);
        cb = fgetc(fb);
        if (ca != cb) { fclose(fa); fclose(fb); return false; }
    } while (ca != EOF);
    fclose(fa);
    fclose(fb);
    return true;
}`,

      String.raw`// fs_temp_name writes a unique temporary path using the process id.
void fs_temp_name(char *buf, size_t cap) {
    snprintf(buf, cap, "/tmp/vibetyper-%ld.tmp", (long)getpid());
}`,

      String.raw`// fs_read_all_lines loads every line of a file into an allocated array,
// returning the line count (caller frees each line and the array).
long fs_read_all_lines(const char *path, char ***lines_out) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) return -1;
    size_t capacity = 16, count = 0;
    char **lines = malloc(capacity * sizeof(char *));
    if (lines == NULL) { fclose(fp); return -1; }
    char line[1024];
    while (fgets(line, sizeof(line), fp) != NULL) {
        size_t len = strlen(line);
        while (len > 0 && (line[len - 1] == '\n' || line[len - 1] == '\r')) line[--len] = '\0';
        if (count == capacity) {
            capacity *= 2;
            char **grown = realloc(lines, capacity * sizeof(char *));
            if (grown == NULL) break;
            lines = grown;
        }
        lines[count] = malloc(len + 1);
        if (lines[count] == NULL) break;
        memcpy(lines[count], line, len + 1);
        count++;
    }
    fclose(fp);
    *lines_out = lines;
    return (long)count;
}`,
    ],
  },

  {
    file: 'networking.c',
    topic: 'POSIX socket networking helpers',
    includes: ['<arpa/inet.h>', '<errno.h>', '<fcntl.h>', '<netdb.h>', '<netinet/in.h>', '<stdbool.h>', '<stddef.h>', '<stdint.h>', '<stdio.h>', '<stdlib.h>', '<string.h>', '<sys/socket.h>', '<sys/time.h>', '<sys/types.h>', '<unistd.h>'],
    units: [
      String.raw`// net_create_tcp_socket opens an IPv4 stream socket, or returns -1.
int net_create_tcp_socket(void) {
    return socket(AF_INET, SOCK_STREAM, 0);
}`,

      String.raw`// net_bind_and_listen binds a socket to any interface and starts listening.
int net_bind_and_listen(int sock, unsigned short port, int backlog) {
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    addr.sin_port = htons(port);
    if (bind(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0) return -1;
    return listen(sock, backlog);
}`,

      String.raw`// net_connect_to opens a connection to host:port, returning the socket.
int net_connect_to(const char *host, unsigned short port) {
    int sock = net_create_tcp_socket();
    if (sock < 0) return -1;
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    if (inet_pton(AF_INET, host, &addr.sin_addr) != 1) {
        close(sock);
        return -1;
    }
    if (connect(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        close(sock);
        return -1;
    }
    return sock;
}`,

      String.raw`// net_send_all sends the entire buffer, handling partial writes.
ssize_t net_send_all(int sock, const void *buf, size_t len) {
    const char *p = buf;
    size_t sent = 0;
    while (sent < len) {
        ssize_t n = send(sock, p + sent, len - sent, 0);
        if (n < 0) return -1;
        sent += (size_t)n;
    }
    return (ssize_t)sent;
}`,

      String.raw`// net_recv_line reads one CR/LF-terminated line into buf, without the newline.
ssize_t net_recv_line(int sock, char *buf, size_t cap) {
    size_t got = 0;
    while (got + 1 < cap) {
        char c;
        ssize_t n = recv(sock, &c, 1, 0);
        if (n <= 0) return n;
        if (c == '\n') break;
        if (c != '\r') buf[got++] = c;
    }
    buf[got] = '\0';
    return (ssize_t)got;
}`,

      String.raw`// net_set_reuseaddr allows a listening socket to rebind after restart.
int net_set_reuseaddr(int sock) {
    int opt = 1;
    return setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
}`,

      String.raw`// net_set_nonblocking toggles a socket into non-blocking mode.
int net_set_nonblocking(int sock) {
    int flags = fcntl(sock, F_GETFL, 0);
    if (flags < 0) return -1;
    return fcntl(sock, F_SETFL, flags | O_NONBLOCK);
}`,

      String.raw`// net_hostname_to_ip resolves host and stores the first IPv4 string in ip.
int net_hostname_to_ip(const char *host, char *ip, size_t cap) {
    struct addrinfo hints, *result = NULL;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    if (getaddrinfo(host, NULL, &hints, &result) != 0 || result == NULL) return -1;
    struct sockaddr_in *addr = (struct sockaddr_in *)result->ai_addr;
    const char *text = inet_ntop(AF_INET, &addr->sin_addr, ip, (socklen_t)cap);
    freeaddrinfo(result);
    return text != NULL ? 0 : -1;
}`,

      String.raw`// net_parse_ipv4 converts "a.b.c.d" into a network-order 32-bit value.
int net_parse_ipv4(const char *text, uint32_t *out) {
    struct in_addr addr;
    if (inet_pton(AF_INET, text, &addr) != 1) return -1;
    *out = addr.s_addr;
    return 0;
}`,

      String.raw`// net_set_timeout sets the receive timeout for a socket in seconds.
int net_set_timeout(int sock, long seconds) {
    struct timeval tv;
    tv.tv_sec = seconds;
    tv.tv_usec = 0;
    return setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
}`,

      String.raw`// net_close_socket closes a valid socket descriptor.
void net_close_socket(int sock) {
    if (sock >= 0) close(sock);
}`,

      String.raw`// net_accept_client accepts a pending connection on a listening socket.
int net_accept_client(int listen_sock) {
    struct sockaddr_in client;
    socklen_t len = sizeof(client);
    return accept(listen_sock, (struct sockaddr *)&client, &len);
}`,

      String.raw`// net_build_http_request formats a minimal HTTP request into buf.
int net_build_http_request(const char *method, const char *path, const char *host, char *buf, size_t cap) {
    return snprintf(buf, cap,
        "%s %s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n",
        method, path, host);
}`,

      String.raw`// net_parse_http_status extracts the numeric code from a status line.
int net_parse_http_status(const char *line) {
    const char *space = strchr(line, ' ');
    if (space == NULL) return -1;
    return atoi(space + 1);
}`,

      String.raw`// net_get_port_name looks up the service name for a well-known TCP port.
const char *net_get_port_name(unsigned short port) {
    struct servent *entry = getservbyport(htons(port), "tcp");
    return entry != NULL ? entry->s_name : "unknown";
}`,

      String.raw`// net_would_block reports whether errno indicates a non-blocking retry.
bool net_would_block(int error) {
    return error == EAGAIN || error == EWOULDBLOCK;
}`,
    ],
  },

  {
    file: 'formatting.c',
    topic: 'text and number formatting',
    includes: ['<ctype.h>', '<stdbool.h>', '<stddef.h>', '<stdint.h>', '<stdio.h>', '<string.h>'],
    units: [
      String.raw`// fmt_hex_dump writes a hex representation of len bytes (e.g. "4d 5a").
size_t fmt_hex_dump(const unsigned char *data, size_t len, char *out, size_t cap) {
    size_t w = 0;
    for (size_t i = 0; i < len && w + 3 < cap; i++) {
        if (i > 0) out[w++] = ' ';
        w += (size_t)snprintf(out + w, cap - w, "%02x", data[i]);
    }
    out[w] = '\0';
    return w;
}`,

      String.raw`// fmt_bytes_human formats a byte count like "1.50 KiB" or "3.9 GiB".
void fmt_bytes_human(uint64_t bytes, char *out, size_t cap) {
    static const char *units[] = {"B", "KiB", "MiB", "GiB", "TiB"};
    double value = (double)bytes;
    size_t unit = 0;
    while (value >= 1024.0 && unit + 1 < sizeof(units) / sizeof(units[0])) {
        value /= 1024.0;
        unit++;
    }
    snprintf(out, cap, unit == 0 ? "%.0f %s" : "%.2f %s", value, units[unit]);
}`,

      String.raw`// fmt_duration formats seconds as "hh:mm:ss".
void fmt_duration(long seconds, char *out, size_t cap) {
    long h = seconds / 3600;
    long m = (seconds % 3600) / 60;
    long s = seconds % 60;
    snprintf(out, cap, "%02ld:%02ld:%02ld", h, m, s);
}`,

      String.raw`// fmt_comma_number writes value with thousands separators (e.g. "1,234,567").
void fmt_comma_number(long long value, char *out, size_t cap) {
    char raw[32];
    snprintf(raw, sizeof(raw), "%lld", value);
    size_t len = strlen(raw);
    size_t groups = (len - 1) / 3;
    size_t total = len + groups;
    if (total + 1 > cap) return;
    out[total] = '\0';
    size_t w = total;
    for (size_t i = len, g = 0; i > 0; i--, g++) {
        out[--w] = raw[i - 1];
        if (g % 3 == 2 && i > 1) out[--w] = ',';
    }
}`,

      String.raw`// fmt_pad_right copies s into out, right-padding with fill to width.
void fmt_pad_right(const char *s, size_t width, char fill, char *out, size_t cap) {
    size_t len = strlen(s);
    size_t keep = len < cap ? len : cap - 1;
    memcpy(out, s, keep);
    size_t w = keep;
    while (w < width && w + 1 < cap) out[w++] = fill;
    out[w] = '\0';
}`,

      String.raw`// fmt_center writes s centered within width, padded with fill.
void fmt_center(const char *s, size_t width, char fill, char *out, size_t cap) {
    size_t len = strlen(s);
    size_t left = len < width ? (width - len) / 2 : 0;
    size_t w = 0;
    for (size_t i = 0; i < left && w + 1 < cap; i++) out[w++] = fill;
    for (size_t i = 0; s[i] != '\0' && w + 1 < cap; i++) out[w++] = s[i];
    while (w < width && w + 1 < cap) out[w++] = fill;
    out[w] = '\0';
}`,

      String.raw`// fmt_fixed_decimal formats value with a fixed number of decimal places.
void fmt_fixed_decimal(double value, int decimals, char *out, size_t cap) {
    char format[16];
    snprintf(format, sizeof(format), "%%.%df", decimals);
    snprintf(out, cap, format, value);
}`,

      String.raw`// fmt_percent formats a ratio in [0, 1] as "42.5%".
void fmt_percent(double ratio, char *out, size_t cap) {
    snprintf(out, cap, "%.1f%%", ratio * 100.0);
}`,

      String.raw`// fmt_snake_to_camel converts "some_name" to "someName" in place.
void fmt_snake_to_camel(char *s) {
    char *write = s;
    bool upper_next = false;
    for (char *read = s; *read != '\0'; read++) {
        if (*read == '_') {
            upper_next = true;
        } else if (upper_next) {
            *write++ = (char)toupper((unsigned char)*read);
            upper_next = false;
        } else {
            *write++ = *read;
        }
    }
    *write = '\0';
}`,

      String.raw`// fmt_camel_to_snake converts "someName" to "some_name" into out.
void fmt_camel_to_snake(const char *s, char *out, size_t cap) {
    size_t w = 0;
    for (const char *p = s; *p != '\0' && w + 2 < cap; p++) {
        if (isupper((unsigned char)*p)) {
            if (w > 0) out[w++] = '_';
            out[w++] = (char)tolower((unsigned char)*p);
        } else {
            out[w++] = *p;
        }
    }
    out[w] = '\0';
}`,

      String.raw`// fmt_truncate copies s, shortening with an ellipsis when longer than max.
void fmt_truncate(const char *s, size_t max, char *out, size_t cap) {
    size_t len = strlen(s);
    if (len <= max || max < 3) {
        snprintf(out, cap, "%s", s);
        return;
    }
    snprintf(out, cap, "%.*s...", (int)(max - 3), s);
}`,

      String.raw`// fmt_binary_string writes value in binary with width bits and leading zeros.
void fmt_binary_string(uint32_t value, unsigned int width, char *out, size_t cap) {
    if (width > cap - 1) width = (unsigned int)(cap - 1);
    for (unsigned int i = 0; i < width; i++) {
        out[width - 1 - i] = (value & 1u) ? '1' : '0';
        value >>= 1u;
    }
    out[width] = '\0';
}`,

      String.raw`// fmt_roman_numeral writes the Roman numeral for value (1-3999) into out.
void fmt_roman_numeral(int value, char *out, size_t cap) {
    static const int vals[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    static const char *syms[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    out[0] = '\0';
    for (size_t i = 0; i < sizeof(vals) / sizeof(vals[0]); i++) {
        while (value >= vals[i]) {
            strncat(out, syms[i], cap - strlen(out) - 1);
            value -= vals[i];
        }
    }
}`,

      String.raw`// fmt_ordinal formats a number with its English suffix ("1st", "22nd").
void fmt_ordinal(int n, char *out, size_t cap) {
    const char *suffix = "th";
    int last = n % 10;
    int second = (n / 10) % 10;
    if (second != 1) {
        if (last == 1) suffix = "st";
        else if (last == 2) suffix = "nd";
        else if (last == 3) suffix = "rd";
    }
    snprintf(out, cap, "%d%s", n, suffix);
}`,

      String.raw`// fmt_url_encode percent-encodes s, leaving alphanumerics and "-_.~" as-is.
void fmt_url_encode(const char *s, char *out, size_t cap) {
    size_t w = 0;
    for (const char *p = s; *p != '\0' && w + 4 < cap; p++) {
        unsigned char c = (unsigned char)*p;
        if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            out[w++] = (char)c;
        } else {
            w += (size_t)snprintf(out + w, cap - w, "%%%02X", c);
        }
    }
    out[w] = '\0';
}`,

      String.raw`// fmt_base64_encode encodes len bytes using the standard alphabet, writing
// unpadded base64 text into out and returning its length.
size_t fmt_base64_encode(const unsigned char *data, size_t len, char *out, size_t cap) {
    static const char table[] =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    size_t w = 0;
    for (size_t i = 0; i < len; i += 3) {
        uint32_t chunk = (uint32_t)data[i] << 16;
        if (i + 1 < len) chunk |= (uint32_t)data[i + 1] << 8;
        if (i + 2 < len) chunk |= data[i + 2];
        if (w + 4 < cap) out[w++] = table[(chunk >> 18) & 0x3F];
        if (w + 4 < cap) out[w++] = table[(chunk >> 12) & 0x3F];
        if (i + 1 < len && w + 4 < cap) out[w++] = table[(chunk >> 6) & 0x3F];
        if (i + 2 < len && w + 4 < cap) out[w++] = table[chunk & 0x3F];
    }
    out[w] = '\0';
    return w;
}`,

      String.raw`// fmt_rgb_hex formats an RGB color as "#RRGGBB".
void fmt_rgb_hex(unsigned char r, unsigned char g, unsigned char b, char *out, size_t cap) {
    snprintf(out, cap, "#%02X%02X%02X", r, g, b);
}`,

      String.raw`// fmt_repeat_char writes ch repeated count times, NUL-terminating the buffer.
size_t fmt_repeat_char(char ch, size_t count, char *out, size_t cap) {
    size_t n = count < cap - 1 ? count : cap - 1;
    for (size_t i = 0; i < n; i++) out[i] = ch;
    out[n] = '\0';
    return n;
}`,
    ],
  },

  {
    file: 'linked_list.c',
    topic: 'singly linked list',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdio.h>', '<stdlib.h>'],
    units: [
      String.raw`typedef struct list_node {
    int value;
    struct list_node *next;
} list_node_t;`,

      String.raw`// list_push_front inserts value at the head and returns the new node.
list_node_t *list_push_front(list_node_t **head, int value) {
    list_node_t *node = malloc(sizeof(list_node_t));
    if (node == NULL) return NULL;
    node->value = value;
    node->next = *head;
    *head = node;
    return node;
}`,

      String.raw`// list_push_back appends value at the tail and returns the new node.
list_node_t *list_push_back(list_node_t **head, int value) {
    list_node_t *node = malloc(sizeof(list_node_t));
    if (node == NULL) return NULL;
    node->value = value;
    node->next = NULL;
    if (*head == NULL) {
        *head = node;
    } else {
        list_node_t *tail = *head;
        while (tail->next != NULL) tail = tail->next;
        tail->next = node;
    }
    return node;
}`,

      String.raw`// list_pop_front removes the head node, storing its value and freeing it.
bool list_pop_front(list_node_t **head, int *out) {
    if (*head == NULL) return false;
    list_node_t *old = *head;
    *head = old->next;
    if (out != NULL) *out = old->value;
    free(old);
    return true;
}`,

      String.raw`// list_find returns the first node matching value, or NULL.
list_node_t *list_find(const list_node_t *head, int value) {
    for (const list_node_t *p = head; p != NULL; p = p->next) {
        if (p->value == value) return (list_node_t *)p;
    }
    return NULL;
}`,

      String.raw`// list_remove deletes the first node matching value; returns true if found.
bool list_remove(list_node_t **head, int value) {
    list_node_t **indirect = head;
    while (*indirect != NULL && (*indirect)->value != value) {
        indirect = &(*indirect)->next;
    }
    if (*indirect == NULL) return false;
    list_node_t *victim = *indirect;
    *indirect = victim->next;
    free(victim);
    return true;
}`,

      String.raw`// list_length returns the number of nodes in the list.
size_t list_length(const list_node_t *head) {
    size_t n = 0;
    for (const list_node_t *p = head; p != NULL; p = p->next) n++;
    return n;
}`,

      String.raw`// list_reverse reverses the list in place.
void list_reverse(list_node_t **head) {
    list_node_t *prev = NULL, *curr = *head;
    while (curr != NULL) {
        list_node_t *next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    *head = prev;
}`,

      String.raw`// list_free frees every node in the list.
void list_free(list_node_t *head) {
    while (head != NULL) {
        list_node_t *next = head->next;
        free(head);
        head = next;
    }
}`,

      String.raw`// list_append concatenates tail onto the end of the list at head.
void list_append(list_node_t **head, list_node_t *tail) {
    if (*head == NULL) {
        *head = tail;
        return;
    }
    list_node_t *last = *head;
    while (last->next != NULL) last = last->next;
    last->next = tail;
}`,

      String.raw`// list_nth returns the node at zero-based index, or NULL if out of range.
list_node_t *list_nth(list_node_t *head, size_t index) {
    size_t i = 0;
    for (list_node_t *p = head; p != NULL; p = p->next, i++) {
        if (i == index) return p;
    }
    return NULL;
}`,

      String.raw`// list_has_cycle detects a loop with Floyd's tortoise-and-hare algorithm.
bool list_has_cycle(const list_node_t *head) {
    const list_node_t *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,

      String.raw`// list_middle returns the middle node using the fast/slow pointer trick.
list_node_t *list_middle(list_node_t *head) {
    list_node_t *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,

      String.raw`// list_insert_sorted inserts value into a list kept in ascending order.
void list_insert_sorted(list_node_t **head, int value) {
    list_node_t *node = malloc(sizeof(list_node_t));
    if (node == NULL) return;
    node->value = value;
    while (*head != NULL && (*head)->value < value) head = &(*head)->next;
    node->next = *head;
    *head = node;
}`,

      String.raw`// list_remove_duplicates removes repeated values, keeping the first of each.
void list_remove_duplicates(list_node_t *head) {
    for (list_node_t *p = head; p != NULL; p = p->next) {
        list_node_t **prev = &p->next;
        while (*prev != NULL) {
            if ((*prev)->value == p->value) {
                list_node_t *dup = *prev;
                *prev = dup->next;
                free(dup);
            } else {
                prev = &(*prev)->next;
            }
        }
    }
}`,

      String.raw`// list_print writes the list as "1 -> 2 -> 3" followed by a newline.
void list_print(const list_node_t *head) {
    for (const list_node_t *p = head; p != NULL; p = p->next) {
        printf("%d%s", p->value, p->next ? " -> " : "\n");
    }
}`,
    ],
  },

  {
    file: 'stack_queue.c',
    topic: 'stack and queue containers',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdlib.h>'],
    units: [
      String.raw`typedef struct stack {
    int *items;
    size_t capacity;
    size_t top;
} stack_t;`,

      String.raw`// stack_create allocates a stack with room for capacity items.
stack_t *stack_create(size_t capacity) {
    stack_t *s = malloc(sizeof(stack_t));
    if (s == NULL) return NULL;
    s->items = malloc(capacity * sizeof(int));
    if (s->items == NULL) { free(s); return NULL; }
    s->capacity = capacity;
    s->top = 0;
    return s;
}`,

      String.raw`// stack_push places value on top; returns false when the stack is full.
bool stack_push(stack_t *s, int value) {
    if (s->top >= s->capacity) return false;
    s->items[s->top++] = value;
    return true;
}`,

      String.raw`// stack_pop removes and returns the top value via out.
bool stack_pop(stack_t *s, int *out) {
    if (s->top == 0) return false;
    *out = s->items[--s->top];
    return true;
}`,

      String.raw`// stack_peek reads the top value without removing it.
bool stack_peek(const stack_t *s, int *out) {
    if (s->top == 0) return false;
    *out = s->items[s->top - 1];
    return true;
}`,

      String.raw`// stack_is_empty reports whether the stack holds no items.
bool stack_is_empty(const stack_t *s) {
    return s->top == 0;
}`,

      String.raw`// stack_size returns the number of items currently held.
size_t stack_size(const stack_t *s) {
    return s->top;
}`,

      String.raw`// stack_free releases the stack and its backing array.
void stack_free(stack_t *s) {
    if (s == NULL) return;
    free(s->items);
    free(s);
}`,

      String.raw`typedef struct queue_node {
    int value;
    struct queue_node *next;
} queue_node_t;`,

      String.raw`typedef struct queue {
    queue_node_t *head;
    queue_node_t *tail;
    size_t count;
} queue_t;`,

      String.raw`// queue_create allocates an empty linked queue.
queue_t *queue_create(void) {
    return calloc(1, sizeof(queue_t));
}`,

      String.raw`// queue_enqueue appends value at the tail; returns false on allocation failure.
bool queue_enqueue(queue_t *q, int value) {
    queue_node_t *node = malloc(sizeof(queue_node_t));
    if (node == NULL) return false;
    node->value = value;
    node->next = NULL;
    if (q->tail == NULL) {
        q->head = q->tail = node;
    } else {
        q->tail->next = node;
        q->tail = node;
    }
    q->count++;
    return true;
}`,

      String.raw`// queue_dequeue removes and returns the front value via out.
bool queue_dequeue(queue_t *q, int *out) {
    if (q->head == NULL) return false;
    queue_node_t *old = q->head;
    q->head = old->next;
    if (q->head == NULL) q->tail = NULL;
    if (out != NULL) *out = old->value;
    free(old);
    q->count--;
    return true;
}`,

      String.raw`// queue_peek reads the front value without removing it.
bool queue_peek(const queue_t *q, int *out) {
    if (q->head == NULL) return false;
    *out = q->head->value;
    return true;
}`,

      String.raw`// queue_is_empty reports whether the queue holds no items.
bool queue_is_empty(const queue_t *q) {
    return q->head == NULL;
}`,

      String.raw`// queue_size returns the number of items currently held.
size_t queue_size(const queue_t *q) {
    return q->count;
}`,

      String.raw`// queue_free releases every node and then the queue itself.
void queue_free(queue_t *q) {
    if (q == NULL) return;
    while (q->head != NULL) {
        queue_node_t *next = q->head->next;
        free(q->head);
        q->head = next;
    }
    free(q);
}`,
    ],
  },

  {
    file: 'hash_table.c',
    topic: 'string-keyed hash table',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdint.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`typedef struct ht_entry {
    char *key;
    int value;
    struct ht_entry *next;
} ht_entry_t;`,

      String.raw`typedef struct hash_table {
    ht_entry_t **buckets;
    size_t bucket_count;
    size_t size;
} hash_table_t;`,

      String.raw`// hash_djb2 computes the classic Dan Bernstein string hash.
uint64_t hash_djb2(const char *key) {
    uint64_t hash = 5381;
    int c;
    while ((c = (unsigned char)*key++) != 0) {
        hash = ((hash << 5) + hash) + (uint64_t)c;
    }
    return hash;
}`,

      String.raw`// hash_fnv1a computes the 64-bit FNV-1a string hash.
uint64_t hash_fnv1a(const char *key) {
    uint64_t hash = 0xcbf29ce484222325ULL;
    while (*key != '\0') {
        hash ^= (unsigned char)*key++;
        hash *= 0x100000001b3ULL;
    }
    return hash;
}`,

      String.raw`// ht_create allocates a hash table with the given number of buckets.
hash_table_t *ht_create(size_t bucket_count) {
    hash_table_t *table = calloc(1, sizeof(hash_table_t));
    if (table == NULL) return NULL;
    table->buckets = calloc(bucket_count, sizeof(ht_entry_t *));
    if (table->buckets == NULL) { free(table); return NULL; }
    table->bucket_count = bucket_count;
    return table;
}`,

      String.raw`// ht_put inserts or updates the value stored under key.
bool ht_put(hash_table_t *table, const char *key, int value) {
    size_t index = (size_t)(hash_fnv1a(key) % table->bucket_count);
    ht_entry_t *entry = table->buckets[index];
    while (entry != NULL) {
        if (strcmp(entry->key, key) == 0) {
            entry->value = value;
            return true;
        }
        entry = entry->next;
    }
    entry = malloc(sizeof(ht_entry_t));
    if (entry == NULL) return false;
    size_t key_len = strlen(key) + 1;
    entry->key = malloc(key_len);
    if (entry->key == NULL) { free(entry); return false; }
    memcpy(entry->key, key, key_len);
    entry->value = value;
    entry->next = table->buckets[index];
    table->buckets[index] = entry;
    table->size++;
    return true;
}`,

      String.raw`// ht_get stores the value for key into out and returns true when present.
bool ht_get(const hash_table_t *table, const char *key, int *out) {
    size_t index = (size_t)(hash_fnv1a(key) % table->bucket_count);
    for (const ht_entry_t *entry = table->buckets[index]; entry != NULL; entry = entry->next) {
        if (strcmp(entry->key, key) == 0) {
            if (out != NULL) *out = entry->value;
            return true;
        }
    }
    return false;
}`,

      String.raw`// ht_remove deletes key from the table and frees its storage.
bool ht_remove(hash_table_t *table, const char *key) {
    size_t index = (size_t)(hash_fnv1a(key) % table->bucket_count);
    ht_entry_t **indirect = &table->buckets[index];
    while (*indirect != NULL) {
        if (strcmp((*indirect)->key, key) == 0) {
            ht_entry_t *victim = *indirect;
            *indirect = victim->next;
            free(victim->key);
            free(victim);
            table->size--;
            return true;
        }
        indirect = &(*indirect)->next;
    }
    return false;
}`,

      String.raw`// ht_contains reports whether key is present in the table.
bool ht_contains(const hash_table_t *table, const char *key) {
    return ht_get(table, key, NULL);
}`,

      String.raw`// ht_size returns the number of key/value pairs stored.
size_t ht_size(const hash_table_t *table) {
    return table->size;
}`,

      String.raw`// ht_free releases every entry, its key, the bucket array, and the table.
void ht_free(hash_table_t *table) {
    if (table == NULL) return;
    for (size_t i = 0; i < table->bucket_count; i++) {
        ht_entry_t *entry = table->buckets[i];
        while (entry != NULL) {
            ht_entry_t *next = entry->next;
            free(entry->key);
            free(entry);
            entry = next;
        }
    }
    free(table->buckets);
    free(table);
}`,

      String.raw`// ht_load_factor returns the ratio of entries to buckets.
double ht_load_factor(const hash_table_t *table) {
    return table->bucket_count == 0 ? 0.0 : (double)table->size / (double)table->bucket_count;
}`,

      String.raw`// ht_keys collects every key into an allocated array and returns the count.
size_t ht_keys(const hash_table_t *table, char ***keys_out) {
    char **keys = malloc((table->size + 1) * sizeof(char *));
    if (keys == NULL) return 0;
    size_t w = 0;
    for (size_t i = 0; i < table->bucket_count; i++) {
        for (const ht_entry_t *entry = table->buckets[i]; entry != NULL; entry = entry->next) {
            size_t len = strlen(entry->key) + 1;
            keys[w] = malloc(len);
            if (keys[w] == NULL) break;
            memcpy(keys[w], entry->key, len);
            w++;
        }
    }
    keys[w] = NULL;
    *keys_out = keys;
    return w;
}`,

      String.raw`// ht_collision_count counts entries sharing a bucket with another key.
size_t ht_collision_count(const hash_table_t *table) {
    size_t collisions = 0;
    for (size_t i = 0; i < table->bucket_count; i++) {
        size_t chain = 0;
        for (const ht_entry_t *entry = table->buckets[i]; entry != NULL; entry = entry->next) chain++;
        if (chain > 1) collisions += chain - 1;
    }
    return collisions;
}`,
    ],
  },

  {
    file: 'binary_tree.c',
    topic: 'binary search tree',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdlib.h>'],
    units: [
      String.raw`typedef struct bst_node {
    int value;
    struct bst_node *left;
    struct bst_node *right;
} bst_node_t;`,

      String.raw`// bst_insert adds value to the tree and returns the (possibly new) root.
bst_node_t *bst_insert(bst_node_t *root, int value) {
    if (root == NULL) {
        root = malloc(sizeof(bst_node_t));
        if (root == NULL) return NULL;
        root->value = value;
        root->left = root->right = NULL;
        return root;
    }
    if (value < root->value) root->left = bst_insert(root->left, value);
    else if (value > root->value) root->right = bst_insert(root->right, value);
    return root;
}`,

      String.raw`// bst_search reports whether value is present in the tree.
bool bst_search(const bst_node_t *root, int value) {
    const bst_node_t *node = root;
    while (node != NULL) {
        if (value == node->value) return true;
        node = value < node->value ? node->left : node->right;
    }
    return false;
}`,

      String.raw`// bst_min returns the smallest value in the tree, or 0 for an empty tree.
int bst_min(const bst_node_t *root) {
    const bst_node_t *node = root;
    while (node != NULL && node->left != NULL) node = node->left;
    return node != NULL ? node->value : 0;
}`,

      String.raw`// bst_max returns the largest value in the tree, or 0 for an empty tree.
int bst_max(const bst_node_t *root) {
    const bst_node_t *node = root;
    while (node != NULL && node->right != NULL) node = node->right;
    return node != NULL ? node->value : 0;
}`,

      String.raw`// bst_height returns the number of levels in the tree.
size_t bst_height(const bst_node_t *root) {
    if (root == NULL) return 0;
    size_t left = bst_height(root->left);
    size_t right = bst_height(root->right);
    return 1 + (left > right ? left : right);
}`,

      String.raw`// bst_size returns the number of nodes in the tree.
size_t bst_size(const bst_node_t *root) {
    if (root == NULL) return 0;
    return 1 + bst_size(root->left) + bst_size(root->right);
}`,

      String.raw`// bst_inorder fills out with values in ascending order, returning the count.
size_t bst_inorder(const bst_node_t *root, int *out) {
    if (root == NULL) return 0;
    size_t n = bst_inorder(root->left, out);
    out[n++] = root->value;
    return n + bst_inorder(root->right, out + n);
}`,

      String.raw`// bst_preorder fills out in preorder (root, left, right), returning the count.
size_t bst_preorder(const bst_node_t *root, int *out) {
    if (root == NULL) return 0;
    size_t n = 1;
    out[0] = root->value;
    n += bst_preorder(root->left, out + n);
    n += bst_preorder(root->right, out + n);
    return n;
}`,

      String.raw`// bst_postorder fills out in postorder (left, right, root), returning the count.
size_t bst_postorder(const bst_node_t *root, int *out) {
    if (root == NULL) return 0;
    size_t n = bst_postorder(root->left, out);
    n += bst_postorder(root->right, out + n);
    out[n++] = root->value;
    return n;
}`,

      String.raw`// bst_remove deletes value and returns the new root.
bst_node_t *bst_remove(bst_node_t *root, int value) {
    if (root == NULL) return NULL;
    if (value < root->value) {
        root->left = bst_remove(root->left, value);
    } else if (value > root->value) {
        root->right = bst_remove(root->right, value);
    } else {
        if (root->left == NULL) {
            bst_node_t *right = root->right;
            free(root);
            return right;
        }
        if (root->right == NULL) {
            bst_node_t *left = root->left;
            free(root);
            return left;
        }
        int successor = bst_min(root->right);
        root->value = successor;
        root->right = bst_remove(root->right, successor);
    }
    return root;
}`,

      String.raw`// bst_free releases every node in the tree.
void bst_free(bst_node_t *root) {
    if (root == NULL) return;
    bst_free(root->left);
    bst_free(root->right);
    free(root);
}`,

      String.raw`// bst_is_balanced reports whether subtree heights differ by at most one.
bool bst_is_balanced(const bst_node_t *root) {
    if (root == NULL) return true;
    size_t left = bst_height(root->left);
    size_t right = bst_height(root->right);
    long diff = (long)left - (long)right;
    return diff >= -1 && diff <= 1 && bst_is_balanced(root->left) && bst_is_balanced(root->right);
}`,

      String.raw`// bst_lca returns the lowest common ancestor of two values in a BST.
bst_node_t *bst_lca(bst_node_t *root, int a, int b) {
    bst_node_t *node = root;
    while (node != NULL) {
        if (a < node->value && b < node->value) node = node->left;
        else if (a > node->value && b > node->value) node = node->right;
        else return node;
    }
    return NULL;
}`,

      String.raw`// bst_count_leaves returns the number of leaf nodes.
size_t bst_count_leaves(const bst_node_t *root) {
    if (root == NULL) return 0;
    if (root->left == NULL && root->right == NULL) return 1;
    return bst_count_leaves(root->left) + bst_count_leaves(root->right);
}`,

      String.raw`// bst_sum returns the sum of all values in the tree.
long bst_sum(const bst_node_t *root) {
    if (root == NULL) return 0;
    return (long)root->value + bst_sum(root->left) + bst_sum(root->right);
}`,
    ],
  },

  {
    file: 'heap.c',
    topic: 'binary min-heap',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdlib.h>'],
    units: [
      String.raw`typedef struct heap {
    int *items;
    size_t capacity;
    size_t count;
} heap_t;`,

      String.raw`// heap_create allocates a min-heap with room for capacity items.
heap_t *heap_create(size_t capacity) {
    heap_t *h = malloc(sizeof(heap_t));
    if (h == NULL) return NULL;
    h->items = malloc(capacity * sizeof(int));
    if (h->items == NULL) { free(h); return NULL; }
    h->capacity = capacity;
    h->count = 0;
    return h;
}`,

      String.raw`// heap_sift_up bubbles the item at index toward the root to restore
// the min-heap invariant.
static void heap_sift_up(int *items, size_t index) {
    while (index > 0) {
        size_t parent = (index - 1) / 2;
        if (items[parent] <= items[index]) break;
        int tmp = items[parent];
        items[parent] = items[index];
        items[index] = tmp;
        index = parent;
    }
}`,

      String.raw`// heap_sift_down pushes the item at index toward the leaves.
static void heap_sift_down(int *items, size_t count, size_t index) {
    for (;;) {
        size_t left = 2 * index + 1;
        size_t right = left + 1;
        size_t smallest = index;
        if (left < count && items[left] < items[smallest]) smallest = left;
        if (right < count && items[right] < items[smallest]) smallest = right;
        if (smallest == index) break;
        int tmp = items[index];
        items[index] = items[smallest];
        items[smallest] = tmp;
        index = smallest;
    }
}`,

      String.raw`// heap_push inserts value; returns false when the heap is full.
bool heap_push(heap_t *h, int value) {
    if (h->count >= h->capacity) return false;
    h->items[h->count] = value;
    heap_sift_up(h->items, h->count);
    h->count++;
    return true;
}`,

      String.raw`// heap_pop removes and returns the minimum value via out.
bool heap_pop(heap_t *h, int *out) {
    if (h->count == 0) return false;
    *out = h->items[0];
    h->items[0] = h->items[--h->count];
    heap_sift_down(h->items, h->count, 0);
    return true;
}`,

      String.raw`// heap_peek reads the minimum value without removing it.
bool heap_peek(const heap_t *h, int *out) {
    if (h->count == 0) return false;
    *out = h->items[0];
    return true;
}`,

      String.raw`// heap_size returns the number of items currently held.
size_t heap_size(const heap_t *h) {
    return h->count;
}`,

      String.raw`// heap_is_empty reports whether the heap holds no items.
bool heap_is_empty(const heap_t *h) {
    return h->count == 0;
}`,

      String.raw`// heap_free releases the heap and its backing array.
void heap_free(heap_t *h) {
    if (h == NULL) return;
    free(h->items);
    free(h);
}`,

      String.raw`// heap_build rearranges an array of count items into a valid min-heap.
void heap_build(int *items, size_t count) {
    for (size_t i = count / 2; i-- > 0;) {
        heap_sift_down(items, count, i);
    }
}`,

      String.raw`// heap_sort sorts values ascending in place using an in-array max-heap.
void heap_sort(int *values, size_t count) {
    if (count < 2) return;
    for (size_t start = count / 2; start > 0;) {
        start--;
        size_t i = start;
        for (;;) {
            size_t child = 2 * i + 1;
            if (child >= count) break;
            if (child + 1 < count && values[child + 1] > values[child]) child++;
            if (values[child] <= values[i]) break;
            int tmp = values[i];
            values[i] = values[child];
            values[child] = tmp;
            i = child;
        }
    }
    for (size_t end = count - 1; end > 0; end--) {
        int tmp = values[0];
        values[0] = values[end];
        values[end] = tmp;
        size_t i = 0;
        for (;;) {
            size_t child = 2 * i + 1;
            if (child >= end) break;
            if (child + 1 < end && values[child + 1] > values[child]) child++;
            if (values[child] <= values[i]) break;
            int tmp2 = values[i];
            values[i] = values[child];
            values[child] = tmp2;
            i = child;
        }
    }
}`,

      String.raw`// heap_replace removes the minimum, inserts value, and returns the old min.
bool heap_replace(heap_t *h, int value, int *out) {
    if (h->count == 0) return heap_push(h, value);
    *out = h->items[0];
    h->items[0] = value;
    heap_sift_down(h->items, h->count, 0);
    return true;
}`,
    ],
  },

  {
    file: 'ring_buffer.c',
    topic: 'circular ring buffer',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdlib.h>'],
    units: [
      String.raw`typedef struct ring_buffer {
    unsigned char *buffer;
    size_t capacity;
    size_t head;
    size_t tail;
} ring_buffer_t;`,

      String.raw`// rb_create allocates a ring buffer that stores capacity - 1 bytes.
ring_buffer_t *rb_create(size_t capacity) {
    ring_buffer_t *rb = malloc(sizeof(ring_buffer_t));
    if (rb == NULL) return NULL;
    rb->buffer = malloc(capacity);
    if (rb->buffer == NULL) { free(rb); return NULL; }
    rb->capacity = capacity;
    rb->head = rb->tail = 0;
    return rb;
}`,

      String.raw`// rb_write_byte stores one byte; returns false when the buffer is full.
bool rb_write_byte(ring_buffer_t *rb, unsigned char byte) {
    size_t next = (rb->head + 1) % rb->capacity;
    if (next == rb->tail) return false;
    rb->buffer[rb->head] = byte;
    rb->head = next;
    return true;
}`,

      String.raw`// rb_read_byte removes and returns the oldest byte via out.
bool rb_read_byte(ring_buffer_t *rb, unsigned char *out) {
    if (rb->head == rb->tail) return false;
    *out = rb->buffer[rb->tail];
    rb->tail = (rb->tail + 1) % rb->capacity;
    return true;
}`,

      String.raw`// rb_peek reads the oldest byte without removing it.
bool rb_peek(const ring_buffer_t *rb, unsigned char *out) {
    if (rb->head == rb->tail) return false;
    *out = rb->buffer[rb->tail];
    return true;
}`,

      String.raw`// rb_count returns the number of bytes currently stored.
size_t rb_count(const ring_buffer_t *rb) {
    return (rb->head - rb->tail + rb->capacity) % rb->capacity;
}`,

      String.raw`// rb_is_empty reports whether the buffer holds no bytes.
bool rb_is_empty(const ring_buffer_t *rb) {
    return rb->head == rb->tail;
}`,

      String.raw`// rb_is_full reports whether no more bytes can be stored.
bool rb_is_full(const ring_buffer_t *rb) {
    return ((rb->head + 1) % rb->capacity) == rb->tail;
}`,

      String.raw`// rb_available returns how many more bytes can be written.
size_t rb_available(const ring_buffer_t *rb) {
    return rb->capacity - 1 - rb_count(rb);
}`,

      String.raw`// rb_free releases the buffer and its storage.
void rb_free(ring_buffer_t *rb) {
    if (rb == NULL) return;
    free(rb->buffer);
    free(rb);
}`,

      String.raw`// rb_clear resets the buffer to empty without freeing storage.
void rb_clear(ring_buffer_t *rb) {
    rb->head = rb->tail = 0;
}`,

      String.raw`// rb_write copies as many bytes as fit, returning the number stored.
size_t rb_write(ring_buffer_t *rb, const void *data, size_t len) {
    const unsigned char *p = data;
    size_t written = 0;
    while (written < len && rb_write_byte(rb, p[written])) written++;
    return written;
}`,

      String.raw`// rb_read removes up to len bytes into out, returning the number read.
size_t rb_read(ring_buffer_t *rb, void *out, size_t len) {
    unsigned char *p = out;
    size_t got = 0;
    while (got < len && rb_read_byte(rb, &p[got])) got++;
    return got;
}`,

      String.raw`// rb_discard drops up to len bytes, returning the number discarded.
size_t rb_discard(ring_buffer_t *rb, size_t len) {
    size_t dropped = 0;
    unsigned char sink;
    while (dropped < len && rb_read_byte(rb, &sink)) dropped++;
    return dropped;
}`,
    ],
  },

  {
    file: 'algorithms.c',
    topic: 'classic algorithms and dynamic programming',
    includes: ['<limits.h>', '<stdbool.h>', '<stddef.h>', '<stdint.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`// alg_binary_search returns the index of target in a sorted array, or -1.
long alg_binary_search(const int *sorted, size_t count, int target) {
    size_t lo = 0, hi = count;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (sorted[mid] == target) return (long)mid;
        if (sorted[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return -1;
}`,

      String.raw`// alg_linear_search returns the index of the first match, or -1.
long alg_linear_search(const int *values, size_t count, int target) {
    for (size_t i = 0; i < count; i++) {
        if (values[i] == target) return (long)i;
    }
    return -1;
}`,

      String.raw`// alg_bubble_sort sorts values ascending in place.
void alg_bubble_sort(int *values, size_t count) {
    for (size_t i = 0; i + 1 < count; i++) {
        bool swapped = false;
        for (size_t j = 0; j + 1 < count - i; j++) {
            if (values[j] > values[j + 1]) {
                int tmp = values[j];
                values[j] = values[j + 1];
                values[j + 1] = tmp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,

      String.raw`// alg_selection_sort sorts values ascending in place.
void alg_selection_sort(int *values, size_t count) {
    for (size_t i = 0; i + 1 < count; i++) {
        size_t min = i;
        for (size_t j = i + 1; j < count; j++) {
            if (values[j] < values[min]) min = j;
        }
        if (min != i) {
            int tmp = values[i];
            values[i] = values[min];
            values[min] = tmp;
        }
    }
}`,

      String.raw`// alg_insertion_sort sorts values ascending in place.
void alg_insertion_sort(int *values, size_t count) {
    for (size_t i = 1; i < count; i++) {
        int key = values[i];
        size_t j = i;
        while (j > 0 && values[j - 1] > key) {
            values[j] = values[j - 1];
            j--;
        }
        values[j] = key;
    }
}`,

      String.raw`// alg_quick_sort sorts values ascending with a Hoare partition.
void alg_quick_sort(int *values, size_t count) {
    if (count < 2) return;
    int pivot = values[count / 2];
    size_t i = 0, j = count - 1;
    while (i <= j) {
        while (values[i] < pivot) i++;
        while (values[j] > pivot) j--;
        if (i <= j) {
            int tmp = values[i];
            values[i] = values[j];
            values[j] = tmp;
            i++;
            j--;
        }
    }
    alg_quick_sort(values, j + 1);
    alg_quick_sort(values + i, count - i);
}`,

      String.raw`// alg_merge_sort sorts values ascending using a scratch buffer.
void alg_merge_sort(int *values, size_t count) {
    if (count < 2) return;
    size_t mid = count / 2;
    alg_merge_sort(values, mid);
    alg_merge_sort(values + mid, count - mid);
    int *merged = malloc(count * sizeof(int));
    if (merged == NULL) return;
    size_t i = 0, j = mid, k = 0;
    while (i < mid && j < count) merged[k++] = values[i] <= values[j] ? values[i++] : values[j++];
    while (i < mid) merged[k++] = values[i++];
    while (j < count) merged[k++] = values[j++];
    memcpy(values, merged, count * sizeof(int));
    free(merged);
}`,

      String.raw`// alg_counting_sort sorts values in [0, max_value] into out (which must
// hold at least count entries) using a counting array.
void alg_counting_sort(const int *values, size_t count, int max_value, int *out) {
    size_t *counts = calloc((size_t)max_value + 1, sizeof(size_t));
    if (counts == NULL) return;
    for (size_t i = 0; i < count; i++) counts[values[i]]++;
    for (int v = 1; v <= max_value; v++) counts[v] += counts[v - 1];
    for (size_t i = count; i-- > 0;) {
        int v = values[i];
        out[--counts[v]] = v;
    }
    free(counts);
}`,

      String.raw`// alg_knapsack_01 returns the max value for a 0/1 knapsack of the given
// capacity using bottom-up dynamic programming.
int alg_knapsack_01(const int *weights, const int *values, size_t n, int capacity) {
    int *dp = calloc((size_t)capacity + 1, sizeof(int));
    if (dp == NULL) return 0;
    for (size_t i = 0; i < n; i++) {
        for (int w = capacity; w >= weights[i]; w--) {
            int take = dp[w - weights[i]] + values[i];
            if (take > dp[w]) dp[w] = take;
        }
    }
    int best = dp[capacity];
    free(dp);
    return best;
}`,

      String.raw`// alg_longest_common_subsequence returns the LCS length of a and b.
size_t alg_longest_common_subsequence(const char *a, const char *b) {
    size_t na = strlen(a), nb = strlen(b);
    size_t *prev = calloc(nb + 1, sizeof(size_t));
    size_t *curr = calloc(nb + 1, sizeof(size_t));
    if (prev == NULL || curr == NULL) { free(prev); free(curr); return 0; }
    for (size_t i = 1; i <= na; i++) {
        for (size_t j = 1; j <= nb; j++) {
            if (a[i - 1] == b[j - 1]) curr[j] = prev[j - 1] + 1;
            else curr[j] = prev[j] > curr[j - 1] ? prev[j] : curr[j - 1];
        }
        size_t *tmp = prev;
        prev = curr;
        curr = tmp;
    }
    size_t result = prev[nb];
    free(prev);
    free(curr);
    return result;
}`,

      String.raw`// alg_longest_increasing_subsequence returns the LIS length of values.
size_t alg_longest_increasing_subsequence(const int *values, size_t count) {
    size_t *lengths = malloc(count * sizeof(size_t));
    if (lengths == NULL) return 0;
    size_t best = 0;
    for (size_t i = 0; i < count; i++) {
        lengths[i] = 1;
        for (size_t j = 0; j < i; j++) {
            if (values[j] < values[i] && lengths[j] + 1 > lengths[i]) lengths[i] = lengths[j] + 1;
        }
        if (lengths[i] > best) best = lengths[i];
    }
    free(lengths);
    return best;
}`,

      String.raw`// alg_edit_distance returns the Levenshtein distance between a and b.
size_t alg_edit_distance(const char *a, const char *b) {
    size_t na = strlen(a), nb = strlen(b);
    size_t *prev = malloc((nb + 1) * sizeof(size_t));
    size_t *curr = malloc((nb + 1) * sizeof(size_t));
    if (prev == NULL || curr == NULL) { free(prev); free(curr); return 0; }
    for (size_t j = 0; j <= nb; j++) prev[j] = j;
    for (size_t i = 1; i <= na; i++) {
        curr[0] = i;
        for (size_t j = 1; j <= nb; j++) {
            size_t cost = a[i - 1] == b[j - 1] ? 0 : 1;
            size_t del = prev[j] + 1;
            size_t ins = curr[j - 1] + 1;
            size_t sub = prev[j - 1] + cost;
            size_t best = del < ins ? del : ins;
            curr[j] = sub < best ? sub : best;
        }
        size_t *tmp = prev;
        prev = curr;
        curr = tmp;
    }
    size_t result = prev[nb];
    free(prev);
    free(curr);
    return result;
}`,

      String.raw`// alg_coin_change returns the fewest coins summing to amount, or -1.
int alg_coin_change(const int *coins, size_t n, int amount) {
    int *dp = malloc((size_t)(amount + 1) * sizeof(int));
    if (dp == NULL) return -1;
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) dp[a] = amount + 1;
    for (int a = 1; a <= amount; a++) {
        for (size_t i = 0; i < n; i++) {
            if (coins[i] <= a && dp[a - coins[i]] + 1 < dp[a]) dp[a] = dp[a - coins[i]] + 1;
        }
    }
    int best = dp[amount] > amount ? -1 : dp[amount];
    free(dp);
    return best;
}`,

      String.raw`// alg_max_subarray returns the largest contiguous subarray sum (Kadane).
int alg_max_subarray(const int *values, size_t count) {
    if (count == 0) return 0;
    int best = values[0], running = values[0];
    for (size_t i = 1; i < count; i++) {
        running = running + values[i] > values[i] ? running + values[i] : values[i];
        if (running > best) best = running;
    }
    return best;
}`,

      String.raw`// alg_fibonacci_memo computes fib(n) with an explicit memoization table.
uint64_t alg_fibonacci_memo(unsigned int n) {
    if (n < 2) return n;
    uint64_t *memo = calloc(n + 1, sizeof(uint64_t));
    if (memo == NULL) return 0;
    memo[1] = 1;
    for (unsigned int i = 2; i <= n; i++) memo[i] = memo[i - 1] + memo[i - 2];
    uint64_t result = memo[n];
    free(memo);
    return result;
}`,

      String.raw`// alg_binary_gcd computes gcd via Stein's binary algorithm (no division).
uint64_t alg_binary_gcd(uint64_t a, uint64_t b) {
    if (a == 0) return b;
    if (b == 0) return a;
    unsigned int shift = 0;
    while (((a | b) & 1u) == 0) {
        a >>= 1;
        b >>= 1;
        shift++;
    }
    while ((a & 1u) == 0) a >>= 1;
    while (b != 0) {
        while ((b & 1u) == 0) b >>= 1;
        if (a > b) {
            uint64_t t = a;
            a = b;
            b = t;
        }
        b -= a;
    }
    return a << shift;
}`,

      String.raw`// alg_dijkstra finds shortest paths from src in a dense graph given as an
// n*n adjacency matrix; dist entries use INT_MAX for no edge.
void alg_dijkstra(const int *graph, int n, int src, int *dist) {
    bool *visited = calloc((size_t)n, sizeof(bool));
    if (visited == NULL) return;
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[src] = 0;
    for (int iter = 0; iter < n; iter++) {
        int u = -1;
        for (int i = 0; i < n; i++) {
            if (!visited[i] && (u == -1 || dist[i] < dist[u])) u = i;
        }
        if (u == -1 || dist[u] == INT_MAX) break;
        visited[u] = true;
        for (int v = 0; v < n; v++) {
            int w = graph[u * n + v];
            if (w >= 0 && dist[u] != INT_MAX && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
    free(visited);
}`,

      String.raw`// alg_bfs computes hop distances from src in an n*n adjacency matrix,
// marking unreachable nodes with -1 (uses a simple queue).
void alg_bfs(const int *graph, int n, int src, int *dist) {
    int *queue = malloc((size_t)n * sizeof(int));
    if (queue == NULL) return;
    for (int i = 0; i < n; i++) dist[i] = -1;
    int head = 0, tail = 0;
    queue[tail++] = src;
    dist[src] = 0;
    while (head < tail) {
        int u = queue[head++];
        for (int v = 0; v < n; v++) {
            if (graph[u * n + v] && dist[v] == -1) {
                dist[v] = dist[u] + 1;
                queue[tail++] = v;
            }
        }
    }
    free(queue);
}`,

      String.raw`// alg_dfs visits every node reachable from u in an adjacency matrix and
// records the discovery order in order (n entries).
void alg_dfs(const int *graph, int n, int u, bool *visited, int *order, int *pos) {
    visited[u] = true;
    order[(*pos)++] = u;
    for (int v = 0; v < n; v++) {
        if (graph[u * n + v] && !visited[v]) alg_dfs(graph, n, v, visited, order, pos);
    }
}`,

      String.raw`// alg_rotated_min finds the minimum in a rotated sorted array.
int alg_rotated_min(const int *values, size_t count) {
    size_t lo = 0, hi = count - 1;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (values[mid] > values[hi]) lo = mid + 1;
        else hi = mid;
    }
    return values[lo];
}`,
    ],
  },

  {
    file: 'bit_manipulation.c',
    topic: 'bit manipulation',
    includes: ['<stdbool.h>', '<stdint.h>'],
    units: [
      String.raw`// bits_count_set returns the number of set bits (popcount).
unsigned int bits_count_set(uint32_t value) {
    unsigned int count = 0;
    while (value != 0) {
        value &= value - 1;
        count++;
    }
    return count;
}`,

      String.raw`// bits_is_power_of_two reports whether value is a positive power of two.
bool bits_is_power_of_two(uint32_t value) {
    return value != 0 && (value & (value - 1)) == 0;
}`,

      String.raw`// bits_set returns value with the given bit set to 1.
uint32_t bits_set(uint32_t value, unsigned int bit) {
    return value | (1u << bit);
}`,

      String.raw`// bits_clear returns value with the given bit cleared to 0.
uint32_t bits_clear(uint32_t value, unsigned int bit) {
    return value & ~(1u << bit);
}`,

      String.raw`// bits_toggle returns value with the given bit flipped.
uint32_t bits_toggle(uint32_t value, unsigned int bit) {
    return value ^ (1u << bit);
}`,

      String.raw`// bits_get reports whether the given bit is set.
bool bits_get(uint32_t value, unsigned int bit) {
    return (value >> bit) & 1u;
}`,

      String.raw`// bits_highest_set returns the index of the most significant set bit, or -1.
int bits_highest_set(uint32_t value) {
    int highest = -1;
    for (unsigned int i = 0; i < 32; i++) {
        if (value & (1u << i)) highest = (int)i;
    }
    return highest;
}`,

      String.raw`// bits_lowest_set isolates the least significant set bit.
uint32_t bits_lowest_set(uint32_t value) {
    return value & (~value + 1u);
}`,

      String.raw`// bits_rotate_left rotates value left by shift bit positions.
uint32_t bits_rotate_left(uint32_t value, unsigned int shift) {
    shift &= 31u;
    return shift == 0 ? value : (value << shift) | (value >> (32u - shift));
}`,

      String.raw`// bits_rotate_right rotates value right by shift bit positions.
uint32_t bits_rotate_right(uint32_t value, unsigned int shift) {
    shift &= 31u;
    return shift == 0 ? value : (value >> shift) | (value << (32u - shift));
}`,

      String.raw`// bits_reverse reverses the order of all 32 bits.
uint32_t bits_reverse(uint32_t value) {
    uint32_t result = 0;
    for (unsigned int i = 0; i < 32; i++) {
        result = (result << 1) | (value & 1u);
        value >>= 1;
    }
    return result;
}`,

      String.raw`// bits_swap_nibbles swaps the high and low nibble of every byte.
uint32_t bits_swap_nibbles(uint32_t value) {
    return ((value & 0x0F0F0F0Fu) << 4) | ((value & 0xF0F0F0F0u) >> 4);
}`,

      String.raw`// bits_count_leading_zeros counts zero bits above the highest set bit.
unsigned int bits_count_leading_zeros(uint32_t value) {
    if (value == 0) return 32;
    unsigned int count = 0;
    for (int i = 31; i >= 0; i--) {
        if (value & (1u << i)) break;
        count++;
    }
    return count;
}`,

      String.raw`// bits_parity returns 1 when value has an odd number of set bits.
unsigned int bits_parity(uint32_t value) {
    unsigned int parity = 0;
    while (value != 0) {
        parity ^= 1u;
        value &= value - 1;
    }
    return parity;
}`,

      String.raw`// bits_add adds a and b using only bitwise operations.
int bits_add(int a, int b) {
    while (b != 0) {
        int carry = a & b;
        a = a ^ b;
        b = carry << 1;
    }
    return a;
}`,

      String.raw`// bits_to_gray converts value to its binary Gray code.
uint32_t bits_to_gray(uint32_t value) {
    return value ^ (value >> 1);
}`,

      String.raw`// bits_from_gray converts a Gray code back to binary.
uint32_t bits_from_gray(uint32_t value) {
    uint32_t result = value;
    while (value >>= 1) result ^= value;
    return result;
}`,

      String.raw`// bits_swap_halves exchanges the upper and lower 16 bits.
uint32_t bits_swap_halves(uint32_t value) {
    return (value << 16) | (value >> 16);
}`,
    ],
  },

  {
    file: 'memory_utils.c',
    topic: 'memory utilities',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdio.h>', '<stdlib.h>', '<string.h>'],
    units: [
      String.raw`// mem_alloc_zero allocates and zeroes count elements of size bytes each,
// exiting on failure so callers need not check for NULL.
void *mem_alloc_zero(size_t count, size_t size) {
    void *ptr = calloc(count, size);
    if (ptr == NULL && count > 0 && size > 0) {
        fprintf(stderr, "calloc(%zu, %zu) failed\n", count, size);
        exit(EXIT_FAILURE);
    }
    return ptr;
}`,

      String.raw`// mem_resize grows or shrinks an allocation, freeing it on failure.
void *mem_resize(void *ptr, size_t new_size) {
    void *grown = realloc(ptr, new_size);
    if (grown == NULL) {
        free(ptr);
        return NULL;
    }
    return grown;
}`,

      String.raw`// mem_zero fills a buffer with zero bytes.
void mem_zero(void *ptr, size_t size) {
    memset(ptr, 0, size);
}`,

      String.raw`// mem_reverse_bytes reverses the byte order of an in-memory buffer.
void mem_reverse_bytes(void *buf, size_t size) {
    unsigned char *p = buf;
    for (size_t i = 0; i < size / 2; i++) {
        unsigned char tmp = p[i];
        p[i] = p[size - 1 - i];
        p[size - 1 - i] = tmp;
    }
}`,

      String.raw`// mem_compare compares two buffers lexicographically.
int mem_compare(const void *a, const void *b, size_t size) {
    return memcmp(a, b, size);
}`,

      String.raw`// mem_find_byte returns the offset of the first matching byte, or -1.
long mem_find_byte(const void *buf, size_t size, unsigned char needle) {
    const unsigned char *p = memchr(buf, needle, size);
    return p == NULL ? -1 : (long)(p - (const unsigned char *)buf);
}`,

      String.raw`// mem_contains reports whether needle appears within haystack.
bool mem_contains(const void *haystack, size_t haystack_size, const void *needle, size_t needle_size) {
    if (needle_size == 0 || needle_size > haystack_size) return false;
    const unsigned char *h = haystack;
    for (size_t i = 0; i + needle_size <= haystack_size; i++) {
        if (memcmp(h + i, needle, needle_size) == 0) return true;
    }
    return false;
}`,

      String.raw`// mem_clone returns a heap copy of size bytes, or NULL on failure.
void *mem_clone(const void *src, size_t size) {
    void *copy = malloc(size);
    if (copy == NULL) return NULL;
    memcpy(copy, src, size);
    return copy;
}`,

      String.raw`// mem_grow_array reallocates an array when count reaches capacity, doubling
// capacity; returns the possibly-moved pointer or NULL on failure.
void *mem_grow_array(void *ptr, size_t element_size, size_t count, size_t *capacity) {
    if (count < *capacity) return ptr;
    size_t next = *capacity == 0 ? 8 : *capacity * 2;
    void *grown = realloc(ptr, next * element_size);
    if (grown == NULL) return NULL;
    *capacity = next;
    return grown;
}`,

      String.raw`// mem_align_up rounds size up to the next multiple of alignment.
size_t mem_align_up(size_t size, size_t alignment) {
    size_t remainder = size % alignment;
    return remainder == 0 ? size : size + (alignment - remainder);
}`,

      String.raw`// mem_all_zero reports whether every byte of a buffer is zero.
bool mem_all_zero(const void *buf, size_t size) {
    const unsigned char *p = buf;
    for (size_t i = 0; i < size; i++) {
        if (p[i] != 0) return false;
    }
    return true;
}`,

      String.raw`// mem_fill_pattern repeats a byte pattern across the destination buffer.
void mem_fill_pattern(void *dst, size_t size, const unsigned char *pattern, size_t pattern_size) {
    unsigned char *p = dst;
    for (size_t i = 0; i < size; i++) p[i] = pattern[i % pattern_size];
}`,

      String.raw`// mem_copy_str copies a NUL-terminated string into a heap buffer.
char *mem_copy_str(const char *src) {
    size_t len = strlen(src) + 1;
    char *copy = malloc(len);
    if (copy == NULL) return NULL;
    memcpy(copy, src, len);
    return copy;
}`,

      String.raw`// mem_swap exchanges the contents of two equally sized buffers.
void mem_swap(void *a, void *b, size_t size) {
    unsigned char *pa = a, *pb = b;
    for (size_t i = 0; i < size; i++) {
        unsigned char tmp = pa[i];
        pa[i] = pb[i];
        pb[i] = tmp;
    }
}`,

      String.raw`// mem_trim reallocates a buffer down to an exact size, preserving contents.
void *mem_trim(void *ptr, size_t size) {
    return realloc(ptr, size);
}`,

      String.raw`// mem_concat joins two byte buffers into a single heap allocation.
void *mem_concat(const void *a, size_t na, const void *b, size_t nb) {
    void *joined = malloc(na + nb);
    if (joined == NULL) return NULL;
    memcpy(joined, a, na);
    memcpy((unsigned char *)joined + na, b, nb);
    return joined;
}`,
    ],
  },

  {
    file: 'date_time.c',
    topic: 'date and time utilities',
    includes: ['<stdbool.h>', '<stddef.h>', '<stdio.h>', '<time.h>'],
    units: [
      String.raw`typedef struct date {
    int year;
    int month;
    int day;
} date_t;`,

      String.raw`// dt_is_leap reports whether year is a Gregorian leap year.
bool dt_is_leap(int year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}`,

      String.raw`// dt_days_in_month returns the number of days in a month, or 0 if invalid.
int dt_days_in_month(int year, int month) {
    static const int days[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (month < 1 || month > 12) return 0;
    if (month == 2 && dt_is_leap(year)) return 29;
    return days[month - 1];
}`,

      String.raw`// dt_days_in_year returns 366 for a leap year, otherwise 365.
int dt_days_in_year(int year) {
    return dt_is_leap(year) ? 366 : 365;
}`,

      String.raw`// dt_is_valid_date checks a date for month and day ranges.
bool dt_is_valid_date(const date_t *d) {
    if (d->month < 1 || d->month > 12 || d->day < 1) return false;
    return d->day <= dt_days_in_month(d->year, d->month);
}`,

      String.raw`// dt_day_of_week returns 0=Sunday .. 6=Saturday (Sakamoto's algorithm).
int dt_day_of_week(const date_t *d) {
    static const int offsets[] = {0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4};
    int y = d->year;
    if (d->month < 3) y -= 1;
    return (y + y / 4 - y / 100 + y / 400 + offsets[d->month - 1] + d->day) % 7;
}`,

      String.raw`// dt_day_of_year returns the 1-based day within the year.
int dt_day_of_year(const date_t *d) {
    int total = d->day;
    for (int m = 1; m < d->month; m++) total += dt_days_in_month(d->year, m);
    return total;
}`,

      String.raw`// dt_days_since_epoch returns days from 1970-01-01 (civil calendar math).
long dt_days_since_epoch(const date_t *d) {
    long y = d->year - (d->month <= 2 ? 1 : 0);
    long era = (y >= 0 ? y : y - 399) / 400;
    long yoe = y - era * 400;
    long doy = (153 * (d->month + (d->month > 2 ? -3 : 9)) + 2) / 5 + d->day - 1;
    long doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + doe - 719468;
}`,

      String.raw`// dt_days_between returns the signed number of days from a to b.
long dt_days_between(const date_t *a, const date_t *b) {
    return dt_days_since_epoch(b) - dt_days_since_epoch(a);
}`,

      String.raw`// dt_add_days shifts a date forward by n days (n may be negative).
void dt_add_days(date_t *d, long n) {
    long days = dt_days_since_epoch(d) + n + 719468;
    long era = (days >= 0 ? days : days - 146096) / 146097;
    long doe = days - era * 146097;
    long yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    long y = yoe + era * 400;
    long doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    long mp = (5 * doy + 2) / 153;
    d->day = (int)(doy - (153 * mp + 2) / 5 + 1);
    d->month = (int)(mp + (mp < 10 ? 3 : -9));
    d->year = (int)(y + (d->month <= 2 ? 1 : 0));
}`,

      String.raw`// dt_compare returns negative, zero, or positive for a before/equal/after b.
int dt_compare(const date_t *a, const date_t *b) {
    if (a->year != b->year) return a->year - b->year;
    if (a->month != b->month) return a->month - b->month;
    return a->day - b->day;
}`,

      String.raw`// dt_parse_iso parses "YYYY-MM-DD" into a date; returns false on error.
bool dt_parse_iso(const char *text, date_t *out) {
    int year, month, day;
    if (sscanf(text, "%d-%d-%d", &year, &month, &day) != 3) return false;
    out->year = year;
    out->month = month;
    out->day = day;
    return dt_is_valid_date(out);
}`,

      String.raw`// dt_format_iso writes a date as "YYYY-MM-DD" into buf.
void dt_format_iso(const date_t *d, char *buf, size_t cap) {
    snprintf(buf, cap, "%04d-%02d-%02d", d->year, d->month, d->day);
}`,

      String.raw`// dt_timestamp_string writes the current local time as a timestamp.
void dt_timestamp_string(char *buf, size_t cap) {
    time_t now = time(NULL);
    struct tm *local = localtime(&now);
    strftime(buf, cap, "%Y-%m-%d %H:%M:%S", local);
}`,

      String.raw`// dt_elapsed_ms returns milliseconds elapsed since a clock() start value.
long dt_elapsed_ms(clock_t start) {
    return (long)((clock() - start) * 1000 / CLOCKS_PER_SEC);
}`,

      String.raw`// dt_week_of_year returns an approximate week number within the year.
int dt_week_of_year(const date_t *d) {
    return (dt_day_of_year(d) - dt_day_of_week(d) + 10) / 7;
}`,

      String.raw`// dt_is_weekend reports whether the date is a Saturday or Sunday.
bool dt_is_weekend(const date_t *d) {
    int dow = dt_day_of_week(d);
    return dow == 0 || dow == 6;
}`,
    ],
  },

  {
    file: 'domain_models.c',
    topic: 'domain models and small structs',
    includes: ['<math.h>', '<stdbool.h>', '<stddef.h>', '<stdio.h>'],
    units: [
      String.raw`typedef struct point {
    double x;
    double y;
} point_t;`,

      String.raw`// point_distance returns the Euclidean distance between two points.
double point_distance(point_t a, point_t b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}`,

      String.raw`// point_midpoint returns the midpoint between two points.
point_t point_midpoint(point_t a, point_t b) {
    point_t mid = {(a.x + b.x) / 2.0, (a.y + b.y) / 2.0};
    return mid;
}`,

      String.raw`typedef struct rectangle {
    double x;
    double y;
    double width;
    double height;
} rectangle_t;`,

      String.raw`// rect_area returns the area of a rectangle.
double rect_area(rectangle_t r) {
    return r.width * r.height;
}`,

      String.raw`// rect_contains reports whether a point lies within a rectangle.
bool rect_contains(rectangle_t r, point_t p) {
    return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
}`,

      String.raw`typedef struct circle {
    point_t center;
    double radius;
} circle_t;`,

      String.raw`// circle_area returns the area of a circle.
double circle_area(circle_t c) {
    static const double PI = 3.14159265358979323846;
    return PI * c.radius * c.radius;
}`,

      String.raw`typedef struct complex {
    double real;
    double imag;
} complex_t;`,

      String.raw`// complex_add returns the sum of two complex numbers.
complex_t complex_add(complex_t a, complex_t b) {
    complex_t result = {a.real + b.real, a.imag + b.imag};
    return result;
}`,

      String.raw`// complex_mul returns the product of two complex numbers.
complex_t complex_mul(complex_t a, complex_t b) {
    complex_t result = {
        a.real * b.real - a.imag * b.imag,
        a.real * b.imag + a.imag * b.real
    };
    return result;
}`,

      String.raw`typedef struct vector3 {
    double x;
    double y;
    double z;
} vector3_t;`,

      String.raw`// vector3_magnitude returns the length of a 3D vector.
double vector3_magnitude(vector3_t v) {
    return sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}`,

      String.raw`// vector3_dot returns the dot product of two 3D vectors.
double vector3_dot(vector3_t a, vector3_t b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}`,

      String.raw`typedef struct bank_account {
    char owner[64];
    double balance;
} bank_account_t;`,

      String.raw`// account_deposit adds a positive amount to the balance.
void account_deposit(bank_account_t *account, double amount) {
    if (amount > 0.0) account->balance += amount;
}`,

      String.raw`// account_withdraw removes amount when sufficient funds exist.
bool account_withdraw(bank_account_t *account, double amount) {
    if (amount <= 0.0 || amount > account->balance) return false;
    account->balance -= amount;
    return true;
}`,

      String.raw`typedef struct fraction {
    long numerator;
    long denominator;
} fraction_t;`,

      String.raw`// fraction_reduce returns the fraction in lowest terms.
fraction_t fraction_reduce(fraction_t f) {
    long a = f.numerator, b = f.denominator;
    while (b != 0) {
        long t = a % b;
        a = b;
        b = t;
    }
    long gcd = a < 0 ? -a : a;
    if (gcd == 0) gcd = 1;
    fraction_t result = {f.numerator / gcd, f.denominator / gcd};
    return result;
}`,

      String.raw`typedef struct rgb_color {
    unsigned char red;
    unsigned char green;
    unsigned char blue;
} rgb_color_t;`,

      String.raw`// rgb_to_hex formats an RGB color as "#RRGGBB".
void rgb_to_hex(rgb_color_t color, char *out, size_t cap) {
    snprintf(out, cap, "#%02X%02X%02X", color.red, color.green, color.blue);
}`,
    ],
  },
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderFile(fd) {
  const includeBlock = fd.includes.map((h) => `#include ${h}`).join('\n');
  const header = `// ${fd.file} — generated by scripts/generate/generate-c.mjs (do not edit by hand).
// Realistic C typing blocks for vibetyper: ${fd.topic}.

${includeBlock}

`;
  return header + fd.units.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Sanity checks
// ---------------------------------------------------------------------------

// Brace balance check that ignores braces inside // and /* */ comments,
// double-quoted strings, and char literals. Mirrors the scanner used by
// server/blockSplitter.js so a unit that passes here splits as one block.
function checkUnitBalance(unit, file, idx) {
  const lines = unit.split('\n');
  let depth = 0;
  for (const line of lines) {
    let inBlock = false;
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      const next = line[i + 1];
      if (inBlock) {
        if (ch === '*' && next === '/') {
          inBlock = false;
          i += 2;
        } else {
          i++;
        }
        continue;
      }
      if (ch === '/' && next === '/') break;
      if (ch === '/' && next === '*') {
        inBlock = true;
        i += 2;
        continue;
      }
      if (ch === '#') break;
      if (ch === '"' || ch === "'") {
        const quote = ch;
        i++;
        while (i < line.length) {
          if (line[i] === '\\') {
            i += 2;
            continue;
          }
          if (line[i] === quote) {
            i++;
            break;
          }
          i++;
        }
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
    if (depth < 0) {
      throw new Error(`${file} unit #${idx} has a closing brace with nothing to open:\n${unit}`);
    }
  }
  if (depth !== 0) {
    throw new Error(`${file} unit #${idx} has unbalanced braces (depth ${depth}):\n${unit}`);
  }
}

// Reject obvious filler so we never ship placeholder text to a typist.
const BANNED = [/lorem/i, /TODO/i, /placeholder/i, /example123/i, /\bfoobar\b/i];
function checkNoFiller(unit, file, idx) {
  for (const re of BANNED) {
    if (re.test(unit)) {
      throw new Error(`${file} unit #${idx} contains filler matching ${re}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let totalUnits = 0;
const written = [];
const seen = new Set();

for (const fd of FILES) {
  if (seen.has(fd.file)) throw new Error(`duplicate output file: ${fd.file}`);
  seen.add(fd.file);
  for (let i = 0; i < fd.units.length; i++) {
    checkUnitBalance(fd.units[i], fd.file, i);
    checkNoFiller(fd.units[i], fd.file, i);
  }
  const content = renderFile(fd);
  fs.writeFileSync(path.join(outDir, fd.file), content);
  totalUnits += fd.units.length;
  written.push(fd.file);
}

if (totalUnits < 300) {
  throw new Error(`C dictionary too small: only ${totalUnits} units generated (need >= 300)`);
}

console.log('Wrote %d C dictionary files, %d units total.', written.length, totalUnits);
for (const f of written) console.log('  -', f);
