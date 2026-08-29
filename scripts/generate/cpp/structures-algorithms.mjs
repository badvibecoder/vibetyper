// Data module for scripts/generate/generate-cpp.mjs.
// Classic data structures and algorithms.

export default [
  {
    file: 'data_structures.cpp',
    topic: 'classic data structures',
    includes: ['<algorithm>', '<cstdint>', '<memory>', '<queue>', '<string>', '<unordered_map>', '<unordered_set>', '<vector>'],
    units: [
      `// TreeNode is a node of a binary search tree.
struct TreeNode {
    int value;
    std::unique_ptr<TreeNode> left;
    std::unique_ptr<TreeNode> right;

    explicit TreeNode(int v) : value(v) {}
};

// tree_insert adds value into the tree keeping BST order.
void tree_insert(std::unique_ptr<TreeNode>& node, int value) {
    if (!node) {
        node = std::make_unique<TreeNode>(value);
        return;
    }
    if (value < node->value) {
        tree_insert(node->left, value);
    } else {
        tree_insert(node->right, value);
    }
}

// tree_contains reports whether value exists in the tree.
bool tree_contains(const TreeNode* node, int value) {
    if (node == nullptr) {
        return false;
    }
    if (value < node->value) {
        return tree_contains(node->left.get(), value);
    }
    if (value > node->value) {
        return tree_contains(node->right.get(), value);
    }
    return true;
}

// tree_inorder returns the values in sorted order.
std::vector<int> tree_inorder(const TreeNode* node) {
    std::vector<int> out;
    if (node == nullptr) {
        return out;
    }
    std::vector<int> left = tree_inorder(node->left.get());
    out.insert(out.end(), left.begin(), left.end());
    out.push_back(node->value);
    std::vector<int> right = tree_inorder(node->right.get());
    out.insert(out.end(), right.begin(), right.end());
    return out;
}

// tree_height returns the number of levels in the tree.
int tree_height(const TreeNode* node) {
    if (node == nullptr) {
        return 0;
    }
    int left = tree_height(node->left.get());
    int right = tree_height(node->right.get());
    return (left > right ? left : right) + 1;
}`,

      `// MinHeap is a binary min-heap backed by a vector.
class MinHeap {
public:
    void push(int value);
    bool pop(int& value);
    bool empty() const;

private:
    std::vector<int> items_;
};

void MinHeap::push(int value) {
    items_.push_back(value);
    size_t i = items_.size() - 1;
    while (i > 0) {
        size_t parent = (i - 1) / 2;
        if (items_[parent] <= items_[i]) {
            break;
        }
        std::swap(items_[parent], items_[i]);
        i = parent;
    }
}

bool MinHeap::pop(int& value) {
    if (items_.empty()) {
        return false;
    }
    value = items_.front();
    items_.front() = items_.back();
    items_.pop_back();
    size_t i = 0;
    while (true) {
        size_t left = 2 * i + 1;
        size_t right = 2 * i + 2;
        size_t smallest = i;
        if (left < items_.size() && items_[left] < items_[smallest]) {
            smallest = left;
        }
        if (right < items_.size() && items_[right] < items_[smallest]) {
            smallest = right;
        }
        if (smallest == i) {
            break;
        }
        std::swap(items_[i], items_[smallest]);
        i = smallest;
    }
    return true;
}

bool MinHeap::empty() const {
    return items_.empty();
}`,

      `// Graph is a directed graph keyed by node name.
class Graph {
public:
    void add_edge(const std::string& from, const std::string& to);
    std::vector<std::string> bfs(const std::string& start) const;

private:
    std::unordered_map<std::string, std::vector<std::string>> adjacency_;
};

void Graph::add_edge(const std::string& from, const std::string& to) {
    adjacency_[from].push_back(to);
}

std::vector<std::string> Graph::bfs(const std::string& start) const {
    std::vector<std::string> order;
    std::queue<std::string> pending;
    std::unordered_set<std::string> visited;
    pending.push(start);
    visited.insert(start);
    while (!pending.empty()) {
        std::string node = pending.front();
        pending.pop();
        order.push_back(node);
        auto it = adjacency_.find(node);
        if (it == adjacency_.end()) {
            continue;
        }
        for (const std::string& next : it->second) {
            if (visited.insert(next).second) {
                pending.push(next);
            }
        }
    }
    return order;
}`,

      `// TrieNode is one node of a prefix tree.
struct TrieNode {
    std::unordered_map<char, std::unique_ptr<TrieNode>> children;
    bool terminal = false;
};

// trie_insert adds a word to the trie.
void trie_insert(TrieNode& root, const std::string& word) {
    TrieNode* node = &root;
    for (char c : word) {
        auto& child = node->children[c];
        if (!child) {
            child = std::make_unique<TrieNode>();
        }
        node = child.get();
    }
    node->terminal = true;
}

// trie_search reports whether word is stored as a complete word.
bool trie_search(const TrieNode& root, const std::string& word) {
    const TrieNode* node = &root;
    for (char c : word) {
        auto it = node->children.find(c);
        if (it == node->children.end()) {
            return false;
        }
        node = it->second.get();
    }
    return node->terminal;
}

// trie_starts_with reports whether any stored word begins with prefix.
bool trie_starts_with(const TrieNode& root, const std::string& prefix) {
    const TrieNode* node = &root;
    for (char c : prefix) {
        auto it = node->children.find(c);
        if (it == node->children.end()) {
            return false;
        }
        node = it->second.get();
    }
    return true;
}`,

      `// fnv1a_hash is a 32-bit FNV-1a variant seeded per hash function.
uint32_t fnv1a_hash(const std::string& text, uint32_t seed) {
    uint32_t hash = 2166136261u ^ seed;
    for (unsigned char c : text) {
        hash ^= c;
        hash *= 16777619u;
    }
    return hash;
}

// BloomFilter is a probabilistic set with no false negatives.
class BloomFilter {
public:
    explicit BloomFilter(size_t bitCount);

    void add(const std::string& item);
    bool maybe_contains(const std::string& item) const;

private:
    std::vector<bool> bits_;
    size_t bitCount_;
};

BloomFilter::BloomFilter(size_t bitCount)
    : bits_(bitCount), bitCount_(bitCount) {}

void BloomFilter::add(const std::string& item) {
    bits_[fnv1a_hash(item, 0x9E3779B9u) % bitCount_] = true;
    bits_[fnv1a_hash(item, 0x85EBCA6Bu) % bitCount_] = true;
}

bool BloomFilter::maybe_contains(const std::string& item) const {
    return bits_[fnv1a_hash(item, 0x9E3779B9u) % bitCount_] &&
           bits_[fnv1a_hash(item, 0x85EBCA6Bu) % bitCount_];
}`,

      `// LinkedNode is one element of a singly linked list.
struct LinkedNode {
    int value;
    LinkedNode* next = nullptr;

    explicit LinkedNode(int v) : value(v) {}
};

// list_append adds a value to the end of a list.
void list_append(LinkedNode*& head, int value) {
    if (head == nullptr) {
        head = new LinkedNode(value);
        return;
    }
    LinkedNode* tail = head;
    while (tail->next != nullptr) {
        tail = tail->next;
    }
    tail->next = new LinkedNode(value);
}

// list_contains reports whether value appears in the list.
bool list_contains(const LinkedNode* head, int value) {
    for (const LinkedNode* node = head; node != nullptr; node = node->next) {
        if (node->value == value) {
            return true;
        }
    }
    return false;
}`,
    ],
  },

  {
    file: 'algorithms.cpp',
    topic: 'classic algorithms',
    includes: ['<algorithm>', '<map>', '<queue>', '<set>', '<string>', '<unordered_map>', '<vector>'],
    units: [
      `// binary_search returns the index of target in a sorted vector, or -1.
int binary_search(const std::vector<int>& sorted, int target) {
    int lo = 0, hi = static_cast<int>(sorted.size()) - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (sorted[mid] == target) {
            return mid;
        }
        if (sorted[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return -1;
}`,

      `// binary_search_first finds the first index of target in a sorted
// vector that may contain duplicates, or -1.
int binary_search_first(const std::vector<int>& sorted, int target) {
    int lo = 0, hi = static_cast<int>(sorted.size()) - 1;
    int first = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (sorted[mid] < target) {
            lo = mid + 1;
        } else {
            if (sorted[mid] == target) {
                first = mid;
            }
            hi = mid - 1;
        }
    }
    return first;
}`,

      `// quick_sort sorts a vector in place with a Hoare partition.
void quick_sort(std::vector<int>& items, int lo, int hi) {
    if (lo >= hi) {
        return;
    }
    int pivot = items[lo + (hi - lo) / 2];
    int i = lo, j = hi;
    while (i <= j) {
        while (items[i] < pivot) ++i;
        while (items[j] > pivot) --j;
        if (i <= j) {
            std::swap(items[i], items[j]);
            ++i;
            --j;
        }
    }
    quick_sort(items, lo, j);
    quick_sort(items, i, hi);
}`,

      `// merge_sort returns a sorted copy of values.
std::vector<int> merge_sort(const std::vector<int>& values) {
    if (values.size() <= 1) {
        return values;
    }
    size_t mid = values.size() / 2;
    std::vector<int> left = merge_sort(
        std::vector<int>(values.begin(), values.begin() + static_cast<long>(mid)));
    std::vector<int> right = merge_sort(
        std::vector<int>(values.begin() + static_cast<long>(mid), values.end()));
    std::vector<int> merged;
    merged.reserve(values.size());
    size_t i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            merged.push_back(left[i++]);
        } else {
            merged.push_back(right[j++]);
        }
    }
    while (i < left.size()) merged.push_back(left[i++]);
    while (j < right.size()) merged.push_back(right[j++]);
    return merged;
}`,

      `// insertion_sort sorts a vector in place, efficient for nearly-sorted
// input.
void insertion_sort(std::vector<int>& items) {
    for (size_t i = 1; i < items.size(); ++i) {
        int key = items[i];
        size_t j = i;
        while (j > 0 && items[j - 1] > key) {
            items[j] = items[j - 1];
            --j;
        }
        items[j] = key;
    }
}`,

      `// selection_sort sorts a vector in place by repeatedly picking the
// minimum of the unsorted tail.
void selection_sort(std::vector<int>& items) {
    for (size_t i = 0; i + 1 < items.size(); ++i) {
        size_t minIdx = i;
        for (size_t j = i + 1; j < items.size(); ++j) {
            if (items[j] < items[minIdx]) {
                minIdx = j;
            }
        }
        std::swap(items[i], items[minIdx]);
    }
}`,

      `// two_sum finds indices of two values that add up to target.
std::pair<int, int> two_sum(const std::vector<int>& values, int target) {
    std::unordered_map<int, int> seen;
    for (size_t i = 0; i < values.size(); ++i) {
        auto it = seen.find(target - values[i]);
        if (it != seen.end()) {
            return {it->second, static_cast<int>(i)};
        }
        seen[values[i]] = static_cast<int>(i);
    }
    return {-1, -1};
}`,

      `// max_subarray_sum returns the largest sum of any contiguous subarray
// using Kadane's algorithm.
int max_subarray_sum(const std::vector<int>& values) {
    if (values.empty()) {
        return 0;
    }
    int best = values.front();
    int current = values.front();
    for (size_t i = 1; i < values.size(); ++i) {
        current = std::max(values[i], current + values[i]);
        best = std::max(best, current);
    }
    return best;
}`,

      `// longest_unique_substring returns the length of the longest substring
// without repeating characters.
size_t longest_unique_substring(const std::string& s) {
    std::unordered_map<char, size_t> lastSeen;
    size_t start = 0, longest = 0;
    for (size_t i = 0; i < s.size(); ++i) {
        auto it = lastSeen.find(s[i]);
        if (it != lastSeen.end() && it->second >= start) {
            start = it->second + 1;
        }
        lastSeen[s[i]] = i;
        longest = std::max(longest, i - start + 1);
    }
    return longest;
}`,

      `// knapsack returns the maximum value that fits in capacity using 0/1
// dynamic programming.
int knapsack(const std::vector<int>& weights, const std::vector<int>& values,
             int capacity) {
    std::vector<int> dp(capacity + 1, 0);
    for (size_t i = 0; i < weights.size(); ++i) {
        for (int w = capacity; w >= weights[i]; --w) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[capacity];
}`,

      `// coin_change returns the minimum coins from denominations needed to
// make amount, or -1 when impossible.
int coin_change(const std::vector<int>& denominations, int amount) {
    const int inf = amount + 1;
    std::vector<int> dp(amount + 1, inf);
    dp[0] = 0;
    for (int coin : denominations) {
        for (int a = coin; a <= amount; ++a) {
            dp[a] = std::min(dp[a], dp[a - coin] + 1);
        }
    }
    return dp[amount] == inf ? -1 : dp[amount];
}`,

      `// longest_common_subsequence returns the length of the longest common
// subsequence of two strings.
size_t longest_common_subsequence(const std::string& a, const std::string& b) {
    std::vector<std::vector<size_t>> dp(a.size() + 1,
                                        std::vector<size_t>(b.size() + 1, 0));
    for (size_t i = 1; i <= a.size(); ++i) {
        for (size_t j = 1; j <= b.size(); ++j) {
            if (a[i - 1] == b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[a.size()][b.size()];
}`,

      `// topological_sort orders nodes so every edge points forward, returning
// false when the graph contains a cycle.
bool topological_sort(
    const std::unordered_map<std::string, std::vector<std::string>>& graph,
    std::vector<std::string>& order) {
    std::unordered_map<std::string, int> indegree;
    for (const auto& entry : graph) {
        indegree[entry.first] += 0;
        for (const std::string& next : entry.second) {
            indegree[next]++;
        }
    }
    std::queue<std::string> ready;
    for (const auto& entry : indegree) {
        if (entry.second == 0) {
            ready.push(entry.first);
        }
    }
    order.clear();
    while (!ready.empty()) {
        std::string node = ready.front();
        ready.pop();
        order.push_back(node);
        auto it = graph.find(node);
        if (it == graph.end()) {
            continue;
        }
        for (const std::string& next : it->second) {
            if (--indegree[next] == 0) {
                ready.push(next);
            }
        }
    }
    return order.size() == graph.size();
}`,

      `// dijkstra returns the shortest distance from start to every node in a
// weighted adjacency map.
std::map<std::string, int> dijkstra(
    const std::map<std::string, std::map<std::string, int>>& graph,
    const std::string& start) {
    const int inf = 1 << 30;
    std::map<std::string, int> dist;
    std::set<std::string> visited;
    for (const auto& entry : graph) {
        dist[entry.first] = inf;
    }
    dist[start] = 0;
    while (true) {
        std::string next;
        int best = inf;
        for (const auto& entry : dist) {
            if (visited.count(entry.first) == 0 && entry.second < best) {
                best = entry.second;
                next = entry.first;
            }
        }
        if (next.empty()) {
            break;
        }
        visited.insert(next);
        auto it = graph.find(next);
        if (it == graph.end()) {
            continue;
        }
        for (const auto& edge : it->second) {
            int candidate = dist[next] + edge.second;
            if (candidate < dist[edge.first]) {
                dist[edge.first] = candidate;
            }
        }
    }
    return dist;
}`,

      `// majority_element returns the value appearing more than n/2 times
// using the Boyer-Moore voting algorithm.
int majority_element(const std::vector<int>& values) {
    int candidate = 0, count = 0;
    for (int v : values) {
        if (count == 0) {
            candidate = v;
        }
        count += (v == candidate) ? 1 : -1;
    }
    return candidate;
}`,

      `// find_missing_number finds the one missing integer in a permutation of
// 0..n using XOR cancellation.
int find_missing_number(const std::vector<int>& values) {
    int missing = 0;
    for (size_t i = 0; i <= values.size(); ++i) {
        missing ^= static_cast<int>(i);
    }
    for (int v : values) {
        missing ^= v;
    }
    return missing;
}`,

      `// dutch_flag sorts an array of 0s, 1s and 2s in a single pass.
void dutch_flag(std::vector<int>& items) {
    size_t lo = 0, mid = 0, hi = items.size();
    while (mid < hi) {
        if (items[mid] == 0) {
            std::swap(items[lo++], items[mid++]);
        } else if (items[mid] == 1) {
            ++mid;
        } else {
            std::swap(items[mid], items[--hi]);
        }
    }
}`,

      `// next_permutation rearranges items into the next lexicographic
// permutation, returning false when already descending.
bool next_permutation(std::vector<int>& items) {
    int i = static_cast<int>(items.size()) - 2;
    while (i >= 0 && items[i] >= items[i + 1]) {
        --i;
    }
    if (i < 0) {
        return false;
    }
    int j = static_cast<int>(items.size()) - 1;
    while (items[j] <= items[i]) {
        --j;
    }
    std::swap(items[i], items[j]);
    std::reverse(items.begin() + i + 1, items.end());
    return true;
}`,

      `// merge_sorted_vectors merges two sorted vectors into one sorted vector.
std::vector<int> merge_sorted_vectors(const std::vector<int>& a,
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
    while (i < a.size()) out.push_back(a[i++]);
    while (j < b.size()) out.push_back(b[j++]);
    return out;
}`,
    ],
  },
];
