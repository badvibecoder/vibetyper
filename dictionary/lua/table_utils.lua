-- tsum totals every numeric element of a list.
local function tsum(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + v
	end
	return total
end

-- tproduct multiplies every element of a list together.
local function tproduct(values)
	local total = 1
	for _, v in ipairs(values) do
		total = total * v
	end
	return total
end

-- tcontains reports whether a list holds a value.
local function tcontains(values, target)
	for _, v in ipairs(values) do
		if v == target then
			return true
		end
	end
	return false
end

-- tindex_of finds the first index of a value, or nil.
local function tindex_of(values, target)
	for i, v in ipairs(values) do
		if v == target then
			return i
		end
	end
	return nil
end

-- tcount_where counts elements that satisfy a predicate.
local function tcount_where(values, predicate)
	local count = 0
	for _, v in ipairs(values) do
		if predicate(v) then
			count = count + 1
		end
	end
	return count
end

-- tfilter keeps only the elements that satisfy a predicate.
local function tfilter(values, predicate)
	local result = {}
	for _, v in ipairs(values) do
		if predicate(v) then
			result[#result + 1] = v
		end
	end
	return result
end

-- tmap transforms every element with a function.
local function tmap(values, fn)
	local result = {}
	for i, v in ipairs(values) do
		result[i] = fn(v)
	end
	return result
end

-- treduce folds a list left-to-right into a single value.
local function treduce(values, fn, initial)
	local acc = initial
	for _, v in ipairs(values) do
		acc = fn(acc, v)
	end
	return acc
end

-- tunique removes duplicates, keeping first-seen order.
local function tunique(values)
	local seen = {}
	local result = {}
	for _, v in ipairs(values) do
		if not seen[v] then
			seen[v] = true
			result[#result + 1] = v
		end
	end
	return result
end

-- treverse returns a new list with elements in reverse order.
local function treverse(values)
	local result = {}
	for i = #values, 1, -1 do
		result[#result + 1] = values[i]
	end
	return result
end

-- tslice extracts a range of elements, like string.sub for lists.
local function tslice(values, first, last)
	first = first or 1
	last = last or #values
	if first < 1 then
		first = 1
	end
	if last > #values then
		last = #values
	end
	local result = {}
	if first > last then
		return result
	end
	for i = first, last do
		result[#result + 1] = values[i]
	end
	return result
end

-- tflatten concatenates the elements of nested lists one level deep.
local function tflatten(rows)
	local result = {}
	for _, row in ipairs(rows) do
		for _, v in ipairs(row) do
			result[#result + 1] = v
		end
	end
	return result
end

-- tfrequencies tallies how often each value appears.
local function tfrequencies(values)
	local counts = {}
	for _, v in ipairs(values) do
		counts[v] = (counts[v] or 0) + 1
	end
	return counts
end

-- tmax finds the largest value in a list of numbers.
local function tmax(values)
	local best = values[1]
	for i = 2, #values do
		if values[i] > best then
			best = values[i]
		end
	end
	return best
end

-- tmin finds the smallest value in a list of numbers.
local function tmin(values)
	local best = values[1]
	for i = 2, #values do
		if values[i] < best then
			best = values[i]
		end
	end
	return best
end

-- tshuffle randomises a list with the Fisher-Yates shuffle.
local function tshuffle(values)
	for i = #values, 2, -1 do
		local j = math.random(i)
		values[i], values[j] = values[j], values[i]
	end
	return values
end

-- tchunk splits a list into sub-lists of at most size elements.
local function tchunk(values, size)
	local result = {}
	for i = 1, #values, size do
		result[#result + 1] = tslice(values, i, i + size - 1)
	end
	return result
end

-- tzip pairs up the elements of two equal-length lists.
local function tzip(keys, values)
	local result = {}
	for i = 1, math.min(#keys, #values) do
		result[i] = { key = keys[i], value = values[i] }
	end
	return result
end

-- tmerge appends every element of b onto a.
local function tmerge(a, b)
	local result = {}
	for _, v in ipairs(a) do
		result[#result + 1] = v
	end
	for _, v in ipairs(b) do
		result[#result + 1] = v
	end
	return result
end

-- tkeys returns the keys of a map as a list.
local function tkeys(map)
	local result = {}
	for k in pairs(map) do
		result[#result + 1] = k
	end
	return result
end

-- tgroup_by buckets list elements by a key function.
local function tgroup_by(values, keyfn)
	local groups = {}
	for _, v in ipairs(values) do
		local key = keyfn(v)
		groups[key] = groups[key] or {}
		groups[key][#groups[key] + 1] = v
	end
	return groups
end
