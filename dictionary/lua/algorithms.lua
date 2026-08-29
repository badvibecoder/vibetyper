-- insertion_sort sorts a list in place by insertion.
local function insertion_sort(values)
	for i = 2, #values do
		local key = values[i]
		local j = i - 1
		while j >= 1 and values[j] > key do
			values[j + 1] = values[j]
			j = j - 1
		end
		values[j + 1] = key
	end
	return values
end

-- selection_sort repeatedly selects the smallest remaining element.
local function selection_sort(values)
	for i = 1, #values do
		local smallest = i
		for j = i + 1, #values do
			if values[j] < values[smallest] then
				smallest = j
			end
		end
		values[i], values[smallest] = values[smallest], values[i]
	end
	return values
end

-- bubble_sort bubbles the largest values to the end.
local function bubble_sort(values)
	local n = #values
	for i = 1, n do
		local swapped = false
		for j = 1, n - i do
			if values[j] > values[j + 1] then
				values[j], values[j + 1] = values[j + 1], values[j]
				swapped = true
			end
		end
		if not swapped then
			break
		end
	end
	return values
end

-- merge combines two sorted lists into one sorted list.
local function merge(left, right)
	local result = {}
	local i, j = 1, 1
	while i <= #left and j <= #right do
		if left[i] <= right[j] then
			result[#result + 1] = left[i]
			i = i + 1
		else
			result[#result + 1] = right[j]
			j = j + 1
		end
	end
	while i <= #left do
		result[#result + 1] = left[i]
		i = i + 1
	end
	while j <= #right do
		result[#result + 1] = right[j]
		j = j + 1
	end
	return result
end

-- merge_sort sorts a list recursively by divide and conquer.
local function merge_sort(values)
	if #values <= 1 then
		return values
	end
	local mid = math.floor(#values / 2)
	local left = {}
	local right = {}
	for i = 1, mid do
		left[i] = values[i]
	end
	for i = mid + 1, #values do
		right[i - mid] = values[i]
	end
	return merge(merge_sort(left), merge_sort(right))
end

-- binary_search finds a value in a sorted list in O(log n).
local function binary_search(values, target)
	local lo, hi = 1, #values
	while lo <= hi do
		local mid = math.floor((lo + hi) / 2)
		if values[mid] == target then
			return mid
		end
		if values[mid] < target then
			lo = mid + 1
		else
			hi = mid - 1
		end
	end
	return nil
end

-- linear_search scans an unsorted list for a value.
local function linear_search(values, target)
	for i, v in ipairs(values) do
		if v == target then
			return i
		end
	end
	return nil
end

-- two_sum finds indices of two values that add up to a target.
local function two_sum(values, target)
	local seen = {}
	for i, v in ipairs(values) do
		local needed = target - v
		if seen[needed] then
			return seen[needed], i
		end
		seen[v] = i
	end
	return nil
end

-- max_subarray finds the largest sum of a contiguous subarray.
local function max_subarray(values)
	if #values == 0 then
		return 0
	end
	local best = values[1]
	local current = values[1]
	for i = 2, #values do
		current = math.max(values[i], current + values[i])
		best = math.max(best, current)
	end
	return best
end

-- lis_length returns the length of the longest increasing subsequence.
local function lis_length(values)
	if #values == 0 then
		return 0
	end
	local lengths = {}
	local best = 1
	for i = 1, #values do
		lengths[i] = 1
		for j = 1, i - 1 do
			if values[j] < values[i] then
				lengths[i] = math.max(lengths[i], lengths[j] + 1)
			end
		end
		best = math.max(best, lengths[i])
	end
	return best
end

-- knapsack_01 computes the maximum value under a weight limit.
local function knapsack_01(weights, values, capacity)
	local dp = {}
	for w = 0, capacity do
		dp[w] = 0
	end
	for i = 1, #weights do
		for w = capacity, weights[i], -1 do
			dp[w] = math.max(dp[w], dp[w - weights[i]] + values[i])
		end
	end
	return dp[capacity]
end

-- edit_distance computes the Levenshtein distance of two strings.
local function edit_distance(a, b)
	local prev = {}
	for j = 0, #b do
		prev[j] = j
	end
	for i = 1, #a do
		local curr = { [0] = i }
		for j = 1, #b do
			local cost = a:sub(i, i) == b:sub(j, j) and 0 or 1
			curr[j] = math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
		end
		prev = curr
	end
	return prev[#b]
end

-- lcs_length returns the length of the longest common subsequence.
local function lcs_length(a, b)
	local table = {}
	for i = 0, #a do
		table[i] = {}
		for j = 0, #b do
			table[i][j] = 0
		end
	end
	for i = 1, #a do
		for j = 1, #b do
			if a:sub(i, i) == b:sub(j, j) then
				table[i][j] = table[i - 1][j - 1] + 1
			else
				table[i][j] = math.max(table[i - 1][j], table[i][j - 1])
			end
		end
	end
	return table[#a][#b]
end

-- coin_change returns the fewest coins for a target amount.
local function coin_change(coins, amount)
	local dp = {}
	dp[0] = 0
	for i = 1, amount do
		dp[i] = math.huge
	end
	for i = 1, amount do
		for _, coin in ipairs(coins) do
			if coin <= i then
				dp[i] = math.min(dp[i], dp[i - coin] + 1)
			end
		end
	end
	if dp[amount] == math.huge then
		return nil
	end
	return dp[amount]
end

-- is_anagram checks whether two strings reuse the same letters.
local function is_anagram(a, b)
	if #a ~= #b then
		return false
	end
	local counts = {}
	for ch in a:gmatch(".") do
		counts[ch] = (counts[ch] or 0) + 1
	end
	for ch in b:gmatch(".") do
		counts[ch] = (counts[ch] or 0) - 1
		if counts[ch] < 0 then
			return false
		end
	end
	return true
end

-- majority_element finds the value appearing more than n/2 times.
local function majority_element(values)
	local candidate, balance = nil, 0
	for _, v in ipairs(values) do
		if balance == 0 then
			candidate = v
		end
		if v == candidate then
			balance = balance + 1
		else
			balance = balance - 1
		end
	end
	local count = 0
	for _, v in ipairs(values) do
		if v == candidate then
			count = count + 1
		end
	end
	if count > #values / 2 then
		return candidate
	end
	return nil
end

-- matrix_multiply multiplies two matrices with compatible dimensions.
local function matrix_multiply(a, b)
	local rows, inner, cols = #a, #a[1], #b[1]
	if inner ~= #b then
		return nil
	end
	local result = {}
	for i = 1, rows do
		result[i] = {}
		for j = 1, cols do
			local total = 0
			for k = 1, inner do
				total = total + a[i][k] * b[k][j]
			end
			result[i][j] = total
		end
	end
	return result
end

-- sieve returns the primes up to and including a limit.
local function sieve(limit)
	if limit < 2 then
		return {}
	end
	local composite = {}
	for i = 2, math.floor(math.sqrt(limit)) do
		if not composite[i] then
			for j = i * i, limit, i do
				composite[j] = true
			end
		end
	end
	local primes = {}
	for i = 2, limit do
		if not composite[i] then
			primes[#primes + 1] = i
		end
	end
	return primes
end

-- floyd_cycle detects a cycle in a functional graph of indices.
local function floyd_cycle(next)
	if #next < 2 then
		return false
	end
	local slow, fast = 1, 1
	for _ = 1, #next + 1 do
		slow = next[slow]
		fast = next[fast]
		if not fast then
			return false
		end
		fast = next[fast]
		if slow == fast then
			return true
		end
	end
	return false
end

-- count_inversions counts pairs out of order (naive O(n^2)).
local function count_inversions(values)
	local count = 0
	for i = 1, #values do
		for j = i + 1, #values do
			if values[i] > values[j] then
				count = count + 1
			end
		end
	end
	return count
end

-- partition_qs reorders a list around a pivot and returns its index.
local function partition_qs(values, lo, hi)
	local pivot = values[hi]
	local i = lo - 1
	for j = lo, hi - 1 do
		if values[j] <= pivot then
			i = i + 1
			values[i], values[j] = values[j], values[i]
		end
	end
	values[i + 1], values[hi] = values[hi], values[i + 1]
	return i + 1
end
