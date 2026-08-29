// Data module for scripts/generate/generate-cpp.mjs.
// Encoding, decoding and bit-level helpers.

export default [
  {
    file: 'encoding_utils.cpp',
    topic: 'encoding and decoding helpers',
    includes: ['<algorithm>', '<cctype>', '<cstdint>', '<string>'],
    units: [
      `// hex_encode renders bytes as lowercase hexadecimal text.
std::string hex_encode(const std::string& data) {
    static const char digits[] = "0123456789abcdef";
    std::string out;
    out.reserve(data.size() * 2);
    for (unsigned char c : data) {
        out.push_back(digits[c >> 4]);
        out.push_back(digits[c & 15]);
    }
    return out;
}`,

      `// hex_decode parses a hexadecimal string into bytes, returning false on
// invalid input.
bool hex_decode(const std::string& text, std::string& out) {
    auto value = [](char c) -> int {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    };
    if (text.size() % 2 != 0) {
        return false;
    }
    out.clear();
    out.reserve(text.size() / 2);
    for (size_t i = 0; i < text.size(); i += 2) {
        int hi = value(text[i]);
        int lo = value(text[i + 1]);
        if (hi < 0 || lo < 0) {
            return false;
        }
        out.push_back(static_cast<char>((hi << 4) | lo));
    }
    return true;
}`,

      `// rot13 applies the classic letter-substitution cipher to text.
std::string rot13(const std::string& text) {
    std::string out = text;
    for (char& c : out) {
        unsigned char u = static_cast<unsigned char>(c);
        if (u >= 'a' && u <= 'z') {
            c = static_cast<char>('a' + (u - 'a' + 13) % 26);
        } else if (u >= 'A' && u <= 'Z') {
            c = static_cast<char>('A' + (u - 'A' + 13) % 26);
        }
    }
    return out;
}`,

      `// xor_bytes applies a repeating key to data.
std::string xor_bytes(const std::string& data, const std::string& key) {
    std::string out;
    out.reserve(data.size());
    if (key.empty()) {
        return data;
    }
    for (size_t i = 0; i < data.size(); ++i) {
        out.push_back(static_cast<char>(data[i] ^ key[i % key.size()]));
    }
    return out;
}`,

      `// reverse_bytes returns a copy of data with the byte order flipped.
std::string reverse_bytes(const std::string& data) {
    return std::string(data.rbegin(), data.rend());
}`,

      `// to_binary_string renders an integer as a binary string.
std::string to_binary_string(uint32_t value) {
    std::string out;
    do {
        out.push_back((value & 1) ? '1' : '0');
        value >>= 1;
    } while (value > 0);
    std::reverse(out.begin(), out.end());
    return out;
}`,

      `// parse_hex_int interprets text as a base-16 integer.
bool parse_hex_int(const std::string& text, uint32_t& out) {
    uint32_t value = 0;
    for (char c : text) {
        int digit;
        if (c >= '0' && c <= '9') {
            digit = c - '0';
        } else if (c >= 'a' && c <= 'f') {
            digit = c - 'a' + 10;
        } else if (c >= 'A' && c <= 'F') {
            digit = c - 'A' + 10;
        } else {
            return false;
        }
        value = value * 16 + static_cast<uint32_t>(digit);
    }
    out = value;
    return true;
}`,

      `// hamming_distance counts positions where two equal-length strings
// differ.
bool hamming_distance(const std::string& a, const std::string& b, size_t& out) {
    if (a.size() != b.size()) {
        return false;
    }
    out = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i] != b[i]) {
            ++out;
        }
    }
    return true;
}`,

      `// run_length_encode compresses repeated runs, so "aaabbc" -> "a3b2c1".
std::string run_length_encode(const std::string& text) {
    std::string out;
    for (size_t i = 0; i < text.size();) {
        char run = text[i];
        size_t count = 1;
        while (i + count < text.size() && text[i + count] == run) {
            ++count;
        }
        out.push_back(run);
        out += std::to_string(count);
        i += count;
    }
    return out;
}`,

      `// run_length_decode expands "a3b2c1" back to "aaabbc".
bool run_length_decode(const std::string& encoded, std::string& out) {
    out.clear();
    for (size_t i = 0; i < encoded.size();) {
        char run = encoded[i++];
        size_t start = i;
        while (i < encoded.size() &&
               std::isdigit(static_cast<unsigned char>(encoded[i]))) {
            ++i;
        }
        if (start == i) {
            return false;
        }
        int count = std::stoi(encoded.substr(start, i - start));
        out.append(static_cast<size_t>(count), run);
    }
    return true;
}`,

      `// soundex_code maps an uppercase letter to its Soundex digit, 0 for
// vowels and H/W.
int soundex_code(char c) {
    switch (c) {
    case 'B': case 'F': case 'P': case 'V': return 1;
    case 'C': case 'G': case 'J': case 'K': case 'Q': case 'S': case 'X': case 'Z': return 2;
    case 'D': case 'T': return 3;
    case 'L': return 4;
    case 'M': case 'N': return 5;
    case 'R': return 6;
    default: return 0;
    }
}

// soundex computes the four-character Soundex code of a name.
std::string soundex(const std::string& name) {
    if (name.empty()) {
        return "";
    }
    std::string upper;
    for (char c : name) {
        upper.push_back(
            static_cast<char>(std::toupper(static_cast<unsigned char>(c))));
    }
    std::string code(1, upper.front());
    int last = soundex_code(upper.front());
    for (size_t i = 1; i < upper.size() && code.size() < 4; ++i) {
        int digit = soundex_code(upper[i]);
        if (digit != 0 && digit != last) {
            code += static_cast<char>('0' + digit);
        }
        if (digit != 0) {
            last = digit;
        }
    }
    while (code.size() < 4) {
        code.push_back('0');
    }
    return code;
}`,

      `// count_set_bits counts the 1 bits in an unsigned integer.
int count_set_bits(uint32_t value) {
    int count = 0;
    while (value > 0) {
        value &= value - 1;
        ++count;
    }
    return count;
}`,

      `// reverse_bits flips the bit order of an 8-bit value.
uint8_t reverse_bits(uint8_t value) {
    uint8_t out = 0;
    for (int i = 0; i < 8; ++i) {
        out = static_cast<uint8_t>((out << 1) | (value & 1));
        value >>= 1;
    }
    return out;
}`,

      `// base36_encode renders a non-negative integer in base 36.
std::string base36_encode(uint64_t value) {
    static const char digits[] = "0123456789abcdefghijklmnopqrstuvwxyz";
    std::string out;
    do {
        out.push_back(digits[value % 36]);
        value /= 36;
    } while (value > 0);
    std::reverse(out.begin(), out.end());
    return out;
}`,

      `// base36_decode parses a base-36 string into an integer.
bool base36_decode(const std::string& text, uint64_t& out) {
    uint64_t value = 0;
    for (char c : text) {
        int digit;
        if (c >= '0' && c <= '9') {
            digit = c - '0';
        } else if (c >= 'a' && c <= 'z') {
            digit = c - 'a' + 10;
        } else if (c >= 'A' && c <= 'Z') {
            digit = c - 'A' + 10;
        } else {
            return false;
        }
        value = value * 36 + static_cast<uint64_t>(digit);
    }
    out = value;
    return true;
}`,

      `// crc8 computes a simple 8-bit CRC over data.
uint8_t crc8(const std::string& data) {
    uint8_t crc = 0;
    for (unsigned char c : data) {
        crc ^= c;
        for (int bit = 0; bit < 8; ++bit) {
            if (crc & 0x80) {
                crc = static_cast<uint8_t>((crc << 1) ^ 0x07);
            } else {
                crc = static_cast<uint8_t>(crc << 1);
            }
        }
    }
    return crc;
}`,
    ],
  },
];
