package algorithms

// insertion_sort sorts a slice in place by insertion.
insertion_sort :: proc(values: []int) {
	for i in 1 ..< len(values) {
		key := values[i]
		j := i - 1
		for j >= 0 && values[j] > key {
			values[j + 1] = values[j]
			j -= 1
		}
		values[j + 1] = key
	}
}

// selection_sort repeatedly selects the smallest remaining element.
selection_sort :: proc(values: []int) {
	for i in 0 ..< len(values) {
		smallest := i
		for j := i + 1; j < len(values); j += 1 {
			if values[j] < values[smallest] {
				smallest = j
			}
		}
		values[i], values[smallest] = values[smallest], values[i]
	}
}

// bubble_sort bubbles the largest values to the end.
bubble_sort :: proc(values: []int) {
	n := len(values)
	for i in 0 ..< n {
		swapped := false
		for j in 0 ..< n - i - 1 {
			if values[j] > values[j + 1] {
				values[j], values[j + 1] = values[j + 1], values[j]
				swapped = true
			}
		}
		if !swapped {
			break
		}
	}
}

// merge merges two sorted slices into one sorted slice.
merge :: proc(left, right: []int) -> []int {
	result := make([]int, 0, len(left) + len(right))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			append(&result, left[i])
			i += 1
		} else {
			append(&result, right[j])
			j += 1
		}
	}
	for i < len(left) {
		append(&result, left[i])
		i += 1
	}
	for j < len(right) {
		append(&result, right[j])
		j += 1
	}
	return result
}

// merge_sort sorts a slice recursively by divide and conquer.
merge_sort :: proc(values: []int) -> []int {
	if len(values) <= 1 {
		return values
	}
	mid := len(values) / 2
	left := merge_sort(values[:mid])
	right := merge_sort(values[mid:])
	return merge(left, right)
}

// quick_sort_partition reorders around a pivot and returns its index.
quick_sort_partition :: proc(values: []int, lo, hi: int) -> int {
	pivot := values[hi]
	i := lo - 1
	for j := lo; j < hi; j += 1 {
		if values[j] <= pivot {
			i += 1
			values[i], values[j] = values[j], values[i]
		}
	}
	values[i + 1], values[hi] = values[hi], values[i + 1]
	return i + 1
}

