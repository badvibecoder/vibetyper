// Data module for scripts/generate/generate-go.mjs.
// Classic data structures and algorithms.

export default [
  {
    file: 'data_structures.go',
    topic: 'classic data structures',
    imports: [],
    units: [
      `// TreeNode is a node of a binary search tree holding an integer value.
type TreeNode struct {
	Value       int
	Left, Right *TreeNode
}

// Insert adds value into the tree rooted at n, keeping BST order.
func (n *TreeNode) Insert(value int) {
	if value < n.Value {
		if n.Left == nil {
			n.Left = &TreeNode{Value: value}
		} else {
			n.Left.Insert(value)
		}
		return
	}
	if n.Right == nil {
		n.Right = &TreeNode{Value: value}
	} else {
		n.Right.Insert(value)
	}
}

// Contains reports whether value exists in the tree.
func (n *TreeNode) Contains(value int) bool {
	if n == nil {
		return false
	}
	switch {
	case value < n.Value:
		return n.Left.Contains(value)
	case value > n.Value:
		return n.Right.Contains(value)
	default:
		return true
	}
}

// InOrder returns the values in sorted order via an in-order traversal.
func (n *TreeNode) InOrder() []int {
	if n == nil {
		return nil
	}
	out := n.Left.InOrder()
	out = append(out, n.Value)
	out = append(out, n.Right.InOrder()...)
	return out
}

// Height returns the number of levels in the tree.
func (n *TreeNode) Height() int {
	if n == nil {
		return 0
	}
	left, right := n.Left.Height(), n.Right.Height()
	if left > right {
		return left + 1
	}
	return right + 1
}`,

      `// MinHeap is a binary min-heap backed by a slice.
type MinHeap struct {
	items []int
}

// Push adds a value to the heap.
func (h *MinHeap) Push(v int) {
	h.items = append(h.items, v)
	for i := len(h.items) - 1; i > 0; {
		parent := (i - 1) / 2
		if h.items[parent] <= h.items[i] {
			break
		}
		h.items[parent], h.items[i] = h.items[i], h.items[parent]
		i = parent
	}
}

// Pop removes and returns the smallest value.
func (h *MinHeap) Pop() (int, bool) {
	if len(h.items) == 0 {
		return 0, false
	}
	top := h.items[0]
	last := len(h.items) - 1
	h.items[0] = h.items[last]
	h.items = h.items[:last]
	for i := 0; ; {
		left, right := 2*i+1, 2*i+2
		smallest := i
		if left < len(h.items) && h.items[left] < h.items[smallest] {
			smallest = left
		}
		if right < len(h.items) && h.items[right] < h.items[smallest] {
			smallest = right
		}
		if smallest == i {
			break
		}
		h.items[i], h.items[smallest] = h.items[smallest], h.items[i]
		i = smallest
	}
	return top, true
}`,

      `// Graph is a directed adjacency-map graph keyed by node name.
type Graph struct {
	adj map[string][]string
}

// NewGraph creates an empty graph.
func NewGraph() *Graph {
	return &Graph{adj: make(map[string][]string)}
}

// AddEdge records a directed edge from from to to.
func (g *Graph) AddEdge(from, to string) {
	g.adj[from] = append(g.adj[from], to)
}

// Neighbors lists the nodes reachable in one hop from node.
func (g *Graph) Neighbors(node string) []string {
	return append([]string(nil), g.adj[node]...)
}

// BFS visits every node reachable from start in breadth-first order.
func (g *Graph) BFS(start string) []string {
	visited := make(map[string]bool)
	var order []string
	queue := []string{start}
	visited[start] = true
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		order = append(order, node)
		for _, next := range g.adj[node] {
			if !visited[next] {
				visited[next] = true
				queue = append(queue, next)
			}
		}
	}
	return order
}`,

      `// FenwickTree is a binary indexed tree for prefix sums over an implicit
// array.
type FenwickTree struct {
	tree []int
}

// NewFenwickTree creates a fenwick tree sized for n elements.
func NewFenwickTree(n int) *FenwickTree {
	return &FenwickTree{tree: make([]int, n+1)}
}

// Add adds delta to the element at 1-based index.
func (f *FenwickTree) Add(index, delta int) {
	for i := index; i < len(f.tree); i += i & -i {
		f.tree[i] += delta
	}
}

// PrefixSum returns the sum of elements 1..index.
func (f *FenwickTree) PrefixSum(index int) int {
	sum := 0
	for i := index; i > 0; i -= i & -i {
		sum += f.tree[i]
	}
	return sum
}`,

      `// hash1 is a simple FNV-1a-style hash used by the bloom filter.
func hash1(s string) int {
	h := 2166136261
	for _, b := range []byte(s) {
		h ^= int(b)
		h *= 16777619
	}
	if h < 0 {
		h = -h
	}
	return h
}

// hash2 is a djb2-style hash, distinct from hash1.
func hash2(s string) int {
	h := 5381
	for _, b := range []byte(s) {
		h = h*33 + int(b)
	}
	if h < 0 {
		h = -h
	}
	return h
}

// BloomFilter is a probabilistic set that never produces false negatives.
type BloomFilter struct {
	bits []bool
	size int
}

// NewBloomFilter creates a bloom filter with the given number of bits.
func NewBloomFilter(size int) *BloomFilter {
	return &BloomFilter{bits: make([]bool, size), size: size}
}

// Add marks an item as present.
func (b *BloomFilter) Add(item string) {
	b.bits[hash1(item)%b.size] = true
	b.bits[hash2(item)%b.size] = true
}

// MaybeContains reports whether the item may be present; a false positive
// is possible but a false negative is not.
func (b *BloomFilter) MaybeContains(item string) bool {
	return b.bits[hash1(item)%b.size] && b.bits[hash2(item)%b.size]
}`,

      `// TrieNode is one node of a rune-based prefix tree.
type TrieNode struct {
	children map[rune]*TrieNode
	terminal bool
}

// NewTrieNode creates an empty trie node.
func NewTrieNode() *TrieNode {
	return &TrieNode{children: make(map[rune]*TrieNode)}
}

// Insert adds a word to the trie.
func (n *TrieNode) Insert(word string) {
	node := n
	for _, r := range word {
		child, ok := node.children[r]
		if !ok {
			child = NewTrieNode()
			node.children[r] = child
		}
		node = child
	}
	node.terminal = true
}

// Search reports whether word is a complete word in the trie.
func (n *TrieNode) Search(word string) bool {
	node := n
	for _, r := range word {
		child, ok := node.children[r]
		if !ok {
			return false
		}
		node = child
	}
	return node.terminal
}

// StartsWith reports whether any stored word begins with prefix.
func (n *TrieNode) StartsWith(prefix string) bool {
	node := n
	for _, r := range prefix {
		child, ok := node.children[r]
		if !ok {
			return false
		}
		node = child
	}
	return true
}`,
    ],
  },

  {
    file: 'algorithms.go',
    topic: 'classic algorithms',
    imports: [],
    units: [
      `// binarySearch returns the index of target in a sorted slice, or -1.
func binarySearch(sorted []int, target int) int {
	lo, hi := 0, len(sorted)-1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if sorted[mid] == target {
			return mid
		}
		if sorted[mid] < target {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return -1
}`,

      `// binarySearchFirst finds the first index of target in a sorted slice that
// may contain duplicates, or -1.
func binarySearchFirst(sorted []int, target int) int {
	lo, hi := 0, len(sorted)-1
	first := -1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if sorted[mid] < target {
			lo = mid + 1
		} else {
			if sorted[mid] == target {
				first = mid
			}
			hi = mid - 1
		}
	}
	return first
}`,

      `// binarySearchLast finds the last index of target in a sorted slice that
// may contain duplicates, or -1.
func binarySearchLast(sorted []int, target int) int {
	lo, hi := 0, len(sorted)-1
	last := -1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if sorted[mid] > target {
			hi = mid - 1
		} else {
			if sorted[mid] == target {
				last = mid
			}
			lo = mid + 1
		}
	}
	return last
}`,

      `// quickSort sorts a slice in place using Hoare-style partitioning.
func quickSort(items []int) {
	var sort func(lo, hi int)
	sort = func(lo, hi int) {
		if lo >= hi {
			return
		}
		pivot := items[lo+(hi-lo)/2]
		i, j := lo, hi
		for i <= j {
			for items[i] < pivot {
				i++
			}
			for items[j] > pivot {
				j--
			}
			if i <= j {
				items[i], items[j] = items[j], items[i]
				i++
				j--
			}
		}
		sort(lo, j)
		sort(i, hi)
	}
	sort(0, len(items)-1)
}`,

      `// mergeSort returns a sorted copy of values using top-down mergesort.
func mergeSort(values []int) []int {
	if len(values) <= 1 {
		return append([]int(nil), values...)
	}
	mid := len(values) / 2
	left := mergeSort(values[:mid])
	right := mergeSort(values[mid:])
	merged := make([]int, 0, len(values))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			merged = append(merged, left[i])
			i++
		} else {
			merged = append(merged, right[j])
			j++
		}
	}
	merged = append(merged, left[i:]...)
	merged = append(merged, right[j:]...)
	return merged
}`,

      `// insertionSort sorts a slice in place, efficient for nearly-sorted input.
func insertionSort(items []int) {
	for i := 1; i < len(items); i++ {
		key := items[i]
		j := i - 1
		for j >= 0 && items[j] > key {
			items[j+1] = items[j]
			j--
		}
		items[j+1] = key
	}
}`,

      `// selectionSort sorts a slice in place by repeatedly picking the minimum
// of the unsorted tail.
func selectionSort(items []int) {
	for i := 0; i < len(items)-1; i++ {
		minIdx := i
		for j := i + 1; j < len(items); j++ {
			if items[j] < items[minIdx] {
				minIdx = j
			}
		}
		items[i], items[minIdx] = items[minIdx], items[i]
	}
}`,

      `// twoSum finds the indices of two values that add up to target.
func twoSum(values []int, target int) [2]int {
	seen := make(map[int]int)
	for i, v := range values {
		if j, ok := seen[target-v]; ok {
			return [2]int{j, i}
		}
		seen[v] = i
	}
	return [2]int{-1, -1}
}`,

      `// maxSubarraySum returns the largest sum of any contiguous subarray using
// Kadane's algorithm.
func maxSubarraySum(values []int) int {
	if len(values) == 0 {
		return 0
	}
	best, current := values[0], values[0]
	for _, v := range values[1:] {
		if current < 0 {
			current = 0
		}
		current += v
		if current > best {
			best = current
		}
	}
	return best
}`,

      `// longestUniqueSubstring returns the length of the longest substring
// without repeating characters.
func longestUniqueSubstring(s string) int {
	lastSeen := make(map[rune]int)
	start, longest := 0, 0
	for i, r := range s {
		if j, ok := lastSeen[r]; ok && j >= start {
			start = j + 1
		}
		lastSeen[r] = i
		if i-start+1 > longest {
			longest = i - start + 1
		}
	}
	return longest
}`,

      `// knapsack returns the maximum value that fits in capacity using 0/1
// dynamic programming.
func knapsack(weights, values []int, capacity int) int {
	n := len(weights)
	dp := make([]int, capacity+1)
	for i := 0; i < n; i++ {
		for w := capacity; w >= weights[i]; w-- {
			if dp[w-weights[i]]+values[i] > dp[w] {
				dp[w] = dp[w-weights[i]] + values[i]
			}
		}
	}
	return dp[capacity]
}`,

      `// coinChange returns the minimum number of coins from denominations needed
// to make amount, or -1 when impossible.
func coinChange(denominations []int, amount int) int {
	inf := amount + 1
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = inf
	}
	for _, coin := range denominations {
		for a := coin; a <= amount; a++ {
			if dp[a-coin]+1 < dp[a] {
				dp[a] = dp[a-coin] + 1
			}
		}
	}
	if dp[amount] == inf {
		return -1
	}
	return dp[amount]
}`,

      `// longestCommonSubsequence returns the length of the longest common
// subsequence of two strings.
func longestCommonSubsequence(a, b string) int {
	ar, br := []rune(a), []rune(b)
	dp := make([][]int, len(ar)+1)
	for i := range dp {
		dp[i] = make([]int, len(br)+1)
	}
	for i := 1; i <= len(ar); i++ {
		for j := 1; j <= len(br); j++ {
			if ar[i-1] == br[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
			} else if dp[i-1][j] > dp[i][j-1] {
				dp[i][j] = dp[i-1][j]
			} else {
				dp[i][j] = dp[i][j-1]
			}
		}
	}
	return dp[len(ar)][len(br)]
}`,

      `// topologicalSort orders nodes so every edge points forward, using Kahn's
// algorithm. It returns ok=false when the graph has a cycle.
func topologicalSort(graph map[string][]string) ([]string, bool) {
	indegree := make(map[string]int)
	for node := range graph {
		indegree[node] = 0
	}
	for _, neighbors := range graph {
		for _, next := range neighbors {
			indegree[next]++
		}
	}
	queue := []string{}
	for node, degree := range indegree {
		if degree == 0 {
			queue = append(queue, node)
		}
	}
	var order []string
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		order = append(order, node)
		for _, next := range graph[node] {
			indegree[next]--
			if indegree[next] == 0 {
				queue = append(queue, next)
			}
		}
	}
	if len(order) != len(graph) {
		return nil, false
	}
	return order, true
}`,

      `// dijkstra returns the shortest distance from start to every reachable
// node in a weighted adjacency map.
func dijkstra(graph map[string]map[string]int, start string) map[string]int {
	dist := make(map[string]int)
	visited := make(map[string]bool)
	for node := range graph {
		dist[node] = 1 << 30
	}
	dist[start] = 0
	for {
		next := ""
		best := 1 << 30
		for node, d := range dist {
			if !visited[node] && d < best {
				best = d
				next = node
			}
		}
		if next == "" {
			break
		}
		visited[next] = true
		for neighbor, weight := range graph[next] {
			if d := dist[next] + weight; d < dist[neighbor] {
				dist[neighbor] = d
			}
		}
	}
	return dist
}`,

      `// majorityElement returns the value appearing more than n/2 times using
// the Boyer-Moore voting algorithm, or 0 if none exists.
func majorityElement(values []int) int {
	candidate, count := 0, 0
	for _, v := range values {
		if count == 0 {
			candidate = v
		}
		if v == candidate {
			count++
		} else {
			count--
		}
	}
	return candidate
}`,

      `// findMissingNumber finds the one missing integer in a permutation of
// 0..n using XOR cancellation.
func findMissingNumber(values []int) int {
	n := len(values)
	missing := 0
	for i := 0; i <= n; i++ {
		missing ^= i
	}
	for _, v := range values {
		missing ^= v
	}
	return missing
}`,

      `// dutchFlag sorts an array of 0s, 1s and 2s in a single pass using a
// three-way partition.
func dutchFlag(items []int) {
	lo, mid, hi := 0, 0, len(items)-1
	for mid <= hi {
		switch items[mid] {
		case 0:
			items[lo], items[mid] = items[mid], items[lo]
			lo++
			mid++
		case 1:
			mid++
		case 2:
			items[mid], items[hi] = items[hi], items[mid]
			hi--
		}
	}
}`,

      `// nextPermutation rearranges items into the next lexicographic
// permutation in place, returning false when already descending.
func nextPermutation(items []int) bool {
	i := len(items) - 2
	for i >= 0 && items[i] >= items[i+1] {
		i--
	}
	if i < 0 {
		return false
	}
	j := len(items) - 1
	for items[j] <= items[i] {
		j--
	}
	items[i], items[j] = items[j], items[i]
	lo, hi := i+1, len(items)-1
	for lo < hi {
		items[lo], items[hi] = items[hi], items[lo]
		lo++
		hi--
	}
	return true
}`,

      `// mergeSortedSlices merges two sorted slices into one sorted slice.
func mergeSortedSlices(a, b []int) []int {
	out := make([]int, 0, len(a)+len(b))
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] {
			out = append(out, a[i])
			i++
		} else {
			out = append(out, b[j])
			j++
		}
	}
	out = append(out, a[i:]...)
	out = append(out, b[j:]...)
	return out
}`,
    ],
  },
];
