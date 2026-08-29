#include <algorithm>
#include <string>
#include <vector>

// factorial computes n! iteratively, returning 1 for n <= 1.
long long factorial(int n) {
    long long result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

// is_palindrome checks whether a string reads the same both ways.
bool is_palindrome(const std::string& text) {
    int left = 0;
    int right = static_cast<int>(text.size()) - 1;
    while (left < right) {
        if (text[left] != text[right]) {
            return false;
        }
        ++left;
        --right;
    }
    return true;
}

// maximum returns the largest value in a vector of integers.
int maximum(const std::vector<int>& values) {
    int best = values.empty() ? 0 : values.front();
    for (int value : values) {
        best = std::max(best, value);
    }
    return best;
}

// filter_positive keeps only the strictly positive values in a vector.
std::vector<int> filter_positive(const std::vector<int>& values) {
    std::vector<int> result;
    for (int value : values) {
        if (value > 0) {
            result.push_back(value);
        }
    }
    return result;
}