// binary_search finds a value in a sorted slice in O(log n).
binary_search :: proc(values: []int, target: int) -> int {
	lo, hi := 0, len(values) - 1
	for lo <= hi {
		mid := lo + (hi - lo) / 2
		if values[mid] == target {
			return mid
		}
		if values[mid] < target {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return -1
}

// linear_search scans an unsorted slice for a value.
linear_search :: proc(values: []int, target: int) -> int {
	for v, i in values {
		if v == target {
			return i
		}
	}
	return -1
}

// two_sum finds indices of two values that add up to a target.
two_sum :: proc(values: []int, target: int) -> (int, int, bool) {
	seen := make(map[int]int)
	defer delete(seen)
	for v, i in values {
		needed := target - v
		if j, ok := seen[needed]; ok {
			return j, i, true
		}
		seen[v] = i
	}
	return 0, 0, false
}

// max_subarray finds the largest sum of a contiguous subarray.
max_subarray :: proc(values: []int) -> int {
	if len(values) == 0 {
		return 0
	}
	best := values[0]
	current := values[0]
	for i in 1 ..< len(values) {
		current = max(values[i], current + values[i])
		best = max(best, current)
	}
	return best
}

// longest_increasing_subsequence returns its length (O(n^2)).
longest_increasing_subsequence :: proc(values: []int) -> int {
	if len(values) == 0 {
		return 0
	}
	lengths := make([]int, len(values))
	defer delete(lengths)
	best := 1
	for i in 0 ..< len(values) {
		lengths[i] = 1
		for j in 0 ..< i {
			if values[j] < values[i] {
				lengths[i] = max(lengths[i], lengths[j] + 1)
			}
		}
		best = max(best, lengths[i])
	}
	return best
}

// knapsack_01 computes the maximum value under a weight limit.
knapsack_01 :: proc(weights, values: []int, capacity: int) -> int {
	n := len(weights)
	dp := make([]int, capacity + 1)
	defer delete(dp)
	for i in 0 ..< n {
		for w := capacity; w >= weights[i]; w -= 1 {
			dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
		}
	}
	return dp[capacity]
}

// edit_distance computes the Levenshtein distance of two strings.
edit_distance :: proc(a, b: string) -> int {
	n, m := len(a), len(b)
	prev := make([]int, m + 1)
	defer delete(prev)
	for j in 0 ..= m {
		prev[j] = j
	}
	for i in 1 ..= n {
		curr := make([]int, m + 1)
		defer delete(curr)
		curr[0] = i
		for j in 1 ..= m {
			cost := 1
			if a[i - 1] == b[j - 1] {
				cost = 0
			}
			curr[j] = min(min(prev[j] + 1, curr[j - 1] + 1), prev[j - 1] + cost)
		}
		prev = curr
	}
	return prev[m]
}

// longest_common_subsequence returns its length via DP table.
longest_common_subsequence :: proc(a, b: string) -> int {
	n, m := len(a), len(b)
	table := make([][]int, n + 1)
	defer delete(table)
	for i in 0 ..= n {
		table[i] = make([]int, m + 1)
	}
	for i in 1 ..= n {
		for j in 1 ..= m {
			if a[i - 1] == b[j - 1] {
				table[i][j] = table[i - 1][j - 1] + 1
			} else {
				table[i][j] = max(table[i - 1][j], table[i][j - 1])
			}
		}
	}
	return table[n][m]
}

// coin_change_min returns the fewest coins for a target amount.
coin_change_min :: proc(coins: []int, amount: int) -> int {
	inf := 1 << 30
	dp := make([]int, amount + 1)
	defer delete(dp)
	for i in 1 ..= amount {
		dp[i] = inf
	}
	for i in 1 ..= amount {
		for coin in coins {
			if coin <= i && dp[i - coin] + 1 < dp[i] {
				dp[i] = dp[i - coin] + 1
			}
		}
	}
	if dp[amount] == inf {
		return -1
	}
	return dp[amount]
}

// is_anagram checks whether two strings reuse the same letters.
is_anagram :: proc(a, b: string) -> bool {
	if len(a) != len(b) {
		return false
	}
	counts := make(map[u8]int)
	defer delete(counts)
	for ch in a {
		counts[ch] += 1
	}
	for ch in b {
		counts[ch] -= 1
		if counts[ch] < 0 {
			return false
		}
	}
	return true
}

// majority_element finds the value appearing more than n/2 times.
majority_element :: proc(values: []int) -> (int, bool) {
	candidate := 0
	balance := 0
	for v in values {
		if balance == 0 {
			candidate = v
		}
		if v == candidate {
			balance += 1
		} else {
			balance -= 1
		}
	}
	count := 0
	for v in values {
		if v == candidate {
			count += 1
		}
	}
	if count > len(values) / 2 {
		return candidate, true
	}
	return 0, false
}

// rotate_matrix_90 rotates a square matrix clockwise in place.
rotate_matrix_90 :: proc(matrix: [][]int) {
	n := len(matrix)
	for layer in 0 ..< n / 2 {
		for offset in layer ..< n - layer - 1 {
			top := matrix[layer][offset]
			matrix[layer][offset] = matrix[n - 1 - offset][layer]
			matrix[n - 1 - offset][layer] = matrix[n - 1 - layer][n - 1 - offset]
			matrix[n - 1 - layer][n - 1 - offset] = matrix[offset][n - 1 - layer]
			matrix[offset][n - 1 - layer] = top
		}
	}
}

// matrix_multiply multiplies two matrices with compatible dims.
matrix_multiply :: proc(a, b: [][]f64) -> ([][]f64, bool) {
	rows := len(a)
	inner := len(a[0])
	cols := len(b[0])
	if inner != len(b) {
		return nil, false
	}
	result := make([][]f64, rows)
	for i in 0 ..< rows {
		result[i] = make([]f64, cols)
		for j in 0 ..< cols {
			sum := 0.0
			for k in 0 ..< inner {
				sum += a[i][k] * b[k][j]
			}
			result[i][j] = sum
		}
	}
	return result, true
}

// sieve_of_eratosthenes returns primes up to and including limit.
sieve_of_eratosthenes :: proc(limit: int) -> []int {
	if limit < 2 {
		return nil
	}
	composite := make([]bool, limit + 1)
	defer delete(composite)
	for i := 2; i * i <= limit; i += 1 {
		if !composite[i] {
			for j := i * i; j <= limit; j += i {
				composite[j] = true
			}
		}
	}
	primes := make([dynamic]int)
	defer delete(primes)
	for i := 2; i <= limit; i += 1 {
		if !composite[i] {
			append(&primes, i)
		}
	}
	return primes[:]
}

// floyd_cycle detects a cycle in a functional graph of indices.
floyd_cycle :: proc(next: []int) -> bool {
	if len(next) < 2 {
		return false
	}
	slow, fast := 0, 0
	for step in 0 ..= len(next) {
		if slow >= len(next) || fast >= len(next) {
			return false
		}
		slow = next[slow]
		fast = next[fast]
		if fast >= len(next) {
			return false
		}
		fast = next[fast]
		if slow == fast {
			return true
		}
	}
	return false
}

// count_inversions counts pairs out of order (naive O(n^2)).
count_inversions :: proc(values: []int) -> int {
	count := 0
	for i in 0 ..< len(values) {
		for j := i + 1; j < len(values); j += 1 {
			if values[i] > values[j] {
				count += 1
			}
		}
	}
	return count
}
